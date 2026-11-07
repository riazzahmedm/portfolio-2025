/** The page header: a bold title and a short description over the gradient that fills the top of the page. */
export default function ArtTitle() {
  return (
    <header className="at">
      <style>{`
        .at { margin-bottom: 40px; color: #fff; }
        .at-row { display: flex; align-items: center; gap: clamp(16px, 5vw, 44px); }
        /* Tilted like a stamp pressed onto the page */
        .at-logo { flex: none; display: block; width: auto; height: clamp(100px, 28vw, 200px); transform: rotate(-9deg); filter: drop-shadow(0 6px 22px rgba(0,0,0,0.4)); }
        .at-title { margin: 0; font: 800 clamp(40px, 12vw, 112px)/0.92 var(--ff-art), var(--ff-display); letter-spacing: -0.04em; text-shadow: 0 8px 36px rgba(0,0,0,0.35); }
        .at-title span { display: block; }
        .at-desc { margin: 16px 0 0; max-width: 40ch; font: 400 clamp(14px, 3.7vw, 16px)/1.55 var(--ff-body); color: rgba(255,255,255,0.86); }
      `}</style>

      <div className="at-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="at-logo" src="/shop-logo.png" alt="Riaz" />
        <h1 className="at-title"><span>Digital</span><span>art</span></h1>
      </div>
      <p className="at-desc">Faces, light and color, painted pixel by pixel. Tap any piece to step closer; some are available as prints.</p>
    </header>
  )
}
