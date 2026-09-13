import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Riaz Ahmed',
  description: 'Portfolio, Shop, Movies and Blog by Riaz Ahmed.',
}

const CARDS = [
  {
    href: '/',
    label: 'Portfolio',
    sub: 'Design & engineering work',
    accent: '#e02020',
    accentDim: 'rgba(220,32,32,0.1)',
    accentGlow: 'rgba(220,32,32,0.22)',
    tag: '01',
    kicker: 'Featured',
  },
  {
    href: '/shop',
    label: 'Shop',
    sub: 'Original digital art prints',
    accent: '#ffffff',
    accentDim: 'rgba(255,255,255,0.06)',
    accentGlow: 'rgba(255,255,255,0.08)',
    tag: '02',
    kicker: 'Store',
  },
  {
    href: '/movies',
    label: 'Movies',
    sub: 'Watch log & lists',
    accent: '#b8a0ff',
    accentDim: 'rgba(184,160,255,0.12)',
    accentGlow: 'rgba(184,160,255,0.18)',
    tag: '03',
    kicker: 'Watchlist',
  },
  {
    href: '/blog',
    label: 'Blog',
    sub: 'Writing & notes',
    accent: '#82ff1f',
    accentDim: 'rgba(130,255,31,0.1)',
    accentGlow: 'rgba(130,255,31,0.16)',
    tag: '04',
    kicker: 'Journal',
  },
]

export default function HubPage() {
  return (
    <>
      <style>{`
        .hub-root {
          min-height: 100dvh;
          background: var(--bg);
          color: var(--text-primary);
          font-family: var(--ff-body);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
        }
        .hub-eyebrow {
          font-family: var(--ff-mono);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .hub-title {
          font-family: var(--ff-display);
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-primary);
          margin: 0 0 40px;
          text-align: center;
        }
        .hub-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 720px;
        }
        .hub-mag {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 28px 22px 32px;
          border-radius: 18px;
          border: 1px solid var(--border-card);
          background: var(--surface);
          text-decoration: none;
          color: var(--text-primary);
          overflow: hidden;
          min-height: 190px;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        /* left accent strip */
        .hub-mag::after {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          border-radius: 0 2px 2px 0;
          background: var(--mag-accent);
          opacity: 0.7;
          transition: opacity 0.22s ease, top 0.22s ease, bottom 0.22s ease;
        }
        .hub-mag:hover::after {
          opacity: 1;
          top: 10%;
          bottom: 10%;
        }
        /* glow layer */
        .hub-mag::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--mag-bg-glow);
          opacity: 0;
          transition: opacity 0.28s ease;
        }
        .hub-mag:hover {
          transform: translateY(-3px);
          border-color: var(--mag-accent-border);
          box-shadow: 0 10px 40px var(--mag-shadow);
        }
        .hub-mag:hover::before {
          opacity: 1;
        }
        /* giant watermark number */
        .hub-mag-wm {
          position: absolute;
          right: 20px;
          bottom: -12px;
          font-family: var(--ff-display);
          font-size: clamp(5rem, 16vw, 9rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--mag-accent);
          opacity: 0.07;
          line-height: 1;
          pointer-events: none;
          user-select: none;
          transition: opacity 0.22s ease;
        }
        .hub-mag:hover .hub-mag-wm {
          opacity: 0.11;
        }
        .hub-mag-top {
          position: relative;
          z-index: 1;
        }
        .hub-mag-kicker {
          font-family: var(--ff-mono);
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--mag-accent);
          opacity: 0.7;
          margin-bottom: 10px;
        }
        .hub-mag-label {
          font-family: var(--ff-display);
          font-size: clamp(2.4rem, 7vw, 4rem);
          font-weight: 800;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--mag-accent);
          line-height: 0.9;
        }
        .hub-mag-rule {
          height: 1px;
          background: var(--mag-accent);
          opacity: 0.15;
          margin: 18px 0 0;
        }
        .hub-mag-footer {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
        }
        .hub-mag-sub {
          font-family: var(--ff-mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }
        .hub-mag-arrow {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid var(--mag-accent-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--mag-accent);
          flex-shrink: 0;
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .hub-mag:hover .hub-mag-arrow {
          background: var(--mag-accent-dim);
          transform: translate(2px, -2px);
        }
      `}</style>

      <div className="hub-root">
        <p className="hub-eyebrow">Riaz Ahmed</p>
        <h1 className="hub-title">What are you here for?</h1>

        <div className="hub-stack">
          {CARDS.map(({ href, label, sub, accent, accentDim, accentGlow, tag, kicker }) => (
            <Link
              key={href}
              href={href}
              className="hub-mag"
              style={{
                '--mag-accent':        accent,
                '--mag-accent-dim':    accentDim,
                '--mag-accent-border': accent === '#ffffff' ? 'rgba(255,255,255,0.2)' : `${accent}66`,
                '--mag-shadow':        accentGlow,
                '--mag-bg-glow':       `radial-gradient(ellipse at 0% 100%, ${accentGlow} 0%, transparent 60%)`,
              } as React.CSSProperties}
            >
              <span className="hub-mag-wm">{tag}</span>

              <div className="hub-mag-top">
                <p className="hub-mag-kicker">{kicker}</p>
                <p className="hub-mag-label">{label}</p>
              </div>

              <div>
                <div className="hub-mag-rule" />
                <div className="hub-mag-footer">
                  <span className="hub-mag-sub">{sub}</span>
                  <span className="hub-mag-arrow">
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
