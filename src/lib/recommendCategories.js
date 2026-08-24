import { isGroqConfigured } from "./groqMealPlan";
import { MEAL_CATEGORIES, getCategoryBySlug } from "./mealCategories";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-20b";

function parseJsonFromContent(content) {
  const text = String(content || "").trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : text;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error("Failed to parse category JSON.");
  }
}

function scoreCategoryLocally(
  category,
  {
    bodyGoal,
    activityLevel,
    healthStatus,
    healthCondition,
    allergies,
    budget,
    bmiCategory,
  },
) {
  let score = 40;
  const goal = String(bodyGoal || "").toLowerCase();
  const activity = String(activityLevel || "").toLowerCase();
  const health = String(healthStatus || "").toLowerCase();
  const condition = String(healthCondition || "").toLowerCase();
  const bmi = String(bmiCategory || "").toLowerCase();
  const tags = category.tags || [];
  const allergyList = allergies || [];

  if (goal.includes("lose") || goal.includes("cut") || goal.includes("tone")) {
    if (tags.includes("lose-weight") || tags.includes("cutting") || tags.includes("low-carb")) {
      score += 35;
    }
  }

  if (goal.includes("gain") || goal.includes("bulk") || goal.includes("muscle")) {
    if (tags.includes("bulking") || tags.includes("muscle") || tags.includes("protein")) {
      score += 35;
    }
  }

  if (goal.includes("recomp")) {
    if (tags.includes("protein") || tags.includes("balanced") || tags.includes("muscle")) {
      score += 30;
    }
  }

  if (goal.includes("energy") || goal.includes("stamina")) {
    if (tags.includes("balanced") || tags.includes("athlete") || tags.includes("healthy")) {
      score += 25;
    }
  }

  if (goal.includes("maintain") || goal.includes("healthy")) {
    if (tags.includes("balanced") || tags.includes("healthy") || tags.includes("heart")) {
      score += 25;
    }
  }

  if (activity.includes("gym") || activity.includes("athlete") || activity.includes("workout")) {
    if (tags.includes("gym") || tags.includes("athlete") || tags.includes("protein")) {
      score += 20;
    }
  }

  if (activity.includes("sitting") || activity.includes("sedentary")) {
    if (tags.includes("light") || tags.includes("balanced") || tags.includes("lose-weight")) {
      score += 15;
    }
  }

  if (Number(budget) > 0 && Number(budget) < 1500) {
    if (tags.includes("budget") || tags.includes("affordable") || tags.includes("student")) {
      score += 25;
    }
  }

  if (Number(budget) >= 5000) {
    if (tags.includes("protein") || tags.includes("balanced") || tags.includes("healthy")) {
      score += 15;
    }
  }

  if (allergyList.some((a) => String(a).toLowerCase() === "fish" || String(a).toLowerCase() === "shellfish" || String(a).toLowerCase() === "shrimp")) {
    if (category.slug === "vegetarian") score += 10;
  }

  if (allergyList.some((a) => String(a).toLowerCase() === "dairy" || String(a).toLowerCase() === "egg")) {
    if (category.slug === "vegetarian") score += 5;
  }

  if (health.includes("has illness") || health.includes("medical condition")) {
    if (tags.includes("healthy") || tags.includes("balanced") || tags.includes("heart")) {
      score += 20;
    }
    if (tags.includes("low-carb") || tags.includes("light")) {
      score += 8;
    }
  } else if (health.includes("no current illness")) {
    if (tags.includes("balanced") || tags.includes("healthy")) {
      score += 6;
    }
  }

  if (condition.includes("heart") || condition.includes("hypertension")) {
    if (tags.includes("heart") || tags.includes("light") || tags.includes("healthy")) {
      score += 15;
    }
  }

  if (condition.includes("diabetes")) {
    if (tags.includes("low-carb") || tags.includes("balanced") || tags.includes("healthy")) {
      score += 15;
    }
  }

  if (bmi.includes("underweight")) {
    if (tags.includes("bulking") || tags.includes("protein") || tags.includes("muscle")) {
      score += 18;
    }
  } else if (bmi.includes("overweight") || bmi.includes("obese")) {
    if (tags.includes("lose-weight") || tags.includes("cutting") || tags.includes("light")) {
      score += 18;
    }
  } else if (bmi.includes("normal")) {
    if (tags.includes("balanced") || tags.includes("healthy")) {
      score += 10;
    }
  }

  return Math.min(99, score);
}

