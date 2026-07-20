# Shop Feature Design

**Date:** 2026-07-19  
**Status:** Approved

## Overview

Add a physical merchandise shop (`/shop`) to the existing portfolio site for selling digital art prints (stickers, posters, badges, etc.). Includes a customer storefront, cart, checkout with UPI/QR payment, order tracking, and a unified admin panel that consolidates Blog, Movies, and Shop management.

---

## Routes

### Customer-Facing

| Route | Purpose |
|---|---|
| `/shop` | Product grid with category + tag filters |
| `/shop/[id]` | Product detail — size selector, add to cart |
| `/shop/cart` | Cart page (localStorage) |
| `/shop/checkout` | Shipping form — creates Supabase Auth account on submit |
| `/shop/checkout/verify` | Email OTP verification (6-digit) |
| `/shop/checkout/payment` | UPI ID + QR code + UTR entry, "I've paid" CTA |
| `/shop/orders` | Customer order history (login required) |
| `/shop/orders/[id]` | Single order status detail |

### Admin

| Route | Purpose |
|---|---|
| `/admin` | Unified panel — Blog / Movies / Shop tabs |
| `/admin` → Shop → Products | Add / edit / delete products, upload images, manage variants |
| `/admin` → Shop → Categories | Add / rename / reorder categories |
| `/admin` → Shop → Tags | Add / rename / delete tags (e.g. Marvel, Spiderman) |
| `/admin` → Shop → Orders | View all orders, verify payment, update status, add notes |
| `/admin` → Shop → Discounts | Bundle deal tiers + coupon codes |
| `/admin` → Shop → Analytics | Visit counts, funnel, abandoned carts |
| `/admin` → Shop → Settings | UPI ID, QR code image, store-level config |

---

## Data Model

### `shop_categories`
```sql
id          uuid primary key default gen_random_uuid()
name        text not null
slug        text not null unique
position    integer default 0
created_at  timestamptz default now()
```

### `shop_products`
```sql
id          uuid primary key default gen_random_uuid()
category_id uuid references shop_categories(id)
name        text not null
description text
images      text[] default '{}'   -- Supabase Storage URLs
is_active   boolean default true
created_at  timestamptz default now()
```

### `shop_variants`
```sql
id          uuid primary key default gen_random_uuid()
product_id  uuid references shop_products(id) on delete cascade
size        text not null          -- e.g. 'A4', 'A3', '3x3 inch'
price       numeric(10,2) not null
stock_qty   integer not null default 0
created_at  timestamptz default now()
```

### `shop_tags`
```sql
id          uuid primary key default gen_random_uuid()
name        text not null
slug        text not null unique
created_at  timestamptz default now()
```

### `shop_product_tags`
```sql
product_id  uuid references shop_products(id) on delete cascade
tag_id      uuid references shop_tags(id) on delete cascade
primary key (product_id, tag_id)
```

### `shop_orders`
```sql
id               uuid primary key default gen_random_uuid()
customer_id      uuid references auth.users(id)
status           text not null default 'pending_payment'
                 -- pending_payment | payment_submitted | confirmed | shipped | delivered | cancelled
payment_status   text not null default 'unpaid'
                 -- unpaid | submitted | verified
shipping_address jsonb not null  -- { name, email, phone, line1, line2, city, state, pincode }
subtotal         numeric(10,2) not null
discount_amount  numeric(10,2) default 0
total            numeric(10,2) not null
coupon_code      text
utr_reference    text           -- customer-entered UTR after UPI payment
notes            text           -- admin notes
created_at       timestamptz default now()
```

### `shop_order_items`
```sql
id           uuid primary key default gen_random_uuid()
order_id     uuid references shop_orders(id) on delete cascade
variant_id   uuid references shop_variants(id)
product_name text not null   -- snapshot at time of order
size         text not null   -- snapshot
price        numeric(10,2) not null  -- snapshot
quantity     integer not null
```

### `shop_bundle_deals`
```sql
id         uuid primary key default gen_random_uuid()
name       text not null        -- e.g. 'Bundle of 5'
min_qty    integer not null     -- minimum total cart quantity to trigger
price      numeric(10,2) not null  -- total price for that quantity
is_active  boolean default true
created_at timestamptz default now()
```
Bundle deals apply to total cart quantity across all items. The best matching tier (highest min_qty that fits) is used.

