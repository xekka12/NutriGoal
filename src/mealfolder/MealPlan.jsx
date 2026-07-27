import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  generateMealPlanWithGroq,
  isGroqConfigured,
  WEEK_DAYS,
} from "../lib/groqMealPlan";
import { saveGeneratedMealPlan, saveMealPlan } from "../lib/mealPlanDb";
import {
  getPlanDays,
  getRecipeTotal,
  normalizeIngredient,
  normalizeStep,
} from "../lib/mealPlanView";
import {
  ACTIVITY_OPTIONS,
  AllergyPicker,
  GOAL_OPTIONS,
  SpecifiableSelect,
} from "./formFields";

const MEALS = ["Breakfast", "Lunch", "Dinner"];
const PROTEIN_OPTIONS = [
  "Any",
  "Chicken",
  "Beef",
  "Pork",
  "Fish",
  "Seafood",
  "Egg",
  "Tofu",
  "Beans",
  "No Meat",
];
const CARB_OPTIONS = [
  "Any",
  "Rice",
  "Brown Rice",
  "Bread",
  "Pasta",
  "Noodles",
  "Oats",
  "Potato",
  "Sweet Potato",
  "No Rice",
  "Low-Carb",
];
const RESTRICTION_OPTIONS = [
  "None",
  "Dairy-Free",
  "Gluten-Free",
  "Nut-Free",
  "Egg-Free",
  "Seafood-Free",
  "Soy-Free",
  "Low-Sodium",
  "Low-Sugar",
];
const COOKING_METHOD_OPTIONS = [
  "Any",
  "Grilled",
  "Steamed",
  "Boiled",
  "Stir-Fried",
  "Air-Fried",
  "Roasted",
  "Baked",
];
const MIN_BUDGET_PER_PERSON_PER_MEAL = 40;
const LAST_SELECTION_KEY = "lastMealPlanSelection";

