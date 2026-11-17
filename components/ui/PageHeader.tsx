/**
 * A section's page heading, the same as the Watchlog's: the Riaz stamp, a large uppercase title and an italic line under it.
 * (The Watchlog draws its own copy inside AmbientHeader, over its backdrop glow.)
 */
export default function PageHeader({ title, tagline }: { title: string; tagline: string }) {
  return (
    <header className="ph">
      <style>{`
        .ph { padding: 30px 0 6px; }
        .ph-row { display: flex; align-items: center; gap: clamp(14px, 4vw, 32px); }
        /* Tilted like a stamp pressed onto the page */
        .ph-logo { flex: none; display: block; width: auto; height: clamp(92px, 24vw, 150px); transform: rotate(-9deg); filter: drop-shadow(0 6px 22px rgba(0,0,0,0.4)); }
        .ph h1 { margin: 0; font-family: var(--ff-display); font-weight: 500; font-size: clamp(2.8rem, 7vw, 5.6rem); line-height: 1; letter-spacing: 0.06em; text-transform: uppercase; color: #f4f1ff; }
        .ph p { margin: 12px 0 0; font-family: var(--ff-serif); font-style: italic; font-weight: 400; font-size: clamp(1.05rem, 1.6vw, 1.3rem); line-height: 1.4; color: rgba(255,255,255,0.86); }
        @media (max-width: 640px) { .ph { padding-top: 22px; } .ph h1 { letter-spacing: 0.05em; } }
      `}</style>
      <div className="ph-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ph-logo" src="/shop-logo.png" alt="Riaz" />
        <div style={{ minWidth: 0 }}>
          <h1>{title}</h1>
          <p>{tagline}</p>
        </div>
      </div>
    </header>
  )
}
