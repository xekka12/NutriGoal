import { isGroqConfigured } from "./groqMealPlan";
import { MEAL_CATEGORIES, getCategoryBySlug } from "./mealCategories";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function parseJsonFromContent(content) {
  const text = String(content || "").trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : text;
  return JSON.parse(raw);
}

function scoreCategoryLocally(category, { bodyGoal, activityLevel, allergies, budget }) {
  let score = 40;
  const goal = String(bodyGoal || "").toLowerCase();
  const activity = String(activityLevel || "").toLowerCase();
  const tags = category.tags || [];
  const allergyList = allergies || [];

  if (goal.includes("lose") || goal.includes("cut")) {
    if (tags.includes("lose-weight") || tags.includes("cutting") || tags.includes("low-carb")) {
      score += 35;
    }
  }

  if (goal.includes("gain") || goal.includes("bulk") || goal.includes("muscle")) {
    if (tags.includes("bulking") || tags.includes("muscle") || tags.includes("protein")) {
      score += 35;
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

  if (Number(budget) > 0 && Number(budget) < 250) {
    if (tags.includes("budget") || tags.includes("affordable") || tags.includes("student")) {
      score += 25;
    }
  }

  if (allergyList.some((a) => String(a).toLowerCase() === "fish" || String(a).toLowerCase() === "shellfish" || String(a).toLowerCase() === "shrimp")) {
    if (category.slug === "vegetarian") score += 10;
  }

  if (allergyList.some((a) => String(a).toLowerCase() === "dairy" || String(a).toLowerCase() === "egg")) {
    if (category.slug === "vegetarian") score += 5;
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

  if (Number(filters.budget) > 0) {
    parts.push(
      `It also works within your optional budget of ₱${Number(filters.budget).toLocaleString()}.`,
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
      ? `₱${Number(filters.budget).toLocaleString()} (optional daily budget hint)`
      : "Not provided (budget is optional)";

  const prompt = `You are a Filipino healthy meal planning assistant.
Based on the user's profile, recommend the best meal categories from the catalog.

User profile:
- Body goal: ${filters.bodyGoal}
- Activity level: ${filters.activityLevel}
- Allergies to avoid: ${allergyText}
- Optional budget: ${budgetText}

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
- If budget is low, prefer budget-friendly categories
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
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You output only JSON for meal category recommendations with short explanations.",
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