### `shop_coupons`
```sql
id               uuid primary key default gen_random_uuid()
code             text not null unique
type             text not null check (type in ('percentage', 'flat'))
value            numeric(10,2) not null  -- 20 = 20% or ₹20 flat
min_order_amount numeric(10,2) default 0
max_uses         integer                  -- null = unlimited
uses_count       integer default 0
expires_at       timestamptz
is_active        boolean default true
created_at       timestamptz default now()
```

### `shop_settings`
```sql
key        text primary key
value      text not null
```
Initial keys: `upi_id`, `qr_code_url`, `store_name`, `store_tagline`.

### `shop_events`
```sql
id          uuid primary key default gen_random_uuid()
type        text not null
            -- page_view | add_to_cart | checkout_started | payment_submitted | order_completed
session_id  text not null   -- UUID stored in localStorage, persists across pages
user_id     uuid references auth.users(id)  -- null for anonymous
metadata    jsonb default '{}'
            -- page_view: { path, product_id? }
            -- add_to_cart: { product_id, variant_id, size, price, qty }
created_at  timestamptz default now()
```

---

## Customer Flow

1. **Browse** — `/shop` shows product grid, filterable by category and tag. Out-of-stock variants shown but disabled in selector.
2. **Product detail** — size selector shows price per variant. "Add to Cart" writes to localStorage.
3. **Cart** — shows items, applies best-matching bundle deal automatically, coupon code field, order total.
4. **Checkout** — shipping form (name, email, phone, address). On submit:
   - Supabase Auth `signUp` with email (account created silently, or existing account reused)
   - Email OTP sent
   - Order record created with `status: pending_payment`
5. **OTP verify** — 6-digit code. On success, redirected to payment page.
6. **Payment** — UPI ID + QR code from `shop_settings`. Customer pays in their UPI app, enters UTR, clicks "I've paid" → `payment_status: submitted`.
7. **Order status** — customer can view at `/shop/orders/[id]` (linked in any confirmation email).
8. **Returning customer login** — email → OTP → order list.

---

## Admin Flow

### Auth
Same existing admin secret key pattern used for Blog and Movies. The `/admin` route is now a unified panel with three top-level tabs.

### Order Management
- Admin sees all orders in a table, filterable by status and payment status.
- On confirming payment verified: `payment_status → verified`, `status → confirmed`, stock decremented on each variant.
- Admin updates status through: confirmed → shipped → delivered.
- Can add internal notes per order.

### Stock Decrement Timing
Stock is **not** decremented on order creation (payment is manual and unverified). It decrements only when admin sets `payment_status → verified`. This prevents phantom stock locks from abandoned checkouts.

---

## Discount Logic

### Bundle Deals (auto-applied)
- Total cart item quantity (sum of all line item qtys) is checked against all active `shop_bundle_deals`.
- The highest `min_qty` tier that is ≤ total quantity is selected.
- The bundle deal `price` replaces the subtotal entirely (not a percentage off).
- Example: Buy 5 stickers for ₹100 overrides the per-unit prices.

### Coupon Codes (manual entry at cart/checkout)
- Customer enters code → validated via API (`/api/shop/validate-coupon`).
- Checks: active, not expired, uses_count < max_uses, order meets min_order_amount.
- Applied after bundle deal if both exist (coupon applies to bundle-deal-adjusted total).

---

## Analytics

Tracked via `shop_events`. Admin Analytics view shows:
- **Visits** — daily unique sessions, total page views
- **Funnel** — page_view → add_to_cart → checkout_started → payment_submitted → order_completed
- **Top products** — by add_to_cart + order count
- **Abandoned carts** — sessions with `add_to_cart` but no `order_completed`, where `user_id` is known (i.e. customer has an account → email is available for follow-up)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database + Auth + Storage:** Supabase
- **Cart state:** localStorage (session_id also stored here)
- **Customer auth:** Supabase Auth email OTP
- **Admin auth:** Existing secret key pattern
- **Styling:** Tailwind CSS (existing)
- **Image storage:** Supabase Storage bucket `shop-images`

---

## Out of Scope (for now)

- Digital file delivery
- WhatsApp / SMS notifications
- Multi-currency
- Shipping cost calculator
- Reviews / ratings
