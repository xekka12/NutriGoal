import { describeBudgetTier, formatMealBudgetCaps, getDailyMealBudgets } from "./budgetTier";
import { buildLocalRecipe } from "./localRecipes";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Groq retired Llama 3.3 on Aug 16, 2026. Production chat models now are
// openai/gpt-oss-120b and openai/gpt-oss-20b. The 20B model is faster and
// less likely to blow the JSON token budget on a 7-day plan.
const GROQ_MODEL = "openai/gpt-oss-20b";

const WEEKLY_CHUNK_SIZE = 1;
const WEEKLY_CHUNK_MAX_TOKENS = 4500;

function repairTruncatedJson(text) {
  let s = String(text || "").trim();
  const start = s.indexOf("{");
  if (start < 0) return s;
  s = s.slice(start);

  let inString = false;
  let escaped = false;
  const stack = [];

  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }
    if (ch === "\"") {
      inString = true;
    } else if (ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch === "}" || ch === "]") {
      stack.pop();
    }
  }

  if (inString) s += "\"";
  s = s.replace(/,\s*$/, "");
  while (stack.length) {
    const open = stack.pop();
    s += open === "{" ? "}" : "]";
  }
  return s;
}

function parseJsonFromContent(content) {
  const text = String(content || "").trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : text;
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(repairTruncatedJson(raw));
    } catch {
      throw new Error("Failed to parse meal plan JSON.");
    }
  }
}

export const WEEK_DAYS = [
  "Day 1",
  "Day 2",
  "Day 3",
  "Day 4",
  "Day 5",
  "Day 6",
  "Day 7",
];

const MEAL_DAY_ORDER = ["Breakfast", "Lunch", "Dinner", "Snack"];

export function sortMealsByDayOrder(meals) {
  return [...(meals || [])].sort((a, b) => {
    const indexOf = (meal) => {
      const i = MEAL_DAY_ORDER.findIndex(
        (name) => name.toLowerCase() === String(meal || "").toLowerCase()
      );
      return i < 0 ? 99 : i;
    };
    return indexOf(a) - indexOf(b);
  });
}

function normalizeIngredient(ingredient) {
  if (typeof ingredient === "string") {
    return { item: ingredient, estimatedPrice: 0 };
  }

  return {
    item: ingredient?.item || ingredient?.name || "Ingredient",
    estimatedPrice: Number(ingredient?.estimatedPrice) || 0,
  };
}

function normalizeStep(step) {
  if (typeof step === "string") {
    return { instruction: step, estimatedTime: "" };
  }

  return {
    instruction: step?.instruction || step?.step || "Cooking step",
    estimatedTime: step?.estimatedTime || step?.time || "",
  };
}

function normalizeRecipe(recipe) {
  return {
    name: recipe?.name || "Suggested meal",
    ingredients: Array.isArray(recipe?.ingredients)
      ? recipe.ingredients.map(normalizeIngredient)
      : [],
    estimatedTotal: Number(recipe?.estimatedTotal) || 0,
    estimatedCookTime: recipe?.estimatedCookTime || "",
    estimatedCalories: Number(recipe?.estimatedCalories) || 0,
    estimatedProteinGrams: Number(recipe?.estimatedProteinGrams) || 0,
    steps: Array.isArray(recipe?.steps) ? recipe.steps.map(normalizeStep) : [],
  };
}

function normalizeRecommendations(
  list,
  recipesPerMeal,
  fallbackBudget,
  allowedMeals,
  mealBudgets = {},
) {
  const source = Array.isArray(list) ? list : [];
  const wanted = sortMealsByDayOrder(
    Array.isArray(allowedMeals) && allowedMeals.length
      ? allowedMeals
      : source.map((item) => item?.meal).filter(Boolean)
  );

  return wanted.map((mealName) => {
    const item =
      source.find(
        (row) => String(row?.meal || "").toLowerCase() === String(mealName).toLowerCase()
      ) || { meal: mealName, recipes: [] };

    return {
      meal: mealName,
      suggestedBudget:
        Number(item?.suggestedBudget) ||
        mealBudgets[mealName] ||
        fallbackBudget,
      recipes: (item?.recipes || []).slice(0, recipesPerMeal).map(normalizeRecipe),
    };
  });
}

