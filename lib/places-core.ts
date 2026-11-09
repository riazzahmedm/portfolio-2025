// Pure logic for "Been there" (/places). Imports nothing, so Node's test runner can load it directly.

export const PLACE_KINDS = [
  { key: 'cafe',        label: 'Cafe' },
  { key: 'restaurant',  label: 'Restaurant' },
  { key: 'street-food', label: 'Street food' },
  { key: 'activity',    label: 'Activity' },
] as const

/** Theatres are logged as movie visits, never here, but they appear in the timeline. */
export const THEATRE_KIND = 'theatre'

export const TIMINGS = [
  { key: 'morning',   label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening',   label: 'Evening' },
  { key: 'night',     label: 'Night' },
] as const

/** One scale for how a place (or a theatre, on a movie visit) was. */
export const PLACE_VIBES = [
  { key: 'loved', label: 'Loved it',   emoji: '💜', color: '#b8a0ff' },
  { key: 'good',  label: 'Good',       emoji: '😊', color: '#82ff1f' },
  { key: 'okay',  label: 'Okay',       emoji: '😐', color: '#fbbf24' },
  { key: 'meh',   label: 'Meh',        emoji: '😕', color: '#fb923c' },
  { key: 'never', label: 'Never again', emoji: '🚫', color: '#ff6b6b' },
] as const

export type TimingKey    = typeof TIMINGS[number]['key']
export type PlaceVibeKey = typeof PLACE_VIBES[number]['key']

const TIMING_KEYS = new Set<string>(TIMINGS.map(t => t.key))
const VIBE_KEYS   = new Set<string>(PLACE_VIBES.map(v => v.key))
const KIND_KEYS   = new Set<string>(PLACE_KINDS.map(k => k.key))

export function timingForHour(hour: number): TimingKey {
  if (hour >= 5 && hour <= 11)  return 'morning'
  if (hour >= 12 && hour <= 16) return 'afternoon'
  if (hour >= 17 && hour <= 20) return 'evening'
  return 'night'
}

// ── Visits ───────────────────────────────────────────────────────────────────

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '')

function isRealDate(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

/** Whitelists and trims the editable fields of a visit. `full` (create) also requires the place and the date. */
export function sanitizeVisit(body: unknown, full: boolean): { value: Record<string, unknown> } | { error: string } {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const out: Record<string, unknown> = {}

  if ('place_id' in b || full) {
    const id = clip(b.place_id, 64)
    if (!id) return { error: 'A place is required' }
    out.place_id = id
  }
  if ('visited_on' in b || full) {
    if (!isRealDate(b.visited_on)) return { error: 'A valid date is required' }
    out.visited_on = b.visited_on
  }
  if ('timing' in b) out.timing = TIMING_KEYS.has(String(b.timing)) ? b.timing : null
  if ('vibe' in b)   out.vibe   = VIBE_KEYS.has(String(b.vibe)) ? b.vibe : null
  if ('note' in b)   out.note   = typeof b.note === 'string' ? b.note.trim().slice(0, 500) || null : null
  if ('spend_per_head' in b) {
    const n = typeof b.spend_per_head === 'number' ? b.spend_per_head : Number(b.spend_per_head)
    out.spend_per_head = b.spend_per_head !== '' && b.spend_per_head !== null && Number.isInteger(n) && n >= 0 && n <= 1_000_000 ? n : null
  }
  if ('must_order' in b) {
    out.must_order = Array.isArray(b.must_order)
      ? b.must_order.map(x => clip(x, 60)).filter(Boolean).slice(0, 12)
      : []
  }
  if ('photos' in b) {
    out.photos = Array.isArray(b.photos)
      ? b.photos.filter((u): u is string => typeof u === 'string' && u.startsWith('http')).slice(0, 8)
      : []
  }
  return { value: out }
}

// ── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineEntry {
  id:        string
  source:    'visit' | 'theatre'
  date:      string            // YYYY-MM-DD
  createdAt: string
  place:     { id: string; kind: string; name: string; city: string | null; area: string | null }
  vibe:      PlaceVibeKey | null
  timing:    TimingKey | null
  spend:     number | null
  note:      string | null
  photos:    string[]
  mustOrder: string[]
  movie?:    { id: string; title: string; posterUrl: string | null; format: string | null }
}

