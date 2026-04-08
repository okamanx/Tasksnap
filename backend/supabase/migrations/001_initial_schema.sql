-- ============================================================
-- TaskSnap - Complete Database Schema (V2)
-- Paste this ENTIRE script in: Supabase Dashboard → SQL Editor → Run
-- It handles Tasks, Messages, Applications, Notifications, and Profiles
-- ============================================================

-- 0. PROFILES TABLE (Auto-synced with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to sync profile updates from user metadata
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET 
    name = COALESCE(new.raw_user_meta_data->>'name', name),
    phone = COALESCE(new.raw_user_meta_data->>'phone', phone),
    avatar_url = COALESCE(new.raw_user_meta_data->>'avatar_url', avatar_url)
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();

-- 1. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  price        INTEGER NOT NULL DEFAULT 0,
  duration     TEXT,
  address      TEXT,
  lat          FLOAT,
  lng          FLOAT,
  status       TEXT NOT NULL DEFAULT 'open',   -- open | assigned | completed
  created_by   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  accepted_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID REFERENCES tasks(id) ON DELETE CASCADE,
  sender_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APPLICATIONS TABLE (For task acceptance flow)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending | accepted | rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, applicant_id)
);

-- 4. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- IMPORTANT: Enable read/write access for simplicity in Hackathon
-- For production, these should be hardened.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are readable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks read access" ON tasks FOR SELECT USING (true);
CREATE POLICY "Tasks insert access" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Tasks update access" ON tasks FOR UPDATE TO authenticated USING (true);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages read access" ON messages FOR SELECT USING (true);
CREATE POLICY "Messages insert access" ON messages FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applications read access" ON applications FOR SELECT USING (true);
CREATE POLICY "Applications insert access" ON applications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Applications update access" ON applications FOR UPDATE TO authenticated USING (true);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications read access" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Notifications insert access" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Notifications update access" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- REALTIME
-- ============================================================
-- Drop first to avoid errors if they already exist
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE applications;

-- Sync existing users if they signed up before this script
INSERT INTO public.profiles (id, name, phone, avatar_url)
SELECT 
  id, 
  raw_user_meta_data->>'name', 
  raw_user_meta_data->>'phone',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