export function isGroqConfigured() {
  return Boolean(import.meta.env.VITE_GROQ_API_KEY);
}

function buildProfileLines({
  activityLevel,
  bodyGoal,
  healthStatus,
  healthCondition,
  allergies,
  proteinSource,
  carbSource,
  restriction,
  cookingMethod,
  age,
  gender,
  heightCm,
  weightKg,
  bmi,
  bmiCategory,
}) {
  const allergyText = allergies?.length ? allergies.join(", ") : "None";

  return `Activity level: ${activityLevel}
Body goal: ${bodyGoal}
Health status: ${healthStatus || "Not specified"}
Illness/condition details: ${healthCondition || "None"}
Age: ${age || "Not provided"}
Gender: ${gender || "Not provided"}
Height: ${heightCm ? `${heightCm} cm` : "Not provided"}
Weight: ${weightKg ? `${weightKg} kg` : "Not provided"}
BMI: ${bmi ? `${bmi} (${bmiCategory || "n/a"})` : "Not provided"}
Allergies to strictly avoid: ${allergyText}
Preferred protein source: ${proteinSource}
Preferred carb source: ${carbSource}
Other restriction: ${restriction}
Preferred cooking method: ${cookingMethod}`;
}

const RECIPE_SHAPE = `{"name":"Recipe","ingredients":[{"item":"2 eggs","estimatedPrice":20}],"estimatedTotal":20,"estimatedCookTime":"15 min","estimatedCalories":520,"estimatedProteinGrams":28,"steps":[{"instruction":"Cook","estimatedTime":"10 min"}]}`;

/** Breakfast/lunch/dinner rarely split evenly, so weight the bigger meals. */
const MEAL_CALORIE_WEIGHTS = {
  breakfast: 0.28,
  lunch: 0.37,
  dinner: 0.35,
  snack: 0.12,
};

export function getMealCalorieTargets(meals, calorieTarget) {
  const list = Array.isArray(meals) ? meals : [];
  const target = Number(calorieTarget);
  if (!list.length || !Number.isFinite(target) || target <= 0) return [];

  const weights = list.map(
    (meal) => MEAL_CALORIE_WEIGHTS[String(meal).toLowerCase()] ?? 0.3
  );
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  return list.map((meal, index) => ({
    meal,
    calories: Math.round((target * weights[index]) / weightSum),
  }));
}

function getSnackSafeExamples(allergies) {
  const blocked = (Array.isArray(allergies) ? allergies : []).map((item) =>
    String(item).toLowerCase().trim(),
  );
  const isBlocked = (terms) =>
    terms.some((term) => blocked.some((allergy) => allergy.includes(term) || term.includes(allergy)));

  const examples = [
    "fresh papaya or mango",
    "boiled egg with cucumber",
    "plain yogurt with fruit",
    "boiled corn (mais)",
    "steamed kamote bites",
    "tokwa cubes with toyomansi",
    "malunggay smoothie with banana",
  ];

  if (!isBlocked(["peanut", "peanuts", "mani", "nut", "tree nut"])) {
    examples.push("small handful of unsalted peanuts (only when no nut allergy)");
  }

  return examples.join(", ");
}

