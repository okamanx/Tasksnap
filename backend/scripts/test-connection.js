// ============================================================
// TaskSnap - Test Supabase Connection
// Run: node scripts/test-connection.js
// ============================================================

import { supabase } from "../config.js";

console.log("🔍 Testing Supabase connection...\n");

try {
  // Test 1: Fetch tasks
  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .limit(5);

  if (taskError) {
    console.error("❌ Tasks table error:", taskError.message);
  } else {
    console.log(`✅ Tasks table OK — ${tasks.length} rows found`);
    if (tasks.length > 0) console.log("   Sample:", tasks[0]);
  }

  // Test 2: Fetch messages
  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("*")
    .limit(5);

  if (msgError) {
    console.error("❌ Messages table error:", msgError.message);
  } else {
    console.log(`✅ Messages table OK — ${messages.length} rows found`);
  }

  console.log("\n🎯 Connection test complete!");
} catch (err) {
  console.error("❌ Fatal error:", err.message);
}
