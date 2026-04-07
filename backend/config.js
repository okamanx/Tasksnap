// ============================================================
// TaskSnap - Supabase Client Config (shared helper)
// Use this file in any backend scripts or testing
// ============================================================

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