function buildSharedRules({
  meals,
  allergies,
  activityLevel,
  bodyGoal,
  healthStatus,
  healthCondition,
  bmiCategory,
  calorieTarget,
  budget,
  planType,
  mealBudgets = {},
  dailyBudget = 0,
}) {
  const mainMealCount = meals.filter((m) => String(m).toLowerCase() !== "snack").length;
  const includeSnack = meals.some((m) => String(m).toLowerCase() === "snack");
  const budgetTier = describeBudgetTier({
    budget,
    mealsCount: mainMealCount,
    planType,
    includeSnack,
  });
  const allergyText = allergies?.length ? allergies.join(", ") : "None";
  const normalizedHealth = String(healthStatus || "").toLowerCase();
  const illnessRule =
    normalizedHealth.includes("has illness") ||
    normalizedHealth.includes("medical condition")
      ? "- Prefer lighter/balanced recipes that are generally easier on the body"
      : "";
  const illnessDetailsRule = String(healthCondition || "").trim()
    ? `- Adjust for this condition when practical: ${healthCondition}`
    : "";
  const bmiKey = String(bmiCategory || "").toLowerCase();
  const bmiRule = bmiKey.includes("underweight")
    ? "- Underweight: prefer calorie-dense, protein-rich meals when practical"
    : bmiKey.includes("overweight") || bmiKey.includes("obese")
      ? "- Overweight/obese BMI: prefer lighter meals that support gradual weight management"
      : bmiKey.includes("normal")
        ? "- Normal BMI: keep portions balanced"
        : "";

  const mealTargets = getMealCalorieTargets(meals, calorieTarget);
  const calorieRules = mealTargets.length
    ? `- Daily calorie target: ${Math.round(Number(calorieTarget))} kcal for the whole day
- Per-meal calorie targets (stay within 10%): ${mealTargets
        .map((entry) => `${entry.meal} ~${entry.calories} kcal`)
        .join(", ")}
- estimatedCalories of all meals in a day must add up close to the daily target; increase portions (rice, protein, healthy oils) instead of lowering calories`
    : "";

  const snackRule = includeSnack
    ? `- Snack slot (included in daily budget, NOT extra): suggest ONE light, healthy Filipino snack (~150–250 kcal). Safe ideas: ${getSnackSafeExamples(allergies)}
- Snack estimatedTotal must stay within ₱${mealBudgets.Snack ?? "?"}. The snack share is already deducted from the daily budget.
- Snack must contain ZERO allergens. User allergies: ${allergyText}. Never suggest peanut, peanut butter, peanuts, mani, or any nut product if user is allergic to peanuts/nuts. Never use any listed allergen in the snack.`
    : "";

  const budgetCapRule = dailyBudget
    ? `- Per-meal price caps (estimatedTotal must NOT exceed): ${formatMealBudgetCaps(mealBudgets)}
- CRITICAL: Sum of estimatedTotal for ALL meals${includeSnack ? " including Snack" : ""} in one day MUST NOT exceed ₱${dailyBudget}. Snack is part of this total, not on top of it.`
    : "";

  return `Rules:
- Meals each day: ${meals.join(", ")}
${budgetTier.prompt}
${budgetCapRule}
${calorieRules}
${snackRule}
- Never use allergy-related ingredients in ANY meal or snack: ${allergyText}
- Match portions to activity (${activityLevel}) and goal (${bodyGoal})
- Respect protein/carb/restriction/cooking prefs when not Any/None
${illnessRule}
${illnessDetailsRule}
${bmiRule}
- Every ingredient must state an exact quantity and the specific item, e.g. "1 cup chopped kangkong", never vague entries like "vegetables", "gulay", or "1 protein"
- Recommend Filipino or Filipino-style home-cooked meals using ingredients commonly sold in Philippine wet markets, groceries, and sari-sari stores
- Prefer rice, kamote, saba, corn, pandesal, eggs, chicken, lean pork, tuna, tilapia, bangus, galunggong, monggo, tokwa, malunggay, kangkong, pechay, sayote, kalabasa, and other local produce when suitable
- Do not use turkey, quinoa, kale, asparagus, imported berries, or other uncommon/expensive imported ingredients unless the user explicitly selected or requires them
- Use familiar Filipino dish names and healthier cooking methods; keep flavors recognizably Filipino
- Affordable local ingredients; realistic PHP prices
- Portions and recipes are for 1 person only
- ingredients: {item, estimatedPrice}; estimatedTotal = sum of prices
- Include realistic estimatedCookTime, estimatedCalories, and estimatedProteinGrams for every recipe
- steps: {instruction, estimatedTime}; keep steps short (max 4)
- Not medical advice`;
}

