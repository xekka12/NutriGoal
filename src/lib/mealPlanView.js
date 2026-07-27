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
  if (Array.isArray(plan?.days) && plan.days.length > 0) {
    return plan.days.map((day, index) => ({
      day: day?.day || `Day ${index + 1}`,
      recommendations: day?.recommendations || [],
    }));
  }

  return [{ day: "", recommendations: plan?.recommendations || [] }];
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
