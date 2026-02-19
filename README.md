# 🧬 Kodex — Setup Guide

## Quick Start

### 1. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open the **SQL Editor** in your dashboard
3. Paste and run `supabase-schema.sql` — this creates all tables + seed data
4. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon/public` key

### 2. Connect to your App
In `App.jsx`, replace the top two constants:
```js
const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJ...";
```

### 3. Use in Expo
Copy `App.jsx` into your Expo project. Install deps if needed:
```bash
npx expo install expo-router
```

---

## Adding New Languages

### Via Supabase Dashboard (easiest)
1. Go to **Table Editor → languages**
2. Click **Insert row** and fill in: name, slug, icon, color, difficulty, etc.

### Via SQL
```sql
-- Add the language
insert into languages (name, slug, icon, color, accent, description, difficulty, order_index)
values ('Kotlin', 'kotlin', '🎯', '#7F52FF', '#FFFFFF', 'Modern JVM language', 'Intermediate', 7);

-- Add lessons
insert into lessons (language_id, language_slug, title, xp_reward, order_index)
select id, 'kotlin', 'Hello Kotlin', 50, 1 from languages where slug = 'kotlin';
```

---

## Features
- ✅ Auth (login / signup / demo mode)
- ✅ 6 programming languages out of the box
- ✅ Multiple choice + fill-in-the-blank questions
- ✅ XP system with levels (every 200 XP = 1 level)
- ✅ Daily streaks
- ✅ Heart system (3 hearts per lesson)
- ✅ Perfect lesson tracking
- ✅ 8 achievements with unlock toasts
- ✅ Leaderboard
- ✅ Profile with achievement grid
- ✅ Progress saved locally + synced to Supabase
- ✅ Confetti on lesson complete
- ✅ Easily add more languages via SQL or Supabase dashboard

## Database Tables
| Table | Purpose |
|---|---|
| `languages` | All programming languages |
| `lessons` | Lessons per language |
| `questions` | Questions per lesson |
| `user_stats` | XP, streaks, level per user |
| `user_progress` | Per-language progress |
| `lesson_attempts` | Full history |
| `achievements` | Achievement definitions |
| `user_achievements` | Earned achievements |
