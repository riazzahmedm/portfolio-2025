'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PLATFORMS } from '@/lib/movies.types'
import { tiltProps } from '@/lib/tilt'

interface Series {
  id:              string
  title:           string
  poster_url:      string | null
  current_season:  number
  current_episode: number
  status:          string
  total_seasons:   number | null
  total_episodes:  number | null
}

interface MovieInProgress {
  id:           string
  title:        string
  poster_url:   string | null
  year:         number | null
  platform:     string | null
}

type Item =
  | { kind: 'series'; key: string; href: string; title: string; poster: string | null; series: Series }
  | { kind: 'movie';  key: string; href: string; title: string; poster: string | null; movie: MovieInProgress }

const TICKS = 10

function seriesProgress(s: Series): number | null {
  // current_episode counts within the season, total_episodes spans the show: estimate with an average season length
  if (!s.total_episodes || !s.total_seasons) return null
  const perSeason = s.total_episodes / s.total_seasons
  return Math.min(1, ((s.current_season - 1) * perSeason + s.current_episode) / s.total_episodes)
}

const platformLabel = (key: string | null) => PLATFORMS.find(p => p.key === key)?.label ?? null

export default function NowWatching() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    const get = (url: string) => fetch(url).then(r => (r.ok ? r.json() : [])).catch(() => [])
    Promise.all([get('/api/series-progress'), get('/api/movies?status=watching&type=movie')]).then(([series, movies]) => {
      const s: Item[] = (Array.isArray(series) ? (series as Series[]) : [])
        .filter(x => x.status === 'watching')
        .map(x => ({ kind: 'series', key: `s-${x.id}`, href: '/movies/tracker', title: x.title, poster: x.poster_url, series: x }))
      const m: Item[] = (Array.isArray(movies) ? (movies as MovieInProgress[]) : [])
        .map(x => ({ kind: 'movie', key: `m-${x.id}`, href: `/movies/${x.id}`, title: x.title, poster: x.poster_url, movie: x }))
      setItems([...s, ...m])
    })
  }, [])

  if (items.length === 0) return null

  return (
    <section className="nw" aria-label="Now watching">
      <style>{`
        .nw { max-width: 1280px; margin: 0 auto; padding: 30px 24px 0; }
        .nw-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .nw-chip {
          display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px 5px 10px; border-radius: 100px;
          font: 10px var(--ff-mono); letter-spacing: 0.26em; text-transform: uppercase; color: #82ff1f;
          border: 1px solid rgba(130,255,31,0.35); background: rgba(130,255,31,0.07);
        }
        .nw-dot { width: 7px; height: 7px; border-radius: 50%; background: #82ff1f; box-shadow: 0 0 0 0 rgba(130,255,31,0.6); animation: nw-pulse 1.8s ease-out infinite; }

        .nw-row { display: flex; gap: 16px; overflow-x: auto; padding: 4px 2px 14px; scroll-snap-type: x proximity; scrollbar-width: none; }
        .nw-row::-webkit-scrollbar { display: none; }

        .nw-card {
          --mx: 0; --my: 0; --ty: 0px; --gx: 50%; --gy: 0%;
          position: relative; flex: 0 0 auto; width: min(340px, 86vw); min-height: 132px; display: flex; overflow: hidden;
          border-radius: 18px; text-decoration: none; color: inherit; scroll-snap-align: start;
          background: #0b0b0d; isolation: isolate; box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 24px -16px rgba(0,0,0,0.9);
          transform: perspective(900px) rotateX(calc(var(--my) * -16deg)) rotateY(calc(var(--mx) * 18deg)) translateY(var(--ty));
          transition: transform 0.5s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease;
          will-change: transform;
        }
        .nw-card.is-tilting { transition: transform 0.08s linear, box-shadow 0.3s ease; }
        .nw-card:hover { --ty: -4px; box-shadow: inset 0 1px 0 rgba(130,255,31,0.25), 0 22px 44px -20px rgba(130,255,31,0.45), 0 10px 24px -12px rgba(0,0,0,0.9); }
        .nw-glare {
          position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0; transition: opacity 0.3s ease;
          background: radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,0.16), transparent 55%);
        }
        .nw-card:hover .nw-glare { opacity: 1; }
        .nw-poster img, .nw-poster .nw-ph { transition: transform 0.5s cubic-bezier(.2,.8,.2,1); transform: translate(calc(var(--mx) * 7px), calc(var(--my) * 7px)); }
        .nw-card.is-tilting .nw-poster img, .nw-card.is-tilting .nw-poster .nw-ph { transition: transform 0.08s linear; }
        @media (hover: none), (pointer: coarse) {
          .nw-card, .nw-card:hover { transform: none; }
          .nw-glare { display: none; }
        }
        .nw-card:focus-visible { outline: 2px solid #82ff1f; outline-offset: 3px; }

        .nw-glow { position: absolute; inset: -30%; z-index: -1; background-size: cover; background-position: center; filter: blur(46px) saturate(1.6); opacity: 0.38; }
        .nw-shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(100deg, rgba(8,8,10,0.55), rgba(8,8,10,0.9) 62%); }

        .nw-poster { flex: 0 0 108px; position: relative; padding: 12px 16px 12px 12px; display: flex; align-items: center; }
        .nw-poster img, .nw-poster .nw-ph { width: 80px; height: 120px; border-radius: 9px; object-fit: cover; box-shadow: 0 10px 24px -8px rgba(0,0,0,0.8); }
        .nw-ph { background: rgba(255,255,255,0.06); }

        .nw-stub { position: relative; flex: 1; min-width: 0; padding: 14px 16px 14px 18px; display: flex; flex-direction: column; justify-content: center; gap: 7px; }
        .nw-stub::before { content: ''; position: absolute; left: 0; top: 16px; bottom: 16px; border-left: 1.5px dashed rgba(255,255,255,0.16); }
        .nw-stub::after, .nw-stub .nw-notch { content: ''; position: absolute; left: -7px; width: 16px; height: 16px; border-radius: 50%; background: var(--bg, #050505); }
        .nw-stub::after { top: -9px; left: -8px; }
        .nw-stub .nw-notch { bottom: -9px; left: -8px; }

        .nw-type { display: flex; align-items: center; gap: 8px; font: 9px var(--ff-mono); letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
        .nw-type b { font-weight: 400; color: #b8a0ff; }
        .nw-card[data-kind='series'] .nw-type b { color: #82ff1f; }
        .nw-bars { display: inline-flex; align-items: flex-end; gap: 2px; height: 10px; }
        .nw-bars i { width: 2px; background: #82ff1f; border-radius: 1px; animation: nw-bar 1s ease-in-out infinite; }
        .nw-bars i:nth-child(2) { animation-delay: 0.2s; } .nw-bars i:nth-child(3) { animation-delay: 0.4s; }

        .nw-title { font: 600 15px/1.25 var(--ff-body); color: #fff; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .nw-big { font: 400 26px/1 var(--ff-display); letter-spacing: 0.06em; color: #fff; }
        .nw-big { display: flex; align-items: center; gap: 10px; }
        .nw-sep { width: 1px; height: 16px; background: rgba(255,255,255,0.25); }
        .nw-sub { font: 11px var(--ff-mono); letter-spacing: 0.06em; color: rgba(255,255,255,0.5); }

        .nw-ticks { display: flex; gap: 3px; margin-top: 2px; }
        .nw-ticks i { flex: 1; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.12); }
        .nw-ticks i.on { background: #82ff1f; box-shadow: 0 0 8px rgba(130,255,31,0.45); }

        @keyframes nw-pulse { 0% { box-shadow: 0 0 0 0 rgba(130,255,31,0.55); } 70% { box-shadow: 0 0 0 8px rgba(130,255,31,0); } 100% { box-shadow: 0 0 0 0 rgba(130,255,31,0); } }
        @keyframes nw-bar { 0%, 100% { height: 3px; } 50% { height: 10px; } }
        @media (prefers-reduced-motion: reduce) { .nw-dot, .nw-bars i { animation: none; } .nw-card, .nw-card:hover { transition: none; transform: none; } .nw-poster img, .nw-poster .nw-ph { transform: none; } .nw-glare { display: none; } }
        @media (max-width: 640px) { .nw { padding: 24px 16px 0; } }
      `}</style>

      <div className="nw-head">
        <span className="nw-chip"><span className="nw-dot" />Now watching</span>
      </div>

      <div className="nw-row">
        {items.map(it => {
          const pct   = it.kind === 'series' ? seriesProgress(it.series) : null
          const filled = pct === null ? 0 : Math.max(1, Math.round(pct * TICKS))
          const platform = it.kind === 'movie' ? platformLabel(it.movie.platform) : null

          return (
            <Link key={it.key} href={it.href} className="nw-card" data-kind={it.kind} {...tiltProps}>
              {it.poster && <div className="nw-glow" style={{ backgroundImage: `url(${it.poster})` }} />}
              <div className="nw-shade" />

              <div className="nw-poster">
                {it.poster ? <img src={it.poster} alt="" /> : <div className="nw-ph" />}
              </div>

              <div className="nw-glare" />

              <div className="nw-stub">
                <span className="nw-notch" />
                <div className="nw-type">
                  <span className="nw-bars"><i /><i /><i /></span>
                  <b>{it.kind === 'series' ? 'Series' : 'Movie'}</b>
                </div>
                <div className="nw-title">{it.title}</div>

                {it.kind === 'series' ? (
                  <>
                    <div className="nw-big"><span>S{it.series.current_season}</span><span className="nw-sep" /><span>E{it.series.current_episode}</span></div>
                    {pct !== null && (
                      <div className="nw-ticks" aria-label={`${Math.round(pct * 100)}% through`}>
                        {Array.from({ length: TICKS }, (_, i) => <i key={i} className={i < filled ? 'on' : ''} />)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="nw-sub">
                    {[it.movie.year, platform].filter(Boolean).join(' · ') || 'In progress'}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
