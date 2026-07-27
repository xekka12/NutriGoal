-- ============================================================
-- COPY ALL -> Supabase SQL Editor -> Run
-- Clean table for generated/saved meal plans.
-- Avoids old tbl_meal_plans schema/cache issues.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.saved_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  plan jsonb NOT NULL,
  is_saved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saved_meal_plans_user_created_idx
ON public.saved_meal_plans (user_id, created_at DESC);

ALTER TABLE public.saved_meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_meal_plans_select_own" ON public.saved_meal_plans;
DROP POLICY IF EXISTS "saved_meal_plans_insert_own" ON public.saved_meal_plans;
DROP POLICY IF EXISTS "saved_meal_plans_update_own" ON public.saved_meal_plans;
DROP POLICY IF EXISTS "saved_meal_plans_delete_own" ON public.saved_meal_plans;

CREATE POLICY "saved_meal_plans_select_own"
ON public.saved_meal_plans
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "saved_meal_plans_insert_own"
ON public.saved_meal_plans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_meal_plans_update_own"
ON public.saved_meal_plans
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_meal_plans_delete_own"
ON public.saved_meal_plans
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
