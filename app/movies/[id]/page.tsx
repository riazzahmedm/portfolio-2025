'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Clock, Globe, RefreshCw, ExternalLink } from 'lucide-react'
import type { MovieLog } from '@/lib/movies.types'
import { VIBES, PLATFORMS, DRAWS } from '@/lib/movies.types'

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '100px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      fontSize: '12px', color: 'rgba(255,255,255,0.6)',
      fontFamily: 'var(--ff-mono)', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

export default function MovieDetailPage() {
  const params  = useParams()
  const id      = params?.id as string
  const [log,   setLog]   = useState<MovieLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/movies/${id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(d => { if (d) { setLog(d); setLoading(false) } })
      .catch(() => { setLoading(false); setNotFound(true) })
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>LOADING…</div>
    </div>
  )

  if (notFound || !log) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: '48px', color: 'rgba(255,255,255,0.1)' }}>404</div>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>Entry not found</div>
      <Link href="/movies" style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: '#b8a0ff', textDecoration: 'none' }}>← Back to watchlog</Link>
    </div>
  )

  const vibe     = VIBES.find(v => v.key === log.vibe)
  const platform = PLATFORMS.find(p => p.key === log.platform)
  const isEpisode = log.type === 'episode' || (log.type === 'series' && log.episode != null)
  const seriesPrefix = isEpisode
    ? `S${String(log.season ?? '').padStart(2, '0')}E${String(log.episode ?? '').padStart(2, '0')}`
    : null

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>

      {/* ── Backdrop hero ── */}
      <div style={{ position: 'relative', height: 'min(50vh, 400px)', background: '#050505', overflow: 'hidden' }}>
        {log.backdrop_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={log.backdrop_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, var(--bg) 100%)' }} />

        {/* Back nav */}
        <Link href="/movies" style={{
          position: 'absolute', top: '20px', left: '20px',
          display: 'flex', alignItems: 'center', gap: '6px',
          color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
          fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          padding: '7px 14px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <ArrowLeft size={12} /> Watchlog
        </Link>

        {/* Type badge */}
        <div style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(8px)',
          border: `1px solid ${log.type === 'movie' ? '#82ff1f' : '#b8a0ff'}`,
          borderRadius: '100px', padding: '4px 12px',
          fontSize: '10px', letterSpacing: '0.18em',
          color: log.type === 'movie' ? '#82ff1f' : '#b8a0ff',
          fontFamily: 'var(--ff-mono)', textTransform: 'uppercase',
        }}>
          {log.type}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Poster + title row */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '-80px', alignItems: 'flex-end', marginBottom: '32px' }}>
          {/* Poster */}
          <div style={{
            width: '120px', flexShrink: 0,
            aspectRatio: '2/3', borderRadius: '12px', overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.12)',
            background: '#0a0a0a',
            boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
          }}>
            {log.poster_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={log.poster_url} alt={log.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🎬</div>
            }
          </div>

          {/* Title block */}
          <div style={{ flex: 1, minWidth: 0, paddingBottom: '4px' }}>
            {seriesPrefix && (
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: '#b8a0ff', marginBottom: '6px' }}>
                {seriesPrefix}
              </div>
            )}
            <h1 style={{
              margin: 0, fontSize: 'clamp(1.4rem, 5vw, 2.2rem)',
              fontFamily: 'var(--ff-display)', fontWeight: 400,
              letterSpacing: '0.04em', lineHeight: 1.1, color: '#fff',
            }}>
              {log.title}
            </h1>
            {log.year && (
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>
                {log.year}
              </div>
            )}
          </div>
        </div>

        {/* Quick chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {log.runtime && <MetaChip><Clock size={10} style={{ display:'inline', marginRight:'4px' }} />{log.runtime} min</MetaChip>}
          {log.tmdb_rating && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '4px 12px', borderRadius: '100px',
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
              fontSize: '12px', color: '#fbbf24', fontFamily: 'var(--ff-mono)',
            }}>
              <Star size={10} fill="#fbbf24" /> {log.tmdb_rating}
            </span>
          )}
          {log.original_language && <MetaChip><Globe size={10} style={{ display:'inline', marginRight:'4px' }} />{log.original_language.toUpperCase()}</MetaChip>}
          {log.certification && <MetaChip>{log.certification}</MetaChip>}
          {log.rewatch && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '4px 12px', borderRadius: '100px',
              background: 'rgba(130,255,31,0.08)', border: '1px solid rgba(130,255,31,0.25)',
              fontSize: '12px', color: '#82ff1f', fontFamily: 'var(--ff-mono)',
            }}>
              <RefreshCw size={10} /> Rewatch
            </span>
          )}
        </div>

        {/* Genres */}
        {log.genres?.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
            {log.genres.map(g => (
              <span key={g} style={{
                padding: '5px 14px', borderRadius: '100px',
                background: 'rgba(184,160,255,0.1)', border: '1px solid rgba(184,160,255,0.22)',
                fontSize: '12px', color: '#b8a0ff', fontFamily: 'var(--ff-mono)', letterSpacing: '0.06em',
              }}>{g}</span>
            ))}
          </div>
        )}

        {/* Tagline */}
        {log.tagline && (
          <p style={{
            margin: '0 0 24px', fontSize: '14px', fontStyle: 'italic',
            color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-body)', lineHeight: 1.6,
          }}>
            "{log.tagline}"
          </p>
        )}

        {/* Overview */}
        {log.overview && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', marginBottom: '10px' }}>Overview</div>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--ff-body)' }}>
              {log.overview}
            </p>
          </div>
        )}

        {/* ── Personal section ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '28px', marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', marginBottom: '20px' }}>Your Log</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {/* Vibe */}
            {vibe && (
              <div style={{ padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', marginBottom: '8px' }}>Feeling</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ fontSize: '18px' }}>{vibe.emoji}</span>
                  <span style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', fontWeight: 600, color: vibe.color }}>{vibe.label}</span>
                </div>
              </div>
            )}
            {/* Watched on */}
            <div style={{ padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', marginBottom: '8px' }}>Watched</div>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                {new Date(log.watched_on + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            {/* Platform */}
            {platform && (
              <div style={{ padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', marginBottom: '8px' }}>Platform</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  {platform.logo
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={platform.logo} alt="" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'contain' }} />
                    : <span style={{ fontSize: '16px' }}>{platform.emoji}</span>
                  }
                  <span style={{ fontFamily: 'var(--ff-body)', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{platform.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Review */}
          {log.review && (
            <div style={{
              padding: '20px', borderRadius: '14px',
              background: 'rgba(184,160,255,0.05)', border: '1px solid rgba(184,160,255,0.15)',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#b8a0ff', fontFamily: 'var(--ff-mono)', marginBottom: '10px' }}>Your Review</div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.75, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--ff-body)', fontStyle: 'italic' }}>
                "{log.review}"
              </p>
            </div>
          )}

          {/* What drew you */}
          {log.draws?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', marginBottom: '10px' }}>What drew you</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {log.draws.map(drawKey => {
                  const draw = DRAWS.find(d => d.key === drawKey)
                  return (
                    <span key={drawKey} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '5px 12px', borderRadius: '100px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '12px', color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--ff-body)',
                    }}>
                      {draw?.emoji} {draw?.label ?? drawKey}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Favorite person */}
          {log.favorite_person && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', background: '#0a0a0a', border: '1px solid rgba(184,160,255,0.2)', flexShrink: 0 }}>
                {log.favorite_person.profile_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={log.favorite_person.profile_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                }
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', fontFamily: 'var(--ff-body)' }}>{log.favorite_person.name}</div>
                <div style={{ fontSize: '11px', color: '#b8a0ff', fontFamily: 'var(--ff-mono)', marginTop: '2px' }}>{log.favorite_person.role} · Stand-out performance</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Cast ── */}
        {log.cast_names?.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>Cast</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {log.cast_names.slice(0, 12).map(name => (
                <span key={name} style={{
                  padding: '5px 13px', borderRadius: '100px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                  fontSize: '12px', color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--ff-body)',
                }}>{name}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Director / Collection ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          {log.director && (
            <div style={{ padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', marginBottom: '6px' }}>Director</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--ff-body)', fontWeight: 600 }}>{log.director}</div>
            </div>
          )}
          {log.collection && (
            <div style={{ padding: '14px 16px', background: 'rgba(130,255,31,0.05)', border: '1px solid rgba(130,255,31,0.2)', borderRadius: '12px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(130,255,31,0.5)', fontFamily: 'var(--ff-mono)', marginBottom: '6px' }}>Collection</div>
              <div style={{ fontSize: '13px', color: '#82ff1f', fontFamily: 'var(--ff-body)' }}>{log.collection}</div>
            </div>
          )}
          {log.imdb_id && (
            <a href={`https://www.imdb.com/title/${log.imdb_id}`} target="_blank" rel="noopener noreferrer"
              style={{ padding: '14px 16px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(251,191,36,0.5)', fontFamily: 'var(--ff-mono)', marginBottom: '6px' }}>IMDb</div>
                <div style={{ fontSize: '13px', color: '#fbbf24', fontFamily: 'var(--ff-mono)' }}>{log.imdb_id}</div>
              </div>
              <ExternalLink size={13} color="rgba(251,191,36,0.5)" />
            </a>
          )}
        </div>

        {/* Keywords */}
        {log.keywords?.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>Keywords</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {log.keywords.slice(0, 20).map(k => (
                <span key={k} style={{
                  padding: '3px 10px', borderRadius: '100px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-mono)',
                }}>{k}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
