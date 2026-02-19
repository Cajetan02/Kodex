import { useState, useEffect, useRef } from "react";

// ============================================================
// CODELING - Gamified Programming Language Learning App
// ============================================================
// Supabase Integration: Replace SUPABASE_URL and SUPABASE_ANON_KEY
// with your actual project values from supabase.com/dashboard
// ============================================================

const SUPABASE_URL = "db.mkrevmnphqlwlnizanjt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rcmV2bW5waHFsd2xuaXphbmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDQwMjUsImV4cCI6MjA4NzA4MDAyNX0.KbQDpqT5yw9PdPYRe1dgk5g1YqNYnjDw7jNZ2BP7lAQ";

// Minimal Supabase client
const supabase = {
  headers: {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  },
  async from(table) {
    const base = `${SUPABASE_URL}/rest/v1/${table}`;
    return {
      select: async (cols = "*", opts = {}) => {
        let url = `${base}?select=${cols}`;
        if (opts.eq) url += `&${opts.eq[0]}=eq.${opts.eq[1]}`;
        if (opts.order) url += `&order=${opts.order}`;
        if (opts.limit) url += `&limit=${opts.limit}`;
        const r = await fetch(url, { headers: supabase.headers });
        return { data: await r.json(), error: r.ok ? null : "error" };
      },
      insert: async (body) => {
        const r = await fetch(base, {
          method: "POST",
          headers: { ...supabase.headers, Prefer: "return=representation" },
          body: JSON.stringify(body),
        });
        return { data: await r.json(), error: r.ok ? null : "error" };
      },
      update: async (body, opts = {}) => {
        let url = base;
        if (opts.eq) url += `?${opts.eq[0]}=eq.${opts.eq[1]}`;
        const r = await fetch(url, {
          method: "PATCH",
          headers: { ...supabase.headers, Prefer: "return=representation" },
          body: JSON.stringify(body),
        });
        return { data: await r.json(), error: r.ok ? null : "error" };
      },
      upsert: async (body) => {
        const r = await fetch(base, {
          method: "POST",
          headers: { ...supabase.headers, Prefer: "resolution=merge-duplicates,return=representation" },
          body: JSON.stringify(body),
        });
        return { data: await r.json(), error: r.ok ? null : "error" };
      },
    };
  },
  auth: {
    async signUp({ email, password, options }) {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, data: options?.data }),
      });
      return await r.json();
    },
    async signInWithPassword({ email, password }) {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return await r.json();
    },
    async signOut() {
      localStorage.removeItem("codeling_user");
    },
  },
};

// ============================================================
// MOCK DATA (works without Supabase connected)
// ============================================================
const MOCK_LANGUAGES = [
  {
    id: 1, name: "Python", slug: "python", icon: "🐍", color: "#3776AB",
    accent: "#FFD43B", description: "The most loved beginner language",
    total_lessons: 5, difficulty: "Beginner", learners: 12847,
  },
  {
    id: 2, name: "JavaScript", slug: "javascript", icon: "⚡", color: "#F7DF1E",
    accent: "#000000", description: "Language of the web",
    total_lessons: 5, difficulty: "Beginner", learners: 21043,
  },
  {
    id: 3, name: "Rust", slug: "rust", icon: "⚙️", color: "#CE422B",
    accent: "#F4A261", description: "Blazingly fast systems language",
    total_lessons: 5, difficulty: "Advanced", learners: 3291,
  },
  {
    id: 4, name: "Go", slug: "go", icon: "🐹", color: "#00ACD7",
    accent: "#FFFFFF", description: "Simple and powerful concurrency",
    total_lessons: 5, difficulty: "Intermediate", learners: 6782,
  },
  {
    id: 5, name: "TypeScript", slug: "typescript", icon: "📘", color: "#3178C6",
    accent: "#FFFFFF", description: "JavaScript with superpowers",
    total_lessons: 5, difficulty: "Intermediate", learners: 9341,
  },
  {
    id: 6, name: "SQL", slug: "sql", icon: "🗄️", color: "#336791",
    accent: "#FFFFFF", description: "Query the world's data",
    total_lessons: 5, difficulty: "Beginner", learners: 8124,
  },
];

const MOCK_LESSONS = {
  python: [
    {
      id: 101, title: "Hello, World!", xp_reward: 50, order_index: 1,
      questions: [
        {
          id: 1, type: "multiple_choice", prompt: "Which function prints output in Python?",
          options: ["console.log()", "print()", "echo()", "output()"],
          answer: "print()", explanation: "print() is Python's built-in output function.",
        },
        {
          id: 2, type: "fill_blank", prompt: "Complete: ___('Hello, World!')",
          answer: "print", explanation: "We use print() to display text.",
        },
        {
          id: 3, type: "multiple_choice", prompt: "What does this output? print(2 + 3)",
          options: ["2 + 3", "23", "5", "Error"],
          answer: "5", explanation: "Python evaluates the expression before printing.",
        },
      ],
    },
    {
      id: 102, title: "Variables & Types", xp_reward: 75, order_index: 2,
      questions: [
        {
          id: 4, type: "multiple_choice", prompt: "Which is a valid Python variable name?",
          options: ["2name", "my-var", "my_var", "my var"],
          answer: "my_var", explanation: "Underscores are valid; spaces and hyphens are not.",
        },
        {
          id: 5, type: "multiple_choice", prompt: "What type is: x = 3.14",
          options: ["int", "str", "float", "double"],
          answer: "float", explanation: "Numbers with decimals are floats in Python.",
        },
        {
          id: 6, type: "fill_blank", prompt: "x = ___('42') converts string to int",
          answer: "int", explanation: "int() converts a string to an integer.",
        },
      ],
    },
    {
      id: 103, title: "Lists & Loops", xp_reward: 100, order_index: 3,
      questions: [
        {
          id: 7, type: "multiple_choice", prompt: "How do you create an empty list?",
          options: ["list = {}", "list = []", "list = ()", "list = <>"],
          answer: "list = []", explanation: "Square brackets [] define a list in Python.",
        },
        {
          id: 8, type: "multiple_choice", prompt: "What does len([1,2,3]) return?",
          options: ["2", "3", "4", "Error"],
          answer: "3", explanation: "len() returns the number of items in a list.",
        },
        {
          id: 9, type: "fill_blank", prompt: "___ i in range(3): print(i)",
          answer: "for", explanation: "for loops iterate over sequences.",
        },
      ],
    },
    {
      id: 104, title: "Functions", xp_reward: 125, order_index: 4,
      questions: [
        {
          id: 10, type: "multiple_choice", prompt: "Keyword to define a function?",
          options: ["function", "fn", "def", "func"],
          answer: "def", explanation: "Python uses 'def' to define functions.",
        },
        {
          id: 11, type: "multiple_choice", prompt: "What does 'return' do?",
          options: ["Prints a value", "Exits the program", "Sends a value back", "Loops again"],
          answer: "Sends a value back", explanation: "return exits the function and sends a value to the caller.",
        },
        {
          id: 12, type: "fill_blank", prompt: "def greet(name):\n    ___ 'Hello, ' + name",
          answer: "return", explanation: "return sends the value out of the function.",
        },
      ],
    },
    {
      id: 105, title: "Dictionaries", xp_reward: 150, order_index: 5,
      questions: [
        {
          id: 13, type: "multiple_choice", prompt: "What defines a Python dictionary?",
          options: ["[]", "()", "{}", "<>"],
          answer: "{}", explanation: "Curly braces {} create a dictionary.",
        },
        {
          id: 14, type: "multiple_choice", prompt: "Access value: d = {'a': 1}, d['a'] = ?",
          options: ["Error", "0", "1", "'a'"],
          answer: "1", explanation: "Dictionary values are accessed by their key.",
        },
        {
          id: 15, type: "fill_blank", prompt: "d = {}; d.___ key, value pairs using d['x'] = 1",
          answer: "stores", explanation: "Dictionaries map keys to values.",
        },
      ],
    },
  ],
};

