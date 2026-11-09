import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import { LOGS_WITH_PLACE, placesNotReady } from '@/lib/movies-select'
import type { Place } from '@/lib/places'
import {
  mergeTimeline, pageAfter, groupByMonth, placeStats, theatreStats, visitsNotReady, THEATRE_KIND, PLACE_VIBES, TIMINGS,
  type TimelineEntry, type PlaceVibeKey, type TimingKey,
} from '@/lib/places-core'

const PLACE_LITE = 'id,kind,name,city,area'
const VIBE_KEYS   = new Set<string>(PLACE_VIBES.map(v => v.key))
const TIMING_KEYS = new Set<string>(TIMINGS.map(t => t.key))

type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

function visitEntry(r: Row): TimelineEntry {
  return {
    id: r.id, source: 'visit', date: r.visited_on, createdAt: r.created_at, place: r.place,
    vibe: VIBE_KEYS.has(r.vibe) ? (r.vibe as PlaceVibeKey) : null,
    timing: TIMING_KEYS.has(r.timing) ? (r.timing as TimingKey) : null,
    spend: typeof r.spend_per_head === 'number' ? r.spend_per_head : null,
    note: r.note ?? null, photos: r.photos ?? [], mustOrder: r.must_order ?? [],
  }
}

/** A movie seen in a theatre, shown as a visit to that theatre. Its vibe is the theatre's, not the movie's. */
function theatreEntry(r: Row): TimelineEntry {
  return {
    id: r.id, source: 'theatre', date: r.watched_on, createdAt: r.created_at ?? r.watched_on, place: r.place,
    vibe: VIBE_KEYS.has(r.theatre_vibe) ? (r.theatre_vibe as PlaceVibeKey) : null,
    timing: TIMING_KEYS.has(r.theatre_timing) ? (r.theatre_timing as TimingKey) : null, spend: null, note: null, photos: [], mustOrder: [],
    movie: { id: r.id, title: r.title, posterUrl: r.poster_url ?? null, format: r.screen_format ?? null },
  }
}

const PAGE = 1000   // PostgREST returns at most this many rows per request, so longer lists are read in pages

/** Reads every row of a query in pages (a stable order, with the id as tie-break, keeps pages from overlapping). */
async function fetchAll(range: (from: number, to: number) => PromiseLike<{ data: Row[] | null; error: { message?: string; code?: string } | null }>) {
  const all: Row[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await range(from, from + PAGE - 1)
    if (error) return { data: null, error }
    all.push(...(data ?? []))
    if ((data ?? []).length < PAGE) return { data: all, error: null }
  }
}

async function loadVisits(placeId?: string): Promise<TimelineEntry[]> {
  const { data, error } = await fetchAll((from, to) => {
    let q = supabase.from('place_visits').select(`*, place:places(${PLACE_LITE})`).order('visited_on', { ascending: false }).order('id').range(from, to)
    if (placeId) q = q.eq('place_id', placeId)
    return q
  })
  if (error) { if (visitsNotReady(error) || placesNotReady(error)) return []; throw error }
  return (data ?? []).filter((r: Row) => r.place).map(visitEntry)
}

async function loadTheatreLogs(placeId?: string): Promise<{ entries: TimelineEntry[]; rows: Row[] }> {
  const { data, error } = await fetchAll((from, to) => {
    let q = supabase.from('logs').select(LOGS_WITH_PLACE).eq('platform', 'theatre').not('place_id', 'is', null).order('watched_on', { ascending: false }).order('id').range(from, to)
    if (placeId) q = q.eq('place_id', placeId)
    return q
  })
  if (error) { if (placesNotReady(error)) return { entries: [], rows: [] }; throw error }
  const rows = (data ?? []) as Row[]
  return { entries: rows.map(theatreEntry), rows }
}

export async function getTimeline(opts: { kind?: string; timing?: string; cursor?: string | null; limit?: number }) {
  const [visits, theatre] = await Promise.all([loadVisits(), loadTheatreLogs()])
  let sorted = mergeTimeline(visits, theatre.entries)
  if (opts.kind)   sorted = sorted.filter(e => e.place.kind === opts.kind)
  if (opts.timing) sorted = sorted.filter(e => e.timing === opts.timing)   // theatre rows have no timing, so they drop out
  const { items, next } = pageAfter(sorted, opts.cursor ?? null, Math.min(Math.max(opts.limit ?? 40, 1), 100))
  return { groups: groupByMonth(items), next, total: sorted.length }
}

export async function getWishlist(): Promise<Place[]> {
  const { data, error } = await supabase.from('places').select('*').not('wishlisted_at', 'is', null).order('wishlisted_at', { ascending: false })
  if (error) { if (visitsNotReady(error)) return []; throw error }
  return (data ?? []) as Place[]
}

export const getPlaceDetail = cache(async (id: string) => {
  const { data: place, error } = await supabase.from('places').select('*').eq('id', id).maybeSingle()
  if (error) { if (/invalid input syntax/i.test(error.message)) return null; throw error }
  if (!place) return null

  if (place.kind === THEATRE_KIND) {
    const { entries, rows } = await loadTheatreLogs(id)
    const sorted = mergeTimeline([], entries)
    return { place: place as Place, entries: sorted, stats: theatreStats(rows as { screen_format: string | null; theatre_vibe: string | null }[]), mustOrder: [] as string[], wishlisted: false }
  }
  const entries = mergeTimeline(await loadVisits(id), [])
  const mustOrder = [...new Set(entries.flatMap(e => e.mustOrder))]
  return { place: place as Place, entries, stats: placeStats(entries), mustOrder, wishlisted: !!place.wishlisted_at }
})
