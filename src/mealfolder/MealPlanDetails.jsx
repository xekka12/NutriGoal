import { useState } from "react";
import {
  getDayNutrition,
  getDayTotal,
  getPlanDailyBudget,
  getPlanDays,
  getPlanFilters,
  getRecipeTotal,
  normalizeIngredient,
  normalizeStep,
} from "../lib/mealPlanView";
import SwapMealFlow from "./SwapMealFlow";

function DetailItem({ label, value }) {
  return (
    <div className="planDetailItem">
      <div className="planDetailItem__label">{label}</div>
      <div className="planDetailItem__value">{value || "—"}</div>
    </div>
  );
}

export default function MealPlanDetails({ plan, editable = false, onPlanUpdate, showProfile = true }) {
  const [swapTarget, setSwapTarget] = useState(null);

  if (!plan) return null;

  const filters = getPlanFilters(plan);
  const days = getPlanDays(plan);
  const duration =
    plan.planType === "weekly" ? "1 Week (7 days)" : "1 Day";

  const detailItems = [
    { label: "Activity Level", value: filters.activityLevel },
    { label: "Body Goal", value: filters.bodyGoal },
    { label: "Allergies", value: filters.allergiesText },
    { label: "Restriction", value: filters.restriction },
    { label: "Protein Source", value: filters.proteinSource },
    { label: "Carb Source", value: filters.carbSource },
    { label: "Cooking Method", value: filters.cookingMethod },
    { label: "Plan Duration", value: duration },
  ];

  if (filters.healthStatus) {
    detailItems.splice(2, 0, {
      label: "Health Status",
      value: filters.healthCondition
        ? `${filters.healthStatus} (${filters.healthCondition})`
        : filters.healthStatus,
    });
  }

  if (filters.bmi) {
    detailItems.push({
      label: "BMI",
      value: filters.bmiCategory
        ? `${filters.bmi} (${filters.bmiCategory})`
        : String(filters.bmi),
    });
  }

  const canSwap = editable && typeof onPlanUpdate === "function";

  return (
    <>
      {showProfile ? (
        <div className="planDetailGrid" style={{ marginTop: 18 }}>
          {detailItems.map((item) => (
            <DetailItem
              key={item.label}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
      ) : null}

      {showProfile && plan.nutritionTip ? (
        <div className="helper" style={{ marginTop: 14 }}>
          Tip: {plan.nutritionTip}
        </div>
      ) : null}

      {days.map((dayPlan, dayIndex) => {
        const daySpend = getDayTotal(dayPlan);
        const dayBudgetCap = getPlanDailyBudget(plan);
        const overBudget = dayBudgetCap > 0 && daySpend > dayBudgetCap;

        return (
        <div
          className="planDay"
          key={dayPlan.day || `day-${dayIndex}`}
          style={{ marginTop: 18 }}
        >
          {dayPlan.day ? (
            <div className="planDay__head">
              <div className="planDay__title">{dayPlan.day}</div>
              {getDayNutrition(dayPlan).calories > 0 || daySpend > 0 ? (
                <div className={`planDay__totals${overBudget ? " planDay__totals--over" : ""}`}>
                  {getDayNutrition(dayPlan).calories > 0 ? (
                    <>
                      Day total: {getDayNutrition(dayPlan).calories.toLocaleString()} kcal
                      {" • "}
                      {getDayNutrition(dayPlan).protein.toLocaleString()}g protein
                    </>
                  ) : null}
                  {daySpend > 0 ? (
                    <>
                      {getDayNutrition(dayPlan).calories > 0 ? " • " : "Day total: "}
                      <span className="planDay__price">
                        ₱{daySpend.toLocaleString()}
                        {dayBudgetCap > 0 ? ` of ₱${dayBudgetCap.toLocaleString()} budget` : ""}
                      </span>
                      {overBudget ? (
                        <span className="planDay__overBudget">
                          {" "}
                          (₱{(daySpend - dayBudgetCap).toLocaleString()} over)
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="plan__recs">
            {(dayPlan.recommendations || []).map((recommendation) => (
              <div className="plan__recCard" key={`${dayPlan.day}-${recommendation.meal}`}>
                <div className="plan__recTitle">
                  <span>
                    {recommendation.meal} • Suggested: ₱
                    {Number(recommendation.suggestedBudget || 0).toLocaleString()}
                  </span>
                  {canSwap ? (
                    <button
                      type="button"
                      className="swapMealBtn"
                      onClick={() =>
                        setSwapTarget({
                          dayIndex,
                          dayLabel: dayPlan.day || "",
                          recommendation,
                        })
                      }
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        sync
                      </span>
                      Swap meal
                    </button>
                  ) : null}
                </div>

                <div className="plan__recipes">
                  {(recommendation.recipes || []).map((recipe) => (
                    <div className="recipe" key={recipe.name}>
                      <div className="recipe__name">
                        <span>{recipe.name}</span>
                      </div>
                      <div className="recipe__stats">
                        {getRecipeTotal(recipe) > 0 ? (
                          <span>
                            <span className="material-symbols-outlined">payments</span>
                            ₱
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
      );
      })}

      {canSwap ? (
        <SwapMealFlow
          plan={plan}
          target={swapTarget}
          onClose={() => setSwapTarget(null)}
          onPlanUpdate={onPlanUpdate}
        />
      ) : null}
    </>
  );
}