function makeRecipe(meal, categoryTitle, variant) {
  const base = String(categoryTitle || "").toLowerCase();

  if (base.includes("vegetarian")) {
    if (meal === "Breakfast") {
      return {
        name: variant === 1 ? "Veggie Omelet (No meat)" : "Oat & Banana Bowl",
        ingredients:
          variant === 1
            ? [
                "2 eggs",
                "1 cup spinach",
                "1 small tomato (chopped)",
                "1/4 onion (chopped)",
                "Salt & pepper",
                "1 tsp oil",
              ]
            : ["1/2 cup oats", "1 banana", "1 cup milk/water", "Honey (optional)"],
        steps:
          variant === 1
            ? [
                "Saute onion and tomato for 1–2 minutes.",
                "Add spinach and cook until wilted.",
                "Beat eggs with salt & pepper, then pour into pan.",
                "Cook until set, fold, and serve.",
              ]
            : [
                "Cook oats with milk/water until thick.",
                "Slice banana and mix in.",
                "Add honey or cinnamon if you want.",
              ],
      };
    }
    return {
      name: variant === 1 ? "Ginisang Gulay" : "Tofu & Veggie Stir-fry",
      ingredients:
        variant === 1
          ? [
              "Assorted vegetables (kangkong/pechay/carrot)",
              "2 cloves garlic",
              "1/2 onion",
              "1 tbsp soy sauce",
              "Salt & pepper",
              "1 tsp oil",
            ]
          : [
              "200g tofu (cubed)",
              "Assorted vegetables",
              "2 cloves garlic",
              "1 tbsp soy sauce",
              "1 tsp oil",
            ],
      steps:
        variant === 1
          ? [
              "Saute garlic and onion.",
              "Add vegetables and stir for 3–5 minutes.",
              "Season with soy sauce, salt & pepper.",
              "Cook until tender then serve.",
            ]
          : [
              "Pan-fry tofu until lightly golden.",
              "Saute garlic, add vegetables, then add tofu.",
              "Season with soy sauce, cook 2–3 minutes, serve.",
            ],
    };
  }

  if (base.includes("high-protein")) {
    return {
      name: variant === 1 ? "Chicken & Veg Bowl" : "Egg & Tuna Plate",
      ingredients:
        variant === 1
          ? ["150g chicken breast", "1 cup mixed veggies", "Salt & pepper", "1 tsp oil"]
          : ["2 eggs", "1 small can tuna", "Salt & pepper", "Rice/veggies (optional)"],
      steps:
        variant === 1
          ? [
              "Season chicken with salt & pepper.",
              "Cook chicken in a pan until done.",
              "Saute veggies quickly.",
              "Combine and serve.",
            ]
          : [
              "Boil or fry eggs to your liking.",
              "Drain tuna and season lightly.",
              "Serve together (add rice/veggies if available).",
            ],
    };
  }

  if (base.includes("low-budget")) {
    return {
      name: variant === 1 ? "Egg + Rice" : "Mongo Guisado (Simple)",
      ingredients:
        variant === 1
          ? ["1–2 eggs", "1 cup rice", "Salt"]
          : ["1 cup mung beans", "Garlic & onion", "Water", "Salt", "Optional greens"],
      steps:
        variant === 1
          ? ["Cook rice.", "Cook eggs (boil/fry).", "Serve together."]
          : [
              "Boil mung beans until soft.",
              "Saute garlic & onion, add beans and a bit of broth.",
              "Season, add greens, simmer 2 minutes.",
            ],
    };
  }

  if (base.includes("mixed")) {
    return {
      name: variant === 1 ? "Chicken + Rice Plate" : "Fish + Veg Bowl",
      ingredients:
        variant === 1
          ? ["Chicken (any cut)", "Rice", "Garlic & onion", "Salt & pepper"]
          : ["Fish (fried/grilled)", "Vegetables", "Rice (optional)", "Salt & pepper"],
      steps:
        variant === 1
          ? [
              "Season chicken and cook until done.",
              "Cook rice.",
              "Serve chicken with rice.",
            ]
          : [
              "Cook fish (grill/fry).",
              "Saute vegetables lightly.",
              "Serve together (add rice if you want).",
            ],
    };
  }

  return {
    name: variant === 1 ? `${meal} Balanced Plate` : `${meal} Simple Bowl`,
    ingredients: [
      "1 protein (egg/chicken/fish)",
      "1 carb (rice/oats)",
      "1–2 vegetables",
      "Salt & pepper",
    ],
    steps: [
      "Cook your protein.",
      "Prepare your carb.",
      "Add vegetables and season.",
      "Combine and serve.",
    ],
  };
}