// Generate lessons for other languages
["javascript", "rust", "go", "typescript", "sql"].forEach((lang) => {
  const templates = {
    javascript: [
      { title: "Console & Variables", xp: 50 },
      { title: "Functions & Arrows", xp: 75 },
      { title: "Arrays & Methods", xp: 100 },
      { title: "Objects & Classes", xp: 125 },
      { title: "Promises & Async", xp: 150 },
    ],
    rust: [
      { title: "Ownership Basics", xp: 50 },
      { title: "Borrowing & References", xp: 75 },
      { title: "Structs & Enums", xp: 100 },
      { title: "Pattern Matching", xp: 125 },
      { title: "Traits & Generics", xp: 150 },
    ],
    go: [
      { title: "Packages & Main", xp: 50 },
      { title: "Variables & Types", xp: 75 },
      { title: "Functions & Multiple Returns", xp: 100 },
      { title: "Goroutines", xp: 125 },
      { title: "Channels", xp: 150 },
    ],
    typescript: [
      { title: "Types & Interfaces", xp: 50 },
      { title: "Generics Basics", xp: 75 },
      { title: "Union & Intersection Types", xp: 100 },
      { title: "Utility Types", xp: 125 },
      { title: "Decorators", xp: 150 },
    ],
    sql: [
      { title: "SELECT & FROM", xp: 50 },
      { title: "WHERE & Filtering", xp: 75 },
      { title: "JOINs", xp: 100 },
      { title: "GROUP BY & Aggregates", xp: 125 },
      { title: "Subqueries", xp: 150 },
    ],
  };
  MOCK_LESSONS[lang] = templates[lang].map((t, i) => ({
    id: 200 + i + Object.keys(MOCK_LESSONS).length * 10,
    title: t.title, xp_reward: t.xp, order_index: i + 1,
    questions: [
      {
        id: 900 + i,
        type: "multiple_choice",
        prompt: `What's a key concept in ${t.title}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        answer: "Option A",
        explanation: `${t.title} is a fundamental concept in this language.`,
      },
      {
        id: 901 + i,
        type: "multiple_choice",
        prompt: "Which of these is correct syntax?",
        options: ["Syntax A", "Syntax B", "Syntax C", "Syntax D"],
        answer: "Syntax B",
        explanation: "This is the correct syntax for this concept.",
      },
      {
        id: 902 + i,
        type: "fill_blank",
        prompt: "Complete the statement: ___",
        answer: "keyword",
        explanation: "This keyword is essential for this concept.",
      },
    ],
  }));
});

// ============================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================
const ACHIEVEMENTS = [
  { id: "first_lesson", icon: "🎯", name: "First Steps", desc: "Complete your first lesson", condition: (u) => u.total_lessons_completed >= 1 },
  { id: "streak_3", icon: "🔥", name: "On Fire", desc: "3 day streak", condition: (u) => u.streak_days >= 3 },
  { id: "streak_7", icon: "💥", name: "Week Warrior", desc: "7 day streak", condition: (u) => u.streak_days >= 7 },
  { id: "xp_500", icon: "⚡", name: "Power User", desc: "Earn 500 XP", condition: (u) => u.total_xp >= 500 },
  { id: "xp_1000", icon: "💫", name: "XP Master", desc: "Earn 1000 XP", condition: (u) => u.total_xp >= 1000 },
  { id: "perfect", icon: "💎", name: "Perfectionist", desc: "Complete a lesson with no mistakes", condition: (u) => u.perfect_lessons >= 1 },
  { id: "multilang", icon: "🌍", name: "Polyglot", desc: "Start 3 different languages", condition: (u) => (u.languages_started || 0) >= 3 },
  { id: "level_5", icon: "👑", name: "Level 5 Reached", desc: "Reach level 5", condition: (u) => u.level >= 5 },
];

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  :root {
    --bg: #0a0a0f;
    --surface: #12121a;
    --surface2: #1a1a26;
    --border: #2a2a40;
    --text: #f0f0ff;
    --muted: #6060a0;
    --accent: #7c3aed;
    --accent2: #06d6a0;
    --accent3: #ff6b6b;
    --accent4: #ffd60a;
    --radius: 16px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    position: relative;
    background: var(--bg);
  }

  /* NOISE TEXTURE */
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  /* ---- AUTH SCREEN ---- */
  .auth-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
  }

  .auth-glow {
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -60%);
    pointer-events: none;
  }

  .logo-area {
    text-align: center;
    margin-bottom: 48px;
    animation: fadeUp 0.6s ease both;
  }

  .logo-icon {
    font-size: 72px;
    display: block;
    margin-bottom: 8px;
    animation: float 3s ease-in-out infinite;
  }

  .logo-name {
    font-size: 42px;
    font-weight: 800;
    letter-spacing: -2px;
    background: linear-gradient(135deg, #a78bfa, #06d6a0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .logo-sub {
    color: var(--muted);
    font-size: 14px;
    margin-top: 4px;
    font-family: 'Space Mono', monospace;
  }

  .auth-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 32px;
    width: 100%;
    max-width: 380px;
    animation: fadeUp 0.6s 0.2s ease both;
  }

  .auth-tabs {
    display: flex;
    background: var(--bg);
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 24px;
  }

  .auth-tab {
    flex: 1;
    padding: 10px;
    border: none;
    background: transparent;
    color: var(--muted);
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .auth-tab.active {
    background: var(--accent);
    color: white;
  }

  .input-group {
    margin-bottom: 16px;
  }

  .input-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
    display: block;
    font-family: 'Space Mono', monospace;
  }

  .input-field {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
    color: var(--text);
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  .input-field:focus {
    border-color: var(--accent);
  }

  .btn-primary {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, var(--accent), #9333ea);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    margin-top: 8px;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.4); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .demo-btn {
    width: 100%;
    padding: 14px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--muted);
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    margin-top: 12px;
    transition: all 0.2s;
  }

  .demo-btn:hover { border-color: var(--accent2); color: var(--accent2); }

  /* ---- BOTTOM NAV ---- */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
    background: rgba(18,18,26,0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex;
    padding: 12px 0 20px;
    z-index: 100;
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 8px;
    border-radius: 12px;
    transition: all 0.2s;
    border: none;
    background: transparent;
  }

  .nav-item.active .nav-icon { color: var(--accent2); }
  .nav-item.active .nav-label { color: var(--accent2); }

  .nav-icon { font-size: 22px; }
  .nav-label { font-size: 10px; color: var(--muted); font-weight: 600; letter-spacing: 0.5px; font-family: 'Space Mono', monospace; }

  /* ---- SCREEN LAYOUT ---- */
  .screen {
    padding: 0 0 100px;
    position: relative;
    z-index: 1;
    animation: fadeIn 0.3s ease;
  }

  .screen-header {
    padding: 60px 20px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .screen-title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -1px;
  }

  /* ---- HOME SCREEN ---- */
  .hero-banner {
    margin: 0 20px 20px;
    background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,214,160,0.1));
    border: 1px solid rgba(124,58,237,0.3);
    border-radius: 20px;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  .hero-banner::after {
    content: '';
    position: absolute;
    top: -50%; right: -50%;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(124,58,237,0.3), transparent);
    border-radius: 50%;
  }

  .hero-greeting {
    font-size: 13px;
    color: var(--accent2);
    font-family: 'Space Mono', monospace;
    margin-bottom: 4px;
  }

  .hero-name {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 16px;
  }

  .stats-row {
    display: flex;
    gap: 12px;
  }

  .stat-pill {
    background: rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 700;
  }

  .stat-pill span:first-child { font-size: 16px; }

  /* XP BAR */
  .xp-bar-container {
    margin: 16px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
  }

  .xp-bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .xp-label {
    font-size: 12px;
    color: var(--muted);
    font-family: 'Space Mono', monospace;
    font-weight: 700;
  }

  .level-badge {
    background: linear-gradient(135deg, var(--accent4), #ff9500);
    color: #000;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 800;
  }

  .xp-bar {
    height: 10px;
    background: var(--bg);
    border-radius: 100px;
    overflow: hidden;
  }

  .xp-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    border-radius: 100px;
    transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 12px rgba(124,58,237,0.6);
  }

  .xp-numbers {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 11px;
    color: var(--muted);
    font-family: 'Space Mono', monospace;
  }

  /* CONTINUE LEARNING */
  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 2px;
    padding: 0 20px;
    margin-bottom: 12px;
    font-family: 'Space Mono', monospace;
  }

  .continue-card {
    margin: 0 20px 24px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .continue-card:hover { border-color: var(--accent); transform: translateY(-2px); }

  .continue-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .lang-icon-large {
    width: 48px; height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .continue-info {}
  .continue-lang { font-size: 18px; font-weight: 800; }
  .continue-lesson { font-size: 13px; color: var(--muted); margin-top: 2px; }

  .progress-bar {
    height: 6px;
    background: var(--bg);
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 0.8s ease;
  }

  .progress-text {
    font-size: 11px;
    color: var(--muted);
    font-family: 'Space Mono', monospace;
  }

  /* LANGUAGE GRID */
  .lang-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 0 20px;
    margin-bottom: 24px;
  }

  .lang-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.25s;
    position: relative;
    overflow: hidden;
  }

  .lang-card:hover {
    border-color: var(--card-color, var(--accent));
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.4);
  }

  .lang-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--card-color, transparent), transparent);
    opacity: 0.06;
    transition: opacity 0.2s;
  }

  .lang-card:hover::before { opacity: 0.12; }

  .lang-card-icon { font-size: 36px; margin-bottom: 10px; display: block; }
  .lang-card-name { font-size: 17px; font-weight: 800; margin-bottom: 4px; }
  .lang-card-desc { font-size: 11px; color: var(--muted); line-height: 1.4; margin-bottom: 12px; }

  .lang-card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .difficulty-badge {
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 20px;
    font-weight: 700;
    font-family: 'Space Mono', monospace;
  }

  .diff-beginner { background: rgba(6,214,160,0.15); color: var(--accent2); }
  .diff-intermediate { background: rgba(255,214,10,0.15); color: var(--accent4); }
  .diff-advanced { background: rgba(255,107,107,0.15); color: var(--accent3); }

  /* ---- LESSON LIST ---- */
  .lesson-list {
    padding: 0 20px;
  }

  .lesson-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .lesson-item:hover { border-color: var(--accent); transform: translateX(4px); }
  .lesson-item.completed { border-color: rgba(6,214,160,0.3); }
  .lesson-item.locked { opacity: 0.5; cursor: not-allowed; }
  .lesson-item.locked:hover { transform: none; border-color: var(--border); }

  .lesson-number {
    width: 44px; height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    font-weight: 800;
  }

  .lesson-number.done { background: rgba(6,214,160,0.15); color: var(--accent2); }
  .lesson-number.current { background: rgba(124,58,237,0.2); color: #a78bfa; }
  .lesson-number.locked-num { background: var(--bg); color: var(--muted); }

  .lesson-info { flex: 1; }
  .lesson-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .lesson-xp { font-size: 12px; color: var(--muted); font-family: 'Space Mono', monospace; }

  .lesson-check { font-size: 20px; }

  /* ---- QUIZ SCREEN ---- */
  .quiz-header {
    padding: 60px 20px 20px;
  }

  .quiz-progress {
    height: 6px;
    background: var(--surface);
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 20px;
  }

  .quiz-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    border-radius: 100px;
    transition: width 0.4s ease;
  }

  .quiz-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .quiz-counter { font-size: 13px; color: var(--muted); font-family: 'Space Mono', monospace; }

  .hearts {
    display: flex;
    gap: 4px;
    font-size: 18px;
  }

  .quiz-question {
    padding: 0 20px;
    margin-bottom: 28px;
  }

  .question-type-badge {
    display: inline-block;
    font-size: 10px;
    padding: 4px 10px;
    background: rgba(124,58,237,0.2);
    color: #a78bfa;
    border-radius: 20px;
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .question-text {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: -0.5px;
  }

  .code-snippet {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    color: var(--accent2);
    margin-top: 12px;
    white-space: pre-wrap;
    line-height: 1.6;
  }

  .options-grid {
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .option-btn {
    width: 100%;
    padding: 18px 20px;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 16px;
    color: var(--text);
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .option-btn:hover:not(:disabled) { border-color: var(--accent); transform: translateX(4px); }
  .option-btn.selected { border-color: var(--accent); background: rgba(124,58,237,0.15); }
  .option-btn.correct { border-color: var(--accent2); background: rgba(6,214,160,0.15); color: var(--accent2); }
  .option-btn.wrong { border-color: var(--accent3); background: rgba(255,107,107,0.15); color: var(--accent3); }
  .option-btn:disabled { cursor: not-allowed; }

  .option-letter {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    font-family: 'Space Mono', monospace;
    flex-shrink: 0;
  }

  .fill-blank-input {
    width: 100%;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 16px;
    padding: 18px 20px;
    color: var(--text);
    font-family: 'Space Mono', monospace;
    font-size: 18px;
    outline: none;
    transition: all 0.2s;
    text-align: center;
  }

  .fill-blank-input:focus { border-color: var(--accent); }
  .fill-blank-input.correct { border-color: var(--accent2); color: var(--accent2); }
  .fill-blank-input.wrong { border-color: var(--accent3); color: var(--accent3); }

  .quiz-bottom {
    padding: 20px;
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
    z-index: 50;
  }

  .feedback-banner {
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
    animation: slideUp 0.3s ease;
  }

  .feedback-banner.correct-fb { background: rgba(6,214,160,0.15); border: 1px solid rgba(6,214,160,0.3); }
  .feedback-banner.wrong-fb { background: rgba(255,107,107,0.15); border: 1px solid rgba(255,107,107,0.3); }

  .feedback-title { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
  .feedback-title.c { color: var(--accent2); }
  .feedback-title.w { color: var(--accent3); }
  .feedback-exp { font-size: 13px; color: var(--muted); }

  /* LESSON COMPLETE */
  .complete-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    text-align: center;
    animation: fadeIn 0.4s ease;
  }

  .complete-emoji {
    font-size: 80px;
    animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    margin-bottom: 16px;
  }

  .complete-title {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -2px;
    margin-bottom: 8px;
    background: linear-gradient(135deg, var(--accent2), var(--accent4));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .complete-subtitle { color: var(--muted); margin-bottom: 32px; font-size: 16px; }

  .complete-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 40px;
  }

  .complete-stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 20px 24px;
    text-align: center;
    flex: 1;
  }

  .complete-stat-icon { font-size: 28px; margin-bottom: 8px; }
  .complete-stat-num { font-size: 28px; font-weight: 800; }
  .complete-stat-label { font-size: 11px; color: var(--muted); font-family: 'Space Mono', monospace; margin-top: 4px; }

  /* ---- LEADERBOARD ---- */
  .leaderboard-list { padding: 0 20px; }

  .lb-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px 18px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: all 0.2s;
    animation: fadeUp 0.3s ease both;
  }

  .lb-item.me { border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.08); }

  .lb-rank {
    width: 32px;
    font-size: 18px;
    font-weight: 800;
    text-align: center;
    font-family: 'Space Mono', monospace;
  }

  .lb-avatar {
    width: 44px; height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    background: var(--bg);
    border: 1px solid var(--border);
  }

  .lb-info { flex: 1; }
  .lb-name { font-size: 16px; font-weight: 700; }
  .lb-detail { font-size: 12px; color: var(--muted); font-family: 'Space Mono', monospace; margin-top: 2px; }
  .lb-xp { font-size: 18px; font-weight: 800; color: var(--accent4); font-family: 'Space Mono', monospace; }

  /* ---- PROFILE ---- */
  .profile-hero {
    margin: 0 20px 20px;
    background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,214,160,0.08));
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 28px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .profile-avatar {
    width: 72px; height: 72px;
    border-radius: 22px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    flex-shrink: 0;
  }

  .profile-name { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .profile-joined { font-size: 12px; color: var(--muted); font-family: 'Space Mono', monospace; }
  .profile-level { margin-top: 8px; }

  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    padding: 0 20px;
    margin-bottom: 24px;
  }

  .achievement-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 14px 8px;
    text-align: center;
    transition: all 0.2s;
  }

  .achievement-item.earned { border-color: rgba(255,214,10,0.4); background: rgba(255,214,10,0.06); }
  .achievement-item.locked-ach { opacity: 0.4; }

  .ach-icon { font-size: 28px; margin-bottom: 6px; }
  .ach-name { font-size: 9px; font-weight: 700; color: var(--muted); font-family: 'Space Mono', monospace; line-height: 1.3; }
  .ach-name.earned-text { color: var(--accent4); }

  /* ---- ANIMATIONS ---- */
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes bounceIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
  @keyframes xpPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); color: var(--accent4); }
    100% { transform: scale(1); }
  }

  .xp-pop { animation: xpPop 0.4s ease; }

  /* CONFETTI */
  .confetti-container {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 999;
    overflow: hidden;
  }

  .confetti-piece {
    position: absolute;
    width: 8px; height: 8px;
    border-radius: 2px;
    animation: confettiFall linear forwards;
  }

  @keyframes confettiFall {
    from { transform: translateY(-20px) rotate(0deg); opacity: 1; }
    to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }

  .back-btn {
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--text);
    padding: 10px 16px;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }
  .back-btn:hover { border-color: var(--accent); }

  .sign-out-btn {
    background: transparent;
    border: 1px solid rgba(255,107,107,0.3);
    border-radius: 12px;
    color: var(--accent3);
    padding: 8px 14px;
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .sign-out-btn:hover { background: rgba(255,107,107,0.1); }

  .streak-flame {
    animation: pulse 1s ease-in-out infinite;
    display: inline-block;
  }

  .lang-learners {
    font-size: 10px;
    color: var(--muted);
    font-family: 'Space Mono', monospace;
  }

  .error-msg {
    color: var(--accent3);
    font-size: 13px;
    text-align: center;
    margin-top: 12px;
    font-family: 'Space Mono', monospace;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    font-size: 32px;
    animation: pulse 1s infinite;
  }

  .toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    animation: slideDown 0.3s ease;
    white-space: nowrap;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getLevelFromXP(xp) {
  return Math.floor(xp / 200) + 1;
}

function getXPForLevel(level) {
  return (level - 1) * 200;
}

function getXPProgress(xp) {
  const level = getLevelFromXP(xp);
  const levelStart = getXPForLevel(level);
  const levelEnd = getXPForLevel(level + 1);
  return { level, progress: xp - levelStart, needed: levelEnd - levelStart };
}

// ============================================================
// CONFETTI COMPONENT
// ============================================================
function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: ["#7c3aed", "#06d6a0", "#ffd60a", "#ff6b6b", "#a78bfa"][i % 5],
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 1.5,
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// AUTH SCREEN
// ============================================================
function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      if (tab === "signup") {
        const res = await supabase.auth.signUp({
          email, password,
          options: { data: { username } },
        });
        if (res.error) { setError(res.error.message || "Sign up failed"); setLoading(false); return; }
      }
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error || !res.access_token) {
        setError(res.error?.message || res.error_description || "Login failed");
        setLoading(false);
        return;
      }
      localStorage.setItem("codeling_user", JSON.stringify(res));
      onAuth({ id: res.user?.id, email, username: res.user?.user_metadata?.username || email.split("@")[0] });
    } catch {
      setError("Network error. Using demo mode.");
      onAuth({ id: "demo", email: "demo@codeling.app", username: "Coder" });
    }
    setLoading(false);
  }

  function handleDemo() {
    onAuth({ id: "demo-" + Date.now(), email: "demo@codeling.app", username: "DemoCoder" });
  }

  return (
    <div className="auth-screen">
      <div className="auth-glow" />
      <div className="logo-area">
        <span className="logo-icon">🧬</span>
        <div className="logo-name">Kodex</div>
        <div className="logo-sub">// level up your code skills</div>
      </div>
      <div className="auth-card">
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Login</button>
          <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Sign Up</button>
        </div>
        {tab === "signup" && (
          <div className="input-group">
            <label className="input-label">Username</label>
            <input className="input-field" placeholder="coolcoder99" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
        )}
        <div className="input-group">
          <label className="input-label">Email</label>
          <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Loading..." : tab === "login" ? "Login →" : "Create Account →"}
        </button>
        <button className="demo-btn" onClick={handleDemo}>Try Demo (no account needed)</button>
      </div>
    </div>
  );
}

// ============================================================
// HOME SCREEN
// ============================================================
function HomeScreen({ user, userStats, onSelectLanguage, onContinue }) {
  const { level, progress, needed } = getXPProgress(userStats.total_xp || 0);
  const lastLang = MOCK_LANGUAGES.find((l) => l.slug === userStats.last_language);
  const lastLesson = lastLang ? MOCK_LESSONS[userStats.last_language]?.find(
    (l) => l.order_index === (userStats.last_lesson_index || 1)
  ) : null;

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "'Space Mono',monospace" }}>Good vibes,</div>
          <div className="screen-title">{userStats.username || user.username} 👋</div>
        </div>
        <div style={{ fontSize: 13, fontFamily: "'Space Mono',monospace", color: "var(--accent4)" }}>
          <span className="streak-flame">🔥</span> {userStats.streak_days || 0} days
        </div>
      </div>

      <div className="hero-banner">
        <div className="hero-greeting">// your progress</div>
        <div className="hero-name">Level {level} Developer</div>
        <div className="stats-row">
          <div className="stat-pill"><span>⚡</span><span>{userStats.total_xp || 0} XP</span></div>
          <div className="stat-pill"><span>📚</span><span>{userStats.total_lessons_completed || 0} lessons</span></div>
          <div className="stat-pill"><span>💎</span><span>{userStats.perfect_lessons || 0} perfect</span></div>
        </div>
      </div>

      <div className="xp-bar-container">
        <div className="xp-bar-header">
          <div className="xp-label">XP Progress</div>
          <div className="level-badge">LVL {level}</div>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${Math.min(100, (progress / needed) * 100)}%` }} />
        </div>
        <div className="xp-numbers">
          <span>{progress} / {needed} XP</span>
          <span>→ LVL {level + 1}</span>
        </div>
      </div>

      {lastLang && (
        <>
          <div className="section-title">Continue Learning</div>
          <div className="continue-card" onClick={onContinue}>
            <div className="continue-header">
              <div className="lang-icon-large" style={{ background: `${lastLang.color}22` }}>
                {lastLang.icon}
              </div>
              <div className="continue-info">
                <div className="continue-lang">{lastLang.name}</div>
                <div className="continue-lesson">
                  {lastLesson ? `Lesson ${lastLesson.order_index}: ${lastLesson.title}` : "Continue where you left off"}
                </div>
              </div>
              <div style={{ fontSize: 22 }}>→</div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, ((userStats[`progress_${userStats.last_language}`] || 0) / MOCK_LESSONS[userStats.last_language]?.length) * 100)}%`,
                  background: lastLang.color,
                }}
              />
            </div>
            <div className="progress-text">
              {userStats[`progress_${userStats.last_language}`] || 0} / {MOCK_LESSONS[userStats.last_language]?.length} lessons complete
            </div>
          </div>
        </>
      )}

      <div className="section-title">All Languages</div>
      <div className="lang-grid">
        {MOCK_LANGUAGES.map((lang) => (
          <div
            key={lang.id}
            className="lang-card"
            style={{ "--card-color": lang.color }}
            onClick={() => onSelectLanguage(lang)}
          >
            <span className="lang-card-icon">{lang.icon}</span>
            <div className="lang-card-name">{lang.name}</div>
            <div className="lang-card-desc">{lang.description}</div>
            <div className="lang-card-meta">
              <span className={`difficulty-badge diff-${lang.difficulty.toLowerCase()}`}>{lang.difficulty}</span>
              <span className="lang-learners">{lang.learners.toLocaleString()} 🧑‍💻</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// LANGUAGE DETAIL / LESSON LIST
// ============================================================
function LanguageScreen({ lang, userStats, onBack, onStartLesson }) {
  const lessons = MOCK_LESSONS[lang.slug] || [];
  const completed = userStats[`progress_${lang.slug}`] || 0;

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "'Space Mono',monospace" }}>
          {completed}/{lessons.length} done
        </div>
      </div>

      <div style={{ padding: "0 20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div
          className="lang-icon-large"
          style={{ background: `${lang.color}22`, width: 64, height: 64, borderRadius: 18, fontSize: 36 }}
        >
          {lang.icon}
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>{lang.name}</div>
          <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{lang.description}</div>
        </div>
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        <div className="progress-bar" style={{ height: 8, marginBottom: 8 }}>
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, (completed / lessons.length) * 100)}%`, background: lang.color }}
          />
        </div>
        <div className="progress-text">{completed} of {lessons.length} lessons complete</div>
      </div>

      <div className="lesson-list">
        {lessons.map((lesson, i) => {
          const isDone = i < completed;
          const isCurrent = i === completed;
          const isLocked = i > completed;

          return (
            <div
              key={lesson.id}
              className={`lesson-item ${isDone ? "completed" : ""} ${isLocked ? "locked" : ""}`}
              onClick={() => !isLocked && onStartLesson(lesson, lang)}
            >
              <div className={`lesson-number ${isDone ? "done" : isCurrent ? "current" : "locked-num"}`}>
                {isDone ? "✓" : isCurrent ? lesson.order_index : "🔒"}
              </div>
              <div className="lesson-info">
                <div className="lesson-title">{lesson.title}</div>
                <div className="lesson-xp">+{lesson.xp_reward} XP · {lesson.questions.length} questions</div>
              </div>
              <div className="lesson-check">
                {isDone ? "✅" : isCurrent ? "▶️" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// QUIZ SCREEN
// ============================================================
function QuizScreen({ lesson, lang, onComplete, onBack }) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [fillVal, setFillVal] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [perfectRun, setPerfectRun] = useState(true);
  const fillRef = useRef(null);

  const q = lesson.questions[qIndex];
  const isLast = qIndex === lesson.questions.length - 1;
  const progress = (qIndex / lesson.questions.length) * 100;

  function checkAnswer() {
    if (answered) return;
    const ans = q.type === "fill_blank" ? fillVal.trim().toLowerCase() : selected;
    const isCorrect = ans === q.answer.toLowerCase() || ans === q.answer;
    setCorrect(isCorrect);
    setAnswered(true);

    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      setMistakes((m) => m + 1);
      setPerfectRun(false);
      setHearts((h) => Math.max(0, h - 1));
    }
  }

  function nextQuestion() {
    if (hearts === 0) { onComplete(0, 0, false); return; }
    if (isLast) {
      const xp = Math.round(lesson.xp_reward * (score + (correct ? 1 : 0)) / lesson.questions.length);
      onComplete(xp, mistakes, perfectRun && correct);
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setFillVal("");
      setAnswered(false);
      setCorrect(false);
      if (fillRef.current) fillRef.current.value = "";
    }
  }

  const letters = ["A", "B", "C", "D"];

  return (
    <div className="screen" style={{ paddingBottom: 160 }}>
      <div className="quiz-header">
        <div className="quiz-status">
          <button className="back-btn" onClick={onBack}>✕ Quit</button>
          <div className="hearts">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} style={{ opacity: i < hearts ? 1 : 0.25 }}>❤️</span>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16, marginBottom: 4 }}>
          <div className="quiz-status" style={{ marginBottom: 8 }}>
            <span className="quiz-counter">{qIndex + 1} / {lesson.questions.length}</span>
            <span style={{ fontSize: 12, color: "var(--accent4)", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>
              {lang.icon} {lang.name}
            </span>
          </div>
          <div className="quiz-progress">
            <div className="quiz-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="quiz-question">
        <div className="question-type-badge">
          {q.type === "multiple_choice" ? "⬜ Multiple Choice" : "✏️ Fill in the Blank"}
        </div>
        <div className="question-text">{q.prompt}</div>
        {q.code && <div className="code-snippet">{q.code}</div>}
      </div>

      <div className="options-grid">
        {q.type === "multiple_choice" ? (
          q.options.map((opt, i) => {
            let cls = "option-btn";
            if (answered) {
              if (opt === q.answer) cls += " correct";
              else if (opt === selected && opt !== q.answer) cls += " wrong";
            } else if (opt === selected) cls += " selected";

            return (
              <button key={i} className={cls} disabled={answered} onClick={() => setSelected(opt)}>
                <span className="option-letter">{letters[i]}</span>
                {opt}
              </button>
            );
          })
        ) : (
          <input
            ref={fillRef}
            className={`fill-blank-input ${answered ? (correct ? "correct" : "wrong") : ""}`}
            placeholder="Type your answer..."
            value={fillVal}
            onChange={(e) => setFillVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") answered ? nextQuestion() : checkAnswer();
            }}
            disabled={answered}
            autoFocus
          />
        )}
      </div>

      <div className="quiz-bottom">
        {answered && (
          <div className={`feedback-banner ${correct ? "correct-fb" : "wrong-fb"}`}>
            <div className={`feedback-title ${correct ? "c" : "w"}`}>
              {correct ? "🎉 Correct!" : "😅 Not quite!"}
            </div>
            <div className="feedback-exp">{q.explanation}</div>
            {!correct && <div style={{ fontSize: 13, marginTop: 6, fontFamily: "'Space Mono',monospace", color: "var(--accent2)" }}>
              Answer: {q.answer}
            </div>}
          </div>
        )}
        <button
          className="btn-primary"
          onClick={answered ? nextQuestion : checkAnswer}
          disabled={!selected && !fillVal && !answered}
        >
          {!answered ? "Check Answer" : isLast ? "Finish Lesson 🎉" : "Continue →"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// LESSON COMPLETE SCREEN
// ============================================================
function LessonCompleteScreen({ xpEarned, mistakes, perfect, lessonTitle, onContinue }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const accuracy = mistakes === 0 ? 100 : Math.max(0, Math.round(100 - mistakes * 20));

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {showConfetti && <Confetti />}
      <div className="complete-screen">
        <div className="complete-emoji">{perfect ? "💎" : xpEarned > 0 ? "🏆" : "💪"}</div>
        <div className="complete-title">{perfect ? "Perfect!" : xpEarned > 0 ? "Lesson Done!" : "Keep Going!"}</div>
        <div className="complete-subtitle">
          {perfect ? "Flawless execution, no mistakes!" : `You completed: ${lessonTitle}`}
        </div>

        <div className="complete-stats">
          <div className="complete-stat">
            <div className="complete-stat-icon">⚡</div>
            <div className="complete-stat-num" style={{ color: "var(--accent4)" }}>+{xpEarned}</div>
            <div className="complete-stat-label">XP EARNED</div>
          </div>
          <div className="complete-stat">
            <div className="complete-stat-icon">🎯</div>
            <div className="complete-stat-num" style={{ color: "var(--accent2)" }}>{accuracy}%</div>
            <div className="complete-stat-label">ACCURACY</div>
          </div>
          <div className="complete-stat">
            <div className="complete-stat-icon">❤️</div>
            <div className="complete-stat-num" style={{ color: mistakes > 0 ? "var(--accent3)" : "var(--accent2)" }}>
              {mistakes}
            </div>
            <div className="complete-stat-label">MISTAKES</div>
          </div>
        </div>

        <button className="btn-primary" style={{ maxWidth: 320 }} onClick={onContinue}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ============================================================
// LEADERBOARD SCREEN
// ============================================================
function LeaderboardScreen({ user, userStats }) {
  const mockLeaderboard = [
    { id: "a1", username: "rustacean_pro", xp: 4820, streak: 14, avatar: "🦀" },
    { id: "a2", username: "py_wizard", xp: 3940, streak: 21, avatar: "🧙" },
    { id: "a3", username: "js_ninja", xp: 3210, streak: 7, avatar: "🥷" },
    { id: "a4", username: "goopher", xp: 2880, streak: 5, avatar: "🐹" },
    { id: "a5", username: "sqlqueen", xp: 2340, streak: 11, avatar: "👑" },
    { id: "a6", username: "ts_overlord", xp: 1920, streak: 3, avatar: "📘" },
    { id: "a7", username: "bytebender", xp: 1540, streak: 8, avatar: "⚡" },
  ];

  const userXP = userStats.total_xp || 0;
  const allUsers = [
    ...mockLeaderboard,
    { id: user.id, username: userStats.username || user.username, xp: userXP, streak: userStats.streak_days || 0, avatar: "🧬", isMe: true },
  ].sort((a, b) => b.xp - a.xp);

  const rankIcons = ["🥇", "🥈", "🥉"];

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="screen-title">Leaderboard 🏆</div>
        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'Space Mono',monospace" }}>Weekly</div>
      </div>

      <div className="leaderboard-list">
        {allUsers.map((u, i) => (
          <div
            key={u.id}
            className={`lb-item ${u.isMe ? "me" : ""}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="lb-rank">{i < 3 ? rankIcons[i] : `#${i + 1}`}</div>
            <div className="lb-avatar">{u.avatar}</div>
            <div className="lb-info">
              <div className="lb-name">{u.username} {u.isMe && "← you"}</div>
              <div className="lb-detail">🔥 {u.streak} day streak</div>
            </div>
            <div className="lb-xp">{u.xp.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PROFILE SCREEN
// ============================================================
function ProfileScreen({ user, userStats, onSignOut }) {
  const { level, progress, needed } = getXPProgress(userStats.total_xp || 0);

  const earnedAchievements = ACHIEVEMENTS.filter((a) => a.condition(userStats));
  const lockedAchievements = ACHIEVEMENTS.filter((a) => !a.condition(userStats));

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="screen-title">Profile</div>
        <button className="sign-out-btn" onClick={onSignOut}>Sign Out</button>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar">🧬</div>
        <div>
          <div className="profile-name">{userStats.username || user.username}</div>
          <div className="profile-joined" style={{ fontFamily: "'Space Mono',monospace", fontSize: 11 }}>
            {user.email}
          </div>
          <div className="profile-level">
            <div className="level-badge">Level {level}</div>
          </div>
        </div>
      </div>

      <div style={{ margin: "0 20px 24px" }}>
        <div className="xp-bar-container">
          <div className="xp-bar-header">
            <div className="xp-label">Experience Points</div>
            <div style={{ fontSize: 13, color: "var(--accent4)", fontWeight: 700, fontFamily: "'Space Mono',monospace" }}>
              {userStats.total_xp || 0} XP total
            </div>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${Math.min(100, (progress / needed) * 100)}%` }} />
          </div>
          <div className="xp-numbers">
            <span>{progress} / {needed} to next level</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, padding: "0 20px", marginBottom: 24 }}>
        {[
          { icon: "🔥", val: userStats.streak_days || 0, label: "DAY STREAK" },
          { icon: "📚", val: userStats.total_lessons_completed || 0, label: "LESSONS" },
          { icon: "💎", val: userStats.perfect_lessons || 0, label: "PERFECT" },
        ].map((s) => (
          <div key={s.label} style={{
            flex: 1, background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 16, padding: "16px 12px", textAlign: "center"
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{s.val}</div>
            <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'Space Mono',monospace", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="section-title" style={{ marginBottom: 16 }}>
        Achievements ({earnedAchievements.length}/{ACHIEVEMENTS.length})
      </div>
      <div className="achievements-grid">
        {ACHIEVEMENTS.map((a) => {
          const earned = earnedAchievements.some((e) => e.id === a.id);
          return (
            <div key={a.id} className={`achievement-item ${earned ? "earned" : "locked-ach"}`} title={a.desc}>
              <div className="ach-icon">{a.icon}</div>
              <div className={`ach-name ${earned ? "earned-text" : ""}`}>{a.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [selectedLang, setSelectedLang] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeLang, setActiveLang] = useState(null);
  const [lessonResult, setLessonResult] = useState(null);
  const [userStats, setUserStats] = useState({
    total_xp: 0, total_lessons_completed: 0, streak_days: 0,
    perfect_lessons: 0, level: 1, last_language: null, last_lesson_index: null,
    languages_started: 0, username: "",
  });
  const [toast, setToast] = useState(null);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem("codeling_user");
    const savedStats = localStorage.getItem("codeling_stats");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.username) setUser(u);
      } catch {}
    }
    if (savedStats) {
      try { setUserStats(JSON.parse(savedStats)); } catch {}
    }
  }, []);

  function saveStats(stats) {
    setUserStats(stats);
    localStorage.setItem("codeling_stats", JSON.stringify(stats));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleAuth(u) {
    setUser(u);
    localStorage.setItem("codeling_user", JSON.stringify(u));

    // Try load from Supabase
    try {
      const db = await supabase.from("user_stats");
      const { data } = await db.select("*", { eq: ["user_id", u.id] });
      if (data?.[0]) {
        saveStats({ ...data[0], username: data[0].username || u.username });
        return;
      }
    } catch {}

    // Initialize new stats
    const newStats = {
      ...userStats,
      username: u.username,
      user_id: u.id,
    };
    saveStats(newStats);
  }

  async function handleLessonComplete(xpEarned, mistakes, perfect, lesson, lang) {
    const newStats = { ...userStats };
    newStats.total_xp = (newStats.total_xp || 0) + xpEarned;
    newStats.total_lessons_completed = (newStats.total_lessons_completed || 0) + 1;
    if (perfect) newStats.perfect_lessons = (newStats.perfect_lessons || 0) + 1;
    newStats.last_language = lang.slug;
    newStats.last_lesson_index = lesson.order_index + 1;
    newStats[`progress_${lang.slug}`] = (newStats[`progress_${lang.slug}`] || 0) + 1;
    newStats.level = getLevelFromXP(newStats.total_xp);

    // Count languages started
    const langs = MOCK_LANGUAGES.filter((l) => newStats[`progress_${l.slug}`] > 0).length;
    newStats.languages_started = langs;

    // Streak
    const today = new Date().toDateString();
    if (newStats.last_active !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (newStats.last_active === yesterday) {
        newStats.streak_days = (newStats.streak_days || 0) + 1;
      } else {
        newStats.streak_days = 1;
      }
      newStats.last_active = today;
    }

    saveStats(newStats);

    // Save to Supabase
    try {
      const db = await supabase.from("user_stats");
      await db.upsert({ ...newStats, updated_at: new Date().toISOString() });
    } catch {}

    // Check new achievements
    const prevAchs = userStats;
    const newAchs = ACHIEVEMENTS.filter((a) => a.condition(newStats) && !a.condition(prevAchs));
    if (newAchs.length > 0) {
      setTimeout(() => showToast(`🏆 Achievement unlocked: ${newAchs[0].name}`), 1000);
    }

    setLessonResult({ xpEarned, mistakes, perfect, lessonTitle: lesson.title });
    setActiveLesson(null);
  }

  function handleSignOut() {
    supabase.auth.signOut();
    localStorage.removeItem("codeling_user");
    setUser(null);
    setUserStats({
      total_xp: 0, total_lessons_completed: 0, streak_days: 0,
      perfect_lessons: 0, level: 1, last_language: null,
    });
  }

  function handleContinue() {
    if (userStats.last_language) {
      const lang = MOCK_LANGUAGES.find((l) => l.slug === userStats.last_language);
      if (lang) {
        setSelectedLang(lang);
        setTab("home");
      }
    }
  }

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="app">
          <AuthScreen onAuth={handleAuth} />
        </div>
      </>
    );
  }

  // Lesson active
  if (activeLesson && activeLang) {
    return (
      <>
        <style>{styles}</style>
        <div className="app">
          {toast && <div className="toast">{toast}</div>}
          <QuizScreen
            lesson={activeLesson}
            lang={activeLang}
            onComplete={(xp, m, p) => handleLessonComplete(xp, m, p, activeLesson, activeLang)}
            onBack={() => { setActiveLesson(null); setActiveLang(null); setSelectedLang(activeLang); }}
          />
        </div>
      </>
    );
  }

  // Lesson result
  if (lessonResult) {
    return (
      <>
        <style>{styles}</style>
        <div className="app">
          <LessonCompleteScreen
            {...lessonResult}
            onContinue={() => {
              setLessonResult(null);
              setSelectedLang(activeLang || MOCK_LANGUAGES.find((l) => l.slug === userStats.last_language));
            }}
          />
        </div>
      </>
    );
  }

  // Language detail
  if (selectedLang) {
    return (
      <>
        <style>{styles}</style>
        <div className="app">
          {toast && <div className="toast">{toast}</div>}
          <LanguageScreen
            lang={selectedLang}
            userStats={userStats}
            onBack={() => setSelectedLang(null)}
            onStartLesson={(lesson, lang) => {
              setActiveLang(lang);
              setActiveLesson(lesson);
            }}
          />
        </div>
      </>
    );
  }

  const navItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "leaderboard", icon: "🏆", label: "Ranks" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {toast && <div className="toast">{toast}</div>}

        {tab === "home" && (
          <HomeScreen
            user={user}
            userStats={userStats}
            onSelectLanguage={(lang) => setSelectedLang(lang)}
            onContinue={handleContinue}
          />
        )}
        {tab === "leaderboard" && (
          <LeaderboardScreen user={user} userStats={userStats} />
        )}
        {tab === "profile" && (
          <ProfileScreen user={user} userStats={userStats} onSignOut={handleSignOut} />
        )}

        <nav className="bottom-nav">
          {navItems.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${tab === n.id ? "active" : ""}`}
              onClick={() => setTab(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
