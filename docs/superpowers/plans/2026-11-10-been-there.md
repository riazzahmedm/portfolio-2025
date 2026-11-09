# Been there Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Been there" (`/places`): a rail timeline of cafe, restaurant, street-food, activity and theatre visits, with a place page, a wishlist, and a one-scroll admin log form.

**Architecture:** Extend the shared `places` table with a new `place_visits` table (visits, photos, spend, must order). The timeline is one server-side merge of `place_visits` and theatre movie logs, grouped by month and paged in memory. Pure logic (stats, merging, paging, sanitising) lives in one import-free module so it can be tested with Node's built-in runner. Pages, API routes, photo upload and nav entries follow the existing Movies, Blog and Art patterns.

**Tech Stack:** Next.js 16.2.4 App Router (read `node_modules/next/dist/docs/` before using an unfamiliar API), React 19, Supabase (anon client for reads, service-role client for writes), Tailwind 4 plus the inline-style approach the Movies page uses, lucide-react, sonner. Tests: `node --test --experimental-strip-types` (Node 22.15 is installed; no test framework is added).

**Spec:** `docs/superpowers/specs/2026-11-10-been-there-design.md` (read its "Calls made after the builder check" section too).

## Global Constraints

- Page title "Been there"; route `/places`; place page `/places/[id]`.
- Kinds: `cafe`, `restaurant`, `street-food`, `activity` (loggable) and `theatre` (derived from movie logs, never logged here, never wishlisted).
- Timings: Morning, Afternoon, Evening, Night (keys `morning|afternoon|evening|night`). Place vibe and theatre vibe labels: Loved it, Good, Okay, Meh, Never again (keys `loved|good|okay|meh|never`).
- Required to log a visit: kind, place name, city, date. Everything else optional. Spend is whole rupees per head; `0` is a valid spend, missing is `null`.
- Public read, admin-only write. Admin check is `isAdmin()` from `lib/admin-auth.ts` at the top of every write route, then a service-role client (`placesDb` in `lib/places.server.ts`).
- A place is unique by kind, lower(name), lower(city) (the existing `places_unique_idx`). Picking a saved suggestion reuses its id.
- The app must keep working before the new SQL is run: reads fall back to the old shape; the log form shows a plain error naming the missing SQL if a save fails for that reason.
- `sharp` is never used in request paths (it crashes on Vercel here). Photos are compressed in the browser with `compressImage` from `lib/compress-image.ts` (max 1600px, quality 0.82) and stored in a new public bucket `place-photos` (10 MB cap, JPEG/PNG/WebP).
- Run `npx next build` and a local `npx next start -p 3102` check of the new routes before pushing.
- Commit messages carry no co-author trailer. Commit once, at the end of the batch (Task 10), not per task.

## Review Focus

- A theatre movie log with no `place_id` (older logs) must not appear in the timeline. Pinned in Task 2 (`mergeTimeline`) and Task 3.
- Two visits to the same place on the same day must be two rows, and paging must never skip or repeat one when a page boundary falls between them. Pinned in Task 2 (`pageAfter`).
- Spend `0` counts toward the average; visits with no spend are skipped; a place with no spend at all has `avgSpend = null` (no "₹NaN"). Pinned in Task 2 (`placeStats`).
- A failed or oversized photo upload must stop the save with a visible message, not save a visit with a broken photo link. Pinned in Task 4.
- A place that already has visits cannot be put on the wishlist, and logging its first visit clears `wishlisted_at`. Pinned in Task 2 (`canWishlist`) and Task 3.

## File Structure