async function callGroq({ apiKey, prompt, maxTokens, temperature = 0.7 }) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature,
      max_tokens: maxTokens,
      reasoning_effort: "low",
      messages: [
        {
          role: "system",
          content:
            "Create Filipino home-cooked meal plans with common Philippine ingredients. Avoid turkey and uncommon imported foods. Every recipe needs estimatedCalories and estimatedProteinGrams. Strictly avoid all user allergens in every meal AND snack — never use peanut/peanut butter if allergic to peanuts. Stay within per-meal PHP budget caps; daily estimatedTotal sum must not exceed the daily budget. Reply with compact JSON only, no markdown. ingredients:[{item,estimatedPrice}]; steps:[{instruction,estimatedTime}].",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const failed = payload?.error?.failed_generation;
    if (failed) {
      try {
        return parseJsonFromContent(failed);
      } catch {
        // Fall through to a normal error so retry can try again.
      }
    }
    const message =
      payload?.error?.message || `Meal generator failed (${response.status})`;
    throw new Error(message);
  }

  return parseJsonFromContent(
    payload?.choices?.[0]?.message?.content ||
      payload?.choices?.[0]?.message?.reasoning
  );
}

function parseRateLimitWaitMs(message) {
  const text = String(message || "");
  const match = text.match(/try again in\s+([\d.]+)\s*s/i);
  if (!match) return 0;
  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  // Cap wait so UI doesn't hang forever.
  return Math.min(Math.ceil(seconds * 1000) + 500, 45000);
}

function isRateLimitError(message) {
  return /rate limit|tokens per minute|tpm/i.test(String(message || ""));
}

/** Reasoning models sometimes stop mid-JSON, which Groq reports as a failed generation. */
function isJsonFailure(message) {
  return /failed to (generate|validate) json|json_validate|unexpected (token|end)/i.test(
    String(message || "")
  );
}

async function callGroqWithRetry({ apiKey, prompt, maxTokens }) {
  const attempts = [
    { temperature: 0.7, maxTokens },
    // Lower temperature keeps the model from rambling past the token budget.
    { temperature: 0.3, maxTokens: Math.round(maxTokens * 1.2) },
    { temperature: 0.1, maxTokens: Math.round(maxTokens * 1.4) },
  ];

  let lastError = null;

  for (const attempt of attempts) {
    try {
      return await callGroq({ apiKey, prompt, ...attempt });
    } catch (error) {
      lastError = error;
      const message = error?.message || "";

      if (isRateLimitError(message)) {
        await new Promise((resolve) =>
          setTimeout(resolve, parseRateLimitWaitMs(message) || 30000)
        );
        continue;
      }

      if (isJsonFailure(message)) continue;

      throw error;
    }
  }

  throw lastError;
}

/**
 * @param {{
 *   categoryTitle: string,
 *   budget: number,
 *   meals: string[],
 *   proteinSource: string,
 *   carbSource: string,
 *   restriction: string,
 *   cookingMethod: string,
 *   activityLevel: string,
 *   bodyGoal: string,
 *   healthStatus?: string,
 *   healthCondition?: string,
 *   allergies: string[],
 *   age?: number,
 *   gender?: string,
 *   heightCm?: number,
 *   weightKg?: number,
 *   bmi?: number,
 *   bmiCategory?: string,
 *   calorieTarget?: number,
 *   planType: "daily" | "weekly",
 *   onProgress?: (percent: number, label: string) => void,
 * }} params
 */
