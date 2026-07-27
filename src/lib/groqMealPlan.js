const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export const WEEK_DAYS = [
  "Day 1",
  "Day 2",
  "Day 3",
  "Day 4",
  "Day 5",
  "Day 6",
  "Day 7",
];

function parseJsonFromContent(content) {
  const text = String(content || "").trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : text;
  return JSON.parse(raw);
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
    steps: Array.isArray(recipe?.steps) ? recipe.steps.map(normalizeStep) : [],
  };
}

function normalizeRecommendations(list, recipesPerMeal, fallbackBudget) {
  return (Array.isArray(list) ? list : []).map((item) => ({
    meal: item?.meal || "Meal",
    suggestedBudget: Number(item?.suggestedBudget) || fallbackBudget,
    recipes: (item?.recipes || []).slice(0, recipesPerMeal).map(normalizeRecipe),
  }));
}

export function isGroqConfigured() {
  return Boolean(import.meta.env.VITE_GROQ_API_KEY);
}

function buildProfileLines({
  activityLevel,
  bodyGoal,
  allergies,
  proteinSource,
  carbSource,
  restriction,
  cookingMethod,
}) {
  const allergyText = allergies?.length ? allergies.join(", ") : "None";

  return `Activity level: ${activityLevel}
Body goal: ${bodyGoal}
Allergies to strictly avoid: ${allergyText}
Preferred protein source: ${proteinSource}
Preferred carb source: ${carbSource}
Other restriction: ${restriction}
Preferred cooking method: ${cookingMethod}`;
}

const RECIPE_SHAPE = `{
  "name": "Recipe name",
  "ingredients": [
    { "item": "2 eggs", "estimatedPrice": 20 },
    { "item": "1 cup rice", "estimatedPrice": 15 }
  ],
  "estimatedTotal": 35,
  "estimatedCookTime": "15 minutes",
  "estimatedCalories": 520,
  "steps": [
    { "instruction": "Prepare ingredients", "estimatedTime": "3 minutes" },
    { "instruction": "Cook until done", "estimatedTime": "12 minutes" }
  ]
}`;

function buildSharedRules({ meals, allergies, activityLevel, bodyGoal }) {
  const allergyText = allergies?.length ? allergies.join(", ") : "None";

  return `Rules:
- Include exactly these meals each day: ${meals.join(", ")}
- Never use any ingredient related to these allergies: ${allergyText}
- Match the portion sizes and calories to the activity level (${activityLevel}) and body goal (${bodyGoal})
- Respect the protein, carb, restriction, and cooking method preferences when they are not "Any" or "None"
- Use affordable Filipino ingredients when possible
- Every ingredient must include estimatedPrice as a realistic Philippine peso estimate
- estimatedTotal should be the sum of ingredient estimatedPrice values
- Every recipe must include estimatedCookTime and estimatedCalories
- Every cooking step must include instruction and estimatedTime
- suggestedBudget should be a reasonable integer in PHP
- Keep steps short and clear
- This is general food advice only, not medical advice`;
}

async function callGroq({ apiKey, prompt, maxTokens }) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You output only JSON for meal plans. Ingredients must be arrays of objects with item and estimatedPrice. Steps must be arrays of objects with instruction and estimatedTime.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message || `Meal generator failed (${response.status})`;
    throw new Error(message);
  }

  return parseJsonFromContent(payload?.choices?.[0]?.message?.content);
}

/**
 * @param {{
 *   categoryTitle: string,
 *   budget: number,
 *   people: number,
 *   meals: string[],
 *   proteinSource: string,
 *   carbSource: string,
 *   restriction: string,
 *   cookingMethod: string,
 *   activityLevel: string,
 *   bodyGoal: string,
 *   allergies: string[],
 *   planType: "daily" | "weekly",
 * }} params
 */
export async function generateMealPlanWithGroq({
  categoryTitle,
  budget,
  people,
  meals,
  proteinSource,
  carbSource,
  restriction,
  cookingMethod,
  activityLevel = "Not set",
  bodyGoal = "Not set",
  allergies = [],
  planType = "daily",
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
  const perPerson = Math.max(1, Math.floor(dailyBudget / people));
  const perMeal = Math.max(1, Math.floor(perPerson / meals.length));
  const recipesPerMeal = isWeekly ? 1 : 2;

  const profile = buildProfileLines({
    activityLevel,
    bodyGoal,
    allergies,
    proteinSource,
    carbSource,
    restriction,
    cookingMethod,
  });
  const rules = buildSharedRules({ meals, allergies, activityLevel, bodyGoal });

  const budgetLines = isWeekly
    ? `Total budget for the whole week: ₱${budget}
Approx budget per day: ₱${dailyBudget}`
    : `Total budget for the day: ₱${budget}`;

  const shape = isWeekly
    ? `{
  "nutritionTip": "One short tip for this activity level and goal",
  "days": [
    {
      "day": "Day 1",
      "recommendations": [
        {
          "meal": "Breakfast",
          "suggestedBudget": 80,
          "recipes": [${RECIPE_SHAPE}]
        }
      ]
    }
  ]
}`
    : `{
  "nutritionTip": "One short tip for this activity level and goal",
  "recommendations": [
    {
      "meal": "Breakfast",
      "suggestedBudget": 80,
      "recipes": [${RECIPE_SHAPE}]
    }
  ]
}`;

  const extraRules = isWeekly
    ? `- Return exactly 7 days: ${WEEK_DAYS.join(", ")}
- Each meal must have exactly 1 recipe
- Use different recipes across the week so meals do not repeat every day
- Keep each recipe to a maximum of 4 short steps`
    : `- Each meal must have exactly 2 recipes`;

  const prompt = `You are a Filipino meal planning assistant for a healthy meal recommender app.
Create practical home-cooked meal recommendations in PHP (₱).

Category: ${categoryTitle}
${budgetLines}
People: ${people}
Meals to plan per day: ${meals.join(", ")}
Approx budget per person per day: ₱${perPerson}
Approx budget per meal slot: ₱${perMeal}
${profile}

Return ONLY valid JSON (no markdown) in this exact shape:
${shape}

${rules}
${extraRules}`;

  const parsed = await callGroq({
    apiKey,
    prompt,
    maxTokens: isWeekly ? 8000 : 3000,
  });

  const nutritionTip = String(parsed?.nutritionTip || "").trim();

  if (isWeekly) {
    const rawDays = Array.isArray(parsed?.days) ? parsed.days : [];
    if (rawDays.length === 0) {
      throw new Error("Meal generator returned an invalid weekly plan format.");
    }

    const days = rawDays.slice(0, WEEK_DAYS.length).map((day, index) => ({
      day: day?.day || WEEK_DAYS[index],
      recommendations: normalizeRecommendations(
        day?.recommendations,
        recipesPerMeal,
        perMeal,
      ),
    }));

    return { planType: "weekly", days, nutritionTip };
  }

  if (!Array.isArray(parsed?.recommendations)) {
    throw new Error("Meal generator returned an invalid meal plan format.");
  }

  const recommendations = normalizeRecommendations(
    parsed.recommendations,
    recipesPerMeal,
    perMeal,
  );

  return {
    planType: "daily",
    days: [{ day: "", recommendations }],
    recommendations,
    nutritionTip,
  };
}
