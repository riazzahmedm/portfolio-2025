import { PLACE_KINDS, THEATRE_KIND } from '@/lib/places-core'

// Plain (server-safe) helpers shared by the timeline rows, the wishlist and the place page.

export const kindLabel = (kind: string) => (kind === THEATRE_KIND ? 'Theatre' : PLACE_KINDS.find(k => k.key === kind)?.label ?? kind)

/** A stable colour block for places with no photo yet. */
function blockColor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360
  return `hsl(${h} 32% 26%)`
}

export function Thumb({ src, name, size = 52 }: { src?: string | null; name: string; size?: number }) {
  const box: React.CSSProperties = { width: size, height: size, borderRadius: '10px', flex: 'none', overflow: 'hidden', background: blockColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--ff-display)', fontSize: size * 0.4 }
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <div style={box}><img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div> : <div style={box}>{name.slice(0, 1).toUpperCase()}</div>
}

