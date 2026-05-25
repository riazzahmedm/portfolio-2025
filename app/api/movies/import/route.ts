/**
 * POST /api/movies/import
 * Body: { rows: LetterboxdRow[] }
 *
 * For each row we search TMDB, build a log entry, and insert into Supabase.
 * Returns { inserted, skipped, errors }.
 */
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { matchMovie, tmdbImg, enrichMovie } from '@/lib/tmdb'
import type { LetterboxdRow, Vibe } from '@/lib/movies.types'

/** Map Letterboxd 0.5–5 rating to a vibe */
function ratingToVibe(raw: string): Vibe | null {
  const n = parseFloat(raw)
  if (isNaN(n)) return null
  if (n >= 5)   return 'masterpiece'  // 5       → This is Cinema
  if (n >= 4)   return 'loved'        // 4, 4.5  → Standing Ovation
  if (n >= 3.5) return 'solid'        // 3.5     → No Notes
  if (n >= 2.5) return 'fine'         // 2.5, 3  → Needed Editing
  return 'painful'                    // ≤2      → Walk of Shame
}

async function isAdmin() {
  const jar = await cookies()
  return jar.get('movies-admin')?.value === 'true'
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { rows }: { rows: LetterboxdRow[] } = await req.json()
  if (!rows?.length) return Response.json({ error: 'No rows provided' }, { status: 400 })

  const inserted: string[] = []
  const skipped:  string[] = []
  const errors:   string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    // Throttle TMDB: 1 req per 250 ms (well within their 40 req/10s limit)
    if (i > 0 && i % 10 === 0) await sleep(1000)
    else if (i > 0) await sleep(250)

    try {
      const match = await matchMovie(row.name, row.year)
      if (!match) {
        skipped.push(row.name)
        continue
      }

      const vibe = ratingToVibe(row.rating)
      const year = match.release_date
        ? new Date(match.release_date).getFullYear()
        : row.year ? parseInt(row.year) : null

      // Fetch full TMDB metadata for insights
      let meta = {}
      try { meta = await enrichMovie(match.id) } catch { /* non-fatal */ }

      const entry = {
        type:            'movie',
        tmdb_id:         match.id,
        title:           match.title ?? row.name,
        poster_url:      tmdbImg(match.poster_path, 'w500'),
        backdrop_url:    tmdbImg(match.backdrop_path, 'w1280'),
        year,
        vibe,
        review:          null,
        platform:        null,
        favorite_person: null,
        draws:           [],
        watched_on:      row.watchedOn,
        season:          null,
        episode:         null,
        episode_title:   null,
        status:          'watched',
        tags:            [],
        rewatch:         row.rewatch,
        source:          'letterboxd',
        ...meta,         // genres, runtime, director, cast_names, keywords, etc.
      }

      const { error } = await supabase.from('logs').insert(entry)
      if (error) {
        errors.push(`${row.name}: ${error.message}`)
      } else {
        inserted.push(row.name)
      }
    } catch (e) {
      errors.push(`${row.name}: ${e instanceof Error ? e.message : 'unknown error'}`)
    }
  }

  return Response.json({ inserted: inserted.length, skipped: skipped.length, errors })
}
