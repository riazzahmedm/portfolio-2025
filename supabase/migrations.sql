-- Run these in your Supabase SQL editor

-- ── Curated Lists ─────────────────────────────────────────────────────────────
create table if not exists movie_lists (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique not null,           -- URL-friendly: "best-of-2024"
  description text,
  is_public   boolean default true,
  created_at  timestamptz default now()
);

create table if not exists movie_list_items (
  id          uuid primary key default gen_random_uuid(),
  list_id     uuid references movie_lists(id) on delete cascade not null,
  log_id      uuid,                                          -- optional soft-link to a logs row (no FK to avoid cross-table dep)
  tmdb_id     integer,
  title       text not null,
  poster_url  text,
  type        text,                           -- 'movie' | 'series'
  year        integer,
  note        text,                           -- admin's comment about why this is on the list
  rank        integer default 0,             -- for ordered lists
  created_at  timestamptz default now()
);

create index if not exists movie_list_items_list_id_idx on movie_list_items(list_id);
create index if not exists movie_list_items_rank_idx    on movie_list_items(list_id, rank);

-- ── Series Progress ───────────────────────────────────────────────────────────
create table if not exists series_progress (
  id               uuid primary key default gen_random_uuid(),
  tmdb_id          integer not null unique,
  title            text not null,
  poster_url       text,
  current_season   integer default 1,
  current_episode  integer default 0,
  status           text default 'watching',  -- 'watching' | 'on_hold' | 'dropped' | 'completed'
  total_seasons    integer,
  total_episodes   integer,
  notes            text,
  last_updated     timestamptz default now(),
  created_at       timestamptz default now()
);

-- ── Disable RLS (all writes go through server-side API routes) ────────────────
alter table movie_lists       disable row level security;
alter table movie_list_items  disable row level security;
alter table series_progress   disable row level security;
