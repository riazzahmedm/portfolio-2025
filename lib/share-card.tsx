/* eslint-disable @next/next/no-img-element -- share cards are drawn by next/og, which needs plain <img> elements */
// The ember story card shared by "I'm super hyped" (Watch Later) and the watched card: drawn by next/og at 1080x1920.
import type { ReactNode } from 'react'

export type FontEntry = { name: string; data: ArrayBuffer; weight: 400 | 700 | 900; style: 'normal' }

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

/** Montserrat Black and Bold, Bebas Neue and Space Mono; a font that cannot be fetched is skipped and the card falls back to a system face. */
export async function loadCardFonts(): Promise<FontEntry[]> {
  const [heavy, bold, bebas, space] = await Promise.all([
    loadGoogleFont('Montserrat:wght@900'), loadGoogleFont('Montserrat:wght@700'), loadGoogleFont('Bebas+Neue'), loadGoogleFont('Space+Mono'),
  ])
  const fonts: FontEntry[] = []
  if (heavy) fonts.push({ name: 'Montserrat', data: heavy, weight: 900, style: 'normal' })
  if (bold)  fonts.push({ name: 'Montserrat', data: bold,  weight: 700, style: 'normal' })
  if (bebas) fonts.push({ name: 'Bebas',      data: bebas, weight: 400, style: 'normal' })
  if (space) fonts.push({ name: 'SpaceMono',  data: space, weight: 400, style: 'normal' })
  return fonts
}

/** A sharper TMDB poster than the grid's thumbnail. */
export const bigPoster = (url: string | null | undefined) => (url ? String(url).replace(/\/t\/p\/\w+/, '/t/p/w780') : null)

export interface CardTheme {
  glow:    string                 // rgb triple for the glow at the top and bottom, e.g. '150,10,10'
  gradient: [string, string]      // the headline's colours
  sparks:  [string, string, string]
}

/** Sparks drifting up through the dark: fixed positions, so a card always renders the same. */
function sparkList(colors: CardTheme['sparks']) {
  let seed = 7
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  return Array.from({ length: 70 }, () => ({
    x: Math.round(rnd() * 1080), y: Math.round(rnd() * 1920), w: 8 + Math.round(rnd() * 26), h: 3 + Math.round(rnd() * 3),
    r: Math.round(rnd() * 180), o: 0.18 + rnd() * 0.5, c: rnd() < 0.5 ? colors[0] : rnd() < 0.5 ? colors[1] : colors[2],
  }))
}

