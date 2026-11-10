import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { VIBES, PLATFORMS } from '@/lib/movies.types'
import type { MovieLog } from '@/lib/movies.types'
import { LOGS_WITH_PLACE, placesNotReady } from '@/lib/movies-select'
import { screenFormatLabel } from '@/lib/places'

export const runtime = 'nodejs'

type VibeDef     = typeof VIBES[number]     | undefined
type PlatformDef = typeof PLATFORMS[number] | undefined
type FontEntry   = { name: string; data: ArrayBuffer; weight: 400; style: 'normal' }

// ── Font loading (cached per warm instance) ──────────────────────────────────
const fontCache = new Map<string, ArrayBuffer>()

async function loadGoogleFont(family: string): Promise<ArrayBuffer | null> {
  if (fontCache.has(family)) return fontCache.get(family)!
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}&display=swap`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; next/og)' } }
    ).then(r => r.text())
    const url = css.match(/src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1]
    if (!url) return null
    const data = await fetch(url).then(r => r.arrayBuffer())
    fontCache.set(family, data)
    return data
  } catch { return null }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function typeLabel(type: string) {
  return type === 'movie' ? 'MOVIE' : type === 'series' ? 'SERIES' : 'EPISODE'
}
/** Where it was watched: the theatre (with its format when it fits), "At the movies" for older theatre logs, or the streaming
 *  service. Unofficial sources are never shown. */
function watchedVia(platform: PlatformDef, log: MovieLog) {
  if (!platform || platform.key === 'unofficial') return null
  if (platform.key !== 'theatre') return platform.label
  const name = log.place?.name
  if (!name) return 'At the movies'
  const format = screenFormatLabel(log.screen_format)
  return format && name.length + format.length <= 26 ? `${name}  ·  ${format}` : name
}
function displayTitle(log: MovieLog) {
  if (log.type !== 'episode') return log.title
  return `${log.title}  S${String(log.season ?? '').padStart(2,'0')}E${String(log.episode ?? '').padStart(2,'0')}`
}

// ── Story card (the OG design — the only style) ──────────────────────────────
function card(log: MovieLog, poster: string|null, vibe: VibeDef, platform: PlatformDef, review: string|null, date: string) {
  const LAVENDER = '#b8a0ff'
  // "Movie" is the default and says nothing, so only series and episodes are named, followed by where it was watched
  const tag = [log.type === 'movie' ? null : typeLabel(log.type), watchedVia(platform, log)].filter(Boolean).join('  ·  ')
  return (
    <div style={{ width:'1080px', height:'1920px', display:'flex', flexDirection:'column', position:'relative', background:'#050505', fontFamily:'sans-serif', overflow:'hidden' }}>
      {poster && <img src={poster} alt="" style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.15 }} />}
      <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'linear-gradient(to bottom,rgba(5,5,5,0.3) 0%,rgba(5,5,5,0.7) 40%,rgba(5,5,5,0.97) 100%)', display:'flex' }} />
      <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:'100px 80px' }}>
        {tag && (
          <div style={{ display:'flex', background:'rgba(184,160,255,0.12)', border:'1px solid rgba(184,160,255,0.35)', borderRadius:'100px', padding:'14px 40px', color:LAVENDER, fontSize:'26px', letterSpacing:'0.3em', marginBottom:'72px', textTransform:'uppercase' }}>
            {tag}
          </div>
        )}
        {poster && <img src={poster} alt={log.title} style={{ width:'300px', height:'450px', objectFit:'cover', borderRadius:'16px', marginBottom:'72px' }} />}
        <div style={{ color:'#ffffff', fontSize:'64px', fontWeight:700, textAlign:'center', lineHeight:1.1, marginBottom:'16px', maxWidth:'900px', display:'flex' }}>{displayTitle(log)}</div>
        {log.episode_title && <div style={{ display:'flex', color:'rgba(255,255,255,0.45)', fontSize:'32px', marginBottom:'16px', textAlign:'center' }}>{log.episode_title}</div>}
        {log.year && log.type!=='episode' && <div style={{ display:'flex', color:'rgba(255,255,255,0.3)', fontSize:'28px', marginBottom:'48px' }}>{log.year}</div>}
        {vibe && (
          <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'52px', padding:'18px 40px', borderRadius:'100px', background:`${vibe.color}18`, border:`1px solid ${vibe.color}55` }}>
            <span style={{ fontSize:'48px' }}>{vibe.emoji}</span>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <span style={{ color:vibe.color, fontSize:'36px', fontWeight:700 }}>{vibe.label}</span>
              <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'24px' }}>{vibe.sub}</span>
            </div>
          </div>
        )}
        {review && <div style={{ display:'flex', color:'rgba(255,255,255,0.65)', fontSize:'30px', textAlign:'center', lineHeight:1.65, maxWidth:'600px', fontStyle:'italic', marginBottom:'56px', paddingLeft:'36px', borderLeft:'3px solid rgba(184,160,255,0.4)' }}>{review}</div>}
        <div style={{ display:'flex', color:'rgba(255,255,255,0.22)', fontSize:'26px', letterSpacing:'0.14em', marginBottom:'80px' }}>{date}</div>
        <div style={{ position:'absolute', bottom:'72px', display:'flex', color:'rgba(255,255,255,0.18)', fontSize:'26px', letterSpacing:'0.22em' }}>RIAZ</div>
      </div>
    </div>
  )
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // The theatre comes from the places join; until that table exists, fall back to the plain row
    const first = await supabase.from('logs').select(LOGS_WITH_PLACE).eq('id', id).single()
    const log = first.error && placesNotReady(first.error) ? (await supabase.from('logs').select('*').eq('id', id).single()).data : first.data
    if (!log) return new Response('Not found', { status: 404 })

    const poster   = log.poster_url ?? null
    const vibe     = VIBES.find(v => v.key === log.vibe)
    const platform = PLATFORMS.find(p => p.key === log.platform)
    const review   = log.review
      ? `"${log.review.slice(0, 120)}${log.review.length > 120 ? '…' : ''}"`
      : null
    const date = new Date(log.watched_on).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })

    // Load fonts in parallel
    const [bebasData, spaceData] = await Promise.all([
      loadGoogleFont('Bebas+Neue'),
      loadGoogleFont('Space+Mono'),
    ])
    const fonts: FontEntry[] = []
    if (bebasData)  fonts.push({ name:'Bebas',     data:bebasData,  weight:400, style:'normal' })
    if (spaceData)  fonts.push({ name:'SpaceMono', data:spaceData,  weight:400, style:'normal' })

    const image = card(log, poster, vibe, platform, review, date)

    return new ImageResponse(image, { width:1080, height:1920, fonts })
  } catch (err) {
    console.error('[story-card]', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}
