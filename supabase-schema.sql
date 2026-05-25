-- ── Fresh install ────────────────────────────────────────────────────────────
-- Run in Supabase → SQL Editor → New query

create table public.logs (
  id              uuid primary key default gen_random_uuid(),

  -- ── Entry type ──
  type            text not null check (type in ('movie', 'series', 'episode')),
  source          text default 'manual' check (source in ('manual', 'letterboxd')),

  -- ── Core identity ──
  tmdb_id         integer,
  title           text not null,
  poster_url      text,
  backdrop_url    text,
  year            integer,

  -- ── Personal fields ──
  vibe            text check (vibe in ('masterpiece','loved','solid','fine','painful')),
  review          text,
  watched_on      date not null default current_date,
  platform        text,
  favorite_person jsonb,          -- { id, name, role, profile_url }
  draws           text[] default '{}',
  season          integer,
  episode         integer,
  episode_title   text,
  status          text default 'watched' check (status in ('watched','watching','dropped')),
  tags            text[] default '{}',
  rewatch         boolean default false,

  -- ── TMDB rich metadata (for insights) ──
  genres               text[]   default '{}',
  runtime              integer,                -- minutes
  original_language    text,                   -- 'en', 'ko', 'hi'
  origin_country       text[]   default '{}',  -- ['United States', 'South Korea']
  tmdb_rating          numeric(3,1),           -- 7.4
  tmdb_vote_count      integer,
  tmdb_popularity      numeric(10,3),
  director             text,                   -- primary director / show creator
  cast_names           text[]   default '{}',  -- top 8 cast
  keywords             text[]   default '{}',  -- thematic tags
  collection           text,                   -- franchise / collection name
  certification        text,                   -- 'PG-13', 'R', 'U/A'
  tagline              text,
  overview             text,
  imdb_id              text,
  budget               bigint,                 -- USD
  revenue              bigint,                 -- USD
  networks             text[]   default '{}',  -- TV: ['Netflix', 'HBO']
  production_companies text[]   default '{}',

  created_at      timestamptz default now()
);

-- RLS
alter table public.logs enable row level security;

create policy "Public read"
  on public.logs for select using (true);

create policy "Anon write"
  on public.logs for all using (true) with check (true);


-- ── Migration (if you already ran the old schema) ─────────────────────────
-- Run ONLY these lines if the table already exists:
--
-- alter table public.logs
--   add column if not exists runtime              integer,
--   add column if not exists original_language    text,
--   add column if not exists origin_country       text[]  default '{}',
--   add column if not exists tmdb_rating          numeric(3,1),
--   add column if not exists tmdb_vote_count      integer,
--   add column if not exists tmdb_popularity      numeric(10,3),
--   add column if not exists director             text,
--   add column if not exists cast_names           text[]  default '{}',
--   add column if not exists keywords             text[]  default '{}',
--   add column if not exists collection           text,
--   add column if not exists certification        text,
--   add column if not exists tagline              text,
--   add column if not exists overview             text,
--   add column if not exists imdb_id              text,
--   add column if not exists budget               bigint,
--   add column if not exists revenue              bigint,
--   add column if not exists networks             text[]  default '{}',
--   add column if not exists production_companies text[]  default '{}';
