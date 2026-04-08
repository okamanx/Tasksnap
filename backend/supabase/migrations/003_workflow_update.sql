-- ============================================================
-- TaskSnap - Workflow & OTP Update (V3)
-- Paste this script in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. ADD WORKFLOW FIELDS TO TASKS
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS start_otp TEXT,
ADD COLUMN IF NOT EXISTS end_otp TEXT,
ADD COLUMN IF NOT EXISTS applicant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS final_price INTEGER;

-- 2. CREATE RATINGS TABLE
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, reviewer_id, reviewee_id)
);

-- Note: `profiles` table does not need hardcoded `avg_rating` columns because 
-- we will calculate the rating natively to ensure accuracy.

-- 3. APPLY RLS TO RATINGS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ratings read access" ON ratings FOR SELECT USING (true);
CREATE POLICY "Ratings insert access" ON ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- Ensure Realtime broadcasts the Tasks and Ratings optimally
ALTER PUBLICATION supabase_realtime ADD TABLE ratings;