const byNewest = (a: TimelineEntry, b: TimelineEntry) =>
  b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id)

/** Visits and theatre movie visits, newest first. A theatre row that points at no place is dropped. */
export function mergeTimeline(visits: TimelineEntry[], theatre: TimelineEntry[]): TimelineEntry[] {
  return [...visits, ...theatre.filter(t => t.place?.id)].sort(byNewest)
}

const cursorOf = (e: TimelineEntry) => `${e.source}:${e.id}`

/** One page of an already-sorted timeline. The cursor is the last item of the previous page; an unknown cursor starts over. */
export function pageAfter(sorted: TimelineEntry[], cursor: string | null, limit: number): { items: TimelineEntry[]; next: string | null } {
  const at    = cursor ? sorted.findIndex(e => cursorOf(e) === cursor) : -1
  const start = at >= 0 ? at + 1 : 0
  const items = sorted.slice(start, start + limit)
  const more  = start + limit < sorted.length
  return { items, next: more && items.length ? cursorOf(items[items.length - 1]) : null }
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function groupByMonth(entries: TimelineEntry[]): { month: string; label: string; entries: TimelineEntry[] }[] {
  const groups: { month: string; label: string; entries: TimelineEntry[] }[] = []
  for (const e of entries) {
    const month = e.date.slice(0, 7)
    let g = groups[groups.length - 1]
    if (!g || g.month !== month) {
      g = { month, label: `${MONTHS[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`, entries: [] }
      groups.push(g)
    }
    g.entries.push(e)
  }
  return groups
}

// ── Stats ────────────────────────────────────────────────────────────────────

/** The most frequent value; on a tie, the one that appears first (callers pass newest first). */
function mostCommon<T extends string>(values: (T | null | undefined)[]): T | null {
  const counts = new Map<T, number>()
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  let best: T | null = null, bestN = 0
  for (const [v, n] of counts) if (n > bestN) { best = v; bestN = n }
  return best
}

export function placeStats(entries: TimelineEntry[]): { visits: number; avgSpend: number | null; usualVibe: PlaceVibeKey | null } {
  const spends = entries.map(e => e.spend).filter((n): n is number => n !== null)
  return {
    visits:    entries.length,
    avgSpend:  spends.length ? Math.round(spends.reduce((a, b) => a + b, 0) / spends.length) : null,
    usualVibe: mostCommon(entries.map(e => e.vibe)),
  }
}

export function theatreStats(logs: { screen_format: string | null; theatre_vibe: string | null }[]): { visits: number; usualFormat: string | null; usualVibe: PlaceVibeKey | null } {
  return {
    visits:      logs.length,
    usualFormat: mostCommon(logs.map(l => l.screen_format)),
    usualVibe:   mostCommon(logs.map(l => (l.theatre_vibe && VIBE_KEYS.has(l.theatre_vibe) ? (l.theatre_vibe as PlaceVibeKey) : null))),
  }
}

// ── Wishlist and rollout ─────────────────────────────────────────────────────

export const canWishlist = (place: { kind: string }, visitCount: number) => KIND_KEYS.has(place.kind) && visitCount === 0

/** True when a query failed only because the Been there SQL has not been run (missing table or column). */
export function visitsNotReady(error: { message?: string; code?: string } | null | undefined): boolean {
  if (!error) return false
  return /place_visits|wishlisted_at|theatre_vibe|42P01|42703|PGRST200|PGRST204/i.test(`${error.code ?? ''} ${error.message ?? ''}`)
}
