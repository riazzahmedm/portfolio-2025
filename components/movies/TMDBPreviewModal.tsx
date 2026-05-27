'use client'
import { useEffect, useState } from 'react'
import { X, Star, Tv, Clock, Globe, DollarSign, Bookmark } from 'lucide-react'
import type { TMDBResult } from '@/lib/movies.types'

interface TMDBPersonRaw {
  id: number; name: string; role: string; profile_path: string | null; dept: string
}

interface Details {
  genres:               string[]
  runtime:              number | null
  original_language:    string | null
  origin_country:       string[]
  tmdb_rating:          number | null
  tmdb_vote_count:      number | null
  certification:        string | null
  tagline:              string | null
  overview:             string | null
  director:             string | null
  cast_names:           string[]
  keywords:             string[]
  collection:           string | null
  imdb_id:              string | null
  budget:               number | null
  revenue:              number | null
  networks:             string[]
  production_companies: string[]
  people:               TMDBPersonRaw[]
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '100px',
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.1)',
      fontSize: '11px', color: 'rgba(255,255,255,0.6)',
      fontFamily: 'var(--ff-mono)', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)',
        marginBottom: '10px',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export default function TMDBPreviewModal({
  result,
  mediaType,
  onClose,
  onPick,
  onWatchLater,
}: {
  result:         TMDBResult
  mediaType:      'movie' | 'tv'
  onClose:        () => void
  onPick:         (r: TMDBResult) => void
  onWatchLater?:  (r: TMDBResult, genres: string[]) => void
}) {
  const [details,  setDetails]  = useState<Details | null>(null)
  const [loading,  setLoading]  = useState(true)

  const title    = result.title ?? result.name ?? ''
  const year     = (result.release_date ?? result.first_air_date ?? '').slice(0, 4)
  const poster   = result.poster_path   ? `https://image.tmdb.org/t/p/w342${result.poster_path}`   : null
  const backdrop = result.backdrop_path ? `https://image.tmdb.org/t/p/w1280${result.backdrop_path}` : null

  useEffect(() => {
    setLoading(true)
    fetch(`/api/tmdb/details?id=${result.id}&type=${mediaType}`)
      .then(r => r.json())
      .then(d => { setDetails(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [result.id, mediaType])

  const crew = details?.people.filter(p => p.dept === 'Crew') ?? []
  const cast = details?.people.filter(p => p.dept === 'Cast') ?? []

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '500px',
          background: '#0e0e0e',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '92dvh',
        }}
      >
        {/* ── Fixed backdrop header ── */}
        <div style={{ position: 'relative', height: '200px', background: '#0a0a0a', flexShrink: 0 }}>
          {backdrop && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, #0e0e0e 100%)' }} />

          {/* Close */}
          <button onClick={onClose} style={{
            position: 'absolute', top: '12px', right: '12px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
          }}>
            <X size={14} />
          </button>

          {/* Poster */}
          <div style={{
            position: 'absolute', bottom: '-40px', left: '20px',
            width: '80px', height: '120px', borderRadius: '10px', overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.12)',
            background: '#141414', boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
          }}>
            {poster
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={poster} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎬</div>
            }
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: 'auto', padding: '52px 20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Title + quick meta */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, fontFamily: 'var(--ff-body)', color: '#fff', lineHeight: 1.2 }}>
                {title}
              </h2>
              {details?.certification && (
                <span style={{
                  padding: '3px 9px', borderRadius: '6px', flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '11px', color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--ff-mono)', marginTop: '4px',
                }}>
                  {details.certification}
                </span>
              )}
            </div>

            {/* Tagline */}
            {details?.tagline && (
              <p style={{ margin: '6px 0 0', fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-body)' }}>
                "{details.tagline}"
              </p>
            )}

            {/* Quick chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
              {year && <MetaChip>{year}</MetaChip>}
              {result.number_of_seasons != null && (
                <MetaChip><Tv size={10} style={{ display: 'inline', marginRight: '3px' }} />{result.number_of_seasons} season{result.number_of_seasons !== 1 ? 's' : ''}</MetaChip>
              )}
              {details?.runtime && (
                <MetaChip><Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />{details.runtime} min</MetaChip>
              )}
              {details?.tmdb_rating && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '3px 10px', borderRadius: '100px',
                  background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
                  fontSize: '11px', color: '#fbbf24', fontFamily: 'var(--ff-mono)',
                }}>
                  <Star size={10} fill="#fbbf24" /> {details.tmdb_rating}
                  {details.tmdb_vote_count && <span style={{ color: 'rgba(251,191,36,0.5)', fontSize: '10px' }}>({(details.tmdb_vote_count / 1000).toFixed(0)}k)</span>}
                </span>
              )}
              {details?.original_language && (
                <MetaChip><Globe size={10} style={{ display: 'inline', marginRight: '3px' }} />{details.original_language.toUpperCase()}</MetaChip>
              )}
            </div>
          </div>

          {/* Loading shimmer */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[80, 60, 95, 70].map((w, i) => (
                <div key={i} style={{ height: '12px', borderRadius: '4px', width: `${w}%`, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.6s ease infinite' }} />
              ))}
            </div>
          )}

          {details && (
            <>
              {/* Genres */}
              {details.genres.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {details.genres.map(g => (
                    <span key={g} style={{
                      padding: '4px 12px', borderRadius: '100px',
                      background: 'rgba(184,160,255,0.1)', border: '1px solid rgba(184,160,255,0.22)',
                      fontSize: '11px', color: '#b8a0ff', fontFamily: 'var(--ff-mono)', letterSpacing: '0.06em',
                    }}>
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {details.overview && (
                <Section title="Overview">
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--ff-body)' }}>
                    {details.overview}
                  </p>
                </Section>
              )}

              {/* Collection */}
              {details.collection && (
                <div style={{
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(130,255,31,0.06)', border: '1px solid rgba(130,255,31,0.18)',
                  fontSize: '12px', color: '#82ff1f', fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em',
                }}>
                  📚 {details.collection}
                </div>
              )}

              {/* Crew */}
              {crew.length > 0 && (
                <Section title="Behind the camera">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {crew.map(p => (
                      <div key={`${p.id}-${p.role}`} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 10px 5px 5px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                          {p.profile_path
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={`https://image.tmdb.org/t/p/w92${p.profile_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>👤</div>
                          }
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', fontFamily: 'var(--ff-body)', lineHeight: 1 }}>{p.name}</div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-mono)', marginTop: '1px' }}>{p.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <Section title="Cast">
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' } as React.CSSProperties}>
                    {cast.map(p => (
                      <div key={`${p.id}-${p.role}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flexShrink: 0, width: '62px' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {p.profile_path
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={`https://image.tmdb.org/t/p/w92${p.profile_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
                          }
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--ff-body)', textAlign: 'center', lineHeight: 1.2, maxWidth: '62px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--ff-mono)', textAlign: 'center', lineHeight: 1.2, maxWidth: '62px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {p.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Details grid */}
              <Section title="Details">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {details.origin_country.length > 0 && (
                    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Country</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--ff-body)' }}>{details.origin_country.join(', ')}</div>
                    </div>
                  )}
                  {details.networks.length > 0 && (
                    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Network</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--ff-body)' }}>{details.networks.join(', ')}</div>
                    </div>
                  )}
                  {details.budget != null && details.budget > 0 && (
                    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Budget</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--ff-body)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />{fmt(details.budget)}
                      </div>
                    </div>
                  )}
                  {details.revenue != null && details.revenue > 0 && (
                    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Revenue</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--ff-body)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />{fmt(details.revenue)}
                      </div>
                    </div>
                  )}
                  {details.production_companies.length > 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Production</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--ff-body)' }}>{details.production_companies.slice(0, 4).join(' · ')}</div>
                    </div>
                  )}
                  {details.imdb_id && (
                    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>IMDb</div>
                      <a href={`https://www.imdb.com/title/${details.imdb_id}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: '#fbbf24', fontFamily: 'var(--ff-mono)', textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}>
                        {details.imdb_id} ↗
                      </a>
                    </div>
                  )}
                </div>
              </Section>

              {/* Keywords */}
              {details.keywords.length > 0 && (
                <Section title="Keywords">
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {details.keywords.slice(0, 20).map(k => (
                      <span key={k} style={{
                        padding: '3px 9px', borderRadius: '100px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ff-mono)',
                      }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px', position: 'sticky', bottom: 0, background: '#0e0e0e', paddingBottom: '4px' }}>
            <button
              onClick={() => { onPick(result); onClose() }}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px',
                border: '1px solid rgba(130,255,31,0.35)',
                background: 'rgba(130,255,31,0.08)',
                color: '#82ff1f', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--ff-body)', transition: 'background 0.18s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(130,255,31,0.14)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(130,255,31,0.08)')}
            >
              Select this
            </button>
            {onWatchLater && (
              <button
                onClick={() => { onWatchLater(result, details?.genres ?? []); onClose() }}
                title="Save for later"
                style={{
                  padding: '12px 16px', borderRadius: '12px',
                  border: '1px solid rgba(184,160,255,0.3)',
                  background: 'rgba(184,160,255,0.08)',
                  color: '#b8a0ff', fontSize: '13px',
                  cursor: 'pointer', fontFamily: 'var(--ff-body)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'background 0.18s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,160,255,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(184,160,255,0.08)')}
              >
                <Bookmark size={14} /> Later
              </button>
            )}
            <button onClick={onClose}
              style={{
                padding: '12px 16px', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.4)', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'var(--ff-body)',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
