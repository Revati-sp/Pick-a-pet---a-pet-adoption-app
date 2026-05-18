-- ============================================================
-- SwipeVote — Supabase Schema
-- Run this first in the Supabase SQL Editor
-- ============================================================

-- 1. Items table (pet catalog)
create table if not exists items (
  id          integer primary key,
  name        text    not null,
  description text    not null,
  image_url   text    not null
);

-- 2. Votes table
create table if not exists votes (
  id         uuid    primary key default gen_random_uuid(),
  session_id text    not null,
  item_id    integer references items(id),
  choice     text    not null check (choice in ('yes', 'no')),
  created_at timestamptz default now(),
  unique(session_id, item_id)   -- prevents duplicate votes per session
);

-- 3. Row Level Security (anon key access)
alter table items enable row level security;
alter table votes enable row level security;

-- Allow anyone to read items (the pet catalog)
create policy "items_public_read" on items
  for select using (true);

-- Allow anyone to read all votes (for results screen)
create policy "votes_public_read" on votes
  for select using (true);

-- Allow anyone to insert a vote
create policy "votes_public_insert" on votes
  for insert with check (true);

-- Allow anyone to update a vote (required for upsert to work)
create policy "votes_public_update" on votes
  for update using (true);
