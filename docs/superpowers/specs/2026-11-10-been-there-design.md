# Been there — design

A new module of the portfolio app (Next.js 16 App Router, Supabase, the same stack as Movies) for logging cafes, restaurants, street food and activities as a visit timeline. Route `/places`, page title "Been there", sits beside Movies, Art and Blog.

## Intent

Riaz wants to look back on where he has been and what was good there: a timeline of visits, a wishlist of places to try, and the dishes worth ordering. It also feeds his public portfolio, so it should look as considered as Movies. He logs from his phone, often a few minutes after leaving, so logging must take about ten seconds.

Theatres already exist in the app: movie logs point at a theatre in the shared `places` table (built in the previous change, commit `29ea3d5`). "Been there" is built on that same table and shows theatre visits too.

## Goals

- A rail timeline of visits, newest first, grouped by month, with compact rows.
- One scrolling log form, usable one-handed on a phone.
- A place page showing all visits to one place.
- A wishlist that turns into a logged visit with one tap.
- Theatres appear in the timeline without being logged twice.
- Consistent with the rest of the app (same nav, tap-to-reveal on touch, dark style, `HubBadge`/`ScrollNav` chrome).

## Non-goals

- No kind-specific fields. Every kind uses the same form. The only kind-aware behaviour: "Must order" is hidden for Activity.
- No map view, geocoding or Google Maps API. The map link is a pasted URL.
- No ratings other than vibe, no tags, no sharing, no comments, no reservations, no parking, no cuisine, no group size, no duration.
- No public logging. Visitors can read; only the admin writes.

## Anti-goals (a failure even if it works)

- Logging that feels like filling in a form with many required fields. Only kind, place name and date are required.
- A page that is slow on a phone because of full-size photos.
- A theatre visit that has to be entered in two places, or that gets out of sync with the movie log.

## What he decided

- **Kinds:** Cafe, Restaurant, Street food, Activity (and Theatre, derived from movie logs).
- **Fields:** place name, city, area, map link; per visit: date, timing (Morning, Afternoon, Evening, Night), vibe, short note, photos, spend per head, must order. Wishlist.
- **Page:** one page for all kinds. A rail timeline: dates down the left edge, a vertical line with a dot per visit, month headings. Compact rows with a thumbnail, name, kind and area, vibe, spend, and timing. Filters: kind chips and timing chips. Tabs: Visited and Wishlist.
- **Place page** (tap a row): hero photo, name, kind and area, stats (visits, average spend per head, the usual vibe), must-order chips, a Maps link, the visit timeline with photos, and a "Log another visit" button.
- **Wishlist:** rows with a "Visited ✓" button that opens the log form for that place; saving it removes it from the wishlist.
- **Log form:** one scrolling form. A Visited/Wishlist switch at the top. Wishlist keeps only kind, city, place and area, and map link. Typing a place name suggests places already saved.
- **Theatre:** shown in the same timeline under a Theatre filter. Rows are derived from movie logs (poster thumbnail, movie title, theatre and area, format). The theatre place page lists the movies seen there and the most common format. No must-order or photos for these.
- **Seating is removed** from the movie form's theatre fields and replaced by a **theatre vibe**: a rating of the theatre for that visit, separate from the movie's vibe, with its own labels. Loved it, Good, Okay, Meh, Never again.
- **Name:** "Been there". Route `/places`.
- **Access:** public read, admin-only write (his guess, unchallenged).

## Data (the builder's starting point, marked as calls)

These are design calls for the builder to confirm, not Riaz's decisions:

- `places` (exists): `kind` becomes one of `cafe | restaurant | street-food | activity | theatre`. Add `wishlisted_at timestamptz` (set while a place is on the wishlist, cleared when the first visit is logged).
- New `place_visits`: `id`, `place_id` (fk, on delete cascade), `visited_on date`, `timing text`, `vibe text`, `note text`, `photos text[]`, `spend_per_head integer` (rupees), `must_order text[]`, `created_at`. RLS: public select; writes only through the server (service role), as for `places`.
- `logs` gets `theatre_vibe text`. The `seating` column added in the previous change is dropped from use, and from the schema if the builder prefers.
- The vibe scale for place visits reuses the theatre labels (Loved it, Good, Okay, Meh, Never again) so there is one place-vibe scale. A constant in `lib/places.ts`.
- The timeline merges `place_visits` and theatre movie logs (those with `platform = 'theatre'` and a `place_id`) sorted by date, in one query path or two merged on the server.
- Photos: a new public Supabase storage bucket `place-photos`; upload route modelled on `app/api/blog/upload/route.ts` (admin only, service role, 10 MB cap, JPEG/PNG/WebP). Resize on the phone before uploading (canvas, max ~1600px long edge), because `sharp` crashes on Vercel in this project. Timeline thumbnails use the stored image with `object-fit: cover` at small size.
- Spend is stored per head in rupees. The average is computed in the app.

