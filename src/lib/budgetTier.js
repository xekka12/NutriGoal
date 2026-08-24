/** Realistic minimum per healthy Filipino meal (2026 inflation). */
export const MIN_BUDGET_PER_MEAL = 100;

/** Lighter minimum for an optional healthy snack slot. */
export const MIN_BUDGET_PER_SNACK = 60;

/** Extra daily amount added to suggested budget when snack is enabled. */
export const SNACK_SUGGESTED_DAILY_ADD = 85;

/** Minimum weekly budget for 7 days × 3 meals. */
export const MIN_WEEKLY_BUDGET = MIN_BUDGET_PER_MEAL * 21;

/**
 * Suggested budget totals based on plan shape — updates as user picks duration/meals.
 * @param {{ mealsCount: number, planType: "daily" | "weekly", includeSnack?: boolean }} params
 */
export function getSuggestedBudget({ mealsCount, planType = "daily", includeSnack = false }) {
  const meals = Math.max(1, Math.min(3, Number(mealsCount) || 1));
  const days = planType === "weekly" ? 7 : 1;
  const snackSlots = includeSnack ? days : 0;
  const mainMealSlots = meals * days;
  const minimum =
    mainMealSlots * MIN_BUDGET_PER_MEAL + snackSlots * MIN_BUDGET_PER_SNACK;

  const dailyTotals = {
    1: 100,
    2: 250,
    3: 380,
  };
  let dailyTotal = dailyTotals[meals] ?? meals * MIN_BUDGET_PER_MEAL;
  if (includeSnack) dailyTotal += SNACK_SUGGESTED_DAILY_ADD;
  const total = planType === "weekly" ? dailyTotal * 7 : dailyTotal;
  const totalMeals = mainMealSlots + snackSlots;

  return {
    total,
    minimum,
    perMeal: Math.max(MIN_BUDGET_PER_MEAL, Math.round(total / totalMeals)),
    meals,
    days,
    includeSnack,
    dailyTotal,
  };
}

function sumBudgetMap(map) {
  return Object.values(map).reduce((sum, value) => sum + value, 0);
}

/**
 * Split a daily budget across main meals and an optional snack.
 * The sum of all caps always equals the daily budget (snack is included, not extra).
 */
export function getDailyMealBudgets({ meals, dailyBudget }) {
  const list = Array.isArray(meals) ? meals : [];
  const mainMeals = list.filter((m) => String(m).toLowerCase() !== "snack");
  const hasSnack = list.some((m) => String(m).toLowerCase() === "snack");
  const budget = Math.max(1, Math.floor(Number(dailyBudget) || 1));

  if (!mainMeals.length && !hasSnack) return {};

  if (!hasSnack) {
    const perMeal = Math.floor(budget / mainMeals.length);
    const result = Object.fromEntries(mainMeals.map((meal) => [meal, perMeal]));
    const remainder = budget - sumBudgetMap(result);
    if (remainder > 0 && mainMeals.length) result[mainMeals[0]] += remainder;
    return result;
  }

  const idealSnackShare = Math.floor(budget * 0.14);
  const maxSnack = Math.min(90, Math.floor(budget * 0.2));
  const minSnack = Math.min(
    MIN_BUDGET_PER_SNACK,
    Math.max(40, Math.floor(budget * 0.1)),
  );
  const maxSnackAllowed = Math.max(1, budget - mainMeals.length);

  let snackBudget = Math.min(
    maxSnackAllowed,
    Math.min(maxSnack, Math.max(minSnack, idealSnackShare)),
  );
  snackBudget = Math.max(1, snackBudget);

  const mainPool = budget - snackBudget;
  const perMain = Math.floor(mainPool / mainMeals.length);
  const result = {
    ...Object.fromEntries(mainMeals.map((meal) => [meal, perMain])),
    Snack: snackBudget,
  };

  const remainder = budget - sumBudgetMap(result);
  if (remainder !== 0 && mainMeals.length) {
    result[mainMeals[0]] += remainder;
  }

  return result;
}

export function formatMealBudgetCaps(mealBudgets) {
  return Object.entries(mealBudgets || {})
    .map(([meal, cap]) => `${meal}: max ₱${cap}`)
    .join(", ");
}

export function getPerMealBudget({ budget, mealsCount, planType = "weekly", includeSnack = false }) {
  const total = Number(budget);
  const meals = Math.max(1, Number(mealsCount) || 3);
  if (!Number.isFinite(total) || total <= 0) return 0;

  const days = planType === "weekly" ? 7 : 1;
  const snackSlots = includeSnack ? days : 0;
  const totalMeals = meals * days + snackSlots;
  return Math.max(1, Math.floor(total / totalMeals));
}

export function getDailyBudgetFromWeekly(weeklyBudget) {
  const total = Number(weeklyBudget);
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.max(1, Math.floor(total / 7));
}

export function describeBudgetTier({ budget, mealsCount, planType = "weekly", includeSnack = false }) {
  const perMeal = getPerMealBudget({ budget, mealsCount, planType, includeSnack });

  if (perMeal >= 250) {
    return {
      tier: "premium",
      label: "Premium",
      perMeal,
      prompt: `- Budget tier: PREMIUM (~₱${perMeal}/meal). Suggest satisfying, appetizing Filipino meals with quality proteins (chicken breast, beef, salmon/bangus, pork cuts), good variety, and restaurant-style home cooking. Meals should feel special and well-prepared, not plain or repetitive survival food. Use the full per-meal budget for better ingredients while staying healthy.`,
    };
  }

  if (perMeal >= 150) {
    return {
      tier: "comfort",
      label: "Comfort",
      perMeal,
      prompt: `- Budget tier: COMFORT (~₱${perMeal}/meal). Suggest tasty, well-rounded Filipino meals with good protein and sides. Avoid overly plain one-pot meals; make dishes look appetizing and balanced (protein + veg + rice).`,
    };
  }

  if (perMeal >= 120) {
    return {
      tier: "moderate",
      label: "Moderate",
      perMeal,
      prompt: `- Budget tier: MODERATE (~₱${perMeal}/meal). Suggest balanced, flavorful everyday Filipino home-cooked meals. Keep them healthy, filling, and visually appealing.`,
    };
  }

  return {
    tier: "budget",
    label: "Budget-friendly",
    perMeal,
    prompt: `- Budget tier: BUDGET-FRIENDLY (~₱${perMeal}/meal). Keep costs low with economical ingredients, but still make meals tasty, nutritious, and presentable — not boring or overly plain. Do not go below realistic 2026 Philippine prices for a healthy single serving.`,
  };
}
