# SwipeVote — Adoptable Pets 🐾

A Tinder-style swipe-to-vote mobile web app built for CMPE 285.  
Vote YES (adopt) or NO (pass) on 100 adoptable pets. Votes are persisted to Supabase and shown on a sortable results screen.

---

## Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite 5                 |
| Styling    | Tailwind CSS v3                   |
| Animations | Framer Motion v11                 |
| Backend/DB | Supabase (PostgreSQL)             |

---

## Project Structure

```
swipevote/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Screen router (swipe / done / results)
│   ├── index.css             # Tailwind directives
│   ├── supabaseClient.js     # Supabase client (reads env vars)
│   ├── data/
│   │   └── pets.js           # 100 pet items (stable IDs + image URLs)
│   └── components/
│       ├── SwipeCard.jsx     # Draggable card with tilt + YES/NO overlay
│       ├── SwipeScreen.jsx   # Main voting screen with progress bar
│       └── ResultsScreen.jsx # Sortable results (loved / disliked / divisive)
├── supabase/
│   ├── schema.sql            # Table definitions + RLS policies
│   └── seed.sql              # INSERT for all 100 pets
├── index.html
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/Revati-sp/Pick-a-pet---a-pet-adoption-app
cd Pick-a-pet---a-pet-adoption-app
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Open the **SQL Editor**
3. Run `supabase/schema.sql` (creates `items` and `votes` tables + RLS policies)
4. Run `supabase/seed.sql` (inserts all 100 pets into the `items` table)

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and paste your values from **Supabase → Project Settings → API**:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — optimised for a 390 × 844 viewport (iPhone 14).

---

## Features

- **Swipe right** = YES (adopt) · **Swipe left** = NO (pass)
- Card tilts while dragging; green ADOPT / red PASS badges appear
- YES ♥ and NO ✕ buttons also trigger the swipe animation
- Progress bar tracks 0 → 100 voted
- Peek of next card visible behind current card
- Session ID stored in localStorage; votes live in Supabase
- Upsert prevents duplicate counting (same session + item → one row)
- Session resumes where you left off on page reload
- Results screen sortable by **Most Loved**, **Most Disliked**, **Most Divisive**
- End-of-deck congratulations screen with link to results
- Image fallback if loremflickr is unavailable

---

## Database Schema

```sql
items  (id integer PK, name, description, image_url)
votes  (id uuid PK, session_id text, item_id → items.id,
        choice text CHECK IN ('yes','no'), created_at,
        UNIQUE(session_id, item_id))
```

---

## Design Decisions

- **localStorage** stores only the anonymous `sessionId` UUID — never vote data.
- **Upsert** (`onConflict: 'session_id,item_id'`) ensures a re-vote updates the row instead of inserting a duplicate.
- **Optimistic UI**: the card animates off-screen immediately; the Supabase write happens in the background to keep the UX snappy.
- **Framer Motion `drag="x"`** handles both mouse drag (desktop) and touch drag (mobile) natively.
- **loremflickr.com** with `?lock=N` returns the same image on every request for the same keyword + lock, making URLs stable for this demo.