/** A heart wrapped in flames, drawn by hand so it never depends on an emoji font. */
export function FlameHeart({ size }: { size: number }) {
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

/** A gold trophy for "This is Cinema". */
export function Trophy({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1a8" /><stop offset="0.5" stopColor="#ffc933" /><stop offset="1" stopColor="#c98a07" /></linearGradient></defs>
      <path d="M26 12 H74 V36 C74 52 63 62 50 62 C37 62 26 52 26 36 Z" fill="url(#tg)" />
      <path d="M26 20 H12 C12 36 18 44 30 46 M74 20 H88 C88 36 82 44 70 46" fill="none" stroke="#e0a21a" strokeWidth="6" strokeLinecap="round" />
      <rect x="44" y="60" width="12" height="16" fill="#e0a21a" />
      <path d="M30 78 H70 L74 90 H26 Z" fill="url(#tg)" />
      <path d="M36 18 H44 V40 C40 38 36 32 36 26 Z" fill="#fffbe0" opacity="0.55" />
    </svg>
  )
}

/** A round face for the lukewarm verdicts: mid (flat), boring (blank) and painful (crossed-out eyes). */
export function Face({ size, mood }: { size: number; mood: 'flat' | 'blank' | 'dead' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe27a" /><stop offset="1" stopColor="#f2a516" /></linearGradient></defs>
      <circle cx="50" cy="50" r="44" fill="url(#fg)" />
      {mood === 'dead'
        ? <path d="M28 34 L44 50 M44 34 L28 50 M56 34 L72 50 M72 34 L56 50 M32 70 Q40 62 50 70 T68 70" fill="none" stroke="#3a2406" strokeWidth="6" strokeLinecap="round" />
        : <>
            <circle cx="35" cy="42" r="6" fill="#3a2406" /><circle cx="65" cy="42" r="6" fill="#3a2406" />
            <path d={mood === 'flat' ? 'M32 68 H68' : 'M34 70 Q50 62 66 70'} fill="none" stroke="#3a2406" strokeWidth="6" strokeLinecap="round" />
          </>}
    </svg>
  )
}

/** The whole card: ember glow, sparks, the tilted poster with a sticker on its corner, a headline, a two-line caption and the Riaz mark. */
export function ShareCard({ theme, poster, sticker, headline, kicker, title, footer = 'WATCHLOG' }: {
  theme: CardTheme; poster: string | null; sticker: ReactNode; headline: string; kicker: string; title: string; footer?: string
}) {
  const len = title.length
  const titleSize = len > 34 ? 46 : len > 22 ? 56 : 66
  const headSize = headline.length > 18 ? 78 : headline.length > 15 ? 88 : 98
  return (
    <div style={{ width: '1080px', height: '1920px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', background: '#050404', overflow: 'hidden', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '760px', display: 'flex', background: `radial-gradient(ellipse 90% 100% at 50% 0%, rgba(${theme.glow},0.75), rgba(5,4,4,0) 100%)` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '620px', display: 'flex', background: `radial-gradient(ellipse 100% 100% at 50% 100%, rgba(${theme.glow},0.8), rgba(5,4,4,0) 100%)` }} />
      {sparkList(theme.sparks).map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: `${s.x}px`, top: `${s.y}px`, width: `${s.w}px`, height: `${s.h}px`, borderRadius: '3px', background: s.c, opacity: s.o, transform: `rotate(${s.r}deg)`, display: 'flex' }} />
      ))}

      <div style={{ position: 'absolute', top: '262px', left: '210px', width: '640px', height: '860px', display: 'flex', transform: 'rotate(-5deg)' }}>
        <div style={{ display: 'flex', width: '640px', height: '860px', borderRadius: '44px', background: '#ffffff', padding: '12px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
          {poster
            ? <img src={poster} alt="" width={616} height={836} style={{ width: '616px', height: '836px', objectFit: 'cover', borderRadius: '34px' }} />
            : <div style={{ display: 'flex', width: '616px', height: '836px', borderRadius: '34px', background: '#241010' }} />}
        </div>
        <div style={{ position: 'absolute', right: '-70px', bottom: '-70px', display: 'flex' }}>{sticker}</div>
      </div>

      <div style={{ position: 'absolute', top: '1270px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: `${headSize}px`, letterSpacing: '-0.015em', transform: 'skewX(-9deg)', backgroundImage: `linear-gradient(90deg, ${theme.gradient[0]}, ${theme.gradient[1]})`, backgroundClip: 'text', color: 'transparent' }}>
          {headline}
        </div>
      </div>

      <div style={{ position: 'absolute', top: '1470px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontSize: '30px', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.78)', marginBottom: '14px' }}>{kicker}</div>
        <div style={{ display: 'flex', fontSize: `${titleSize}px`, fontWeight: 700, color: '#ffffff', textAlign: 'center', lineHeight: 1.12, maxWidth: '860px', justifyContent: 'center' }}>{title}</div>
      </div>

      <div style={{ position: 'absolute', bottom: '92px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontFamily: 'Bebas, sans-serif', fontSize: '76px', letterSpacing: '0.2em', color: '#ffffff' }}>RIAZ</div>
        <div style={{ display: 'flex', fontFamily: 'SpaceMono, monospace', fontSize: '24px', letterSpacing: '0.24em', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>{footer}</div>
      </div>
    </div>
  )
}
