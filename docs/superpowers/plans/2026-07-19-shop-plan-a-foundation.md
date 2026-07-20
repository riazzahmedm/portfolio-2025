# Shop — Plan A: Foundation (Schema + Types + API Routes)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete backend layer for the shop feature — database tables, TypeScript types, and all API routes needed by the storefront and admin panel.

**Architecture:** All database access is server-side via Next.js API routes using the existing `lib/supabase.ts` client (anon key). Customer authentication uses Supabase Auth email OTP with the session token stored in an httpOnly cookie. Admin auth is unified into a single `admin` cookie via a new `/api/auth/admin` route. No client-side Supabase SDK needed.

**Tech Stack:** Next.js 16 App Router, Supabase (postgres + auth + storage), TypeScript, existing `lib/supabase.ts`

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `supabase-schema.sql` | Modify | Append shop tables |
| `lib/shop.types.ts` | Create | All shop TypeScript types |
| `lib/admin-auth.ts` | Create | Shared `isAdmin()` helper |
| `next.config.ts` | Modify | Add Supabase Storage hostname |
| `app/api/auth/admin/route.ts` | Create | Unified admin login/logout/check |
| `app/api/auth/admin/check/route.ts` | Create | Check admin auth status |
| `app/api/shop/categories/route.ts` | Create | List + create categories |
| `app/api/shop/categories/[id]/route.ts` | Create | Update + delete category |
| `app/api/shop/tags/route.ts` | Create | List + create tags |
| `app/api/shop/tags/[id]/route.ts` | Create | Update + delete tag |
| `app/api/shop/products/route.ts` | Create | List (public) + create (admin) products |
| `app/api/shop/products/[id]/route.ts` | Create | Get, update, delete product |
| `app/api/shop/products/[id]/tags/route.ts` | Create | Attach/detach tags from product |
| `app/api/shop/variants/route.ts` | Create | Create variant |
| `app/api/shop/variants/[id]/route.ts` | Create | Update + delete variant |
| `app/api/shop/upload/route.ts` | Create | Upload image to `shop-images` bucket |
| `app/api/shop/settings/route.ts` | Create | Get + update shop settings |
| `app/api/shop/auth/send-otp/route.ts` | Create | Send email OTP (creates user) |
| `app/api/shop/auth/verify-otp/route.ts` | Create | Verify OTP, set session cookie |
| `app/api/shop/auth/me/route.ts` | Create | Get current customer session |
| `app/api/shop/auth/logout/route.ts` | Create | Clear customer session cookie |
| `app/api/shop/orders/route.ts` | Create | Create order + list customer orders |
| `app/api/shop/orders/[id]/route.ts` | Create | Get order (customer), submit payment |
| `app/api/shop/coupons/validate/route.ts` | Create | Validate coupon code |
| `app/api/shop/events/route.ts` | Create | Track analytics events |
| `app/api/admin/shop/orders/route.ts` | Create | Admin: list all orders |
| `app/api/admin/shop/orders/[id]/route.ts` | Create | Admin: update order status/payment |
| `app/api/admin/shop/discounts/bundles/route.ts` | Create | Admin: manage bundle deals |
| `app/api/admin/shop/discounts/bundles/[id]/route.ts` | Create | Admin: update/delete bundle |
| `app/api/admin/shop/discounts/coupons/route.ts` | Create | Admin: manage coupons |
| `app/api/admin/shop/discounts/coupons/[id]/route.ts` | Create | Admin: update/delete coupon |
| `app/api/admin/shop/analytics/route.ts` | Create | Admin: analytics summary |

---

## Task 1: Supabase Schema

**Files:**
- Modify: `supabase-schema.sql`

- [ ] **Step 1: Append shop tables to `supabase-schema.sql`**

Add after the existing content:

```sql
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

-- RLS: all shop tables public read, write via API routes only
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
create policy "Anon all"                 on public.shop_categories    for all using (true) with check (true);
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
```

- [ ] **Step 2: Run schema in Supabase**

Go to Supabase Dashboard → SQL Editor → New query. Paste the shop section from `supabase-schema.sql` (the new block you just added) and run it.