| File | Responsibility |
|---|---|
| `supabase/migrations.sql` (modify) | `place_visits`, `places.wishlisted_at`, `logs.theatre_vibe`, `place-photos` bucket |
| `lib/places-core.ts` (create) | Pure, import-free: constants, types, sanitising, stats, merge, month grouping, paging |
| `lib/places-core.test.ts` (create) | Node tests for the above |
| `lib/places-feed.server.ts` (create) | Supabase reads: timeline, wishlist, place detail (with old-schema fallbacks) |
| `lib/places.server.ts` (modify) | Kind whitelist and `wishlisted_at` in `sanitizePlace` |
| `app/api/places/timeline/route.ts`, `wishlist/route.ts`, `visits/route.ts`, `visits/[id]/route.ts`, `upload/route.ts`, `[id]/detail/route.ts` (create) | API |
| `components/places/*` (create) | `PlaceRow`, `Timeline`, `PlacesBrowser`, `PlaceForm`, `PhotoPicker`, `PlaceDetail` |
| `app/places/page.tsx`, `layout.tsx`, `[id]/page.tsx` (create) | Pages and metadata |
| `components/admin/places/PlacesAdmin.tsx` (create), `app/admin/page.tsx` (modify) | Admin tab |
| `components/movies/TheatreFields.tsx`, `AdminForm.tsx`, `LogCard.tsx`, `app/movies/[id]/page.tsx`, `lib/movies.types.ts`, `lib/places.ts` (modify) | Theatre vibe replaces seating |
| `app/hub/page.tsx`, `app/sitemap.ts` (modify) | Nav entries |

---

### Task 1: SQL and test runner

**Files:**
- Modify: `supabase/migrations.sql` (append), `package.json` (add `"test"` script)

**Interfaces:**
- Produces: tables/columns used by every later task: `place_visits(id, place_id, visited_on, timing, vibe, note, photos text[], spend_per_head int, must_order text[], created_at)`, `places.wishlisted_at timestamptz`, `logs.theatre_vibe text`.

- [ ] **Step 1: Append one SQL block** to `supabase/migrations.sql`: create `place_visits` (`place_id uuid not null references places(id) on delete cascade`, `visited_on date not null`, `photos text[] not null default '{}'`, `must_order text[] not null default '{}'`, `created_at timestamptz not null default now()`, other columns nullable); index on `(place_id, visited_on desc)`; RLS enabled with a public-select policy (drop-if-exists first, like `places`); `alter table places add column if not exists wishlisted_at timestamptz`; `alter table logs add column if not exists theatre_vibe text`; insert the `place-photos` public bucket into `storage.buckets` with `on conflict do nothing`.
- [ ] **Step 2: Add the script** `"test": "node --test --experimental-strip-types lib/places-core.test.ts"` to `package.json`.
- [ ] **Step 3: Verify** `npm test` runs and reports "no test" or a missing-file error (the test file arrives in Task 2). Expected: the runner starts; the failure is only the missing file.

### Task 2: Pure core logic (tests first)

**Files:**
- Create: `lib/places-core.ts`, `lib/places-core.test.ts`

**Interfaces:**
- Produces (all exported from `lib/places-core.ts`, which imports nothing):
  - `PLACE_KINDS: {key:string;label:string}[]` (the four loggable kinds, in that order), `THEATRE_KIND = 'theatre'`, `TIMINGS`, `PLACE_VIBES` (each `{key,label,emoji,color}`).
  - `type TimingKey`, `type PlaceVibeKey`.
  - `timingForHour(hour: number): TimingKey`: 5–11 morning, 12–16 afternoon, 17–20 evening, otherwise night.
  - `sanitizeVisit(body: unknown, full: boolean): {value: Record<string, unknown>} | {error: string}`: requires `place_id` and `visited_on` (`YYYY-MM-DD`) when `full`; whitelists `timing`, `vibe`, `note` (≤ 500 chars), `photos` (≤ 8 URLs starting `http`), `spend_per_head` (integer 0–1000000, else `null`), `must_order` (≤ 12 items, each ≤ 60 chars, trimmed, blanks dropped). Unknown timing/vibe keys become `null`.
  - `interface TimelineEntry { id: string; source: 'visit' | 'theatre'; date: string; createdAt: string; place: {id:string;kind:string;name:string;city:string|null;area:string|null}; vibe: PlaceVibeKey | null; timing: TimingKey | null; spend: number | null; note: string | null; photos: string[]; mustOrder: string[]; movie?: {id:string;title:string;posterUrl:string|null;format:string|null} }`
  - `mergeTimeline(visits: TimelineEntry[], theatre: TimelineEntry[]): TimelineEntry[]`: newest `date` first, then newest `createdAt`, then `id` for a stable order; theatre entries without `place.id` are dropped.
  - `pageAfter(sorted: TimelineEntry[], cursor: string | null, limit: number): {items: TimelineEntry[]; next: string | null}`: cursor is `${source}:${id}` of the last item of the previous page; `next` is `null` on the last page.
  - `groupByMonth(entries: TimelineEntry[]): {month: string; label: string; entries: TimelineEntry[]}[]`: `month` is `YYYY-MM`, `label` like `November 2026`, order preserved.
  - `placeStats(entries: TimelineEntry[]): {visits: number; avgSpend: number | null; usualVibe: PlaceVibeKey | null}`: average rounded to a whole rupee, over entries that have a spend; usual vibe is the most frequent, ties go to the most recent visit (entries are newest first).
  - `theatreStats(logs: {screen_format: string | null; theatre_vibe: string | null}[]): {visits: number; usualFormat: string | null; usualVibe: PlaceVibeKey | null}`: ignores logs without a format/vibe for those two fields.
  - `canWishlist(place: {kind: string}, visitCount: number): boolean`: true only for the four loggable kinds with zero visits.
  - `visitsNotReady(error: {message?: string; code?: string} | null | undefined): boolean`: true when the failure is only a missing `place_visits`, `wishlisted_at` or `theatre_vibe` (regex in the style of `placesNotReady` in `lib/movies-select.ts`).

