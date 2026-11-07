'use client'
import { useMemo, useState } from 'react'
import { hasTitle, type PublicArtPiece } from '@/lib/art.types'
import ArtPosters from '@/components/art/ArtPosters'
import ArtTitle from '@/components/art/ArtTitle'
import ArtViewer from '@/components/art/ArtViewer'
import TiltToggle from '@/components/movies/TiltToggle'

// The first pieces get the big poster treatment; the rest sit in a compact grid below
const FEATURED = 12

const ACCENT = '#f59e0b'

export default function ArtGallery({ pieces }: { pieces: PublicArtPiece[] }) {
  const [tag, setTag]       = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const tags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of pieces) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)
  }, [pieces])

  const visible = useMemo(() => (tag ? pieces.filter(p => p.tags.includes(tag)) : pieces), [pieces, tag])
  return (
    <main style={{ position: 'relative', minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <style>{`
        .art-wrap { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 44px 20px 80px; }
        .art-bg { position: absolute; inset: 0 0 auto 0; height: min(86vh, 700px); pointer-events: none; z-index: 0; overflow: hidden;
          background: linear-gradient(125deg, #1b0b3a 0%, #4a0e4e 46%, #0b2a3f 100%); background-size: 200% 200%; animation: art-bg-shift 14s ease-in-out infinite alternate;
          -webkit-mask-image: linear-gradient(to bottom, #000 52%, transparent 100%); mask-image: linear-gradient(to bottom, #000 52%, transparent 100%); }
        .art-bg::before { content: ''; position: absolute; width: 60%; aspect-ratio: 1; right: -12%; top: -22%; border-radius: 50%; background: radial-gradient(circle, rgba(226,72,150,0.38), transparent 65%); }
        .art-bg::after { content: ''; position: absolute; width: 55%; aspect-ratio: 1; left: -14%; bottom: -10%; border-radius: 50%; background: radial-gradient(circle, rgba(34,150,190,0.32), transparent 65%); }
        @keyframes art-bg-shift { from { background-position: 0% 30%; } to { background-position: 100% 70%; } }
        @media (prefers-reduced-motion: reduce) { .art-bg { animation: none; } }
        .art-grid { columns: 2; column-gap: 12px; }
        @media (min-width: 720px)  { .art-grid { columns: 3; column-gap: 16px; } }
        @media (min-width: 1100px) { .art-grid { columns: 4; column-gap: 18px; } }
        .art-tile { display: block; width: 100%; margin: 0 0 12px; padding: 0; border: 0; cursor: zoom-in; break-inside: avoid; position: relative;
          border-radius: 10px; overflow: hidden; background: var(--surface); }
        @media (min-width: 720px) { .art-tile { margin-bottom: 16px; } }
        .art-tile img { display: block; width: 100%; height: auto; transition: transform 0.5s cubic-bezier(.2,.7,.2,1); }
        .art-tile-cap { position: absolute; inset: auto 0 0 0; padding: 36px 12px 10px; text-align: left; color: #fff; font: 500 13px var(--ff-body);
          background: linear-gradient(to top, rgba(0,0,0,0.78), transparent); opacity: 0; transform: translateY(6px); transition: opacity 0.25s, transform 0.25s; }
        @media (hover: hover) and (pointer: fine) and (min-width: 641px) {
          .art-tile:hover img { transform: scale(1.035); }
          .art-tile:hover .art-tile-cap { opacity: 1; transform: none; }
        }
        .art-tile:focus-visible, .art-chip:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
        .art-chip { padding: 7px 14px; border-radius: 100px; cursor: pointer; font: 12px var(--ff-body); transition: all 0.18s;
          border: 1px solid var(--border); background: transparent; color: var(--text-secondary); text-transform: capitalize; }
        .art-chip[aria-pressed='true'] { border-color: ${ACCENT}88; background: ${ACCENT}1f; color: ${ACCENT}; }
        @media (prefers-reduced-motion: reduce) { .art-tile img { transition: none; } }
      `}</style>

      <div className="art-bg" aria-hidden="true" />

      <div className="art-wrap">

        <ArtTitle />

        <TiltToggle what="artwork" />

        {tags.length > 0 && (
          <div role="group" aria-label="Filter by theme" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            <button type="button" className="art-chip" aria-pressed={!tag} onClick={() => setTag('')}>All {pieces.length}</button>
            {tags.map(t => (
              <button key={t} type="button" className="art-chip" aria-pressed={tag === t} onClick={() => setTag(tag === t ? '' : t)}>{t}</button>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <p style={{ padding: '70px 0', textAlign: 'center', fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
            {pieces.length === 0 ? 'The gallery is empty for now. New work lands here soon.' : 'Nothing under this theme yet.'}
          </p>
        ) : (
          <>
            <ArtPosters pieces={visible.slice(0, FEATURED)} onOpen={setOpenId} />
            {visible.length > FEATURED && (
              <>
                <h2 style={{ margin: '48px 0 16px', fontFamily: 'var(--ff-display)', fontSize: '24px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>More work</h2>
                <div className="art-grid">
                  {visible.slice(FEATURED).map(p => (
                    <button key={p.id} type="button" className="art-tile" onClick={() => setOpenId(p.id)} aria-label={hasTitle(p.title) ? `View ${p.title}` : 'View artwork'}
                      style={p.width && p.height ? { aspectRatio: `${p.width} / ${p.height}` } : undefined}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url} alt={hasTitle(p.title) ? p.title : 'Artwork'} width={p.width ?? undefined} height={p.height ?? undefined} loading="lazy" decoding="async" />
                      {hasTitle(p.title) && <span className="art-tile-cap">{p.title}</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <ArtViewer pieces={visible} openId={openId} onChange={setOpenId} />
    </main>
  )
}