export default function MealPlan() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state ?? null;

  const savedSelection = useMemo(() => {
    try {
      const raw = localStorage.getItem(LAST_SELECTION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const categorySlug = state?.categorySlug ?? savedSelection?.categorySlug ?? "";
  const categoryTitle =
    state?.categoryTitle ?? savedSelection?.categoryTitle ?? "Meal Plan";
  const initialBudget =
    typeof state?.budget === "number"
      ? state.budget
      : typeof savedSelection?.budget === "number"
        ? savedSelection.budget
        : 0;
  const initialPeople =
    typeof state?.people === "number"
      ? state.people
      : typeof savedSelection?.people === "number"
        ? savedSelection.people
        : 1;
  const initialMeals = Array.isArray(state?.meals)
    ? state.meals
    : Array.isArray(savedSelection?.meals)
      ? savedSelection.meals
    : null;
  const initialProteinSource =
    state?.proteinSource ?? savedSelection?.proteinSource ?? "Any";
  const initialCarbSource = state?.carbSource ?? savedSelection?.carbSource ?? "Any";
  const initialRestriction =
    state?.restriction ?? savedSelection?.restriction ?? "None";
  const initialCookingMethod =
    state?.cookingMethod ?? savedSelection?.cookingMethod ?? "Any";
  const initialActivityLevel =
    state?.activityLevel ?? savedSelection?.activityLevel ?? ACTIVITY_OPTIONS[0];
  const initialBodyGoal =
    state?.bodyGoal ?? savedSelection?.bodyGoal ?? GOAL_OPTIONS[0];
  const initialAllergies = Array.isArray(state?.allergies)
    ? state.allergies
    : Array.isArray(savedSelection?.allergies)
      ? savedSelection.allergies
      : [];
  const initialPlanType =
    state?.planType ?? savedSelection?.planType ?? "daily";
  const lockedProfile = Boolean(
    state?.lockedProfile ?? savedSelection?.lockedProfile,
  );
  const budgetLocked = Boolean(
    state?.budgetLocked ?? savedSelection?.budgetLocked,
  );

  useMemo(() => {
    try {
      localStorage.setItem(
        LAST_SELECTION_KEY,
        JSON.stringify({
          categorySlug,
          categoryTitle,
          budget: initialBudget,
          people: initialPeople,
          meals: initialMeals,
          proteinSource: initialProteinSource,
          carbSource: initialCarbSource,
          restriction: initialRestriction,
          cookingMethod: initialCookingMethod,
          activityLevel: initialActivityLevel,
          bodyGoal: initialBodyGoal,
          allergies: initialAllergies,
          planType: initialPlanType,
          lockedProfile,
          budgetLocked,
        }),
      );
    } catch {
      // ignore
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [budget, setBudget] = useState(initialBudget ? String(initialBudget) : "");
  const budgetNumber = useMemo(() => {
    const n = Number(budget);
    return Number.isFinite(n) ? n : 0;
  }, [budget]);

  const [people, setPeople] = useState(String(initialPeople || 1));
  const peopleNumber = useMemo(() => {
    const n = Number(people);
    return Number.isFinite(n) ? n : 0;
  }, [people]);

  const [selectedMeals, setSelectedMeals] = useState(initialMeals ?? ["Lunch"]);
  const [proteinSource, setProteinSource] = useState(initialProteinSource);
  const [carbSource, setCarbSource] = useState(initialCarbSource);
  const [restriction, setRestriction] = useState(initialRestriction);
  const [cookingMethod, setCookingMethod] = useState(initialCookingMethod);
  const [activityLevel, setActivityLevel] = useState(initialActivityLevel);
  const [bodyGoal, setBodyGoal] = useState(initialBodyGoal);
  const [allergies, setAllergies] = useState(initialAllergies);
  const [planType, setPlanType] = useState(initialPlanType);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isWeekly = planType === "weekly";
  const dayCount = isWeekly ? WEEK_DAYS.length : 1;

  const toggleMeal = (meal) => {
    setSelectedMeals((prev) => {
      if (prev.includes(meal)) return prev.filter((m) => m !== meal);
      if (prev.length >= 3) return prev;
      return [...prev, meal];
    });
  };

  const buildLocalRecommendations = (variantOffset = 0) => {
    const dailyBudget = Math.max(1, Math.floor(budgetNumber / dayCount));
    const perPerson = Math.max(1, Math.floor(dailyBudget / peopleNumber));
    const perMeal = Math.max(1, Math.floor(perPerson / selectedMeals.length));

    return selectedMeals.map((meal) => ({
      meal,
      suggestedBudget: perMeal,
      recipes: isWeekly
        ? [makeRecipe(meal, categoryTitle, (variantOffset % 2) + 1)]
        : [
            makeRecipe(meal, categoryTitle, 1),
            makeRecipe(meal, categoryTitle, 2),
          ],
    }));
  };

  const buildLocalDays = () => {
    if (!isWeekly) {
      return [{ day: "", recommendations: buildLocalRecommendations() }];
    }

    return WEEK_DAYS.map((day, index) => ({
      day,
      recommendations: buildLocalRecommendations(index),
    }));
  };

  const generate = async () => {
    setError("");
    setGenerated(null);

    if (selectedMeals.length < 1) {
      setError("Please choose at least 1 meal (Breakfast/Lunch/Dinner).");
      return;
    }
    if (selectedMeals.length > 3) {
      setError("You can only choose up to 3 meals.");
      return;
    }
    if (!String(activityLevel || "").trim()) {
      setError("Please choose or specify your activity level.");
      return;
    }
    if (!String(bodyGoal || "").trim()) {
      setError("Please choose or specify your body goal.");
      return;
    }
    if (!String(proteinSource || "").trim()) {
      setError("Please choose or specify a protein source.");
      return;
    }
    if (!String(carbSource || "").trim()) {
      setError("Please choose or specify a carb source.");
      return;
    }
    if (!String(restriction || "").trim()) {
      setError("Please choose or specify a restriction.");
      return;
    }
    if (!String(cookingMethod || "").trim()) {
      setError("Please choose or specify a cooking method.");
      return;
    }
    if (budgetNumber <= 0) {
      setError("Please enter your budget (must be greater than 0).");
      return;
    }
    if (peopleNumber < 1) {
      setError("Please enter how many people will eat (at least 1).");
      return;
    }

    const minimumBudget =
      peopleNumber *
      selectedMeals.length *
      dayCount *
      MIN_BUDGET_PER_PERSON_PER_MEAL;
    if (budgetNumber < minimumBudget) {
      const rangeText = isWeekly ? "for the whole week " : "";
      setError(
        `Your budget is too low. For ${peopleNumber} person(s) and ${selectedMeals.length} meal(s) per day ${rangeText}, please enter at least ₱${minimumBudget.toLocaleString()} (about ₱${MIN_BUDGET_PER_PERSON_PER_MEAL} per person per meal).`
      );
      return;
    }

    setLoading(true);

    let days = buildLocalDays();
    let nutritionTip = "";
    let source = "local";

    if (isGroqConfigured()) {
      try {
        const result = await generateMealPlanWithGroq({
          categoryTitle,
          budget: budgetNumber,
          people: peopleNumber,
          meals: selectedMeals,
          proteinSource: String(proteinSource).trim(),
          carbSource: String(carbSource).trim(),
          restriction: String(restriction).trim(),
          cookingMethod: String(cookingMethod).trim(),
          activityLevel: String(activityLevel).trim(),
          bodyGoal: String(bodyGoal).trim(),
          allergies,
          planType,
        });
        days = result.days;
        nutritionTip = result.nutritionTip;
        source = "groq";
      } catch (groqError) {
        setError(
          `AI generator failed (${groqError.message}). Showing built-in meals instead.`
        );
        days = buildLocalDays();
        source = "local-fallback";
      }
    }

    const now = Date.now();
    const record = {
      id: `${now}-${Math.random().toString(16).slice(2)}`,
      categorySlug: categorySlug || "custom",
      categoryTitle,
      meals: selectedMeals,
      budget: budgetNumber,
      people: peopleNumber,
      planType,
      days,
      recommendations: days[0]?.recommendations ?? [],
      nutritionTip,
      filters: {
        proteinSource,
        carbSource,
        restriction,
        cookingMethod,
        activityLevel,
        bodyGoal,
        allergies,
      },
      source,
      createdAt: now,
    };

    try {
      const savedHistoryRecord = await saveGeneratedMealPlan(record);
      setGenerated(savedHistoryRecord);
    } catch (historyError) {
      setError(
        `Generated successfully, but could not save to History: ${historyError.message}`
      );
      setGenerated(record);
    }

    setLoading(false);
  };

  const saveThisPlan = async () => {
    if (!generated) return;

    setError("");
    setSaving(true);

    try {
      const savedRecord = await saveMealPlan(generated);
      setGenerated(savedRecord);
      navigate("/saved-plans");
    } catch (saveError) {
      setError(
        `Could not save meal plan to database: ${saveError.message}. Make sure tbl_meal_plans is linked to auth.users and has the correct RLS policies.`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section">
      <div className="section__head">
        <div>
          <h3 className="section__title">{categoryTitle}</h3>
          <p className="section__subtitle">
            {lockedProfile
              ? "Your Dashboard details are locked. Fill in the remaining options, then generate your meal plan."
              : "Set your filters, then generate a 1-day or 1-week meal plan."}
          </p>
        </div>
      </div>

      <div className="plan">
        <div className="glass plan__card">
          {lockedProfile ? (
            <div className="lockedProfileBanner">
              These details came from your Dashboard filters and cannot be
              changed here. Go back to Dashboard if you need to update them.
            </div>
          ) : null}

          <div className="formgrid formgrid--2">
            <SpecifiableSelect
              id="activityLevel"
              label="Activity Level"
              value={activityLevel}
              onChange={setActivityLevel}
              options={ACTIVITY_OPTIONS}
              locked={lockedProfile}
            />
            <SpecifiableSelect
              id="bodyGoal"
              label="Body Goal"
              value={bodyGoal}
              onChange={setBodyGoal}
              options={GOAL_OPTIONS}
              locked={lockedProfile}
            />
          </div>

          <AllergyPicker
            allergies={allergies}
            onChange={setAllergies}
            locked={lockedProfile}
          />

          <div className="field">
            <div className="label">Plan Duration</div>
            <div className="pillgrid">
              <button
                type="button"
                className={!isWeekly ? "pill pill--active" : "pill"}
                onClick={() => setPlanType("daily")}
                aria-pressed={!isWeekly}
              >
                1 Day
              </button>
              <button
                type="button"
                className={isWeekly ? "pill pill--active" : "pill"}
                onClick={() => setPlanType("weekly")}
                aria-pressed={isWeekly}
              >
                1 Week (7 days)
              </button>
            </div>
            <div className="helper">
              {isWeekly
                ? "You will get a different set of meals for each of the 7 days."
                : "You will get meal recommendations for one day."}
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="planBudget">
              {isWeekly ? "Budget for the whole week" : "Budget for the day"}
            </label>
            <div className="inputwrap">
              <span className="inputwrap__prefix" aria-hidden="true">
                ₱
              </span>
              <input
                id="planBudget"
                className="input"
                type="number"
                inputMode="numeric"
                placeholder="Enter your budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min={1}
                disabled={budgetLocked}
                readOnly={budgetLocked}
              />
            </div>
            <div className="helper">
              {budgetLocked
                ? "Budget is locked from your Dashboard filters."
                : `Minimum: ₱${(
                    peopleNumber *
                      selectedMeals.length *
                      dayCount *
                      MIN_BUDGET_PER_PERSON_PER_MEAL || 0
                  ).toLocaleString()} for your current selection.`}
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="people">
              How many people will eat?
            </label>
            <input
              id="people"
              className="input"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="e.g. 2"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
            />
          </div>

          <div className="field">
            <div className="label">Meal Options (choose 1 to 3)</div>
            <div className="pillgrid">
              {MEALS.map((meal) => {
                const active = selectedMeals.includes(meal);
                const disabled = !active && selectedMeals.length >= 3;
                return (
                  <button
                    key={meal}
                    type="button"
                    className={active ? "pill pill--active" : "pill"}
                    onClick={() => toggleMeal(meal)}
                    disabled={disabled}
                    aria-pressed={active}
                  >
                    {meal}
                  </button>
                );
              })}
            </div>
            <div className="helper">
              You can choose 1, 2, or 3 meals (Breakfast, Lunch, Dinner)
              {isWeekly ? " for each day of the week." : "."}
            </div>
          </div>

          <div className="formgrid formgrid--2">
            <SpecifiableSelect
              id="proteinSource"
              label="Protein Source"
              value={proteinSource}
              onChange={setProteinSource}
              options={PROTEIN_OPTIONS}
              helper="Choose one, or Specify other to type your own."
            />
            <SpecifiableSelect
              id="carbSource"
              label="Carb Source"
              value={carbSource}
              onChange={setCarbSource}
              options={CARB_OPTIONS}
              helper="Choose one, or Specify other to type your own."
            />
          </div>

          <div className="formgrid formgrid--2">
            <SpecifiableSelect
              id="restriction"
              label="Other Restriction"
              value={restriction}
              onChange={setRestriction}
              options={RESTRICTION_OPTIONS}
              helper="Choose one, or Specify other to type your own."
            />
            <SpecifiableSelect
              id="cookingMethod"
              label="Preferred Cooking Method"
              value={cookingMethod}
              onChange={setCookingMethod}
              options={COOKING_METHOD_OPTIONS}
              helper="Choose one, or Specify other to type your own."
            />
          </div>

          {error ? <div className="error">{error}</div> : null}

          {!isGroqConfigured() ? (
            <div className="helper">
              AI meal generator is not configured. Using built-in meals until then.
            </div>
          ) : null}

          <button
            className="primarybtn"
            type="button"
            onClick={generate}
            disabled={loading}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
            {loading
              ? isWeekly
                ? "Building your 7-day plan..."
                : "Generating recommendations..."
              : isWeekly
                ? "Generate 7-Day Meal Plan"
                : "Generate Recommendations"}
          </button>

          {generated ? (
            <div className="glass plan__result" style={{ padding: 18 }}>
              <div className="plan__resultHead">
                <div>
                  <div className="label">
                    {generated.planType === "weekly"
                      ? "7-Day Meal Plan"
                      : "Recommendations"}
                  </div>
                  <div className="helper" style={{ marginTop: 4 }}>
                    Budget: ₱{generated.budget.toLocaleString()} • People:{" "}
                    {generated.people} • Meals: {generated.meals.join(" + ")}
                  </div>
                  <div className="helper" style={{ marginTop: 4 }}>
                    Activity: {generated.filters.activityLevel} • Goal:{" "}
                    {generated.filters.bodyGoal} • Allergies:{" "}
                    {generated.filters.allergies?.length
                      ? generated.filters.allergies.join(", ")
                      : "None"}
                  </div>
                  <div className="helper" style={{ marginTop: 4 }}>
                    Protein: {generated.filters.proteinSource} • Carbs:{" "}
                    {generated.filters.carbSource} • Restriction:{" "}
                    {generated.filters.restriction} • Method:{" "}
                    {generated.filters.cookingMethod}
                  </div>
                  {generated.nutritionTip ? (
                    <div className="helper" style={{ marginTop: 4 }}>
                      Tip: {generated.nutritionTip}
                    </div>
                  ) : null}
                  <div className="helper" style={{ marginTop: 4 }}>
                    Ingredient prices are estimates and may vary by location,
                    season, and store.
                  </div>
                </div>
                <button
                  className="softbtn softbtn--light"
                  type="button"
                  onClick={saveThisPlan}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Meal Plan"}
                </button>
              </div>

              {getPlanDays(generated).map((dayPlan, dayIndex) => (
                <div className="planDay" key={dayPlan.day || `day-${dayIndex}`}>
                  {dayPlan.day ? (
                    <div className="planDay__title">{dayPlan.day}</div>
                  ) : null}
                  <div className="plan__recs">
                    {dayPlan.recommendations.map((r) => (
                      <div className="plan__recCard" key={r.meal}>
                        <div className="plan__recTitle">
                          {r.meal} • Suggested: ₱
                          {Number(r.suggestedBudget || 0).toLocaleString()}
                        </div>
                        <div className="plan__recipes">
                          {r.recipes.map((recipe) => (
                            <div className="recipe" key={recipe.name}>
                              <div className="recipe__name">
                                {recipe.name}{" "}
                                {getRecipeTotal(recipe) > 0 ? (
                                  <span className="helper">
                                    • Estimated total: ₱
                                    {getRecipeTotal(recipe).toLocaleString()}
                                  </span>
                                ) : null}
                                {recipe.estimatedCookTime ? (
                                  <span className="helper">
                                    {" "}
                                    • Cook time: {recipe.estimatedCookTime}
                                  </span>
                                ) : null}
                                {recipe.estimatedCalories > 0 ? (
                                  <span className="helper">
                                    {" "}
                                    • ~{recipe.estimatedCalories.toLocaleString()}{" "}
                                    kcal
                                  </span>
                                ) : null}
                              </div>
                              <div className="recipe__cols">
                                <div className="recipe__col">
                                  <div className="recipe__label">
                                    Ingredients
                                  </div>
                                  <ul className="plan__list">
                                    {recipe.ingredients.map((ing) => {
                                      const ingredient =
                                        normalizeIngredient(ing);
                                      return (
                                        <li key={ingredient.item}>
                                          {ingredient.item}
                                          {ingredient.estimatedPrice > 0
                                            ? ` — ₱${ingredient.estimatedPrice.toLocaleString()}`
                                            : ""}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                                <div className="recipe__col">
                                  <div className="recipe__label">
                                    How to cook
                                  </div>
                                  <ol className="plan__olist">
                                    {recipe.steps.map((st, index) => {
                                      const step = normalizeStep(st);
                                      return (
                                        <li key={`${step.instruction}-${index}`}>
                                          {step.instruction}
                                          {step.estimatedTime
                                            ? ` (${step.estimatedTime})`
                                            : ""}
                                        </li>
                                      );
                                    })}
                                  </ol>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

