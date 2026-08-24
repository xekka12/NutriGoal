export function normalizeIngredient(ingredient) {
  if (typeof ingredient === "string") {
    return { item: ingredient, estimatedPrice: 0 };
  }

  return {
    item: ingredient?.item || ingredient?.name || "Ingredient",
    estimatedPrice: Number(ingredient?.estimatedPrice) || 0,
  };
}

export function normalizeStep(step) {
  if (typeof step === "string") {
    return { instruction: step, estimatedTime: "" };
  }

  return {
    instruction: step?.instruction || step?.step || "Cooking step",
    estimatedTime: step?.estimatedTime || step?.time || "",
  };
}

export function getRecipeTotal(recipe) {
  const explicitTotal = Number(recipe?.estimatedTotal);
  if (Number.isFinite(explicitTotal) && explicitTotal > 0) return explicitTotal;

  return (recipe?.ingredients || [])
    .map(normalizeIngredient)
    .reduce((sum, ingredient) => sum + ingredient.estimatedPrice, 0);
}

/**
 * Older plans only stored a flat recommendations array, so single-day plans are
 * wrapped here to keep one rendering path for both daily and weekly plans.
 */
export function getPlanDays(plan) {
  const sortRows = (rows) => {
    const list = Array.isArray(rows) ? rows : [];
    const mealOrder = ["Breakfast", "Lunch", "Dinner", "Snack"];
    return [...list].sort((a, b) => {
      const indexOf = (row) => {
        const i = mealOrder.findIndex(
          (name) => name.toLowerCase() === String(row?.meal || "").toLowerCase()
        );
        return i < 0 ? 99 : i;
      };
      return indexOf(a) - indexOf(b);
    });
  };

  if (Array.isArray(plan?.days) && plan.days.length > 0) {
    return plan.days.map((day, index) => ({
      day: day?.day || `Day ${index + 1}`,
      recommendations: sortRows(day?.recommendations || []),
    }));
  }

  return [{ day: "", recommendations: sortRows(plan?.recommendations || []) }];
}

/** Uses the first recipe of each meal since that is the primary suggestion. */
export function getDayNutrition(dayPlan) {
  return (dayPlan?.recommendations || []).reduce(
    (totals, recommendation) => {
      const recipe = (recommendation?.recipes || [])[0];
      return {
        calories: totals.calories + (Number(recipe?.estimatedCalories) || 0),
        protein: totals.protein + (Number(recipe?.estimatedProteinGrams) || 0),
      };
    },
    { calories: 0, protein: 0 },
  );
}

/** Sum of recipe costs for all meals in one day. */
export function getDayTotal(dayPlan) {
  return (dayPlan?.recommendations || [])
    .flatMap((recommendation) => recommendation.recipes || [])
    .reduce((sum, recipe) => sum + getRecipeTotal(recipe), 0);
}

/** User's daily budget cap derived from the plan total. */
export function getPlanDailyBudget(plan) {
  const budget = Number(plan?.budget);
  if (!Number.isFinite(budget) || budget <= 0) return 0;
  const days = isWeeklyPlan(plan) ? 7 : 1;
  return Math.floor(budget / days);
}

/** Replace one meal/snack slot and return an updated plan object. */
export function replaceMealInPlan(plan, { dayIndex, meal, recommendation }) {
  const days = getPlanDays(plan).map((dayPlan, index) => {
    if (index !== dayIndex) return { ...dayPlan };

    const recommendations = (dayPlan.recommendations || []).map((row) => {
      if (String(row?.meal || "").toLowerCase() !== String(meal || "").toLowerCase()) {
        return row;
      }
      return recommendation;
    });

    return {
      ...dayPlan,
      recommendations,
    };
  });

  const nextPlan = {
    ...plan,
    days,
  };

  if (!isWeeklyPlan(plan) || dayIndex === 0) {
    nextPlan.recommendations = days[0]?.recommendations ?? [];
  }

  return nextPlan;
}

export function isWeeklyPlan(plan) {
  return plan?.planType === "weekly" || (plan?.days?.length ?? 0) > 1;
}

export function getPlanFilters(plan) {
  const filters = plan?.filters ?? {};
  const allergies = Array.isArray(filters.allergies) ? filters.allergies : [];

  return {
    proteinSource: filters.proteinSource || "Any",
    carbSource: filters.carbSource || "Any",
    restriction: filters.restriction || "None",
    cookingMethod: filters.cookingMethod || "Any",
    activityLevel: filters.activityLevel || "Not set",
    bodyGoal: filters.bodyGoal || "Not set",
    healthStatus: filters.healthStatus || "",
    healthCondition: filters.healthCondition || "",
    bmi: filters.bmi || "",
    bmiCategory: filters.bmiCategory || "",
    allergies,
    allergiesText: allergies.length ? allergies.join(", ") : "None",
  };
}

export function getPlanTotal(plan) {
  return getPlanDays(plan)
    .flatMap((day) => day.recommendations || [])
    .flatMap((recommendation) => recommendation.recipes || [])
    .reduce((sum, recipe) => sum + getRecipeTotal(recipe), 0);
}
