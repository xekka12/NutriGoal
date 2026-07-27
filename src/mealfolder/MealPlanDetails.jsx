import {
  getPlanDays,
  getPlanFilters,
  getRecipeTotal,
  normalizeIngredient,
  normalizeStep,
} from "../lib/mealPlanView";

function ReadOnlySelect({ label, value }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <select className="input" value={value || "—"} disabled>
        <option value={value || "—"}>{value || "—"}</option>
      </select>
    </div>
  );
}

export default function MealPlanDetails({ plan }) {
  if (!plan) return null;

  const filters = getPlanFilters(plan);
  const days = getPlanDays(plan);

  return (
    <>
      <div className="formgrid formgrid--2" style={{ marginTop: 18 }}>
        <ReadOnlySelect label="Activity Level" value={filters.activityLevel} />
        <ReadOnlySelect label="Body Goal" value={filters.bodyGoal} />
      </div>

      <div className="formgrid formgrid--2" style={{ marginTop: 12 }}>
        <ReadOnlySelect label="Allergies" value={filters.allergiesText} />
        <ReadOnlySelect
          label="Restriction"
          value={filters.restriction}
        />
      </div>

      <div className="formgrid formgrid--2" style={{ marginTop: 12 }}>
        <ReadOnlySelect label="Protein Source" value={filters.proteinSource} />
        <ReadOnlySelect label="Carb Source" value={filters.carbSource} />
      </div>

      <div className="formgrid formgrid--2" style={{ marginTop: 12 }}>
        <ReadOnlySelect label="Cooking Method" value={filters.cookingMethod} />
        <ReadOnlySelect
          label="Plan Duration"
          value={plan.planType === "weekly" ? "1 Week (7 days)" : "1 Day"}
        />
      </div>

      {plan.nutritionTip ? (
        <div className="helper" style={{ marginTop: 12 }}>
          Tip: {plan.nutritionTip}
        </div>
      ) : null}

      {days.map((dayPlan, dayIndex) => (
        <div
          className="planDay"
          key={dayPlan.day || `day-${dayIndex}`}
          style={{ marginTop: 18 }}
        >
          {dayPlan.day ? (
            <div className="planDay__title">{dayPlan.day}</div>
          ) : null}

          <div className="plan__recs">
            {(dayPlan.recommendations || []).map((recommendation) => (
              <div className="plan__recCard" key={recommendation.meal}>
                <div className="plan__recTitle">
                  {recommendation.meal} • Suggested: ₱
                  {Number(recommendation.suggestedBudget || 0).toLocaleString()}
                </div>

                <div className="plan__recipes">
                  {(recommendation.recipes || []).map((recipe) => (
                    <div className="recipe" key={recipe.name}>
                      <div className="recipe__name">
                        {recipe.name}
                        {getRecipeTotal(recipe) > 0 ? (
                          <span className="helper">
                            {" "}
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
                        {Number(recipe.estimatedCalories) > 0 ? (
                          <span className="helper">
                            {" "}
                            • ~
                            {Number(recipe.estimatedCalories).toLocaleString()}{" "}
                            kcal
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
      ))}
    </>
  );
}
