import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  isGroqConfigured,
  regenerateSingleMealWithGroq,
} from "../lib/groqMealPlan";
import { updateMealPlan } from "../lib/mealPlanDb";
import {
  getPlanDays,
  getRecipeTotal,
  normalizeIngredient,
  normalizeStep,
  replaceMealInPlan,
} from "../lib/mealPlanView";
import { estimateDailyCalories } from "./bmiUtils";

function RecipePreview({ recipe }) {
  if (!recipe) return null;

  return (
    <div className="swapMealPreview">
      <div className="recipe__name">
        <span>{recipe.name}</span>
      </div>
      <div className="recipe__stats">
        {getRecipeTotal(recipe) > 0 ? (
          <span>
            <span className="material-symbols-outlined">payments</span>₱
            {getRecipeTotal(recipe).toLocaleString()}
          </span>
        ) : null}
        {recipe.estimatedCookTime ? (
          <span>
            <span className="material-symbols-outlined">schedule</span>
            {recipe.estimatedCookTime}
          </span>
        ) : null}
        {Number(recipe.estimatedCalories) > 0 ? (
          <span className="recipe__stat--calories">
            <span className="material-symbols-outlined">local_fire_department</span>
            {Number(recipe.estimatedCalories).toLocaleString()} kcal
          </span>
        ) : null}
        {Number(recipe.estimatedProteinGrams) > 0 ? (
          <span className="recipe__stat--protein">
            <span className="material-symbols-outlined">fitness_center</span>
            {Number(recipe.estimatedProteinGrams).toLocaleString()}g protein
          </span>
        ) : null}
      </div>
      <div className="recipe__cols">
        <div className="recipe__col">
          <div className="recipe__label">Ingredients</div>
          <ul className="plan__list">
            {(recipe.ingredients || []).map((ing) => {
              const ingredient = normalizeIngredient(ing);
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
          <div className="recipe__label">How to cook</div>
          <ol className="plan__olist">
            {(recipe.steps || []).map((st, index) => {
              const step = normalizeStep(st);
              return (
                <li key={`${step.instruction}-${index}`}>
                  {step.instruction}
                  {step.estimatedTime ? ` (${step.estimatedTime})` : ""}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function SwapMealPortal({ children }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export default function SwapMealFlow({ plan, target, onClose, onPlanUpdate }) {
  const [phase, setPhase] = useState("confirm");
  const [pendingRecommendation, setPendingRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (target) {
      setPhase("confirm");
      setPendingRecommendation(null);
      setError("");
      setLoading(false);
      setSaving(false);
    }
  }, [target?.dayIndex, target?.recommendation?.meal, target?.recommendation?.recipes?.[0]?.name]);

  if (!target) return null;

  const { dayIndex, dayLabel, recommendation } = target;
  const meal = recommendation?.meal || "Meal";
  const currentRecipe = recommendation?.recipes?.[0];
  const currentRecipeName = currentRecipe?.name || "";

  const getCalorieTarget = () => {
    const filters = plan?.filters ?? {};
    return (
      estimateDailyCalories({
        age: filters.age,
        heightCm: filters.heightCm,
        weightKg: filters.weightKg,
        gender: filters.gender,
        activityLevel: filters.activityLevel,
        bodyGoal: filters.bodyGoal,
      })?.target ?? 0
    );
  };

  const getAvoidNames = () => {
    const dayPlan = getPlanDays(plan)[dayIndex];
    return (dayPlan?.recommendations || [])
      .flatMap((row) => row?.recipes || [])
      .map((recipe) => recipe?.name)
      .filter(Boolean);
  };

  const runGeneration = async () => {
    setLoading(true);
    setError("");

    try {
      const nextRecommendation = await regenerateSingleMealWithGroq({
        plan,
        dayIndex,
        meal,
        currentRecipeName,
        calorieTarget: getCalorieTarget(),
        avoidRecipeNames: getAvoidNames(),
      });
      setPendingRecommendation(nextRecommendation);
      setPhase("preview");
    } catch (generationError) {
      setError(generationError.message || "Could not generate a replacement meal.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pendingRecommendation) return;

    setSaving(true);
    setError("");

    try {
      const updatedPlan = replaceMealInPlan(plan, {
        dayIndex,
        meal,
        recommendation: pendingRecommendation,
      });

      let savedPlan = updatedPlan;
      if (updatedPlan.dbId) {
        savedPlan = await updateMealPlan(updatedPlan);
      }

      onPlanUpdate?.(savedPlan);
      onClose();
    } catch (saveError) {
      setError(saveError.message || "Could not save the updated meal.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (loading || saving) return;
    onClose();
  };

  return (
    <SwapMealPortal>
      <div
        className="modalOverlay swapMealOverlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="swapMealTitle"
        onClick={handleClose}
      >
        <div
          className="confirmModal glass swapMealModal"
          onClick={(event) => event.stopPropagation()}
        >
        {phase === "confirm" ? (
          <>
            <span className="material-symbols-outlined swapMealModal__icon" aria-hidden="true">
              shopping_basket
            </span>
            <h3 id="swapMealTitle" className="confirmModal__title">
              Swap this {meal.toLowerCase()}?
            </h3>
            <p className="confirmModal__text">
              Is <strong>{currentRecipeName || `this ${meal.toLowerCase()}`}</strong> not
              available to you{dayLabel ? ` on ${dayLabel}` : ""}? We&apos;ll suggest a new
              healthy {meal.toLowerCase()} based on your profile and budget (up to ₱
              {Number(recommendation?.suggestedBudget || 0).toLocaleString()}).
            </p>
            {!isGroqConfigured() ? (
              <p className="helper" style={{ marginTop: 0 }}>
                AI is not configured — a built-in alternative will be used.
              </p>
            ) : null}
            {error ? <div className="error">{error}</div> : null}
            <div className="confirmModal__actions">
              <button className="softbtn" type="button" onClick={handleClose} disabled={loading}>
                Cancel
              </button>
              <button
                className="softbtn softbtn--light"
                type="button"
                onClick={runGeneration}
                disabled={loading}
              >
                {loading ? "Finding alternative..." : "Yes, swap meal"}
              </button>
            </div>
          </>
        ) : null}

        {phase === "preview" && pendingRecommendation ? (
          <>
            <h3 id="swapMealTitle" className="confirmModal__title">
              New {meal.toLowerCase()} suggestion
            </h3>
            <p className="confirmModal__text">
              Review the replacement below. Save it to update your plan, or generate again
              for another option.
            </p>
            <RecipePreview recipe={pendingRecommendation.recipes?.[0]} />
            {error ? <div className="error">{error}</div> : null}
            <div className="confirmModal__actions swapMealModal__actions">
              <button className="softbtn" type="button" onClick={handleClose} disabled={loading || saving}>
                Cancel
              </button>
              <button
                className="softbtn softbtn--light"
                type="button"
                onClick={runGeneration}
                disabled={loading || saving}
              >
                {loading ? "Generating..." : "Generate again"}
              </button>
              <button
                className="softbtn softbtn--light"
                type="button"
                onClick={handleSave}
                disabled={loading || saving}
              >
                {saving ? "Saving..." : "Save meal"}
              </button>
            </div>
          </>
        ) : null}
        </div>
      </div>
    </SwapMealPortal>
  );
}
