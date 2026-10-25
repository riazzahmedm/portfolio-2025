// Server-side only — never import from client components.

const BASE = process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3'
const key  = () => process.env.TMDB_API_KEY!

function url(path: string, extra = '') {
  return `${BASE}${path}?api_key=${key()}${extra}`
}

/** status 0 means the request never got a response (timeout, DNS or connection failure). */
export class TmdbError extends Error {
  constructor(public status: number, public reason = `TMDB ${status}`) { super(reason) }
  get unreachable() { return this.status === 0 }
}

const ATTEMPT_TIMEOUT_MS = 5_000
const MAX_ATTEMPTS = 2

/**
 * Fetches a TMDB endpoint and returns its JSON. Each attempt times out after 5s and
 * network failures, 429s and 5xx are retried once; other non-2xx throw a TmdbError at once.
 */
async function tmdbJson(path: string, extra = '') {
  let last: TmdbError = new TmdbError(0, 'TMDB request failed')

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url(path, extra), { signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS) })
      if (res.ok) return res.json()
      last = new TmdbError(res.status)
      if (res.status < 500 && res.status !== 429) break
    } catch (err) {
      const cause = (err as { cause?: { code?: string } })?.cause?.code ?? (err as Error)?.name
      last = new TmdbError(0, `could not reach api.themoviedb.org (${cause})`)
    }
    console.error(`[tmdb] ${path} attempt ${attempt}/${MAX_ATTEMPTS}: ${last.reason}`)
  }
  throw last
}

/** Like tmdbJson, but a 404 (unknown id) resolves to null. */
async function tmdbJsonOrNull(path: string) {
  try { return await tmdbJson(path) }
  catch (err) { if (err instanceof TmdbError && err.status === 404) return null; throw err }
}

/** Maps an error thrown by this module to a JSON response for API routes. */
export function tmdbErrorResponse(err: unknown) {
  if (err instanceof TmdbError) {
    if (err.status === 404) return Response.json({ error: 'Not found on TMDB' }, { status: 404 })
    if (err.unreachable) {
      return Response.json({ error: "Couldn't reach TMDB — check your internet connection or DNS" }, { status: 504 })
    }
  }
  return Response.json({ error: 'TMDB request failed' }, { status: 502 })
}

export const tmdbImg = (path: string | null, size = 'w500') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null

// ── Search ───────────────────────────────────────────────────────────────────

export async function searchMovies(query: string) {
  const data = await tmdbJson('/search/movie', `&query=${encodeURIComponent(query)}`)
  return (data.results ?? []).slice(0, 8)
}

export async function searchTV(query: string) {
  const data = await tmdbJson('/search/tv', `&query=${encodeURIComponent(query)}`)
  return (data.results ?? []).slice(0, 8)
}

/** Fetch a single movie by TMDB ID — used when user pastes a TMDB URL */
export async function getMovieById(id: number) {
  const data = await tmdbJsonOrNull(`/movie/${id}`)
  if (!data || data.success === false) return null
  return data
}

/** Fetch a single TV show by TMDB ID */
export async function getTVById(id: number) {
  const data = await tmdbJsonOrNull(`/tv/${id}`)
  if (!data || data.success === false) return null
  // normalise to movie-shape so the form can treat them the same
  return { ...data, title: data.name, release_date: data.first_air_date }
}

/** Best-effort match for Letterboxd import. Prefers exact year, falls back to top result. */
export async function matchMovie(title: string, year: string) {
  const results = await searchMovies(title)
  if (!results.length) return null
  return results.find((r: { release_date?: string }) => r.release_date?.startsWith(year))
    ?? results[0]
}

// ── Season / episode browsing (used by the admin form picker) ────────────────

export async function getTVSeason(id: number, season: number) {
  return tmdbJson(`/tv/${id}/season/${season}`)
}

/** TV show top-level details (season count etc.) — lightweight, no append. */
export async function getTVDetails(id: number) {
  return tmdbJson(`/tv/${id}`)
}

// ── Credits for the "favourite person" picker ────────────────────────────────