- [ ] **Step 1: Write the failing tests** in `lib/places-core.test.ts` (`node:test` + `node:assert/strict`, importing `./places-core.ts`). Test names and assertions:
  - `timingForHour`: 5→morning, 11→morning, 12→afternoon, 16→afternoon, 17→evening, 20→evening, 21→night, 0→night, 4→night.
  - `sanitizeVisit`: missing `place_id` with `full=true` → error; bad date `2026-13-40` → error; `spend_per_head: 0` stays `0`; `spend_per_head: '-5'` → `null`; `spend_per_head: 'abc'` → `null`; `vibe: 'bogus'` → `null`; 20 `must_order` items → 12, blanks removed, trimmed; 10 photo URLs → 8, non-`http` URL dropped; a patch (`full=false`) with only `{note:'x'}` returns only `note`.
  - `mergeTimeline`: orders by date desc then `createdAt` desc; two entries on the same date both kept; a `theatre` entry whose `place.id` is empty is dropped (Review Focus 1).
  - `pageAfter`: with 5 entries where entries 2 and 3 share a date, `limit=2` pages return ids in order with no repeat or gap, and the final page has `next === null` (Review Focus 2); an unknown cursor returns the first page.
  - `groupByMonth`: Nov 10, Nov 2, Oct 30 → two groups `2026-11` ("November 2026", 2 entries) and `2026-10`.
  - `placeStats`: spends `[350, 0, null]` → `avgSpend` 175, `visits` 3; all-null spends → `avgSpend === null` (Review Focus 3); vibes `loved, good, good, loved` newest-first → `usualVibe` `loved` (tie goes to the newest); empty array → zeros/`null`.
  - `theatreStats`: formats `['imax', null, 'imax', 'barco']` → `usualFormat` `imax`; no vibes → `usualVibe` `null`.
  - `canWishlist`: `cafe`, 0 visits → true; `cafe`, 1 visit → false; `theatre`, 0 → false; unknown kind → false.
  - `visitsNotReady`: code `42P01` with message mentioning `place_visits` → true; an unrelated error → false; `undefined` → false.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement** `lib/places-core.ts` to the interface above. Constants for vibes: choose emoji and colours in the same style as `VIBES` in `lib/movies.types.ts` (do not import it; this file imports nothing).
- [ ] **Step 4: Run** `npm test`. Expected: all pass.

### Task 3: Server reads and the places whitelist

**Files:**
- Create: `lib/places-feed.server.ts`
- Modify: `lib/places.server.ts` (`sanitizePlace`)
- Create: `app/api/places/timeline/route.ts`, `app/api/places/wishlist/route.ts`, `app/api/places/[id]/detail/route.ts`

