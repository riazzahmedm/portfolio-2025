/**
 * One-time Letterboxd diary seed script.
 *
 * Usage:
 *   node scripts/seed-letterboxd.mjs /path/to/diary.csv
 *
 * Needs .env.local with:
 *   SUPABASE_URL, SUPABASE_ANON_KEY, TMDB_API_KEY
 */

import { readFileSync, existsSync } from 'fs'
import { resolve }                  from 'path'
import { createClient }             from '@supabase/supabase-js'

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local')
if (!existsSync(envPath)) {
  console.error('❌  .env.local not found. Copy .env.local.example and fill in your keys.')
  process.exit(1)
}
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const clean = line.trim()
  if (!clean || clean.startsWith('#')) continue
  const eq = clean.indexOf('=')
  if (eq === -1) continue
  process.env[clean.slice(0, eq).trim()] = clean.slice(eq + 1).trim()
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY
const TMDB_KEY     = process.env.TMDB_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY || !TMDB_KEY) {
  console.error('❌  Missing env vars. Check SUPABASE_URL, SUPABASE_ANON_KEY, TMDB_API_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Args ─────────────────────────────────────────────────────────────────────
const csvPath = process.argv[2]
if (!csvPath) {
  console.error('❌  Usage: node scripts/seed-letterboxd.mjs /path/to/diary.csv [--limit N]')
  process.exit(1)
}

const limitArg = process.argv.indexOf('--limit')
const LIMIT    = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : Infinity
const fullPath = resolve(process.cwd(), csvPath)
if (!existsSync(fullPath)) {
  console.error(`❌  File not found: ${fullPath}`)
  process.exit(1)
}

// ── CSV parser ───────────────────────────────────────────────────────────────
function splitLine(line) {
  const out = []; let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
      else inQ = !inQ
    } else if (c === ',' && !inQ) { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur)
  return out.map(s => s.trim())
}

function parseCsv(text) {
  const lines   = text.trim().split(/\r?\n/)
  const headers = splitLine(lines[0])
  return lines.slice(1).filter(l => l.trim()).map(l => {
    const vals = {}
    splitLine(l).forEach((v, i) => { if (headers[i]) vals[headers[i]] = v })
    return vals
  })
}

// ── Vibe mapping ─────────────────────────────────────────────────────────────
function ratingToVibe(raw) {
  const n = parseFloat(raw)
  if (isNaN(n)) return null
  if (n >= 5)   return 'masterpiece'  // 5       → This is Cinema
  if (n >= 4)   return 'loved'        // 4, 4.5  → Standing Ovation
  if (n >= 3.5) return 'solid'        // 3.5     → No Notes
  if (n >= 2.5) return 'fine'         // 2.5, 3  → Needed Editing
  return 'painful'                    // ≤2      → Walk of Shame
}

// ── TMDB helpers ─────────────────────────────────────────────────────────────
const tmdbImg = (path, size = 'w500') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null

const tmdbUrl = (path, extra = '') =>
  `https://api.themoviedb.org/3${path}?api_key=${TMDB_KEY}${extra}`

async function searchTMDB(title, year) {
  const res     = await fetch(tmdbUrl('/search/movie', `&query=${encodeURIComponent(title)}&include_adult=false`))
  const data    = await res.json()
  const results = data.results ?? []
  if (!results.length) return null
  return results.find(r => r.release_date?.startsWith(year)) ?? results[0]
}

/** Fetch full metadata in one append_to_response call */
async function enrichMovie(id) {
  const data = await fetch(
    tmdbUrl(`/movie/${id}`, '&append_to_response=credits,keywords,release_dates')
  ).then(r => r.json())

  const director   = (data.credits?.crew ?? []).find(c => c.job === 'Director')?.name ?? null
  const cast_names = (data.credits?.cast ?? []).slice(0, 8).map(c => c.name)
  const keywords   = (data.keywords?.keywords ?? []).map(k => k.name)

  const releaseDates = data.release_dates?.results ?? []
  const usEntry      = releaseDates.find(r => r.iso_3166_1 === 'US')
  const anyEntry     = releaseDates[0]
  const certification =
    usEntry?.release_dates?.find(d => d.certification)?.certification ??
    anyEntry?.release_dates?.find(d => d.certification)?.certification ??
    null

  return {
    genres:               (data.genres ?? []).map(g => g.name),
    runtime:              data.runtime ?? null,
    original_language:    data.original_language ?? null,
    origin_country:       (data.production_countries ?? []).map(c => c.name),
    tmdb_rating:          data.vote_average   ? Math.round(data.vote_average * 10) / 10 : null,
    tmdb_vote_count:      data.vote_count     ?? null,
    tmdb_popularity:      data.popularity     ? Math.round(data.popularity * 100) / 100 : null,
    director,
    cast_names,
    keywords,
    collection:           data.belongs_to_collection?.name ?? null,
    certification,
    tagline:              data.tagline        || null,
    overview:             data.overview       || null,
    imdb_id:              data.imdb_id        ?? null,
    budget:               data.budget         || null,
    revenue:              data.revenue        || null,
    networks:             [],
    production_companies: (data.production_companies ?? []).map(c => c.name),
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

const raw  = readFileSync(fullPath, 'utf8')
const rows = parseCsv(raw)
  .map(r => ({
    name:      r['Name']?.trim(),
    year:      r['Year']?.trim() ?? '',
    rating:    r['Rating']?.trim() ?? '',
    watchedOn: (r['Watched Date'] ?? r['Date'] ?? '').trim(),
    rewatch:   r['Rewatch']?.toLowerCase() === 'yes',
  }))
  .filter(r => r.name && r.watchedOn)

console.log(`\n🎬  Letterboxd seed`)
console.log(`    ${rows.length} diary entries found in ${csvPath}\n`)

// Skip already-imported entries (safe to re-run)
const { data: existing } = await supabase
  .from('logs')
  .select('title, watched_on')
  .eq('source', 'letterboxd')

const existingSet = new Set((existing ?? []).map(e => `${e.title}|${e.watched_on}`))
const toImport    = rows.filter(r => !existingSet.has(`${r.name}|${r.watchedOn}`)).slice(0, LIMIT)

if (toImport.length === 0) {
  console.log('✅  Nothing new — all entries already exist.')
  process.exit(0)
}

if (toImport.length < rows.length)
  console.log(`⚡  Skipping ${rows.length - toImport.length} already-imported entries.\n`)

console.log(`    Importing ${toImport.length} entries with full TMDB metadata…\n`)

// TMDB rate limit: 40 req/10s. We use append_to_response so each movie = 1 call.
// 280ms gap → ~3.5 req/s → well within limits.
const DELAY_MS  = 280
const BAR_WIDTH = 30
let inserted = 0, skipped = 0, errors = []

function drawProgress(i) {
  const pct    = Math.round(((i + 1) / toImport.length) * 100)
  const filled = Math.round((pct / 100) * BAR_WIDTH)
  const bar    = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled)
  process.stdout.write(
    `\r    [${bar}] ${pct}%  ${i + 1}/${toImport.length}  ✓${inserted} skip:${skipped} err:${errors.length}   `
  )
}

for (let i = 0; i < toImport.length; i++) {
  const row = toImport[i]
  drawProgress(i)
  if (i > 0) await sleep(DELAY_MS)

  try {
    const match = await searchTMDB(row.name, row.year)
    if (!match) { skipped++; continue }

    const year = match.release_date
      ? new Date(match.release_date).getFullYear()
      : row.year ? parseInt(row.year) : null

    // Full metadata — one extra TMDB call (append_to_response = still 1 HTTP req)
    let meta = {}
    try { meta = await enrichMovie(match.id) } catch { /* non-fatal */ }

    const entry = {
      type:            'movie',
      tmdb_id:         match.id,
      title:           match.title ?? row.name,
      poster_url:      tmdbImg(match.poster_path, 'w500'),
      backdrop_url:    tmdbImg(match.backdrop_path, 'w1280'),
      year,
      vibe:            ratingToVibe(row.rating),
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
      ...meta,
    }

    const { error } = await supabase.from('logs').insert(entry)
    if (error) { errors.push(`${row.name}: ${error.message}`); continue }
    inserted++
  } catch (e) {
    errors.push(`${row.name}: ${e.message}`)
  }
}

drawProgress(toImport.length - 1)
console.log('\n')
console.log('✅  Done!')
console.log(`    Inserted : ${inserted}`)
console.log(`    Skipped  : ${skipped}  (no TMDB match)`)
console.log(`    Errors   : ${errors.length}`)

if (errors.length) {
  console.log('\n⚠️   Errors:')
  errors.slice(0, 20).forEach(e => console.log(`    – ${e}`))
  if (errors.length > 20) console.log(`    … and ${errors.length - 20} more`)
}
console.log()
