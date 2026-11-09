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


-- ── Art gallery ───────────────────────────────────────────────────────────────
-- RLS stays ON with no policies: only the server (service role) reads and writes this table.
create table if not exists art_pieces (
  id           uuid primary key default gen_random_uuid(),
  title        text not null default 'Untitled',
  caption      text,
  image_url    text not null,
  width        integer,
  height       integer,
  tags         text[] not null default '{}',
  product_id   uuid references shop_products(id) on delete set null,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists art_pieces_order_idx on art_pieces (sort_order, created_at desc);
alter table art_pieces enable row level security;


-- ── Places: shared by Movies (theatres) and the upcoming cafes / restaurants / activities module ──────────────
-- One row per real-world place. Anyone may read; only the server (service role) writes.
create table if not exists places (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null,          -- 'theatre' | 'cafe' | 'restaurant' | 'activity' | ...
  name       text not null,
  city       text,
  area       text,                   -- locality, e.g. 'Kukatpally' or 'Velachery'
  address    text,
  maps_url   text,
  lat        double precision,
  lng        double precision,
  created_at timestamptz not null default now()
);
-- the same place is never saved twice (case-insensitive on name and city)
create unique index if not exists places_unique_idx on places (kind, lower(name), lower(coalesce(city, '')));
create index if not exists places_kind_city_idx on places (kind, city);
alter table places enable row level security;
drop policy if exists "places are readable" on places;
create policy "places are readable" on places for select using (true);

-- A movie log can point at the theatre it was seen in, and note the screen format
alter table logs add column if not exists place_id      uuid references places(id) on delete set null;
alter table logs add column if not exists screen_format text;
alter table logs add column if not exists seating       text;   -- 'recliner' | 'luxe' | 'insignia' | 'gold'
create index if not exists logs_place_idx on logs (place_id);