Also create a `shop-images` storage bucket: Supabase Dashboard → Storage → New bucket → name `shop-images` → Public → Create.

- [ ] **Step 3: Add Supabase Storage hostname to `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 2: TypeScript Types

**Files:**
- Create: `lib/shop.types.ts`

- [ ] **Step 1: Create `lib/shop.types.ts`**

```typescript
export interface ShopCategory {
  id: string
  name: string
  slug: string
  position: number
  created_at: string
}

export interface ShopTag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface ShopVariant {
  id: string
  product_id: string
  size: string
  price: number
  stock_qty: number
  created_at: string
}

export interface ShopProduct {
  id: string
  category_id: string | null
  name: string
  description: string | null
  images: string[]
  is_active: boolean
  created_at: string
  category?: ShopCategory
  variants?: ShopVariant[]
  tags?: ShopTag[]
}

export interface ShippingAddress {
  name: string
  email: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
}

export type OrderStatus = 'pending_payment' | 'payment_submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'submitted' | 'verified'

export interface ShopOrderItem {
  id: string
  order_id: string
  variant_id: string | null
  product_name: string
  size: string
  price: number
  quantity: number
}

export interface ShopOrder {
  id: string
  customer_id: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  shipping_address: ShippingAddress
  subtotal: number
  discount_amount: number
  total: number
  coupon_code: string | null
  utr_reference: string | null
  notes: string | null
  created_at: string
  items?: ShopOrderItem[]
}

export interface ShopBundleDeal {
  id: string
  name: string
  min_qty: number
  price: number
  is_active: boolean
  created_at: string
}

