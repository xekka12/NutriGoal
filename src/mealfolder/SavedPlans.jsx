import { useEffect, useState } from "react";
import { deleteMealPlan, fetchMealPlans } from "../lib/mealPlanDb";
import { downloadMealPlanPdf } from "../lib/mealPlanPdf";
import { isWeeklyPlan } from "../lib/mealPlanView";
import MealPlanDetails from "./MealPlanDetails";

function formatDate(ms) {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return "";
  }
}

export default function SavedPlans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      setError("");

      try {
        const rows = await fetchMealPlans();
        if (isMounted) setPlans(rows.filter((plan) => plan.isSaved));
      } catch (loadError) {
        if (isMounted) setError(loadError.message);
      }
    };

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      await deleteMealPlan(planToDelete.dbId, planToDelete);
      setPlans((current) =>
        current.filter((plan) => plan.dbId !== planToDelete.dbId),
      );
      if (selectedPlan?.dbId === planToDelete.dbId) {
        setSelectedPlan(null);
      }
      setMessage("Deleted from Saved Meal Plans. It is still in History.");
      setPlanToDelete(null);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (plan) => {
    const planId = plan.dbId || plan.id;
    setDownloadingId(planId);
    setError("");
    setMessage("");

    try {
      await downloadMealPlanPdf(plan);
      setMessage("Downloaded successfully.");
    } catch (downloadError) {
      setError(
        downloadError?.message ||
          "Could not create the PDF. Please try again.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePlanUpdate = (updatedPlan) => {
    setSelectedPlan(updatedPlan);
    setPlans((current) =>
      current.map((plan) =>
        plan.dbId === updatedPlan.dbId ? updatedPlan : plan,
      ),
    );
    setMessage("Meal updated successfully.");
  };

  return (
    <section className="section">
      <div className="section__head">
        <div>
          <h3 className="section__title">Saved Meal Plans</h3>
          <p className="section__subtitle">
            Reuse your saved plans next time without re-entering details.
          </p>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {message ? <div className="success">{message}</div> : null}

      {plans.length === 0 ? (
        <div className="glass" style={{ padding: 24 }}>
          <p style={{ margin: 0, color: "var(--text-2)", lineHeight: 1.7 }}>
            No saved meals yet. Generate recommendations, then tap{" "}
            <b>Save Meal Plan</b>.
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
                  • Meals: {(p.meals || []).join(" + ")}
                </p>
                <p className="catcard__desc" style={{ marginTop: 8 }}>
                  Saved: {formatDate(p.createdAt)}
                </p>

                <div className="planCardActions">
                  <button
                    className="softbtn softbtn--light"
                    type="button"
                    onClick={() => setSelectedPlan(p)}
                  >
                    View
                  </button>
                  <button
                    className="softbtn softbtn--light"
                    type="button"
                    onClick={() => handleDownload(p)}
                    disabled={downloadingId === (p.dbId || p.id)}
                  >
                    <span className="material-symbols-outlined">download</span>
                    {downloadingId === (p.dbId || p.id)
                      ? "Creating..."
                      : "PDF"}
                  </button>
                  <button
                    className="softbtn softbtn--danger"
                    type="button"
                    onClick={() => setPlanToDelete(p)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedPlan ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="savedPlanTitle"
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
                  id="savedPlanTitle"
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

              <div className="savedPlanModalActions">
                <button
                  className="softbtn softbtn--light"
                  type="button"
                  onClick={() => handleDownload(selectedPlan)}
                  disabled={
                    downloadingId === (selectedPlan.dbId || selectedPlan.id)
                  }
                >
                  <span className="material-symbols-outlined">download</span>
                  {downloadingId === (selectedPlan.dbId || selectedPlan.id)
                    ? "Creating PDF..."
                    : "Download PDF"}
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

      {planToDelete ? (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deletePlanTitle"
        >
          <div className="confirmModal glass">
            <h3 id="deletePlanTitle" className="confirmModal__title">
              Delete saved meal plan?
            </h3>
            <p className="confirmModal__text">
              Are you sure you want to delete{" "}
              <strong>{planToDelete.categoryTitle}</strong> from Saved Meal
              Plans? It will stay in your History.
            </p>
            <div className="confirmModal__actions">
              <button
                className="softbtn"
                type="button"
                onClick={() => setPlanToDelete(null)}
                disabled={deleting}
              >
                No
              </button>
              <button
                className="softbtn softbtn--danger"
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

