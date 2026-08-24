import { useEffect, useState } from "react";
import { fetchMealPlans, saveMealPlan } from "../lib/mealPlanDb";
import { isWeeklyPlan } from "../lib/mealPlanView";
import MealPlanDetails from "./MealPlanDetails";

function formatDate(ms) {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return "";
  }
}

export default function History() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [messageModal, setMessageModal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      setError("");

      try {
        const rows = await fetchMealPlans();
        if (isMounted) setPlans(rows);
      } catch (loadError) {
        if (isMounted) setError(loadError.message);
      }
    };

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveSelectedPlan = async () => {
    if (!selectedPlan) return;

    if (selectedPlan.isSaved) {
      setMessageModal("This meal plan is already saved.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const savedPlan = await saveMealPlan(selectedPlan);
      setSelectedPlan(savedPlan);
      setPlans((currentPlans) =>
        currentPlans.map((plan) =>
          plan.dbId === savedPlan.dbId ? savedPlan : plan,
        ),
      );
      setMessageModal("Meal plan saved successfully.");
    } catch (saveError) {
      setMessageModal(`Could not save meal plan: ${saveError.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePlanUpdate = (updatedPlan) => {
    setSelectedPlan(updatedPlan);
    setPlans((current) =>
      current.map((plan) =>
        plan.dbId === updatedPlan.dbId ? updatedPlan : plan,
      ),
    );
    setMessageModal("Meal updated successfully.");
  };

  return (
    <section className="section">
      <div className="section__head">
        <div>
          <h3 className="section__title">History</h3>
          <p className="section__subtitle">
            Your generated meal recommendations will appear here.
          </p>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}

      {plans.length === 0 ? (
        <div className="glass" style={{ padding: 24 }}>
          <p style={{ margin: 0, color: "var(--text-2)", lineHeight: 1.7 }}>
            No generated meal history yet. Go to Dashboard, click <b>Select</b>,
            then <b>Generate Recommendations</b>.
          </p>
        </div>
      ) : (
        <div className="grid4">
          {plans.map((p) => (
            <article className="catcard" key={p.id}>
              <div className="catcard__body">
                <div className="catcard__row">
                  <h4 className="catcard__title">{p.categoryTitle}</h4>
                  <span className="badge badge--balanced">
                    ₱{Number(p.budget || 0).toLocaleString()}
                  </span>
                </div>
                <p className="catcard__desc">
                  {isWeeklyPlan(p) ? "1 Week Plan" : "1 Day Plan"} • For 1 person
                  • Meals: {(p.meals || []).join(" + ") || "—"}
                </p>
                <p className="catcard__desc" style={{ marginTop: 8 }}>
                  Saved: {formatDate(p.createdAt)}
                </p>

                <button
                  className="softbtn softbtn--light"
                  type="button"
                  style={{ marginTop: 14 }}
                  onClick={() => setSelectedPlan(p)}
                >
                  View
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedPlan ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="historyPlanTitle"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "grid",
            placeItems: "center",
            padding: 16,
            background: "rgba(15, 23, 42, 0.55)",
          }}
        >
          <div
            className="glass modalScroll"
            style={{
              width: "min(920px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              borderRadius: 24,
            }}
          >
            <div className="plan__resultHead">
              <div>
                <h3
                  id="historyPlanTitle"
                  className="section__title"
                  style={{ marginBottom: 6 }}
                >
                  {selectedPlan.categoryTitle}
                </h3>
                <div className="helper">
                  {isWeeklyPlan(selectedPlan) ? "1 Week Plan" : "1 Day Plan"} •
                  Budget: ₱{Number(selectedPlan.budget || 0).toLocaleString()} •
                  For 1 person • Meals:{" "}
                  {(selectedPlan.meals || []).join(" + ") || "—"}
                </div>
                <div className="helper" style={{ marginTop: 4 }}>
                  Ingredient prices are estimates and may vary by location,
                  season, and store.
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  className="softbtn softbtn--light"
                  type="button"
                  onClick={handleSaveSelectedPlan}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Meal Plan"}
                </button>
                <button
                  className="softbtn softbtn--light"
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                >
                  Close
                </button>
              </div>
            </div>

            <MealPlanDetails
              plan={selectedPlan}
              editable
              onPlanUpdate={handlePlanUpdate}
            />
          </div>
        </div>
      ) : null}

      {messageModal ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            display: "grid",
            placeItems: "center",
            padding: 16,
            background: "rgba(15, 23, 42, 0.45)",
          }}
        >
          <div
            className="glass"
            style={{
              width: "min(380px, 100%)",
              padding: 22,
              borderRadius: 22,
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 16px", color: "var(--text)", fontWeight: 800 }}>
              {messageModal}
            </p>
            <button
              className="softbtn softbtn--light"
              type="button"
              onClick={() => setMessageModal("")}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