**Interfaces:**
- Consumes: everything from `lib/places-core.ts`; `LOGS_WITH_PLACE`, `placesNotReady` from `lib/movies-select.ts`; the anon `supabase` client from `lib/supabase.ts`.
- Produces:
  - `getTimeline(opts: {kind?: string; timing?: string; cursor?: string | null; limit?: number}): Promise<{groups: ReturnType<typeof groupByMonth>; next: string | null; total: number}>`: reads `place_visits` joined to `places`, plus movie logs where `platform = 'theatre'` and `place_id is not null`; builds `TimelineEntry` rows (`source: 'theatre'` rows get `movie`, `vibe` from `theatre_vibe`, `timing: null`); applies kind and timing filters (an active timing filter hides theatre rows); merges, then `pageAfter`; default `limit` 40. If `place_visits` or `theatre_vibe` is missing (`visitsNotReady`), degrade to the sources that exist.
  - `getWishlist(): Promise<Place[]>` (places with `wishlisted_at` not null, newest first; `[]` if the column is missing).
  - `getPlaceDetail(id: string): Promise<{place: Place; entries: TimelineEntry[]; stats: ReturnType<typeof placeStats> | ReturnType<typeof theatreStats>; mustOrder: string[]; wishlisted: boolean} | null>`: for `kind === 'theatre'` entries come from movie logs and stats from `theatreStats`; otherwise from `place_visits`. `mustOrder` is the de-duplicated union across visits, newest first.
  - Routes: `GET /api/places/timeline?kind=&timing=&cursor=&limit=`, `GET /api/places/wishlist`, `GET /api/places/[id]/detail`; all public, all `Response.json`, errors through `dbError`.
  - `sanitizePlace` accepts only kinds in `PLACE_KINDS` plus `theatre`; unknown kinds return `{error: 'Unknown kind'}`; accepts `wishlisted: boolean` and maps it to `wishlisted_at` (`new Date().toISOString()` or `null`).

- [ ] **Step 1: Implement** `lib/places-feed.server.ts` and the three routes. Reuse the `Place` type from `lib/places.ts`.
- [ ] **Step 2: Update** `sanitizePlace` as above.
- [ ] **Step 3: Verify** `npx tsc --noEmit` is clean. Run `npm run dev` (or `next start`) and `curl localhost:<port>/api/places/timeline` → `200` with a `groups` array that already contains the existing Scene theatre visit; `curl .../api/places/wishlist` → `200` `[]`; `curl .../api/places/<prasads id>/detail` → `200` with `stats.usualFormat`.

### Task 4: Writes: visits, wishlist and photo upload

**Files:**
- Create: `app/api/places/visits/route.ts`, `app/api/places/visits/[id]/route.ts`, `app/api/places/upload/route.ts`, `lib/place-photos.ts`
- Modify: `app/api/places/route.ts` (POST accepts `wishlisted`)

**Interfaces:**
- Consumes: `sanitizeVisit`, `canWishlist`, `visitsNotReady` from `lib/places-core.ts`; `placesDb`, `sanitizePlace` from `lib/places.server.ts`; `isAdmin`; `dbError`.
- Produces:
  - `POST /api/places/visits` (admin): body `{place_id, visited_on, ...optional fields}` → inserts via `placesDb`, then sets that place's `wishlisted_at = null`; returns the new row (`201`). `PATCH`/`DELETE /api/places/visits/[id]` (admin). A save that fails because `visitsNotReady` returns `{error: 'Run the Been there SQL block in supabase/migrations.sql first'}` with status `503`.
  - `POST /api/places` with `{wishlisted: true}`: rejects (`409`, "Already visited") when the place exists with visits, and rejects theatre.
  - `POST /api/places/upload` (admin): copy `app/api/blog/upload/route.ts` with bucket `place-photos`; returns `{url}`.
  - `uploadPlacePhoto(file: File): Promise<string>` in `lib/place-photos.ts` (client-side): `compressImage(file, 1600, 0.82)` then POST to `/api/places/upload`; throws `Error(message)` with the server's message on failure.

- [ ] **Step 1: Implement** the four routes and the helper.
- [ ] **Step 2: Verify** with `npx tsc --noEmit`; then `curl -X POST localhost:<port>/api/places/visits` with no cookie → `401`; `curl -X POST .../api/places/upload` with no cookie → `401`.
- [ ] **Step 3: Pin Review Focus 4 in the form task:** `uploadPlacePhoto` throwing must be caught by `PlaceForm` (Task 6), which aborts the save and shows the message. Note it there; no test here.

### Task 5: Timeline UI and the `/places` page

**Files:**
- Create: `components/places/PlaceRow.tsx`, `components/places/Timeline.tsx`, `components/places/PlacesBrowser.tsx`, `app/places/layout.tsx`, `app/places/page.tsx`

