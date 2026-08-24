import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  generateMealPlanWithGroq,
  getMealCalorieTargets,
  isGroqConfigured,
  sortMealsByDayOrder,
  WEEK_DAYS,
} from "../lib/groqMealPlan";
import {
  describeBudgetTier,
  getDailyMealBudgets,
  getSuggestedBudget,
  MIN_BUDGET_PER_MEAL,
  MIN_BUDGET_PER_SNACK,
  SNACK_SUGGESTED_DAILY_ADD,
} from "../lib/budgetTier";
import { buildLocalRecipe } from "../lib/localRecipes";
import { saveGeneratedMealPlan, saveMealPlan, updateMealPlan } from "../lib/mealPlanDb";
import {
  ACTIVITY_CARDS,
  ACTIVITY_OPTIONS,
  AllergyPicker,
  GOAL_CARDS,
  GOAL_OPTIONS,
  HEALTH_STATUS_OPTIONS,
  HealthStatusPicker,
  ILLNESS_STATUS_VALUE,
  ImageCardPicker,
  SpecifiableSelect,
} from "./formFields";
import GenerateProgressModal from "./GenerateProgressModal";
import MealPlanDetails from "./MealPlanDetails";
import BmiCalculator from "./BmiCalculator";
import {
  classifyBmi,
  computeBmi,
  estimateDailyCalories,
  getBmiGoalCaution,
  validateBmiInputs,
} from "./bmiUtils";

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
const PEOPLE_COUNT = 1;
const LAST_SELECTION_KEY = "lastMealPlanSelection";

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
  const initialHealthStatus =
    state?.healthStatus ?? savedSelection?.healthStatus ?? HEALTH_STATUS_OPTIONS[0];
  const initialHealthCondition =
    state?.healthCondition ?? savedSelection?.healthCondition ?? "";
  const initialAllergies = Array.isArray(state?.allergies)
    ? state.allergies
    : Array.isArray(savedSelection?.allergies)
      ? savedSelection.allergies
      : [];
  const initialAge =
    state?.age ?? savedSelection?.age ?? "";
  const initialGender =
    state?.gender ?? savedSelection?.gender ?? "female";
  const initialHeightCm =
    state?.heightCm ?? savedSelection?.heightCm ?? "";
  const initialWeightKg =
    state?.weightKg ?? savedSelection?.weightKg ?? "";
  const initialPlanType =
    state?.planType ?? savedSelection?.planType ?? "daily";
  const initialIncludeSnack = Boolean(
    state?.includeSnack ?? savedSelection?.includeSnack,
  );
  const lockedProfile = Boolean(
    state?.lockedProfile ?? savedSelection?.lockedProfile,
  );

  useMemo(() => {
    try {
      localStorage.setItem(
        LAST_SELECTION_KEY,
        JSON.stringify({
          categorySlug,
          categoryTitle,
          budget: initialBudget,
          people: PEOPLE_COUNT,
          meals: initialMeals,
          proteinSource: initialProteinSource,
          carbSource: initialCarbSource,
          restriction: initialRestriction,
          cookingMethod: initialCookingMethod,
          activityLevel: initialActivityLevel,
          bodyGoal: initialBodyGoal,
          healthStatus: initialHealthStatus,
          healthCondition: initialHealthCondition,
          allergies: initialAllergies,
          age: initialAge,
          gender: initialGender,
          heightCm: initialHeightCm,
          weightKg: initialWeightKg,
          planType: initialPlanType,
          includeSnack: initialIncludeSnack,
          lockedProfile,
        }),
      );
    } catch {
      // ignore
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [budget, setBudget] = useState(() => {
    if (initialBudget > 0) return String(initialBudget);
    return String(
      getSuggestedBudget({
        mealsCount: (initialMeals ?? ["Lunch"]).length,
        planType: initialPlanType,
      }).total,
    );
  });
  const budgetNumber = useMemo(() => {
    const n = Number(budget);
    return Number.isFinite(n) ? n : 0;
  }, [budget]);

  const [selectedMeals, setSelectedMeals] = useState(initialMeals ?? ["Lunch"]);
  const [proteinSource, setProteinSource] = useState(initialProteinSource);
  const [carbSource, setCarbSource] = useState(initialCarbSource);
  const [restriction, setRestriction] = useState(initialRestriction);
  const [cookingMethod, setCookingMethod] = useState(initialCookingMethod);
  const [activityLevel, setActivityLevel] = useState(initialActivityLevel);
  const [bodyGoal, setBodyGoal] = useState(initialBodyGoal);
  const [healthStatus, setHealthStatus] = useState(initialHealthStatus);
  const [healthCondition, setHealthCondition] = useState(initialHealthCondition);
  const [allergies, setAllergies] = useState(initialAllergies);
  const [bmiAge, setBmiAge] = useState(
    initialAge === "" || initialAge == null ? "" : String(initialAge)
  );
  const [bmiHeightCm, setBmiHeightCm] = useState(
    initialHeightCm === "" || initialHeightCm == null
      ? ""
      : String(initialHeightCm)
  );
  const [bmiWeightKg, setBmiWeightKg] = useState(
    initialWeightKg === "" || initialWeightKg == null
      ? ""
      : String(initialWeightKg)
  );
  const [bmiGender, setBmiGender] = useState(initialGender || "female");
  const [planType, setPlanType] = useState(initialPlanType);
  const [includeSnack, setIncludeSnack] = useState(initialIncludeSnack);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [generateProgressLabel, setGenerateProgressLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingBmiCaution, setPendingBmiCaution] = useState(null);

  const isWeekly = planType === "weekly";
  const dayCount = isWeekly ? WEEK_DAYS.length : 1;

  const suggestedBudget = useMemo(
    () =>
      getSuggestedBudget({
        mealsCount: selectedMeals.length,
        planType,
        includeSnack,
      }),
    [selectedMeals.length, planType, includeSnack],
  );

  const minimumBudget = suggestedBudget.minimum;

  useEffect(() => {
    setBudget(String(suggestedBudget.total));
  }, [suggestedBudget.total]);

  const budgetTier = useMemo(
    () =>
      budgetNumber > 0
        ? describeBudgetTier({
            budget: budgetNumber,
            mealsCount: selectedMeals.length,
            planType,
            includeSnack,
          })
        : null,
    [budgetNumber, selectedMeals.length, planType, includeSnack],
  );

  const orderedMeals = useMemo(
    () => sortMealsByDayOrder(selectedMeals),
    [selectedMeals]
  );

  const generationMeals = useMemo(
    () =>
      includeSnack
        ? sortMealsByDayOrder([...orderedMeals, "Snack"])
        : orderedMeals,
    [includeSnack, orderedMeals],
  );

  const calorieTarget = useMemo(
    () =>
      estimateDailyCalories({
        age: bmiAge,
        heightCm: bmiHeightCm,
        weightKg: bmiWeightKg,
        gender: bmiGender,
        activityLevel,
        bodyGoal,
      })?.target ?? 0,
    [bmiAge, bmiHeightCm, bmiWeightKg, bmiGender, activityLevel, bodyGoal]
  );

  const toggleMeal = (meal) => {
    setSelectedMeals((prev) => {
      if (prev.includes(meal)) return prev.filter((m) => m !== meal);
      if (prev.length >= 3) return prev;
      return [...prev, meal];
    });
  };

  const buildLocalRecommendations = (dayIndex = 0) => {
    const dailyBudget = Math.max(1, Math.floor(budgetNumber / dayCount));
    const mealBudgets = getDailyMealBudgets({
      meals: generationMeals,
      dailyBudget,
    });
    const mealCalories = getMealCalorieTargets(generationMeals, calorieTarget);

    return generationMeals.map((meal, mealIndex) => {
      const targetCalories = mealCalories[mealIndex]?.calories ?? 0;
      const recipeOptions = {
        meal,
        categoryTitle,
        dayIndex,
        targetCalories,
        allergies,
      };

      return {
        meal,
        suggestedBudget: mealBudgets[meal] ?? dailyBudget,
        recipes: [buildLocalRecipe({ ...recipeOptions, variant: mealIndex })],
      };
    });
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

  const generate = async ({ skipBmiCaution = false } = {}) => {
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
    if (!String(healthStatus || "").trim()) {
      setError("Please choose or specify your health status.");
      return;
    }
    if (
      String(healthStatus || "").trim() === ILLNESS_STATUS_VALUE &&
      !String(healthCondition || "").trim()
    ) {
      setError("Please specify your illness or medical condition.");
      return;
    }

    const bmiError = validateBmiInputs({
      age: bmiAge,
      heightCm: bmiHeightCm,
      weightKg: bmiWeightKg,
      gender: bmiGender,
    });
    if (bmiError) {
      setError(bmiError);
      return;
    }

    const bmiValue = computeBmi(bmiHeightCm, bmiWeightKg);
    const bmiCategory = classifyBmi(bmiValue);

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

    if (budgetNumber < minimumBudget) {
      const rangeText = isWeekly ? "for the whole week " : "for the day ";
      const snackHint = includeSnack
        ? ` (includes optional snack at ₱${MIN_BUDGET_PER_SNACK}/day)`
        : "";
      setError(
        `Your budget is too low. For ${selectedMeals.length} meal(s) per day${includeSnack ? " + snack" : ""} ${rangeText}, please enter at least ₱${minimumBudget.toLocaleString()} (about ₱${MIN_BUDGET_PER_MEAL} per meal${snackHint}).`,
      );
      return;
    }

    const caution = getBmiGoalCaution(bodyGoal, bmiValue, bmiCategory);
    if (!skipBmiCaution && !lockedProfile && caution) {
      setPendingBmiCaution(caution);
      return;
    }

    setLoading(true);
    setGenerateProgress(0);
    setGenerateProgressLabel("Starting...");

    const reportProgress = (pct, label) => {
      setGenerateProgress(pct);
      setGenerateProgressLabel(label);
    };

    let days = buildLocalDays();
    let nutritionTip = "";
    let source = "local";

    if (isGroqConfigured()) {
      try {
        const result = await generateMealPlanWithGroq({
          categoryTitle,
          budget: budgetNumber,
          meals: generationMeals,
          proteinSource: String(proteinSource).trim(),
          carbSource: String(carbSource).trim(),
          restriction: String(restriction).trim(),
          cookingMethod: String(cookingMethod).trim(),
          activityLevel: String(activityLevel).trim(),
          bodyGoal: String(bodyGoal).trim(),
          healthStatus: String(healthStatus).trim(),
          healthCondition:
            String(healthStatus).trim() === ILLNESS_STATUS_VALUE
              ? String(healthCondition).trim()
              : "",
          allergies,
          age: Number(bmiAge),
          gender: bmiGender,
          heightCm: Number(bmiHeightCm),
          weightKg: Number(bmiWeightKg),
          bmi: Number(bmiValue.toFixed(1)),
          bmiCategory: bmiCategory?.label || "",
          calorieTarget,
          planType,
          onProgress: reportProgress,
        });
        days = result.days;
        nutritionTip = result.nutritionTip;
        source = "groq";
      } catch (groqError) {
        const raw = String(groqError.message || "");
        const waitMatch = raw.match(/try again in\s+([\d.]+)\s*s/i);
        const waitHint = waitMatch
          ? ` Wait about ${Math.ceil(Number(waitMatch[1]))}s then try again.`
          : " Wait a bit then try again.";
        const isRateLimit = /rate limit|tokens per minute|tpm/i.test(raw);

        setError(
          isRateLimit
            ? `AI is temporarily rate-limited.${waitHint} Showing built-in sample meals for now (not AI-generated).`
            : `AI generator failed. Showing built-in sample meals instead. (${raw})`
        );
        days = buildLocalDays();
        source = "local-fallback";
        reportProgress(100, "Showing sample meals");
      }
    } else {
      reportProgress(40, "Picking sample meals...");
      reportProgress(100, "Complete!");
    }

    const now = Date.now();
    const record = {
      id: `${now}-${Math.random().toString(16).slice(2)}`,
      categorySlug: categorySlug || "custom",
      categoryTitle,
      meals: generationMeals,
      includeSnack,
      budget: budgetNumber,
      people: PEOPLE_COUNT,
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
        healthStatus,
        healthCondition:
          String(healthStatus).trim() === ILLNESS_STATUS_VALUE
            ? String(healthCondition).trim()
            : "",
        allergies,
        age: Number(bmiAge),
        gender: bmiGender,
        heightCm: Number(bmiHeightCm),
        weightKg: Number(bmiWeightKg),
        bmi: Number(bmiValue.toFixed(1)),
        bmiCategory: bmiCategory?.label || "",
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

  const handleGeneratedPlanUpdate = async (updatedPlan) => {
    setGenerated(updatedPlan);
    if (updatedPlan.dbId) {
      try {
        const saved = await updateMealPlan(updatedPlan);
        setGenerated(saved);
      } catch (updateError) {
        setError(`Meal updated locally but could not sync: ${updateError.message}`);
      }
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
            <ImageCardPicker
              id="activityLevel"
              label="Activity Level"
              value={activityLevel}
              onChange={setActivityLevel}
              cards={ACTIVITY_CARDS}
              locked={lockedProfile}
            />
            <ImageCardPicker
              id="bodyGoal"
              label="Body Goal"
              value={bodyGoal}
              onChange={setBodyGoal}
              cards={GOAL_CARDS}
              locked={lockedProfile}
            />
          </div>

          <div className="formgrid formgrid--2">
            <HealthStatusPicker
              id="healthStatus"
              healthStatus={healthStatus}
              healthCondition={healthCondition}
              onChange={({ healthStatus: nextStatus, healthCondition: nextCondition }) => {
                setHealthStatus(nextStatus);
                setHealthCondition(nextCondition);
              }}
              locked={lockedProfile}
            />
          </div>

          <AllergyPicker
            allergies={allergies}
            onChange={setAllergies}
            locked={lockedProfile}
          />

          <BmiCalculator
            age={bmiAge}
            heightCm={bmiHeightCm}
            weightKg={bmiWeightKg}
            gender={bmiGender}
            activityLevel={activityLevel}
            bodyGoal={bodyGoal}
            locked={lockedProfile}
            onChange={(next) => {
              setBmiAge(next.age);
              setBmiHeightCm(next.heightCm);
              setBmiWeightKg(next.weightKg);
              setBmiGender(next.gender);
            }}
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

          <div className="field">
            <div className="label">Optional Healthy Snack</div>
            <div className="pillgrid">
              <button
                type="button"
                className={!includeSnack ? "pill pill--active" : "pill"}
                onClick={() => setIncludeSnack(false)}
                aria-pressed={!includeSnack}
              >
                No snack
              </button>
              <button
                type="button"
                className={includeSnack ? "pill pill--active" : "pill"}
                onClick={() => setIncludeSnack(true)}
                aria-pressed={includeSnack}
              >
                Include snack
              </button>
            </div>
            <div className="helper">
              Optional lang — kung gusto mo ng meryenda, magdadagdag ng isang
              healthy snack bawat araw (kasama na sa budget, +~₱
              {SNACK_SUGGESTED_DAILY_ADD}/day sa suggested total) based sa goal
              at health profile mo.
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="planBudget">
              {isWeekly ? "Budget for the whole week (required)" : "Budget for the day (required)"}
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
                placeholder={String(suggestedBudget.total)}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min={minimumBudget}
                required
              />
            </div>
            <div className="helper">
              Suggested: ₱{suggestedBudget.total.toLocaleString()} for{" "}
              {selectedMeals.length} meal
              {selectedMeals.length === 1 ? "" : "s"}
              {includeSnack ? " + snack" : ""}
              {isWeekly ? " × 7 days" : ""} (~₱
              {suggestedBudget.perMeal.toLocaleString()}/slot). Minimum: ₱
              {minimumBudget.toLocaleString()} (₱{MIN_BUDGET_PER_MEAL}/meal
              {includeSnack ? `, ₱${MIN_BUDGET_PER_SNACK}/snack — included in total` : ""}).
              {includeSnack ? (
                <>
                  {" "}
                  Snack share ay kasama na sa budget — hindi dagdag sa labas.
                </>
              ) : null}
              Auto-updates when you change plan duration or meals — you can
              still edit if you want to spend more.
              {budgetNumber > 0 && budgetTier ? (
                <>
                  {" "}
                  Your entry: ~₱{budgetTier.perMeal.toLocaleString()}/meal (
                  {budgetTier.label}
                  {budgetTier.perMeal >= 150 ? " — tastier meals" : ""}).
                </>
              ) : null}
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          {!isGroqConfigured() ? (
            <div className="helper">
              AI meal generator is not configured. Using built-in meals until then.
            </div>
          ) : null}

          <GenerateProgressModal
            open={loading}
            percent={generateProgress}
            label={generateProgressLabel}
          />

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
                <div className="planSummary">
                  <div className="planSummary__heading">
                    <span className="material-symbols-outlined">restaurant_menu</span>
                    <div>
                      <span className="planSummary__eyebrow">Your personalized plan</span>
                      <h3>
                    {generated.planType === "weekly"
                      ? "7-Day Meal Plan"
                      : "Daily Meal Recommendations"}
                      </h3>
                    </div>
                  </div>

                  <div className="planSummary__facts">
                    <div><span>Budget</span><strong>₱{generated.budget.toLocaleString()}</strong></div>
                    <div><span>Servings</span><strong>1 person</strong></div>
                    <div><span>Goal</span><strong>{generated.filters.bodyGoal}</strong></div>
                    <div>
                      <span>Daily target</span>
                      <strong>
                        {calorieTarget > 0
                          ? `${calorieTarget.toLocaleString()} kcal`
                          : "Not set"}
                      </strong>
                    </div>
                  </div>

                  {generated.nutritionTip ? (
                    <div className="planSummary__tip">
                      <span className="material-symbols-outlined">lightbulb</span>
                      <span>{generated.nutritionTip}</span>
                    </div>
                  ) : null}
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

              <MealPlanDetails
                plan={generated}
                editable
                showProfile={false}
                onPlanUpdate={handleGeneratedPlanUpdate}
              />
            </div>
          ) : null}
        </div>
      </div>

      {pendingBmiCaution ? (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mealPlanBmiCautionTitle"
        >
          <div className="confirmModal glass bmiCautionModal">
            <span
              className="material-symbols-outlined bmiCautionModal__icon"
              aria-hidden="true"
            >
              warning
            </span>
            <h3 id="mealPlanBmiCautionTitle" className="confirmModal__title">
              {pendingBmiCaution.title}
            </h3>
            <p className="confirmModal__text">
              {pendingBmiCaution.message}
            </p>
            <p className="bmiCautionModal__note">
              This is a general BMI screening only, not medical advice.
            </p>
            <div className="confirmModal__actions">
              <button
                className="softbtn"
                type="button"
                onClick={() => setPendingBmiCaution(null)}
              >
                Change My Goal
              </button>
              <button
                className="primarybtn"
                type="button"
                onClick={() => {
                  setPendingBmiCaution(null);
                  generate({ skipBmiCaution: true });
                }}
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

