/* eslint-disable @next/next/no-img-element -- share cards are drawn by next/og, which needs plain <img> elements */
import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

type FontEntry = { name: string; data: ArrayBuffer; weight: 400 | 700 | 900; style: 'normal' }

// ── Font loading (cached per warm instance) ──────────────────────────────────
const fontCache = new Map<string, ArrayBuffer>()
async function loadGoogleFont(family: string): Promise<ArrayBuffer | null> {
  if (fontCache.has(family)) return fontCache.get(family)!
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}&display=swap`, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; next/og)' } }).then(r => r.text())
    const url = css.match(/src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1]
    if (!url) return null
    const data = await fetch(url).then(r => r.arrayBuffer())
    fontCache.set(family, data)
    return data
  } catch { return null }
}

/** Sparks drifting up through the dark: fixed positions, so a card always renders the same. */
const SPARKS = (() => {
  let seed = 7
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  return Array.from({ length: 70 }, () => ({
    x: Math.round(rnd() * 1080), y: Math.round(rnd() * 1920), w: 8 + Math.round(rnd() * 26), h: 3 + Math.round(rnd() * 3),
    r: Math.round(rnd() * 180), o: 0.18 + rnd() * 0.5, c: rnd() < 0.5 ? '#ff7a1a' : rnd() < 0.5 ? '#ffb347' : '#c2260e',
  }))
})()

/** A heart wrapped in flames, drawn by hand so it never depends on an emoji font. */
function FlameHeart({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="fh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd23f" /><stop offset="0.45" stopColor="#ff7a1a" /><stop offset="1" stopColor="#e11d1d" /></linearGradient>
        <linearGradient id="hh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff5a4d" /><stop offset="1" stopColor="#c4161c" /></linearGradient>
      </defs>
      <path d="M50 4 C58 18 72 22 70 38 C80 30 82 20 80 12 C94 28 98 48 90 64 C84 80 68 94 50 96 C32 94 16 80 10 64 C2 48 8 30 22 14 C20 24 24 32 30 38 C28 22 42 18 50 4 Z" fill="url(#fh)" />
      <path d="M50 86 C30 72 18 60 18 46 C18 36 26 30 34 30 C42 30 47 35 50 41 C53 35 58 30 66 30 C74 30 82 36 82 46 C82 60 70 72 50 86 Z" fill="url(#hh)" />
      <path d="M50 70 C42 62 38 56 38 50 C38 46 41 44 44 44 C47 44 49 46 50 48 C51 46 53 44 56 44 C59 44 62 46 62 50 C62 56 58 62 50 70 Z" fill="#ff8f6b" opacity="0.55" />
    </svg>
  )
}

function card(title: string, poster: string | null) {
  const len = title.length
  const titleSize = len > 34 ? 46 : len > 22 ? 56 : 66
  return (
    <div style={{ width: '1080px', height: '1920px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', background: '#050404', overflow: 'hidden', fontFamily: 'Montserrat, sans-serif' }}>
      {/* ember glow, top and bottom */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '760px', display: 'flex', background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(150,10,10,0.75), rgba(5,4,4,0) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '620px', display: 'flex', background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(140,8,8,0.8), rgba(5,4,4,0) 100%)' }} />
      {SPARKS.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: `${s.x}px`, top: `${s.y}px`, width: `${s.w}px`, height: `${s.h}px`, borderRadius: '3px', background: s.c, opacity: s.o, transform: `rotate(${s.r}deg)`, display: 'flex' }} />
      ))}

      {/* the poster, tilted like a card tossed on the table, with a flaming heart on its corner */}
      <div style={{ position: 'absolute', top: '262px', left: '210px', width: '640px', height: '860px', display: 'flex', transform: 'rotate(-5deg)' }}>
        <div style={{ display: 'flex', width: '640px', height: '860px', borderRadius: '44px', background: '#ffffff', padding: '12px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
          {poster
            ? <img src={poster} alt="" width={616} height={836} style={{ width: '616px', height: '836px', objectFit: 'cover', borderRadius: '34px' }} />
            : <div style={{ display: 'flex', width: '616px', height: '836px', borderRadius: '34px', background: '#241010' }} />}
        </div>
        <div style={{ position: 'absolute', right: '-70px', bottom: '-70px', display: 'flex' }}><FlameHeart size={240} /></div>
      </div>

      <div style={{ position: 'absolute', top: '1270px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '98px', letterSpacing: '-0.015em', transform: 'skewX(-9deg)', backgroundImage: 'linear-gradient(90deg, #ff6a1a, #ffb347)', backgroundClip: 'text', color: 'transparent' }}>
          I&apos;M SUPER HYPED
        </div>
      </div>

      <div style={{ position: 'absolute', top: '1470px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontSize: '30px', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.78)', marginBottom: '14px' }}>TO WATCH</div>
        <div style={{ display: 'flex', fontSize: `${titleSize}px`, fontWeight: 700, color: '#ffffff', textAlign: 'center', lineHeight: 1.12, maxWidth: '860px', justifyContent: 'center' }}>{title}</div>
      </div>

      <div style={{ position: 'absolute', bottom: '92px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontFamily: 'Bebas, sans-serif', fontSize: '76px', letterSpacing: '0.2em', color: '#ffffff' }}>RIAZ</div>
        <div style={{ display: 'flex', fontFamily: 'SpaceMono, monospace', fontSize: '24px', letterSpacing: '0.24em', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>WATCHLOG</div>
      </div>
    </div>
  )
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: item } = await supabase.from('watchlist').select('title,poster_url').eq('id', id).maybeSingle()
    if (!item) return new Response('Not found', { status: 404 })

    // a sharper poster than the grid's thumbnail
    const poster = item.poster_url ? String(item.poster_url).replace(/\/t\/p\/\w+/, '/t/p/w780') : null

    const [heavy, bold, bebas, space] = await Promise.all([
      loadGoogleFont('Montserrat:wght@900'), loadGoogleFont('Montserrat:wght@700'), loadGoogleFont('Bebas+Neue'), loadGoogleFont('Space+Mono'),
    ])
    const fonts: FontEntry[] = []
    if (heavy) fonts.push({ name: 'Montserrat', data: heavy, weight: 900, style: 'normal' })
    if (bold)  fonts.push({ name: 'Montserrat', data: bold,  weight: 700, style: 'normal' })
    if (bebas) fonts.push({ name: 'Bebas',      data: bebas, weight: 400 as never, style: 'normal' })
    if (space) fonts.push({ name: 'SpaceMono',  data: space, weight: 400 as never, style: 'normal' })

    return new ImageResponse(card(String(item.title), poster), { width: 1080, height: 1920, fonts })
  } catch (err) {
    console.error('[hype-card]', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}