function buildLocalExplanation(category, filters) {
  const parts = [];
  const goal = filters.bodyGoal || "your goal";
  const activity = filters.activityLevel || "your activity level";

  parts.push(
    `${category.title} fits ${goal.toLowerCase()} while matching ${activity.toLowerCase()}.`,
  );

  if (filters.allergies?.length) {
    parts.push(
      `We can keep recipes clear of ${filters.allergies.join(", ").toLowerCase()}.`,
    );
  }

  if (String(filters.healthStatus || "").trim()) {
    parts.push(`Health status noted: ${String(filters.healthStatus).toLowerCase()}.`);
  }
  if (String(filters.healthCondition || "").trim()) {
    parts.push(
      `Condition focus: ${String(filters.healthCondition).toLowerCase()}.`,
    );
  }

  if (filters.bmi && filters.bmiCategory) {
    parts.push(`BMI ${filters.bmi} (${filters.bmiCategory}).`);
  }

  if (Number(filters.budget) > 0) {
    parts.push(
      `It also works within a budget of about ₱${Number(filters.budget).toLocaleString()}.`,
    );
  } else {
    parts.push(category.description);
  }

  return parts.join(" ");
}

function recommendLocally(filters) {
  return [...MEAL_CATEGORIES]
    .map((category) => {
      const matchScore = scoreCategoryLocally(category, filters);
      return {
        ...category,
        matchScore,
        explanation: buildLocalExplanation(category, filters),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);
}

async function recommendWithGroq(filters) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const catalog = MEAL_CATEGORIES.map((category) => ({
    slug: category.slug,
    title: category.title,
    description: category.description,
    tags: category.tags,
  }));

  const allergyText = filters.allergies?.length
    ? filters.allergies.join(", ")
    : "None";
  const budgetText =
    Number(filters.budget) > 0
      ? `₱${Number(filters.budget).toLocaleString()} (optional budget hint)`
      : "Not provided — user sets budget on the Meal Plan page before generating";

  const prompt = `You are a Filipino healthy meal planning assistant.
Based on the user's profile, recommend the best meal categories from the catalog.

User profile:
- Body goal: ${filters.bodyGoal}
- Activity level: ${filters.activityLevel}
- Health status: ${filters.healthStatus || "Not specified"}
- Illness/condition details: ${filters.healthCondition || "None"}
- Age: ${filters.age || "Not provided"}
- Gender: ${filters.gender || "Not provided"}
- Height: ${filters.heightCm ? `${filters.heightCm} cm` : "Not provided"}
- Weight: ${filters.weightKg ? `${filters.weightKg} kg` : "Not provided"}
- BMI: ${filters.bmi ? `${filters.bmi} (${filters.bmiCategory || "n/a"})` : "Not provided"}
- Allergies to avoid: ${allergyText}
- Budget hint: ${budgetText}

Available categories:
${JSON.stringify(catalog, null, 2)}

Return ONLY valid JSON in this exact shape:
{
  "recommendations": [
    {
      "slug": "muscle-gain",
      "matchScore": 92,
      "explanation": "Short clear explanation why this category fits the user."
    }
  ]
}

Rules:
- Recommend 3 to 4 categories only
- Use only slugs from the catalog
- matchScore must be an integer from 1 to 99
- explanation must be 1-2 sentences, practical, and mention the user's goal/activity
- Prefer categories that support the body goal (e.g. bulking/muscle gain, cutting/weight loss)
- Factor in BMI category (underweight → calorie-dense/protein; overweight/obese → lighter/cutting; normal → balanced)
- If a budget hint is provided and low, prefer budget-friendly categories
- Respect allergies in the explanation
- This is general food advice only, not medical advice`;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 1200,
      reasoning_effort: "low",
      messages: [
        {
          role: "system",
          content:
            "You output compact JSON only for meal category recommendations with short explanations. No markdown.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      payload?.error?.message || `Category recommendation failed (${response.status})`,
    );
  }

  const parsed = parseJsonFromContent(payload?.choices?.[0]?.message?.content);
  const list = Array.isArray(parsed?.recommendations)
    ? parsed.recommendations
    : [];

  const mapped = list
    .map((item) => {
      const category = getCategoryBySlug(item?.slug);
      if (!category) return null;
      return {
        ...category,
        matchScore: Math.min(99, Math.max(1, Number(item.matchScore) || 70)),
        explanation:
          String(item.explanation || "").trim() ||
          buildLocalExplanation(category, filters),
      };
    })
    .filter(Boolean);

  if (mapped.length === 0) {
    throw new Error("No valid category recommendations returned.");
  }

  return mapped.slice(0, 4);
}

/**
 * @param {{
 *   bodyGoal: string,
 *   activityLevel: string,
 *   healthStatus?: string,
 *   healthCondition?: string,
 *   allergies: string[],
 *   budget?: number | string,
 * }} filters
 */
export async function recommendMealCategories(filters) {
  if (isGroqConfigured()) {
    try {
      return await recommendWithGroq(filters);
    } catch {
      return recommendLocally(filters);
    }
  }

  return recommendLocally(filters);
}
