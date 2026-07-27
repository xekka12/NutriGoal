-- ============================================================
-- COPY LAHAT → Supabase → SQL Editor → Run
-- Para lumabas ang "Auth" sa Schema Visualizer na naka-connect
-- sa tbl_meal_plans (tulad sa prof).
--
-- Register.jsx signUp() → gumagawa ng row sa auth.users
-- Itong SQL → nagli-link ng tbl_meal_plans.user_id → auth.users.id
-- ============================================================

-- Drop policies FIRST because they depend on user_id.
DROP POLICY IF EXISTS "meal_plans_select_own" ON public.tbl_meal_plans;
DROP POLICY IF EXISTS "meal_plans_insert_own" ON public.tbl_meal_plans;
DROP POLICY IF EXISTS "meal_plans_update_own" ON public.tbl_meal_plans;
DROP POLICY IF EXISTS "meal_plans_delete_own" ON public.tbl_meal_plans;

-- Tanggalin ang lumang link sa tbl_users (kung nabura na ang table)
ALTER TABLE public.tbl_meal_plans
DROP CONSTRAINT IF EXISTS tbl_meal_plans_user_id_fkey;

-- Palitan ang user_id: int8 → uuid (OK lang kung walang data pa sa table)
ALTER TABLE public.tbl_meal_plans
DROP COLUMN IF EXISTS user_id;

ALTER TABLE public.tbl_meal_plans
ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE;

-- Optional relationship: allow meal plan without category_id for AI-generated plans
ALTER TABLE public.tbl_meal_plans
ALTER COLUMN category_id DROP NOT NULL;

-- The React app saves the whole generated plan as JSON string in meals.
-- Keep this as text for compatibility with your current table.
ALTER TABLE public.tbl_meal_plans
ALTER COLUMN meals TYPE text USING meals::text;

ALTER TABLE public.tbl_meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meal_plans_select_own"
ON public.tbl_meal_plans
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "meal_plans_insert_own"
ON public.tbl_meal_plans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_plans_update_own"
ON public.tbl_meal_plans
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_plans_delete_own"
ON public.tbl_meal_plans
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
