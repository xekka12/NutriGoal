import { supabase } from "./supabaseClient";

const QUERY_TIMEOUT_MS = 8000;

function withTimeout(promise, message = "Database request timed out.") {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), QUERY_TIMEOUT_MS);
    }),
  ]);
}

function normalizeDatabaseError(error) {
  const message = String(error?.message || error || "");

  if (message.toLowerCase().includes("schema cache")) {
    return new Error(
      "Database schema is not ready yet. Run supabase/create_saved_meal_plans.sql in Supabase SQL Editor, then refresh this page."
    );
  }

  return error;
}

export function parseMealPlanRow(row) {
  const plan = row.plan || {};

  return {
    ...plan,
    id: plan.id || row.id,
    dbId: row.id,
    isSaved: Boolean(row.is_saved),
    budget: Number(plan.budget ?? 0),
    people: Number(plan.people ?? 1),
    createdAt: row.created_at || plan.createdAt || Date.now(),
  };
}

export async function getCurrentUser() {
  if (!supabase) throw new Error("Supabase is not configured.");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) return session.user;

  const {
    data: { user },
    error,
  } = await withTimeout(
    supabase.auth.getUser(),
    "Could not check your login session. Please refresh and log in again.",
  );

  if (error) throw normalizeDatabaseError(error);
  if (!user) throw new Error("Please log in first.");

  return user;
}

async function insertMealPlan(plan) {
  const user = await getCurrentUser();
  const planToSave = {
    ...plan,
    createdAt: plan.createdAt || Date.now(),
  };

  const { data, error } = await withTimeout(
    supabase
      .from("saved_meal_plans")
      .insert({
        user_id: user.id,
        plan: planToSave,
        is_saved: Boolean(planToSave.isSaved),
      })
      .select("id, created_at, plan, is_saved")
      .single(),
  );

  if (error) throw normalizeDatabaseError(error);

  return parseMealPlanRow(data);
}

export function saveGeneratedMealPlan(plan) {
  return insertMealPlan({ ...plan, isSaved: false });
}

export async function saveMealPlan(plan) {
  const planToSave = { ...plan, isSaved: true };

  if (!plan.dbId) {
    return insertMealPlan(planToSave);
  }

  const user = await getCurrentUser();

  const { data, error } = await withTimeout(
    supabase
      .from("saved_meal_plans")
      .update({
        plan: planToSave,
        is_saved: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", plan.dbId)
      .eq("user_id", user.id)
      .select("id, created_at, plan, is_saved")
      .single(),
  );

  if (error) throw normalizeDatabaseError(error);

  return parseMealPlanRow(data);
}

/** Update an existing plan in the database without changing saved status. */
export async function updateMealPlan(plan) {
  if (!plan?.dbId) {
    throw new Error("Meal plan not found in your account.");
  }

  const user = await getCurrentUser();

  const { data, error } = await withTimeout(
    supabase
      .from("saved_meal_plans")
      .update({
        plan,
        is_saved: Boolean(plan.isSaved),
        updated_at: new Date().toISOString(),
      })
      .eq("id", plan.dbId)
      .eq("user_id", user.id)
      .select("id, created_at, plan, is_saved")
      .single(),
  );

  if (error) throw normalizeDatabaseError(error);

  return parseMealPlanRow(data);
}

export async function fetchMealPlans() {
  const user = await getCurrentUser();

  const { data, error } = await withTimeout(
    supabase
      .from("saved_meal_plans")
      .select("id, created_at, plan, is_saved")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  );

  if (error) throw error;

  return (data || []).map(parseMealPlanRow);
}

export async function deleteMealPlan(dbId, plan = {}) {
  if (!dbId) throw new Error("Meal plan not found.");

  const user = await getCurrentUser();
  const planToUpdate = { ...plan, isSaved: false };

  const { error } = await withTimeout(
    supabase
      .from("saved_meal_plans")
      .update({
        plan: planToUpdate,
        is_saved: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dbId)
      .eq("user_id", user.id),
  );

  if (error) throw normalizeDatabaseError(error);
}
