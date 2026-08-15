import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "../lib/AuthProvider";
import { fetchMealPlans } from "../lib/mealPlanDb";
import { recommendMealCategories } from "../lib/recommendCategories";
import { getUserFullName } from "../lib/userProfile";
import {
  ACTIVITY_CARDS,
  ACTIVITY_OPTIONS,
  AllergyPicker,
  GOAL_CARDS,
  GOAL_OPTIONS,
  HEALTH_CONDITION_CARDS,
  HEALTH_CONDITION_OPTIONS,
  HEALTH_STATUS_CARDS,
  HEALTH_STATUS_OPTIONS,
  ILLNESS_STATUS_VALUE,
  ImageCardPicker,
} from "./formFields";

export default function Dashboard() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const [progress, setProgress] = useState({ generated: 0, saved: 0 });
  const [activityLevel, setActivityLevel] = useState(ACTIVITY_OPTIONS[0]);
  const [bodyGoal, setBodyGoal] = useState(GOAL_OPTIONS[0]);
  const [healthStatus, setHealthStatus] = useState(HEALTH_STATUS_OPTIONS[0]);
  const [healthCondition, setHealthCondition] = useState("");
  const [allergies, setAllergies] = useState([]);
  const [budget, setBudget] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasFiltered, setHasFiltered] = useState(false);

  const fullName = useMemo(
    () => getUserFullName(session?.user),
    [session?.user],
  );

  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      try {
        const plans = await fetchMealPlans();
        if (!isMounted) return;

        setProgress({
          generated: plans.length,
          saved: plans.filter((plan) => plan.isSaved).length,
        });
      } catch {
        if (isMounted) setProgress({ generated: 0, saved: 0 });
      }
    };

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFindCategories = async (event) => {
    event.preventDefault();
    setError("");

    if (!String(activityLevel || "").trim()) {
      setError("Please choose or specify your activity level.");
      return;
    }
    if (!String(bodyGoal || "").trim()) {
      setError("Please choose or specify your body goal.");
      return;
    }
    if (
      String(healthStatus || "").trim() === ILLNESS_STATUS_VALUE &&
      !String(healthCondition || "").trim()
    ) {
      setError("Please specify your illness or medical condition.");
      return;
    }

    setLoading(true);
    setHasFiltered(true);

    const budgetNumber = Number(budget);
    const filters = {
      activityLevel: String(activityLevel).trim(),
      bodyGoal: String(bodyGoal).trim(),
      healthStatus: String(healthStatus).trim(),
      healthCondition:
        String(healthStatus).trim() === ILLNESS_STATUS_VALUE
          ? String(healthCondition).trim()
          : "",
      allergies,
      budget:
        Number.isFinite(budgetNumber) && budgetNumber > 0 ? budgetNumber : 0,
    };

    try {
      const result = await recommendMealCategories(filters);
      setRecommendations(result);
    } catch (recommendError) {
      setRecommendations([]);
      setError(
        recommendError.message ||
          "Could not recommend meal categories. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (category) => {
    const budgetNumber = Number(budget);
    const hasBudget = Number.isFinite(budgetNumber) && budgetNumber > 0;

    navigate("/meal-plan", {
      state: {
        categorySlug: category.slug,
        categoryTitle: category.title,
        badge: category.badge,
        activityLevel: String(activityLevel).trim(),
        bodyGoal: String(bodyGoal).trim(),
        healthStatus: String(healthStatus).trim(),
        healthCondition:
          String(healthStatus).trim() === ILLNESS_STATUS_VALUE
            ? String(healthCondition).trim()
            : "",
        allergies,
        budget: hasBudget ? budgetNumber : undefined,
        lockedProfile: true,
        budgetLocked: hasBudget,
      },
    });
  };

  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <p className="hero__welcome">
            Welcome, <span className="text-primary">{fullName}</span>
          </p>
          <h2 className="hero__title">
            Plan your vitality, <span className="text-primary">one meal</span> at
            a time.
          </h2>
          <p className="hero__subtitle">
            Tell us your goal, activity, health status, and allergies first.
            Then we recommend the meal categories that fit you best.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <h3 className="section__title">Personalize Your Plan</h3>
            <p className="section__subtitle">
              Filter first. Meal categories appear after we match your profile.
            </p>
          </div>
        </div>

        <form className="glass filterPanel" onSubmit={handleFindCategories}>
          <div className="formgrid formgrid--2">
            <ImageCardPicker
              id="dashActivityLevel"
              label="What do you usually do?"
              value={activityLevel}
              onChange={setActivityLevel}
              cards={ACTIVITY_CARDS}
              helper="Tap to choose your activity level."
            />
            <ImageCardPicker
              id="dashBodyGoal"
              label="Body Goal"
              value={bodyGoal}
              onChange={setBodyGoal}
              cards={GOAL_CARDS}
              helper="Tap to choose your body goal."
            />
          </div>

          <div className="formgrid formgrid--2">
            <ImageCardPicker
              id="dashHealthStatus"
              label="Health Status"
              value={healthStatus}
              onChange={setHealthStatus}
              cards={HEALTH_STATUS_CARDS}
              allowSpecify={false}
              helper="Do you currently have an illness or medical condition?"
            />
          </div>

          {healthStatus === ILLNESS_STATUS_VALUE ? (
            <div className="formgrid formgrid--2">
              <ImageCardPicker
                id="dashHealthCondition"
                label="What illness/condition?"
                value={healthCondition}
                onChange={setHealthCondition}
                cards={HEALTH_CONDITION_CARDS}
                helper="Choose your condition, or specify your own."
              />
            </div>
          ) : null}

          <AllergyPicker allergies={allergies} onChange={setAllergies} />

          <div className="field">
            <label className="label" htmlFor="dashBudget">
              Budget (optional)
            </label>
            <div className="inputwrap">
              <span className="inputwrap__prefix" aria-hidden="true">
                ₱
              </span>
              <input
                id="dashBudget"
                className="input"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="Leave blank if you want suggestions without budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div className="helper">
              Optional. If provided, we will prefer categories that fit your
              budget. This will be locked later on the Meal Plan page.
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <button className="primarybtn" type="submit" disabled={loading}>
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              tune
            </span>
            {loading
              ? "Finding matching categories..."
              : "Find Matching Meal Categories"}
          </button>
        </form>
      </section>

      {hasFiltered ? (
        <section className="section">
          <div className="section__head">
            <div>
              <h3 className="section__title">Recommended For You</h3>
              <p className="section__subtitle">
                Based on your filters, these meal categories fit best. Each one
                includes an explanation.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="glass" style={{ padding: 24 }}>
              <p style={{ margin: 0, color: "var(--text-2)" }}>
                Matching your goal, activity, health status, and allergies...
              </p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="glass" style={{ padding: 24 }}>
              <p style={{ margin: 0, color: "var(--text-2)" }}>
                No matching categories found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid4">
              {recommendations.map((category) => (
                <article className="catcard" key={category.slug}>
                  <div className="catcard__media">
                    <img
                      className="catcard__img"
                      src={category.image}
                      alt={category.alt}
                    />
                  </div>
                  <div className="catcard__body">
                    <div className="catcard__row">
                      <h4 className="catcard__title">{category.title}</h4>
                      <span className={`badge badge--${category.badge.variant}`}>
                        {category.matchScore}% match
                      </span>
                    </div>
                    <p className="catcard__desc">{category.explanation}</p>
                    <button
                      className="softbtn softbtn--light"
                      type="button"
                      onClick={() => handleSelectCategory(category)}
                    >
                      Select
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <section className="stats">
        <div className="glass stats__left">
          <h3 className="stats__title">How It Works</h3>
          <div className="guidegrid">
            <div className="guideitem">
              <span className="material-symbols-outlined guideitem__icon">
                tune
              </span>
              <div>
                <h4 className="guideitem__title">Filter your profile</h4>
                <p className="guideitem__text">
                  Set your activity level, body goal, health status, allergies,
                  and optional budget first.
                </p>
              </div>
            </div>

            <div className="guideitem">
              <span className="material-symbols-outlined guideitem__icon">
                restaurant_menu
              </span>
              <div>
                <h4 className="guideitem__title">Get category matches</h4>
                <p className="guideitem__text">
                  We recommend meal categories that fit you, with a short
                  explanation for each.
                </p>
              </div>
            </div>

            <div className="guideitem">
              <span className="material-symbols-outlined guideitem__icon">
                bolt
              </span>
              <div>
                <h4 className="guideitem__title">Generate your meals</h4>
                <p className="guideitem__text">
                  Choose a category, then generate a 1-day or 1-week meal plan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="goal">
          <div>
            <h3 className="goal__title">Meal Plan Progress</h3>
            <p className="goal__subtitle">
              Track your generated and saved meal recommendations.
            </p>
          </div>
          <div className="goal__bottom">
            <div className="progressCards">
              <div className="progressCard">
                <div className="progressCard__value">{progress.generated}</div>
                <div className="progressCard__label">Generated plans</div>
              </div>
              <div className="progressCard">
                <div className="progressCard__value">{progress.saved}</div>
                <div className="progressCard__label">Saved meals</div>
              </div>
            </div>
            <div className="helper" style={{ color: "rgba(255,255,255,0.82)" }}>
              Generate a meal plan to add it to History. Save it to keep it in
              Saved Meals.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