**Interfaces:**
- Consumes: `/api/places/timeline`, `/api/places/wishlist`, `useTapReveal` from `components/movies/useTapReveal.ts`, `ScrollNav`, `navIcon`/`NAV_ICON_SIZE`, `PLACE_KINDS`, `TIMINGS`, `PLACE_VIBES`.
- Produces:
  - `PlaceRow({entry, isAdmin, onEdit, onDelete}: {entry: TimelineEntry; isAdmin: boolean; onEdit?: (e: TimelineEntry) => void; onDelete?: (e: TimelineEntry) => void})`: the rail row from the approved mockup: date on the left (day number and weekday), dot on the line, 50px thumbnail, name, `kind · area`, vibe and spend, timing. Taps open `/places/[place.id]`, except theatre rows, which open `/movies/[movie.id]`. Admin edit/delete appear on hover (desktop) or tap (touch) through `useTapReveal`; theatre rows have no edit/delete here.
  - `Timeline({groups}: {groups: {month: string; label: string; entries: TimelineEntry[]}[]})`.
  - `PlacesBrowser()` (client): fetches `/api/auth/admin` for `isAdmin`; Visited and Wishlist tabs; kind chips (All, the four kinds, Theatre) and dashed timing chips; "Load more" using `next`; empty states ("Nothing logged yet."); Wishlist rows have a "Visited ✓" button that links to `/admin?tab=places&place=<id>` (admin only). `onEdit` opens `PlaceForm` (Task 6) in a bottom sheet over the page, pre-filled from the entry; saving patches the row in place without a refetch, like `handleEditSaved` on the Movies page; `onDelete` confirms with `ConfirmModal`.
  - `app/places/layout.tsx` exports metadata: title `Been there — Riaz Ahmed`, description, canonical `/places`.