export async function generateMealPlanWithGroq({
  categoryTitle,
  budget,
  meals,
  proteinSource,
  carbSource,
  restriction,
  cookingMethod,
  activityLevel = "Not set",
  bodyGoal = "Not set",
  healthStatus = "Not specified",
  healthCondition = "",
  allergies = [],
  age,
  gender,
  heightCm,
  weightKg,
  bmi,
  bmiCategory = "",
  calorieTarget = 0,
  planType = "daily",
  onProgress,
}) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing VITE_GROQ_API_KEY. Add it to your .env file and restart npm run dev."
    );
  }

  const isWeekly = planType === "weekly";
  const dayCount = isWeekly ? WEEK_DAYS.length : 1;
  const dailyBudget = Math.max(1, Math.floor(budget / dayCount));
  const mealBudgets = getDailyMealBudgets({ meals, dailyBudget });
  const perMeal = mealBudgets[meals[0]] ?? Math.max(1, Math.floor(dailyBudget / meals.length));
  const recipesPerMeal = 1;
  const mainMealCount = meals.filter((m) => String(m).toLowerCase() !== "snack").length;
  const includeSnack = meals.some((m) => String(m).toLowerCase() === "snack");

  const profile = buildProfileLines({
    activityLevel,
    bodyGoal,
    healthStatus,
    healthCondition,
    allergies,
    proteinSource,
    carbSource,
    restriction,
    cookingMethod,
    age,
    gender,
    heightCm,
    weightKg,
    bmi,
    bmiCategory,
  });
  const budgetTier = describeBudgetTier({
    budget,
    mealsCount: mainMealCount,
    planType,
    includeSnack,
  });

  const rules = buildSharedRules({
    meals,
    allergies,
    activityLevel,
    bodyGoal,
    healthStatus,
    healthCondition,
    bmiCategory,
    calorieTarget,
    budget,
    planType,
    mealBudgets,
    dailyBudget,
  });

  onProgress?.(5, "Preparing your profile...");

  const budgetCapLines = formatMealBudgetCaps(mealBudgets);
  const snackCap = mealBudgets.Snack;

  const budgetLines = isWeekly
    ? `Total budget for the whole week: ₱${budget} (includes snack if selected — snack is NOT extra)
Approx budget per day: ₱${dailyBudget}`
    : `Total budget for the day: ₱${budget} (includes snack if selected — snack is NOT extra)`;

  const promptHeader = `Philippines-focused healthy meal planner. Output practical Filipino home-cooked meals using locally available ingredients and PHP prices.

Category: ${categoryTitle}
${budgetLines}
People: 1 (single-person plan only)
Meals/day: ${meals.join(", ")}
Daily budget cap: ₱${dailyBudget}
Per-meal budget caps: ${budgetCapLines}
${includeSnack ? `Snack budget (included in daily cap): ₱${snackCap}` : ""}
Budget quality tier: ${budgetTier.label}
${profile}`;

  if (isWeekly) {
    const days = [];
    let nutritionTip = "";

    // The model reasons before answering, so a 7-day request often gets cut off
    // mid-JSON. Requesting a few days at a time keeps each response complete.
    for (
      let start = 0;
      start < WEEK_DAYS.length;
      start += WEEKLY_CHUNK_SIZE
    ) {
      const chunkDays = WEEK_DAYS.slice(start, start + WEEKLY_CHUNK_SIZE);
      const previousNames = days
        .flatMap((day) => day.recommendations)
        .flatMap((recommendation) => recommendation.recipes)
        .map((recipe) => recipe.name);

      const avoidRule = previousNames.length
        ? `- Do not repeat these already-used recipes: ${previousNames.join(", ")}`
        : "";

      const dayNumber = start + 1;
      onProgress?.(
        Math.round((start / WEEK_DAYS.length) * 85) + 8,
        `Planning Day ${dayNumber} of 7...`,
      );

      const chunkPrompt = `${promptHeader}

Return ONLY valid JSON (no markdown):
{"nutritionTip":"short tip","days":[{"day":"${chunkDays[0]}","recommendations":[{"meal":"${meals[0]}","suggestedBudget":${perMeal},"recipes":[${RECIPE_SHAPE}]}]}]}

${rules}
- Exactly these days in order: ${chunkDays.join(", ")}
- Every day must include all meals: ${meals.join(", ")}
- Exactly 1 recipe per meal (never 2)
- Keep recipes compact (max 5 ingredients, max 3 steps)
${avoidRule}`;

      let parsedChunk;
      try {
        parsedChunk = await callGroqWithRetry({
          apiKey,
          prompt: chunkPrompt,
          maxTokens: WEEKLY_CHUNK_MAX_TOKENS,
        });
      } catch {
        const mealCalories = getMealCalorieTargets(meals, calorieTarget);
        days.push({
          day: chunkDays[0],
          recommendations: meals.map((meal, mealIndex) => ({
            meal,
            suggestedBudget: mealBudgets[meal] ?? perMeal,
            recipes: [
              buildLocalRecipe({
                meal,
                categoryTitle,
                dayIndex: start + mealIndex,
                variant: mealIndex,
                targetCalories: mealCalories[mealIndex]?.calories ?? 0,
                allergies,
              }),
            ],
          })),
        });
        onProgress?.(
          Math.round(((start + 1) / WEEK_DAYS.length) * 85) + 8,
          `Finished Day ${dayNumber} of 7`,
        );
        continue;
      }

      if (!nutritionTip) {
        nutritionTip = String(parsedChunk?.nutritionTip || "").trim();
      }

      onProgress?.(
        Math.round(((start + 1) / WEEK_DAYS.length) * 85) + 8,
        `Finished Day ${dayNumber} of 7`,
      );

      const rawDays = Array.isArray(parsedChunk?.days) ? parsedChunk.days : [];
      if (rawDays.length === 0) {
        throw new Error("Meal generator returned an invalid weekly plan format.");
      }

      rawDays.slice(0, chunkDays.length).forEach((day, index) => {
        days.push({
          day: chunkDays[index],
          recommendations: normalizeRecommendations(
            day?.recommendations,
            recipesPerMeal,
            perMeal,
            meals,
            mealBudgets,
          ),
        });
      });
    }

    if (days.length < WEEK_DAYS.length) {
      throw new Error(
        `Meal generator only returned ${days.length} of ${WEEK_DAYS.length} days.`
      );
    }

    onProgress?.(95, "Finalizing your meal plan...");
    onProgress?.(100, "Complete!");

    return { planType: "weekly", days: days.slice(0, WEEK_DAYS.length), nutritionTip };
  }

  onProgress?.(25, "Analyzing your preferences...");
  onProgress?.(45, "Creating your meals...");

  const prompt = `${promptHeader}

Return ONLY valid JSON (no markdown):
{"nutritionTip":"short tip","recommendations":[{"meal":"${meals[0]}","suggestedBudget":${perMeal},"recipes":[${RECIPE_SHAPE}]}]}

${rules}
- Exactly 1 recipe per selected meal (never 2)
- If the user chose only one meal, that single recipe must meet the full daily calorie target
- Keep recipes compact (max 5 ingredients, max 3 steps)`;

  const parsed = await callGroqWithRetry({ apiKey, prompt, maxTokens: 3000 });
  const nutritionTip = String(parsed?.nutritionTip || "").trim();

  if (!Array.isArray(parsed?.recommendations)) {
    throw new Error("Meal generator returned an invalid meal plan format.");
  }

  const recommendations = normalizeRecommendations(
    parsed.recommendations,
    recipesPerMeal,
    perMeal,
    meals,
    mealBudgets,
  );

  onProgress?.(100, "Complete!");

  return {
    planType: "daily",
    days: [{ day: "", recommendations }],
    recommendations,
    nutritionTip,
  };
}

