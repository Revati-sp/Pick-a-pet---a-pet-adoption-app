# AI_NOTES.md — SwipeVote Development Log

## Project Overview
SwipeVote is a mobile-first Tinder-style voting app for CMPE 285 (Software Entrepreneurship). Users swipe or tap to vote on 100 adoptable pets. Votes are stored in Supabase and results are shown on a sortable leaderboard.

---

## AI Assistance Used

This project was built with the help of **Claude Sonnet 4.6** (Claude Code) acting as an AI pair-programmer.

### What AI generated

| Artifact | AI involvement |
|---|---|
| Project scaffold (Vite + React + Tailwind) | Full generation |
| `SwipeCard.jsx` | Full generation — drag gesture logic, tilt transform, YES/NO overlay |
| `SwipeScreen.jsx` | Full generation — session management, Supabase fetch/upsert, optimistic UI |
| `ResultsScreen.jsx` | Full generation — vote tallying, sort logic, bar chart |
| `supabase/schema.sql` | Full generation — tables, constraints, RLS policies |
| `supabase/seed.sql` | Full generation — 100 pet records |
| `src/data/pets.js` | Full generation — 100 pet objects with names, descriptions, image URLs |
| `README.md` | Full generation |

### What required human decisions

- Choosing the "Adoptable Pets" theme
- Choosing Framer Motion over raw pointer events
- Deciding to use loremflickr for placeholder pet images
- Deciding to use upsert (not insert + check) to handle duplicate votes
- Deciding to skip already-voted pets on page reload (session resume)

---

## Key Architecture Decisions

### Session Management
Anonymous session IDs are generated with `crypto.randomUUID()` and stored in `localStorage`. This is the **only** thing stored locally — it is not vote data, just a device identifier. All votes live in Supabase.

### Duplicate Vote Prevention
The `votes` table has a `UNIQUE(session_id, item_id)` constraint. Votes are written with `.upsert(..., { onConflict: 'session_id,item_id' })`, so a repeat vote updates the existing row's `choice` rather than inserting a second row. This satisfies the "same sessionId + itemId should only count once" requirement at the database level, not just application level.

### Optimistic UI
When a user swipes or clicks a button:
1. The card immediately animates off-screen (Framer Motion)
2. React state advances to the next card
3. The Supabase upsert runs in the background

This makes the app feel instant even on slow connections.

### Swipe Gesture (Framer Motion)
- `drag="x"` — enables horizontal drag on both mouse (desktop) and touch (mobile)
- `dragConstraints={{ left: 0, right: 0 }}` — card springs back if not swiped far enough
- `dragElastic={0.85}` — allows some overshoot for natural feel
- `useTransform(x, ...)` — rotates card and fades YES/NO overlays based on drag position
- `useImperativeHandle` — lets the parent call `triggerSwipe()` when buttons are pressed

### Results Sorting
- **Most Loved**: sort descending by `yes` count
- **Most Disliked**: sort descending by `no` count
- **Most Divisive**: sort ascending by `|yes - no|` (smallest gap = most split), tiebreak by total votes descending

---

## Limitations & Known Constraints

- **Images**: loremflickr.com returns real Flickr photos tagged with the search keywords. The `?lock=N` parameter makes them stable per session but they may not always be perfectly on-theme. A fallback to `placehold.co` is included in the `onError` handler.
- **No authentication**: uses anonymous sessions. A determined user could clear localStorage to vote again; the upsert only prevents duplicate counting within one session.
- **No real-time updates**: the results screen fetches a snapshot at load time. Adding a Supabase Realtime subscription would make counts update live.
- **Mobile-first**: designed for 390 × 844 (iPhone 14). Works on desktop but the card is constrained to `max-w-sm`.

---

## Prompt Strategy

The AI was prompted to:
1. Generate a complete, runnable project (not snippets)
2. Prioritize rubric requirements over extra features
3. Keep files under ~200 lines, simple and readable
4. Use upsert at the database level for vote deduplication
5. Handle loading, error, and empty states in every component

The AI pair-programmer approach saved significant time on boilerplate (Vite config, Tailwind setup, Supabase client) and allowed focus on the core voting UX and data flow.