export interface ShopCoupon {
  id: string
  code: string
  type: 'percentage' | 'flat'
  value: number
  min_order_amount: number
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface ShopSettings {
  upi_id: string
  qr_code_url: string
  store_name: string
  store_tagline: string
}

export interface CartItem {
  variantId: string
  productId: string
  name: string
  size: string
  price: number
  qty: number
  image: string
}

export type ShopEventType = 'page_view' | 'add_to_cart' | 'checkout_started' | 'payment_submitted' | 'order_completed'

export interface ShopEvent {
  id: string
  type: ShopEventType
  session_id: string
  user_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 3: Unified Admin Auth

**Files:**
- Create: `lib/admin-auth.ts`
- Create: `app/api/auth/admin/route.ts`

- [ ] **Step 1: Create `lib/admin-auth.ts`**

Shared helper used by all admin API routes (replaces the duplicated `isAdmin()` in each route).

```typescript
import { cookies } from 'next/headers'

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin')?.value === 'true'
}
```

- [ ] **Step 2: Create `app/api/auth/admin/route.ts`**

Single endpoint for the unified admin panel login/logout/check. Uses `ADMIN_PASSWORD` env var.

```typescript
import { cookies } from 'next/headers'

const COOKIE = 'admin'

export async function GET() {
  const jar    = await cookies()
  const authed = jar.get(COOKIE)?.value === 'true'
  return Response.json({ authed })
}

export async function POST(req: Request) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Wrong password' }, { status: 401 })
  }
  const jar = await cookies()
  jar.set(COOKIE, 'true', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 30,
    path:     '/',
  })
  return Response.json({ ok: true })
}

export async function DELETE() {
  const jar = await cookies()
  jar.delete(COOKIE)
  return Response.json({ ok: true })
}
```

- [ ] **Step 3: Add `ADMIN_PASSWORD` to `.env.local`**

Open `.env.local` and add:
```
ADMIN_PASSWORD=your_admin_password_here
```

Use the same password you currently use for blog/movies admin (or set a new unified one).

- [ ] **Step 4: Update `app/api/auth/blog/route.ts` to also set the unified `admin` cookie**

Replace the existing file:

```typescript
import { cookies } from 'next/headers'

const COOKIE = 'admin'

export async function GET() {
  const jar    = await cookies()
  const authed = jar.get(COOKIE)?.value === 'true'
  return Response.json({ authed })
}

export async function POST(req: Request) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Wrong password' }, { status: 401 })
  }
  const jar = await cookies()
  jar.set(COOKIE, 'true', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 30,
    path:     '/',
  })
  return Response.json({ ok: true })
}

export async function DELETE() {
  const jar = await cookies()
  jar.delete(COOKIE)
  return Response.json({ ok: true })
}
```

- [ ] **Step 5: Update `app/api/auth/movies/route.ts`** to the same content as Step 4 (identical).

- [ ] **Step 6: Update `app/api/blog/route.ts` to use shared `isAdmin`**

Replace the local `isAdmin()` function at the top with the import:

```typescript
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
```

Remove the local `isAdmin` function definition (lines 3–6 of the current file). Keep everything else the same.

- [ ] **Step 7: Update `app/api/blog/upload/route.ts` to use shared `isAdmin`**

Replace local `isAdmin()` with import:

```typescript
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import convert from 'heic-convert'
```

Remove the local `isAdmin` function. Keep everything else.

- [ ] **Step 8: Update all existing `app/api/movies/**` routes to use shared `isAdmin`**

In each movies API route file that has a local `isAdmin()` checking `movies-admin` cookie, replace it with:

```typescript
import { isAdmin } from '@/lib/admin-auth'
```

- [ ] **Step 9: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 4: Customer Auth API (Email OTP)

**Files:**
- Create: `lib/customer-auth.ts`
- Create: `app/api/shop/auth/send-otp/route.ts`
- Create: `app/api/shop/auth/verify-otp/route.ts`
- Create: `app/api/shop/auth/me/route.ts`
- Create: `app/api/shop/auth/logout/route.ts`

- [ ] **Step 1: Create `lib/customer-auth.ts`**

Shared helper to get current customer from session cookie.

```typescript
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

const SESSION_COOKIE = 'shop-session'

export async function getCustomer(): Promise<{ id: string; email: string } | null> {
  const jar   = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return { id: user.id, email: user.email! }
}

export async function setSessionCookie(accessToken: string) {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 30,
    path:     '/',
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}
```

- [ ] **Step 2: Create `app/api/shop/auth/send-otp/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'Email required' }, { status: 400 })
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 3: Create `app/api/shop/auth/verify-otp/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { setSessionCookie } from '@/lib/customer-auth'

export async function POST(req: Request) {
  const { email, token } = await req.json()
  if (!email || !token) {
    return Response.json({ error: 'Email and token required' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error || !data.session) {
    return Response.json({ error: error?.message ?? 'Invalid or expired code' }, { status: 401 })
  }

  await setSessionCookie(data.session.access_token)
  return Response.json({ ok: true, userId: data.user?.id })
}
```

- [ ] **Step 4: Create `app/api/shop/auth/me/route.ts`**

```typescript
import { getCustomer } from '@/lib/customer-auth'

export async function GET() {
  const customer = await getCustomer()
  if (!customer) return Response.json({ user: null })
  return Response.json({ user: customer })
}
```

- [ ] **Step 5: Create `app/api/shop/auth/logout/route.ts`**

```typescript
import { clearSessionCookie } from '@/lib/customer-auth'

export async function POST() {
  await clearSessionCookie()
  return Response.json({ ok: true })
}
```

- [ ] **Step 6: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 5: Categories & Tags API

**Files:**
- Create: `app/api/shop/categories/route.ts`
- Create: `app/api/shop/categories/[id]/route.ts`
- Create: `app/api/shop/tags/route.ts`
- Create: `app/api/shop/tags/[id]/route.ts`

- [ ] **Step 1: Create `app/api/shop/categories/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET() {
  const { data, error } = await supabase
    .from('shop_categories')
    .select('*')
    .order('position', { ascending: true })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_categories')
    .insert({ name: body.name, slug: body.slug, position: body.position ?? 0 })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
```

- [ ] **Step 2: Create `app/api/shop/categories/[id]/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_categories')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabase.from('shop_categories').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 3: Create `app/api/shop/tags/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET() {
  const { data, error } = await supabase
    .from('shop_tags')
    .select('*')
    .order('name', { ascending: true })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_tags')
    .insert({ name: body.name, slug: body.slug })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
```

- [ ] **Step 4: Create `app/api/shop/tags/[id]/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_tags')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabase.from('shop_tags').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 6: Products & Variants API

**Files:**
- Create: `app/api/shop/products/route.ts`
- Create: `app/api/shop/products/[id]/route.ts`
- Create: `app/api/shop/products/[id]/tags/route.ts`
- Create: `app/api/shop/variants/route.ts`
- Create: `app/api/shop/variants/[id]/route.ts`

- [ ] **Step 1: Create `app/api/shop/products/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const tag      = searchParams.get('tag')
  const admin    = await isAdmin()

  let query = supabase
    .from('shop_products')
    .select(`
      *,
      category:shop_categories(*),
      variants:shop_variants(*),
      tags:shop_product_tags(tag:shop_tags(*))
    `)
    .order('created_at', { ascending: false })

  if (!admin) query = query.eq('is_active', true)
  if (category) query = query.eq('category_id', category)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Flatten tags: [{ tag: {...} }] → [{ ... }]
  const products = (data ?? []).map((p: any) => ({
    ...p,
    tags: (p.tags ?? []).map((t: any) => t.tag).filter(Boolean),
  }))

  // Filter by tag slug if provided
  const filtered = tag
    ? products.filter((p: any) => p.tags.some((t: any) => t.slug === tag))
    : products

  return Response.json(filtered)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_products')
    .insert({
      category_id: body.category_id ?? null,
      name:        body.name,
      description: body.description ?? null,
      images:      body.images ?? [],
      is_active:   body.is_active ?? true,
    })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
```

- [ ] **Step 2: Create `app/api/shop/products/[id]/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase
    .from('shop_products')
    .select(`
      *,
      category:shop_categories(*),
      variants:shop_variants(*),
      tags:shop_product_tags(tag:shop_tags(*))
    `)
    .eq('id', id)
    .single()
  if (error) return Response.json({ error: error.message }, { status: 404 })
  return Response.json({
    ...data,
    tags: (data.tags ?? []).map((t: any) => t.tag).filter(Boolean),
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_products')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabase.from('shop_products').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 3: Create `app/api/shop/products/[id]/tags/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

// PUT replaces all tags for a product
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { tagIds }: { tagIds: string[] } = await req.json()

  // Delete existing, then insert new
  await supabase.from('shop_product_tags').delete().eq('product_id', id)

  if (tagIds.length > 0) {
    const rows = tagIds.map(tag_id => ({ product_id: id, tag_id }))
    const { error } = await supabase.from('shop_product_tags').insert(rows)
    if (error) return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
```

- [ ] **Step 4: Create `app/api/shop/variants/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_variants')
    .insert({
      product_id: body.product_id,
      size:       body.size,
      price:      body.price,
      stock_qty:  body.stock_qty ?? 0,
    })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
```

- [ ] **Step 5: Create `app/api/shop/variants/[id]/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_variants')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabase.from('shop_variants').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 6: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 7: Image Upload & Settings API

**Files:**
- Create: `app/api/shop/upload/route.ts`
- Create: `app/api/shop/settings/route.ts`

- [ ] **Step 1: Create `app/api/shop/upload/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import convert from 'heic-convert'

const HEIC_EXTS = new Set(['heic', 'heif'])

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  let buffer      = Buffer.from(await file.arrayBuffer())
  let contentType = file.type
  let ext         = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'

  if (HEIC_EXTS.has(ext) || file.type === 'image/heic' || file.type === 'image/heif') {
    const output = await convert({ buffer, format: 'JPEG', quality: 0.88 })
    buffer      = Buffer.from(output)
    contentType = 'image/jpeg'
    ext         = 'jpg'
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('shop-images')
    .upload(filename, buffer, { contentType, upsert: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('shop-images')
    .getPublicUrl(filename)

  return Response.json({ url: publicUrl })
}
```

- [ ] **Step 2: Create `app/api/shop/settings/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import type { ShopSettings } from '@/lib/shop.types'

export async function GET() {
  const { data, error } = await supabase
    .from('shop_settings')
    .select('key, value')
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const settings = Object.fromEntries((data ?? []).map(r => [r.key, r.value])) as ShopSettings
  return Response.json(settings)
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body: Partial<ShopSettings> = await req.json()

  const upserts = Object.entries(body).map(([key, value]) => ({ key, value: value as string }))
  const { error } = await supabase
    .from('shop_settings')
    .upsert(upserts, { onConflict: 'key' })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 8: Orders API (Customer-Facing)

**Files:**
- Create: `app/api/shop/orders/route.ts`
- Create: `app/api/shop/orders/[id]/route.ts`
- Create: `app/api/shop/coupons/validate/route.ts`

- [ ] **Step 1: Create `app/api/shop/coupons/validate/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { code, subtotal }: { code: string; subtotal: number } = await req.json()
  if (!code) return Response.json({ error: 'Code required' }, { status: 400 })

  const { data: coupon, error } = await supabase
    .from('shop_coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) return Response.json({ error: 'Invalid coupon code' }, { status: 404 })

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return Response.json({ error: 'Coupon has expired' }, { status: 400 })
  }

  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return Response.json({ error: 'Coupon usage limit reached' }, { status: 400 })
  }

  if (subtotal < coupon.min_order_amount) {
    return Response.json({
      error: `Minimum order ₹${coupon.min_order_amount} required for this coupon`,
    }, { status: 400 })
  }

  const discount = coupon.type === 'percentage'
    ? Math.round((subtotal * coupon.value) / 100 * 100) / 100
    : Math.min(coupon.value, subtotal)

  return Response.json({ valid: true, discount, coupon })
}
```

- [ ] **Step 2: Create `app/api/shop/orders/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { getCustomer } from '@/lib/customer-auth'
import type { CartItem, ShippingAddress } from '@/lib/shop.types'

export async function GET() {
  const customer = await getCustomer()
  if (!customer) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('shop_orders')
    .select('*, items:shop_order_items(*)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  const customer = await getCustomer()
  if (!customer) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body: {
    items: CartItem[]
    shipping_address: ShippingAddress
    subtotal: number
    discount_amount: number
    total: number
    coupon_code?: string
  } = await req.json()

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('shop_orders')
    .insert({
      customer_id:      customer.id,
      shipping_address: body.shipping_address,
      subtotal:         body.subtotal,
      discount_amount:  body.discount_amount,
      total:            body.total,
      coupon_code:      body.coupon_code ?? null,
    })
    .select()
    .single()

  if (orderError) return Response.json({ error: orderError.message }, { status: 500 })

  // Insert line items
  const items = body.items.map(item => ({
    order_id:     order.id,
    variant_id:   item.variantId,
    product_name: item.name,
    size:         item.size,
    price:        item.price,
    quantity:     item.qty,
  }))

  const { error: itemsError } = await supabase.from('shop_order_items').insert(items)
  if (itemsError) return Response.json({ error: itemsError.message }, { status: 500 })

  // Increment coupon uses_count if applicable
  if (body.coupon_code) {
    await supabase.rpc('increment_coupon_uses', { coupon_code: body.coupon_code })
      .catch(() => {/* non-critical */})
  }

  return Response.json({ id: order.id }, { status: 201 })
}
```

Note: The coupon `uses_count` increment uses a Supabase RPC for atomicity. Add this function to the SQL schema:

```sql
-- Run in Supabase SQL Editor:
create or replace function increment_coupon_uses(coupon_code text)
returns void language sql as $$
  update public.shop_coupons
  set uses_count = uses_count + 1
  where code = coupon_code;
$$;
```

- [ ] **Step 3: Create `app/api/shop/orders/[id]/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { getCustomer } from '@/lib/customer-auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCustomer()
  if (!customer) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabase
    .from('shop_orders')
    .select('*, items:shop_order_items(*)')
    .eq('id', id)
    .eq('customer_id', customer.id)
    .single()

  if (error) return Response.json({ error: 'Order not found' }, { status: 404 })
  return Response.json(data)
}

// Customer submits "I've paid" + optional UTR
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCustomer()
  if (!customer) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { utr_reference } = await req.json()

  const { data, error } = await supabase
    .from('shop_orders')
    .update({
      payment_status: 'submitted',
      status:         'payment_submitted',
      utr_reference:  utr_reference ?? null,
    })
    .eq('id', id)
    .eq('customer_id', customer.id)
    .eq('payment_status', 'unpaid') // only allow once
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
```

- [ ] **Step 4: Add `increment_coupon_uses` RPC in Supabase**

Run in Supabase Dashboard → SQL Editor:

```sql
create or replace function increment_coupon_uses(coupon_code text)
returns void language sql as $$
  update public.shop_coupons
  set uses_count = uses_count + 1
  where code = coupon_code;
$$;
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 9: Admin Orders & Discounts API

**Files:**
- Create: `app/api/admin/shop/orders/route.ts`
- Create: `app/api/admin/shop/orders/[id]/route.ts`
- Create: `app/api/admin/shop/discounts/bundles/route.ts`
- Create: `app/api/admin/shop/discounts/bundles/[id]/route.ts`
- Create: `app/api/admin/shop/discounts/coupons/route.ts`
- Create: `app/api/admin/shop/discounts/coupons/[id]/route.ts`

- [ ] **Step 1: Create `app/api/admin/shop/orders/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status         = searchParams.get('status')
  const payment_status = searchParams.get('payment_status')

  let query = supabase
    .from('shop_orders')
    .select('*, items:shop_order_items(*)')
    .order('created_at', { ascending: false })

  if (status)         query = query.eq('status', status)
  if (payment_status) query = query.eq('payment_status', payment_status)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
```

- [ ] **Step 2: Create `app/api/admin/shop/orders/[id]/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()

  // If admin is verifying payment, decrement stock
  if (body.payment_status === 'verified') {
    // Get order items to decrement stock
    const { data: items } = await supabase
      .from('shop_order_items')
      .select('variant_id, quantity')
      .eq('order_id', id)

    for (const item of items ?? []) {
      if (!item.variant_id) continue
      await supabase.rpc('decrement_stock', {
        variant_id: item.variant_id,
        qty:        item.quantity,
      })
    }
  }

  const { data, error } = await supabase
    .from('shop_orders')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
```

Add this RPC too:

```sql
-- Run in Supabase SQL Editor:
create or replace function decrement_stock(variant_id uuid, qty integer)
returns void language sql as $$
  update public.shop_variants
  set stock_qty = greatest(0, stock_qty - qty)
  where id = variant_id;
$$;
```

- [ ] **Step 3: Create `app/api/admin/shop/discounts/bundles/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET() {
  const { data, error } = await supabase
    .from('shop_bundle_deals')
    .select('*')
    .order('min_qty', { ascending: true })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_bundle_deals')
    .insert({ name: body.name, min_qty: body.min_qty, price: body.price, is_active: body.is_active ?? true })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
```

- [ ] **Step 4: Create `app/api/admin/shop/discounts/bundles/[id]/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_bundle_deals')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabase.from('shop_bundle_deals').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 5: Create `app/api/admin/shop/discounts/coupons/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase
    .from('shop_coupons')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_coupons')
    .insert({
      code:             body.code.toUpperCase(),
      type:             body.type,
      value:            body.value,
      min_order_amount: body.min_order_amount ?? 0,
      max_uses:         body.max_uses ?? null,
      expires_at:       body.expires_at ?? null,
      is_active:        body.is_active ?? true,
    })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
```

- [ ] **Step 6: Create `app/api/admin/shop/discounts/coupons/[id]/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_coupons')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabase.from('shop_coupons').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 7: Add `decrement_stock` RPC in Supabase**

Run in Supabase Dashboard → SQL Editor:

```sql
create or replace function decrement_stock(variant_id uuid, qty integer)
returns void language sql as $$
  update public.shop_variants
  set stock_qty = greatest(0, stock_qty - qty)
  where id = variant_id;
$$;
```

- [ ] **Step 8: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 10: Events & Analytics API

**Files:**
- Create: `app/api/shop/events/route.ts`
- Create: `app/api/admin/shop/analytics/route.ts`

- [ ] **Step 1: Create `app/api/shop/events/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { getCustomer } from '@/lib/customer-auth'
import type { ShopEventType } from '@/lib/shop.types'

export async function POST(req: Request) {
  const body: { type: ShopEventType; session_id: string; metadata?: Record<string, unknown> } = await req.json()

  if (!body.type || !body.session_id) {
    return Response.json({ error: 'type and session_id required' }, { status: 400 })
  }

  const customer = await getCustomer()

  const { error } = await supabase.from('shop_events').insert({
    type:       body.type,
    session_id: body.session_id,
    user_id:    customer?.id ?? null,
    metadata:   body.metadata ?? {},
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 2: Create `app/api/admin/shop/analytics/route.ts`**

```typescript
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') ?? '30')
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const [eventsRes, ordersRes] = await Promise.all([
    supabase
      .from('shop_events')
      .select('type, session_id, user_id, metadata, created_at')
      .gte('created_at', since),
    supabase
      .from('shop_orders')
      .select('id, total, status, payment_status, created_at')
      .gte('created_at', since),
  ])

  const events = eventsRes.data ?? []
  const orders = ordersRes.data ?? []

  // Funnel counts
  const count = (type: string) => new Set(events.filter(e => e.type === type).map(e => e.session_id)).size

  // Top products by add_to_cart
  const productCounts: Record<string, { name: string; count: number }> = {}
  events
    .filter(e => e.type === 'add_to_cart')
    .forEach(e => {
      const meta = e.metadata as { product_id?: string; name?: string }
      if (meta?.product_id) {
        if (!productCounts[meta.product_id]) {
          productCounts[meta.product_id] = { name: meta.name ?? meta.product_id, count: 0 }
        }
        productCounts[meta.product_id].count++
      }
    })

  const topProducts = Object.entries(productCounts)
    .map(([id, { name, count }]) => ({ id, name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Abandoned carts: sessions with add_to_cart but no order_completed, with known user_id
  const completedSessions = new Set(events.filter(e => e.type === 'order_completed').map(e => e.session_id))
  const abandonedUserIds = [...new Set(
    events
      .filter(e => e.type === 'add_to_cart' && e.user_id && !completedSessions.has(e.session_id))
      .map(e => e.user_id)
  )]

  return Response.json({
    funnel: {
      page_views:          count('page_view'),
      add_to_cart:         count('add_to_cart'),
      checkout_started:    count('checkout_started'),
      payment_submitted:   count('payment_submitted'),
      order_completed:     count('order_completed'),
    },
    topProducts,
    abandonedCartUserCount: abandonedUserIds.length,
    totalOrders:  orders.length,
    totalRevenue: orders
      .filter(o => o.payment_status === 'verified')
      .reduce((sum, o) => sum + Number(o.total), 0),
    days,
  })
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 11: Final Verification

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Dev server starts without errors**

```bash
npm run dev
```

Open browser, check console for errors. Navigate to `/api/shop/categories` — should return `[]` (empty array, not an error).

Navigate to `/api/shop/settings` — should return the seeded settings object:
```json
{
  "upi_id": "",
  "qr_code_url": "",
  "store_name": "Riaz Ahmed Art",
  "store_tagline": "Original digital art — stickers, posters & more"
}
```

Navigate to `/api/shop/products` — should return `[]`.

- [ ] **Step 3: Test admin auth**

```bash
curl -X POST http://localhost:3000/api/auth/admin \
  -H "Content-Type: application/json" \
  -d '{"password":"your_admin_password_here"}'
```

Expected: `{"ok":true}`

```bash
curl http://localhost:3000/api/auth/admin \
  -H "Cookie: admin=true"
```

Expected: `{"authed":true}`

Plan A complete. Proceed to Plan B (Customer Storefront).
