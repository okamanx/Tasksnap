-- ============================================================
-- TaskSnap - Initial Database Schema
-- Paste this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  price        INTEGER NOT NULL DEFAULT 0,
  lat          FLOAT,
  lng          FLOAT,
  status       TEXT NOT NULL DEFAULT 'open',   -- open | accepted | completed
  created_by   UUID REFERENCES auth.users(id),
  accepted_by  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID REFERENCES tasks(id) ON DELETE CASCADE,
  sender_id  UUID REFERENCES auth.users(id),
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- TASKS: anyone can read open tasks
CREATE POLICY "Public can view open tasks"
  ON tasks FOR SELECT
  USING (status = 'open');

-- TASKS: logged-in users can insert their own task
CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- TASKS: owner OR acceptor can update the task
CREATE POLICY "Users can update own or accepted tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = accepted_by);

-- MESSAGES: participants of a task can read messages
CREATE POLICY "Task participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = messages.task_id
        AND (t.created_by = auth.uid() OR t.accepted_by = auth.uid())
    )
  );

-- MESSAGES: authenticated users can send messages
CREATE POLICY "Authenticated users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- ============================================================
-- REALTIME (Enable live updates for chat & tasks)
-- ============================================================

-- Run these in Supabase Dashboard → Database → Replication
-- OR just go to Table Editor and enable Realtime toggle for both tables.

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================
-- SEED DATA (Optional - for testing without frontend)
-- ============================================================

/*
INSERT INTO tasks (title, description, price, lat, lng, status) VALUES
  ('Clean my room', 'Need help cleaning a 2BHK flat', 200, 28.6139, 77.2090),
  ('Grocery delivery', 'Buy groceries from Big Bazaar and deliver', 150, 28.6200, 77.2100),
  ('Dog walking', 'Walk my labrador for 30 minutes', 100, 28.6100, 77.2050),
  ('Fix my laptop', 'Laptop not starting, need basic check', 300, 28.6050, 77.2150);
*/
