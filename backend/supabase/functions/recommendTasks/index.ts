// ============================================================
// TaskSnap - AI Task Recommendation Edge Function
// Powered by OpenRouter (google/gemini-flash-1.5)
//
// Deploy with: supabase functions deploy recommendTasks
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Parse Request Body ---
    const { lat, lng } = await req.json();
    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: "lat and lng are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Connect to Supabase ---
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- Fetch all open tasks ---
    const { data: tasks, error: dbError } = await supabase
      .from("tasks")
      .select("id, title, description, price, lat, lng")
      .eq("status", "open")
      .limit(50);

    if (dbError) throw new Error(`DB Error: ${dbError.message}`);
    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ ranked: [], message: "No open tasks found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Build AI Prompt ---
    const tasksText = tasks.map((t, i) =>
      `${i + 1}. task_id=${t.id} | title="${t.title}" | desc="${t.description}" | price=Rs.${t.price} | location=(${t.lat},${t.lng})`
    ).join("\n");

    const prompt = `You are a smart task matching engine for a hyperlocal marketplace app called TaskSnap.

User is at location: lat=${lat}, lng=${lng}

Here are available tasks:
${tasksText}

Rank these tasks for the user based on:
1. Distance (closer tasks rank higher) — use lat/lng to estimate
2. Price (higher pay is better)
3. Simplicity/ease of task (simpler tasks rank higher)

Return ONLY a valid JSON array. No explanation. No markdown. Just raw JSON.
Format:
[
  { "task_id": "<uuid>", "score": 0.95, "reason": "short reason" },
  { "task_id": "<uuid>", "score": 0.82, "reason": "short reason" }
]

Return all tasks, ranked from best to worst.`;

    // --- Call OpenRouter API (OpenAI-compatible format) ---
    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY")!;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tasksnap.app",        // Optional — shows on OpenRouter leaderboard
        "X-Title": "TaskSnap",                          // Optional — app name on OpenRouter
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",              // Free model on OpenRouter
        messages: [
          {
            role: "system",
            content: "You are a task matching AI. Always return valid JSON arrays only. No markdown. No explanation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 2048,
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text();
      throw new Error(`OpenRouter API error ${aiRes.status}: ${err}`);
    }

    const aiData = await aiRes.json();
    const rawText = aiData?.choices?.[0]?.message?.content ?? "[]";

    // --- Parse AI response safely ---
    let ranked: { task_id: string; score: number; reason: string }[] = [];
    try {
      // Strip markdown code fences if model wraps output in ```json ... ```
      const cleaned = rawText
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/g, "")
        .trim();
      ranked = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI output:", rawText);
      // Fallback: return tasks in original order with equal scores
      ranked = tasks.map((t) => ({
        task_id: t.id,
        score: 0.5,
        reason: "AI ranking unavailable — showing all tasks",
      }));
    }

    return new Response(
      JSON.stringify({ ranked }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Edge function error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
