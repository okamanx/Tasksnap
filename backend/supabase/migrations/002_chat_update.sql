-- ============================================================
-- TaskSnap - Schema Update (V3)
-- Paste this ENTIRE script in: Supabase Dashboard → SQL Editor → Run
-- It upgrades the messages table for Secure End-To-End 1-on-1 Chat
-- ============================================================

ALTER TABLE messages ADD COLUMN IF NOT EXISTS room_id TEXT;
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
