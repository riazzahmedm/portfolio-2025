/* eslint-disable @next/next/no-img-element -- share cards are drawn by next/og, which needs plain <img> elements */
// The ember story card shared by "I'm super hyped" (Watch Later) and the watched card: drawn by next/og at 1080x1920.

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

/** Montserrat Black and Bold and Space Mono; a font that cannot be fetched is skipped and the card falls back to a system face. */
export async function loadCardFonts(): Promise<FontEntry[]> {
  const [heavy, bold, space] = await Promise.all([
    loadGoogleFont('Montserrat:wght@900'), loadGoogleFont('Montserrat:wght@700'), loadGoogleFont('Space+Mono'),
  ])
  const fonts: FontEntry[] = []
  if (heavy) fonts.push({ name: 'Montserrat', data: heavy, weight: 900, style: 'normal' })
  if (bold)  fonts.push({ name: 'Montserrat', data: bold,  weight: 700, style: 'normal' })
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

/** A title too wide for one line is split at the space nearest its middle, so the second line is never a stray word. */
function balanced(title: string, size: number): string[] {
  if (title.length * size * 0.56 <= 700) return [title]
  const mid = title.length / 2
  let best = -1
  for (let i = 0; i < title.length; i++) if (title[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i
  return best < 0 ? [title] : [title.slice(0, best), title.slice(best + 1)]
}

/** The whole card: ember glow, sparks, the tilted poster, a headline, a two-line caption and a footer line. */
export function ShareCard({ theme, poster, headline, kicker, title, footer = 'WATCHLOG' }: {
  theme: CardTheme; poster: string | null; headline: string; kicker: string; title: string; footer?: string
}) {
  const len = title.length
  const titleSize = len > 34 ? 36 : len > 22 ? 42 : 50
  const headSize = headline.length > 18 ? 58 : headline.length > 15 ? 66 : 74
  return (
    <div style={{ width: '1080px', height: '1920px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', background: '#050404', overflow: 'hidden', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '760px', display: 'flex', background: `radial-gradient(ellipse 90% 100% at 50% 0%, rgba(${theme.glow},0.75), rgba(5,4,4,0) 100%)` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '620px', display: 'flex', background: `radial-gradient(ellipse 100% 100% at 50% 100%, rgba(${theme.glow},0.8), rgba(5,4,4,0) 100%)` }} />
      {sparkList(theme.sparks).map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: `${s.x}px`, top: `${s.y}px`, width: `${s.w}px`, height: `${s.h}px`, borderRadius: '3px', background: s.c, opacity: s.o, transform: `rotate(${s.r}deg)`, display: 'flex' }} />
      ))}

      <div style={{ position: 'absolute', top: '262px', left: '220px', width: '640px', height: '860px', display: 'flex', transform: 'rotate(-5deg)' }}>
        <div style={{ display: 'flex', width: '640px', height: '860px', borderRadius: '44px', background: '#ffffff', padding: '12px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
          {poster
            ? <img src={poster} alt="" width={616} height={836} style={{ width: '616px', height: '836px', objectFit: 'cover', borderRadius: '34px' }} />
            : <div style={{ display: 'flex', width: '616px', height: '836px', borderRadius: '34px', background: '#241010' }} />}
        </div>
      </div>

      <div style={{ position: 'absolute', top: '1270px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: `${headSize}px`, letterSpacing: '-0.015em', transform: 'skewX(-9deg)', backgroundImage: `linear-gradient(90deg, ${theme.gradient[0]}, ${theme.gradient[1]})`, backgroundClip: 'text', color: 'transparent' }}>
          {headline}
        </div>
      </div>

      <div style={{ position: 'absolute', top: '1470px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontSize: '25px', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.78)', marginBottom: '12px' }}>{kicker}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: `${titleSize}px`, fontWeight: 700, color: '#ffffff', textAlign: 'center', lineHeight: 1.12 }}>
          {balanced(title, titleSize).map(line => <div key={line} style={{ display: 'flex', justifyContent: 'center' }}>{line}</div>)}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '100px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', fontFamily: 'SpaceMono, monospace', fontSize: '26px', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.6)' }}>{footer}</div>
      </div>
    </div>
  )
}