/**
 * Regenerate a single meal/snack slot (e.g. when user cannot buy the suggested dish).
 * @param {{
 *   plan: object,
 *   dayIndex: number,
 *   meal: string,
 *   currentRecipeName?: string,
 *   calorieTarget?: number,
 *   avoidRecipeNames?: string[],
 * }} params
 */
export async function regenerateSingleMealWithGroq({
  plan,
  dayIndex = 0,
  meal,
  currentRecipeName = "",
  calorieTarget = 0,
  avoidRecipeNames = [],
}) {
  const filters = plan?.filters ?? {};
  const meals = Array.isArray(plan?.meals) ? plan.meals : [];
  const categoryTitle = plan?.categoryTitle || "Meal Plan";
  const budget = Number(plan?.budget) || 0;
  const planType = plan?.planType === "weekly" ? "weekly" : "daily";
  const dailyBudget = Math.max(1, Math.floor(budget / (planType === "weekly" ? 7 : 1)));
  const mealBudgets = getDailyMealBudgets({ meals, dailyBudget });
  const mealBudget = mealBudgets[meal] ?? Math.max(1, Math.floor(dailyBudget / Math.max(1, meals.length)));
  const mealCalories = getMealCalorieTargets([meal], calorieTarget);
  const targetCalories = mealCalories[0]?.calories ?? 0;

  const allergies = Array.isArray(filters.allergies) ? filters.allergies : [];
  const avoidList = [
    currentRecipeName,
    ...avoidRecipeNames,
  ]
    .map((name) => String(name || "").trim())
    .filter(Boolean);

  const buildLocalFallback = () => ({
    meal,
    suggestedBudget: mealBudget,
    recipes: [
      buildLocalRecipe({
        meal,
        categoryTitle,
        dayIndex: dayIndex + avoidList.length + Date.now(),
        variant: avoidList.length + Math.floor(Math.random() * 5),
        targetCalories,
        allergies,
      }),
    ],
  });

  if (!isGroqConfigured()) {
    return buildLocalFallback();
  }

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const profile = buildProfileLines({
    activityLevel: filters.activityLevel || "Not set",
    bodyGoal: filters.bodyGoal || "Not set",
    healthStatus: filters.healthStatus || "Not specified",
    healthCondition: filters.healthCondition || "",
    allergies,
    proteinSource: filters.proteinSource || "Any",
    carbSource: filters.carbSource || "Any",
    restriction: filters.restriction || "None",
    cookingMethod: filters.cookingMethod || "Any",
    age: filters.age,
    gender: filters.gender,
    heightCm: filters.heightCm,
    weightKg: filters.weightKg,
    bmi: filters.bmi,
    bmiCategory: filters.bmiCategory || "",
  });

  const rules = buildSharedRules({
    meals: [meal],
    allergies,
    activityLevel: filters.activityLevel || "Not set",
    bodyGoal: filters.bodyGoal || "Not set",
    healthStatus: filters.healthStatus || "Not specified",
    healthCondition: filters.healthCondition || "",
    bmiCategory: filters.bmiCategory || "",
    calorieTarget,
    budget,
    planType,
    mealBudgets: { [meal]: mealBudget },
    dailyBudget,
  });

  const dayLabel = plan?.days?.[dayIndex]?.day || (dayIndex > 0 ? `Day ${dayIndex + 1}` : "Today");
  const avoidRule = avoidList.length
    ? `- Do NOT repeat these recipes: ${avoidList.join(", ")}`
    : "";
  const unavailableRule = currentRecipeName
    ? `- The user cannot buy or find "${currentRecipeName}". Suggest a different ${meal.toLowerCase()} with different main ingredients and protein source when possible.`
    : "";

  const prompt = `Philippines-focused healthy meal planner. Generate ONE replacement ${meal} only.

Category: ${categoryTitle}
${dayLabel} — replacement ${meal}
User profile:
${profile}

Budget cap for this ${meal.toLowerCase()}: ₱${mealBudget} (estimatedTotal must NOT exceed this)
${targetCalories > 0 ? `Target calories for this ${meal.toLowerCase()}: ~${targetCalories} kcal` : ""}
${unavailableRule}
${avoidRule}

Return ONLY valid JSON (no markdown):
{"meal":"${meal}","suggestedBudget":${mealBudget},"recipes":[${RECIPE_SHAPE}]}

${rules}
- Exactly 1 recipe (never 2)
- Keep compact (max 5 ingredients, max 3 steps)`;

  try {
    const parsed = await callGroqWithRetry({ apiKey, prompt, maxTokens: 1800 });
    const rows = Array.isArray(parsed?.recommendations)
      ? parsed.recommendations
      : parsed?.meal
        ? [parsed]
        : [];

    const normalized = normalizeRecommendations(
      rows,
      1,
      mealBudget,
      [meal],
      { [meal]: mealBudget },
    );

    if (normalized[0]?.recipes?.length) {
      return normalized[0];
    }

    if (parsed?.recipes?.length) {
      return normalizeRecommendations(
        [{ meal, suggestedBudget: mealBudget, recipes: parsed.recipes }],
        1,
        mealBudget,
        [meal],
        { [meal]: mealBudget },
      )[0];
    }
  } catch {
    // Fall through to local sample meal.
  }

  return buildLocalFallback();
}