export async function getCredits(id: number, type: 'movie' | 'tv') {
  const data = await tmdbJson(`/${type}/${id}/credits`)

  const cast = (data.cast ?? []).slice(0, 20).map((p: {
    id: number; name: string; character: string; profile_path: string | null; order: number
  }) => ({
    id: p.id, name: p.name, role: p.character || 'Cast',
    profile_path: p.profile_path, order: p.order ?? 99, dept: 'Cast',
  }))

  const KEY_JOBS = ['Director', 'Screenplay', 'Writer', 'Director of Photography', 'Original Music Composer']
  const crew = (data.crew ?? [])
    .filter((p: { job: string }) => KEY_JOBS.includes(p.job))
    .slice(0, 8)
    .map((p: { id: number; name: string; job: string; profile_path: string | null }) => ({
      id: p.id, name: p.name, role: p.job,
      profile_path: p.profile_path, order: -1, dept: 'Crew',
    }))

  return [...crew, ...cast]
}

// ── Rich metadata (stored for insights) ──────────────────────────────────────

export interface TMDBMeta {
  genres:               string[]
  runtime:              number | null       // minutes
  original_language:    string | null       // 'en', 'ko', 'hi'
  origin_country:       string[]            // ['United States']
  tmdb_rating:          number | null       // 0–10
  tmdb_vote_count:      number | null
  tmdb_popularity:      number | null
  director:             string | null       // primary director / show creator
  cast_names:           string[]            // top 8
  keywords:             string[]            // thematic tags
  collection:           string | null       // franchise / collection name
  certification:        string | null       // 'PG-13', 'R', 'U/A'
  tagline:              string | null
  overview:             string | null
  imdb_id:              string | null
  budget:               number | null       // USD
  revenue:              number | null       // USD
  networks:             string[]            // TV: ['Netflix', 'HBO']
  production_companies: string[]
  // TV-only
  number_of_seasons?:  number | null
  number_of_episodes?: number | null
  seasons?: {
    season_number: number
    name:          string
    episode_count: number
    air_date:      string | null
    poster_path:   string | null
  }[]
}

/**
 * Fetch everything we want for a MOVIE in one request.
 * Uses append_to_response so it's a single TMDB API call.
 */
export async function enrichMovie(tmdbId: number): Promise<TMDBMeta> {
  const data = await tmdbJson(`/movie/${tmdbId}`, '&append_to_response=credits,keywords,release_dates')

  // Director
  const director = (data.credits?.crew ?? [])
    .find((c: { job: string }) => c.job === 'Director')?.name ?? null

  // Top 8 cast
  const cast_names: string[] = (data.credits?.cast ?? [])
    .slice(0, 8)
    .map((c: { name: string }) => c.name)

  // Keywords
  const keywords: string[] = (data.keywords?.keywords ?? [])
    .map((k: { name: string }) => k.name)

  // Certification — prefer US, fall back to first available
  const releaseDates: { iso_3166_1: string; release_dates: { certification: string }[] }[] =
    data.release_dates?.results ?? []
  const usEntry  = releaseDates.find(r => r.iso_3166_1 === 'US')
  const anyEntry = releaseDates[0]
  const certification =
    usEntry?.release_dates?.find(d => d.certification)?.certification ??
    anyEntry?.release_dates?.find(d => d.certification)?.certification ??
    null

  return {
    genres:               (data.genres ?? []).map((g: { name: string }) => g.name),
    runtime:              data.runtime ?? null,
    original_language:    data.original_language ?? null,
    origin_country:       (data.production_countries ?? []).map((c: { name: string }) => c.name),
    tmdb_rating:          data.vote_average  ? Math.round(data.vote_average * 10) / 10 : null,
    tmdb_vote_count:      data.vote_count    ?? null,
    tmdb_popularity:      data.popularity    ? Math.round(data.popularity * 100) / 100 : null,
    director,
    cast_names,
    keywords,
    collection:           data.belongs_to_collection?.name ?? null,
    certification,
    tagline:              data.tagline       || null,
    overview:             data.overview      || null,
    imdb_id:              data.imdb_id       ?? null,
    budget:               data.budget        || null,
    revenue:              data.revenue       || null,
    networks:             [],
    production_companies: (data.production_companies ?? []).map((c: { name: string }) => c.name),
  }
}