- [ ] **Step 1: Build the components** to match the mockup (`.superpowers/brainstorm/41320-1794249920/content/timeline-options.html`, option A) using the app's dark tokens and the Movies page's header chrome (`ScrollNav`, map-pin `lucide-react` icon `MapPin` as the page's nav icon, admin "Log a place" icon linking to `/admin?tab=places`).
- [ ] **Step 2: Verify** with `npx tsc --noEmit`; start dev, open `/places` at 375px width: the Scene theatre row shows the Prasads name and its theatre vibe placeholder; kind chip "Theatre" shows it, "Cafe" shows the empty state; a screenshot is taken.

### Task 6: Log form and admin tab

**Files:**
- Create: `components/places/PlaceForm.tsx`, `components/places/PhotoPicker.tsx`, `components/admin/places/PlacesAdmin.tsx`
- Modify: `app/admin/page.tsx` (add `places` to `Tab`, to `NAV` with a `MapPin` icon, and to the render list)

**Interfaces:**
- Consumes: `/api/places?kind=&city=&q=` (existing, for suggestions), `POST /api/places`, `POST /api/places/visits`, `PATCH /api/places/visits/[id]`, `uploadPlacePhoto`, `timingForHour`, `PLACE_KINDS`, `TIMINGS`, `PLACE_VIBES`, `CITIES` from `lib/places.ts`.
- Produces: `PlaceForm({initial, onSaved}: {initial?: {entry?: TimelineEntry; placeId?: string}; onSaved: (entry?: TimelineEntry) => void})`: one scrolling form. Order: Visited/Wishlist switch; Kind; City (Hyderabad, Chennai, Other, remembered like `TheatreFields`); Place name with saved suggestions; Area; Map link; Date (default today); Timing (default `timingForHour(new Date().getHours())`); Vibe; Spend per head; Must order (hidden for `activity`); Note; Photos. Wishlist mode keeps only kind, city, name, area, map link; the switch is hidden when the chosen saved place has visits. `?place=<id>` in the admin URL prefills the place and opens in Visited mode (the wishlist hand-off). On save it resets for the next entry but keeps kind, city and date.
- [ ] **Step 1: Implement** the form; resolve the place first (reuse a picked suggestion's id, otherwise `POST /api/places`), then upload photos, then `POST` the visit. If any photo upload throws, stop, show the error with `toast.error`, keep the form filled, and do not create the visit (Review Focus 4).
- [ ] **Step 2: Wire `PlacesAdmin`** (`<PlaceForm onSaved={() => {}} />`, remounted never, like `MoviesAdmin`) and the admin tab. Read `place` from the URL query in `app/admin/page.tsx` the way it already reads `tab`.
- [ ] **Step 3: Verify** `npx tsc --noEmit`; in the browser (signed in as admin, 375px): the form shows all fields in order, Must order disappears for Activity, Wishlist hides date/vibe/spend/photos/note, timing defaults to the current time of day. Do not submit against the live database unless the user agrees; use the `401` checks from Task 4 for the API.

### Task 7: Place page

**Files:**
- Create: `components/places/PlaceDetail.tsx`, `app/places/[id]/page.tsx`

**Interfaces:**
- Consumes: `getPlaceDetail` from `lib/places-feed.server.ts` (called from the server page), `PlaceRow`/`Timeline`, `PLACE_VIBES`, `screenFormatLabel` from `lib/places.ts`.
- Produces: `PlaceDetail({data, isAdmin}: {data: NonNullable<Awaited<ReturnType<typeof getPlaceDetail>>>; isAdmin: boolean})` matching the approved mockup (hero photo from the newest visit with a photo, else a neutral block; name; `kind · area, city`; stat tiles; must-order chips with a ★; "Open in Maps ↗" when `maps_url`; the visit timeline with photos; "+ Log another visit" for admins linking to `/admin?tab=places&place=<id>`). Theatre variant: tiles are visits, usual format, usual theatre vibe; no must-order, no photos, no log button. `app/places/[id]/page.tsx` is a server component with `generateMetadata` (title is the place name) and `notFound()` for unknown ids.
- [ ] **Step 1: Implement** both files.
- [ ] **Step 2: Verify** `npx tsc --noEmit`; open `/places/<prasads id>` and `/places/does-not-exist` (404) in the browser; screenshot at 375px.

### Task 8: Theatre vibe replaces seating

**Files:**
- Modify: `lib/places.ts` (remove `SEATING` and `seatingLabel`; add `THEATRE_VIBES` re-exported from `places-core`'s `PLACE_VIBES`), `lib/movies.types.ts` (`seating` → `theatre_vibe: string | null`), `components/movies/TheatreFields.tsx` (`seating` state and chip row → `vibe`, label "Theatre vibe (optional)", chips from `PLACE_VIBES`), `components/movies/AdminForm.tsx` (send `theatre_vibe` instead of `seating`; same clear-on-switch rule), `components/movies/LogCard.tsx` (tooltip text includes the theatre vibe label), `app/movies/[id]/page.tsx` (shows "Theatre vibe: Loved it" under the theatre block).
- [ ] **Step 1: Make the edits**; `grep -rn "seating" app components lib` must return nothing afterwards.
- [ ] **Step 2: Verify** `npx tsc --noEmit`; in the admin form choosing Theatre shows "Theatre vibe" chips instead of Seating; the movie detail page for Scene still renders (no theatre vibe yet).

### Task 9: Nav entries

**Files:**
- Modify: `app/hub/page.tsx` (new card: href `/places`, label "Been there", sub "Cafes, food and outings", a text card like the others, accent `#fb7185`, tag `05`, kicker `Timeline`), `app/sitemap.ts` (add `/places`, weekly, priority 0.7).
- [ ] **Step 1: Make the edits** following the existing entries' shape exactly.
- [ ] **Step 2: Verify** `/hub` shows the new card and `/sitemap.xml` lists `/places`.

### Task 10: Full verification and release

- [ ] **Step 1: Stop the dev server**, then run `npm test` (all pass), `npx tsc --noEmit`, `npx next build`.
- [ ] **Step 2: Production smoke test:** `npx next start -p 3102`; `curl` returns `200` for `/places`, `/places/<prasads id>`, `/api/places/timeline`, `/api/places/wishlist`, `/hub`, `/sitemap.xml`; `401` for `POST /api/places/visits` and `/api/places/upload` without a cookie. Stop the server.
- [ ] **Step 3: Browser check at 375px:** `/places` (rail timeline, filters, tabs), `/places/<id>`, admin `Places` tab, `/movies` card for Scene unchanged.
- [ ] **Step 4: Tell Riaz** to run the new SQL block (the one appended in Task 1) in the Supabase SQL editor before logging the first visit.
- [ ] **Step 5: Commit once and push** to `main` with a plain message and no co-author trailer. Do not commit `.superpowers/` (already ignored).
