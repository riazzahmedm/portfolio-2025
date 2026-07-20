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


-- ── Blog ───────────────────────────────────────────────────────────────────────
-- Run in Supabase → SQL Editor → New query

create table public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  cover_image  text,
  content      jsonb not null default '[]',
  tags         text[] default '{}',
  published    boolean default false,
  published_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.blog_posts enable row level security;

create policy "Public read"
  on public.blog_posts for select using (true);

create policy "Anon write"
  on public.blog_posts for all using (true) with check (true);


-- ── Shop Feature ──────────────────────────────────────────────────────────────

-- Categories (Stickers, Posters, Badges, etc.)
create table public.shop_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  position   integer not null default 0,
  created_at timestamptz default now()
);

-- Tags (Marvel, Spiderman, DC, etc.)
create table public.shop_tags (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz default now()
);

-- Products
create table public.shop_products (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid references public.shop_categories(id) on delete set null,
  name        text not null,
  description text,
  images      text[] not null default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

-- Product ↔ Tag junction
create table public.shop_product_tags (
  product_id uuid references public.shop_products(id) on delete cascade,
  tag_id     uuid references public.shop_tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

-- Variants (size + price + stock per product)
create table public.shop_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.shop_products(id) on delete cascade,
  size       text not null,
  price      numeric(10,2) not null,
  stock_qty  integer not null default 0,
  created_at timestamptz default now()
);

-- Orders
create table public.shop_orders (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid references auth.users(id),
  status           text not null default 'pending_payment'
                     check (status in ('pending_payment','payment_submitted','confirmed','shipped','delivered','cancelled')),
  payment_status   text not null default 'unpaid'
                     check (payment_status in ('unpaid','submitted','verified')),
  shipping_address jsonb not null,
  subtotal         numeric(10,2) not null,
  discount_amount  numeric(10,2) not null default 0,
  total            numeric(10,2) not null,
  coupon_code      text,
  utr_reference    text,
  notes            text,
  created_at       timestamptz default now()
);

-- Order line items (price snapshot)
create table public.shop_order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.shop_orders(id) on delete cascade,
  variant_id   uuid references public.shop_variants(id) on delete set null,
  product_name text not null,
  size         text not null,
  price        numeric(10,2) not null,
  quantity     integer not null
);

-- Bundle deals (buy N for ₹X)
create table public.shop_bundle_deals (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  min_qty    integer not null,
  price      numeric(10,2) not null,
  is_active  boolean not null default true,
  created_at timestamptz default now()
);

-- Coupon codes
create table public.shop_coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  type             text not null check (type in ('percentage','flat')),
  value            numeric(10,2) not null,
  min_order_amount numeric(10,2) not null default 0,
  max_uses         integer,
  uses_count       integer not null default 0,
  expires_at       timestamptz,
  is_active        boolean not null default true,
  created_at       timestamptz default now()
);

-- Key-value settings store
create table public.shop_settings (
  key   text primary key,
  value text not null
);

-- Seed default settings
insert into public.shop_settings (key, value) values
  ('upi_id',       ''),
  ('qr_code_url',  ''),
  ('store_name',   'Riaz Ahmed Art'),
  ('store_tagline','Original digital art — stickers, posters & more');

-- Analytics events
create table public.shop_events (
  id         uuid primary key default gen_random_uuid(),
  type       text not null
               check (type in ('page_view','add_to_cart','checkout_started','payment_submitted','order_completed')),
  session_id text not null,
  user_id    uuid references auth.users(id),
  metadata   jsonb not null default '{}',
  created_at timestamptz default now()
);

-- RLS: all shop tables — anon write (all access via API routes which enforce auth)
alter table public.shop_categories    enable row level security;
alter table public.shop_tags          enable row level security;
alter table public.shop_products      enable row level security;
alter table public.shop_product_tags  enable row level security;
alter table public.shop_variants      enable row level security;
alter table public.shop_orders        enable row level security;
alter table public.shop_order_items   enable row level security;
alter table public.shop_bundle_deals  enable row level security;
alter table public.shop_coupons       enable row level security;
alter table public.shop_settings      enable row level security;
alter table public.shop_events        enable row level security;

create policy "Public read categories"   on public.shop_categories   for select using (true);
create policy "Public read tags"         on public.shop_tags          for select using (true);
create policy "Public read products"     on public.shop_products      for select using (true);
create policy "Public read product_tags" on public.shop_product_tags  for select using (true);
create policy "Public read variants"     on public.shop_variants      for select using (true);
create policy "Public read bundle_deals" on public.shop_bundle_deals  for select using (true);
create policy "Public read settings"     on public.shop_settings      for select using (true);
create policy "Anon all categories"      on public.shop_categories    for all using (true) with check (true);
create policy "Anon all tags"            on public.shop_tags          for all using (true) with check (true);
create policy "Anon all products"        on public.shop_products      for all using (true) with check (true);
create policy "Anon all product_tags"    on public.shop_product_tags  for all using (true) with check (true);
create policy "Anon all variants"        on public.shop_variants      for all using (true) with check (true);
create policy "Anon all orders"          on public.shop_orders        for all using (true) with check (true);
create policy "Anon all order_items"     on public.shop_order_items   for all using (true) with check (true);
create policy "Anon all bundle_deals"    on public.shop_bundle_deals  for all using (true) with check (true);
create policy "Anon all coupons"         on public.shop_coupons       for all using (true) with check (true);
create policy "Anon all settings"        on public.shop_settings      for all using (true) with check (true);
create policy "Anon all events"          on public.shop_events        for all using (true) with check (true);

-- RPC for atomic coupon usage increment
create or replace function increment_coupon_uses(coupon_code text)
returns void language sql as $$
  update public.shop_coupons
  set uses_count = uses_count + 1
  where code = coupon_code;
$$;

-- RPC for atomic stock decrement
create or replace function decrement_stock(variant_id uuid, qty integer)
returns void language sql as $$
  update public.shop_variants
  set stock_qty = greatest(0, stock_qty - qty)
  where id = variant_id;
$$;