/**
 * Fetch everything we want for a TV SHOW in one request.
 */
export async function enrichTV(tmdbId: number): Promise<TMDBMeta> {
  const data = await tmdbJson(`/tv/${tmdbId}`, '&append_to_response=credits,keywords,content_ratings')

  // Show creator (equivalent of director)
  const director = (data.created_by ?? [])[0]?.name ?? null

  const cast_names: string[] = (data.credits?.cast ?? [])
    .slice(0, 8)
    .map((c: { name: string }) => c.name)

  // TV keywords use "results" not "keywords"
  const keywords: string[] = (data.keywords?.results ?? [])
    .map((k: { name: string }) => k.name)

  // Content rating — prefer US
  const ratings: { iso_3166_1: string; rating: string }[] =
    data.content_ratings?.results ?? []
  const certification =
    ratings.find(r => r.iso_3166_1 === 'US')?.rating ??
    ratings[0]?.rating ??
    null

  return {
    genres:               (data.genres ?? []).map((g: { name: string }) => g.name),
    runtime:              (data.episode_run_time ?? [])[0] ?? null,
    original_language:    data.original_language ?? null,
    origin_country:       data.origin_country ?? [],           // already string[]
    tmdb_rating:          data.vote_average  ? Math.round(data.vote_average * 10) / 10 : null,
    tmdb_vote_count:      data.vote_count    ?? null,
    tmdb_popularity:      data.popularity    ? Math.round(data.popularity * 100) / 100 : null,
    director,
    cast_names,
    keywords,
    collection:           null,
    certification,
    tagline:              null,
    overview:             data.overview || null,
    imdb_id:              null,
    budget:               null,
    revenue:              null,
    networks:             (data.networks ?? []).map((n: { name: string }) => n.name),
    production_companies: (data.production_companies ?? []).map((c: { name: string }) => c.name),
    number_of_seasons:    data.number_of_seasons  ?? null,
    number_of_episodes:   data.number_of_episodes ?? null,
    seasons: ((data.seasons ?? []) as {
      season_number: number; name: string
      episode_count: number; air_date: string | null; poster_path: string | null
    }[])
      .filter(s => s.season_number > 0 || s.episode_count > 0) // keep specials only if non-empty
      .map(s => ({
        season_number: s.season_number,
        name:          s.name,
        episode_count: s.episode_count,
        air_date:      s.air_date ?? null,
        poster_path:   s.poster_path ?? null,
      })),
  }
}

/** Convenience — pick the right enricher by log type. */
export async function enrich(tmdbId: number, type: 'movie' | 'series' | 'episode'): Promise<TMDBMeta> {
  return type === 'movie' ? enrichMovie(tmdbId) : enrichTV(tmdbId)
}

// ── Watch providers ───────────────────────────────────────────────────────────

export interface WatchProvider {
  provider_id:   number
  provider_name: string
  logo_path:     string
}

export interface WatchProviders {
  flatrate: WatchProvider[]   // streaming
  rent:     WatchProvider[]
  buy:      WatchProvider[]
  link:     string | null     // JustWatch deep link
}

/**
 * Fetch streaming / rent / buy availability.
 * Tries each region in order and returns the first hit.
 * Default: IN (India) then US fallback.
 */
export async function getWatchProviders(
  id:      number,
  type:    'movie' | 'tv',
  regions = ['IN', 'US'],
): Promise<WatchProviders> {
  const data = await tmdbJson(`/${type}/${id}/watch/providers`)
  const results = data.results ?? {}

  for (const region of regions) {
    const r = results[region]
    if (r) return {
      flatrate: r.flatrate ?? [],
      rent:     r.rent     ?? [],
      buy:      r.buy      ?? [],
      link:     r.link     ?? null,
    }
  }

  return { flatrate: [], rent: [], buy: [], link: null }
}
