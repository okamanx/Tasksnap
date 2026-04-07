# TaskSnap — Backend Setup Guide
> Supabase + Google Gemini AI | Hackathon Edition

---

## 📁 Project Structure

```
backend/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   ← Run this in Supabase SQL Editor
│   └── functions/
│       └── recommendTasks/
│           └── index.ts             ← AI matching edge function
├── scripts/
│   └── test-connection.js           ← Test your DB connection
├── config.js                        ← Supabase client helper
├── package.json
├── .env.example                     ← Copy to .env and fill keys
└── README.md
```

---

## ⚡ STEP 1 — Create Supabase Project (2 minutes)

1. Go to → **https://supabase.com**
2. Click **"New Project"**
3. Fill in:
   - Project Name: `tasksnap`
   - DB Password: (remember this)
   - Region: **South Asia (Mumbai)**
4. Wait ~1 minute for project to spin up

---

## 🗄️ STEP 2 — Run Database Schema

1. In Supabase Dashboard → click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it in → click **"Run"**
5. You should see: ✅ Success

**Tables created:**
| Table | Purpose |
|-------|---------|
| `tasks` | All posted tasks with location & price |
| `messages` | Chat messages per task |

---

## 🔑 STEP 3 — Get Your API Keys

In Supabase Dashboard → **Project Settings** → **API**

Copy these 3 values:

| Key | Where to find |
|-----|--------------|
| `SUPABASE_URL` | Project URL (e.g. `https://abc123.supabase.co`) |
| `SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (keep secret!) |

Then:
```bash
# Copy the example file
copy .env.example .env

# Open .env and fill in your keys
notepad .env
```

### Get Gemini API Key
1. Go to → **https://aistudio.google.com/app/apikey**
2. Click **"Create API Key"**
3. Copy it into `.env` as `GEMINI_API_KEY`

---

## 🔴 STEP 4 — Enable Realtime (for Chat)

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Under **"supabase_realtime"** publication:
   - Enable `tasks` table ✅
   - Enable `messages` table ✅

---

## 🚀 STEP 5 — Deploy Edge Function

### Install Supabase CLI (first time only)
```powershell
# In PowerShell (run as Administrator)
winget install Supabase.CLI
```

### Login and Link Project
```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```
> Find your project ID in Supabase Dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`

### Set Gemini Secret
```powershell
supabase secrets set GEMINI_API_KEY=your-gemini-api-key-here
```

### Deploy the Function
```powershell
cd backend
supabase functions deploy recommendTasks --no-verify-jwt
```

✅ Your API endpoint is now live at:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/recommendTasks
```

---

## 🧪 STEP 6 — Test It

### Test DB Connection
```powershell
cd backend
npm install
node scripts/test-connection.js
```

### Test Edge Function (cURL)
```powershell
curl -X POST "https://YOUR_PROJECT_ID.supabase.co/functions/v1/recommendTasks" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -d '{"lat": 28.6139, "lng": 77.2090}'
```

**Expected Response:**
```json
{
  "ranked": [
    { "task_id": "uuid-here", "score": 0.95, "reason": "Nearby and high pay" },
    { "task_id": "uuid-here", "score": 0.80, "reason": "Simple task, good price" }
  ]
}
```

---

## 📤 Share With Frontend Team

Give your teammate these 2 values from `.env`:

```
SUPABASE_URL = https://your-project-id.supabase.co
SUPABASE_ANON_KEY = your-anon-key
```

> ⚠️ **NEVER share** `SERVICE_ROLE_KEY` — it gives full DB access

Frontend code to connect:
```js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://your-project-id.supabase.co",
  "your-anon-key"
);
```

---

## 📊 Database Schema Reference

### `tasks` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Task name |
| `description` | TEXT | Details |
| `price` | INTEGER | Pay in ₹ |
| `lat` | FLOAT | Latitude |
| `lng` | FLOAT | Longitude |
| `status` | TEXT | `open` / `accepted` / `completed` |
| `created_by` | UUID | User who posted |
| `accepted_by` | UUID | User who accepted |
| `created_at` | TIMESTAMP | Auto-set |

### `messages` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `task_id` | UUID | Links to task |
| `sender_id` | UUID | Who sent it |
| `message` | TEXT | Message content |
| `created_at` | TIMESTAMP | Auto-set |

---

## 🎯 API Endpoint Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `supabase.from("tasks").select()` | JS SDK | Get all tasks |
| `supabase.from("tasks").insert()` | JS SDK | Post a task |
| `supabase.from("tasks").update()` | JS SDK | Accept a task |
| `supabase.from("messages").select()` | JS SDK | Get chat messages |
| `supabase.from("messages").insert()` | JS SDK | Send a message |
| `/functions/v1/recommendTasks` | POST | AI ranked tasks |

---

## 🔥 Quick Checklist

- [ ] Supabase project created
- [ ] SQL schema ran successfully
- [ ] Realtime enabled for tasks + messages
- [ ] `.env` file filled with all 4 keys
- [ ] Edge function deployed
- [ ] Connection test passes
- [ ] Shared URL + anon key with frontend team

---

*Built for hackathon speed. Good luck! 🚀*