## Screens and where they live

- `/places`: the timeline page (filters, tabs, rows). Admin sees edit/delete on tap on touch screens and on hover on desktop, using the existing `useTapReveal` hook.
- `/places/[id]`: the place page.
- Admin: a "Places" tab in the existing admin dashboard next to Movies (this is where the log form lives), plus an edit form reachable from the page for the admin.
- Nav: a map-pin icon in the same bare icon style (`components/ui/nav-icon.ts`), an entry on the Hub page, an entry in `sitemap.ts`, and the `HubBadge`/`ScrollNav` chrome on the page.

## Left to the builder

Component structure, file layout, API route shapes, how the timeline merges its two sources, pagination (the Movies page paginates; do the same if the list grows), the exact empty states and copy, and the wishlist-to-visit hand-off implementation.

## Constraints

- Follow `AGENTS.md`: this Next.js version differs from older releases; check `node_modules/next/dist/docs/` before using an API.
- Run the production build and a local `next start` check before pushing any server-side change (a past `sharp` crash only showed on Vercel).
- Roll out new columns safely: the app must keep working before Riaz runs the SQL, as the theatre change does.
- Commit messages carry no co-author trailer. Commit at the end of the batch, not per fix.

## Calls made after the builder check (the designer's calls, for Riaz to check)

- **Existing data:** `places.kind` is free text with no database constraint; the only rows today are theatres (`kind = 'theatre'`). No backfill is needed. The five kinds are a constant in `lib/places.ts`, and the server whitelists them for new rows.
- **Theatres:** a theatre cannot be wishlisted and has no `place_visits`. Its visits are only the movie logs that point at it, so its stats (visits, usual theatre vibe, most common format) come from `logs`. Its timeline rows show the **theatre vibe**, not the movie vibe. "Most common format" ignores logs with no format.
- **Admin identification:** the same as Movies and Blog: `isAdmin()` in `lib/admin-auth.ts` (a signed admin cookie), checked at the top of every write route, then a service-role Supabase client for the insert. The new routes copy `app/api/places/route.ts`, not anything new.
- **Safe rollout before the SQL is run:** `/places` renders with an empty state ("Nothing logged yet") and the theatre rows still work. Queries on `place_visits`, `wishlisted_at` and `theatre_vibe` fall back to the old shape if the table or column is missing, the same `placesNotReady`-style check the theatre change uses. The admin log form stays visible and shows a plain error naming the missing SQL block if a save fails for that reason. The `place-photos` bucket is created by the SQL block, so photo upload is the last thing to start working.
- **Wishlist rules:** wishlist membership is derived from `wishlisted_at IS NOT NULL`. The first visit logged for a place clears it. A place that already has visits can't be added to the wishlist (the switch is hidden for saved places that have visits). Only the four non-theatre kinds can be wishlisted.
- **Place identity:** a place is unique by kind, name and city, case-insensitively (the unique index already exists). Picking a suggestion reuses its id. A close but different name creates a new place; merge tooling is out of scope.
- **Required fields:** kind, place name, city (so the unique key holds) and date for a visit. Timing, vibe, note, photos, spend and must order are all optional. The timing chip defaults to the one matching the current time of day, and he can change it. Stats ignore missing values (the average spend skips visits without a spend; "usual vibe" is the most common vibe among visits that have one).
- **Vibe on place visits:** the same five labels as the theatre vibe (Loved it, Good, Okay, Meh, Never again), stored as keys.
- **Pagination:** a load-more by date cursor over the merged timeline, with month headings; the builder chooses the exact mechanism.
