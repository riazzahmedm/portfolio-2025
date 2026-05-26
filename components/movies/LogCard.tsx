'use client'
import { useState } from 'react'
import { Share2, Trash2, Pencil, RefreshCw } from 'lucide-react'
import type { MovieLog } from '@/lib/movies.types'
import { VIBES, PLATFORMS } from '@/lib/movies.types'
import StoryCardModal from './StoryCardModal'

const TYPE_COLOR: Record<string, string> = {
  movie:   '#82ff1f',
  series:  '#b8a0ff',
  episode: 'rgba(184,160,255,0.7)',
}
const TYPE_LABEL: Record<string, string> = {
  movie:   'Movie',
  series:  'Series',
  episode: 'Episode',
}

function VibeBadge({ vibe }: { vibe: string }) {
  const v = VIBES.find(x => x.key === vibe)
  if (!v) return null
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '10px', fontFamily: 'var(--ff-body)',
      color: v.color, marginTop: '4px',
    }}>
      <span style={{ fontSize: '12px' }}>{v.emoji}</span>
      <span style={{ fontWeight: 600 }}>{v.label}</span>
    </div>
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  const p = PLATFORMS.find(x => x.key === platform)
  if (!p) return null
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '9px', color: 'rgba(255,255,255,0.4)',
      fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em',
    }}>
      {p.logo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={p.logo} alt={p.label} style={{ width: '12px', height: '12px', borderRadius: '3px', objectFit: 'contain' }} />
        : <span style={{ fontSize: '10px' }}>{p.emoji}</span>
      }
      <span>{p.label}</span>
    </div>
  )
}

export default function LogCard({
  log,
  isAdmin,
  onDeleted,
  onEdit,
}: {
  log:        MovieLog
  isAdmin?:   boolean
  onDeleted?: (id: string) => void
  onEdit?:    (log: MovieLog) => void
}) {
  const [showStory, setShowStory] = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [hovered,   setHovered]   = useState(false)

  const seriesPrefix =
    log.type === 'episode'
      ? `S${String(log.season ?? '').padStart(2, '0')}E${String(log.episode ?? '').padStart(2, '0')}`
      : null

  const subtitle =
    log.type === 'episode' ? log.episode_title ?? '' : log.year?.toString() ?? ''

  async function handleDelete() {
    if (!confirm(`Delete "${log.title}"?`)) return
    setDeleting(true)
    await fetch(`/api/movies/${log.id}`, { method: 'DELETE' })
    onDeleted?.(log.id)
  }

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background:    'var(--surface)',
          border:        `1px solid ${hovered ? 'rgba(184,160,255,0.25)' : 'var(--border-card)'}`,
          borderRadius:  '14px',
          overflow:      'hidden',
          display:       'flex',
          flexDirection: 'column',
          transform:     hovered ? 'translateY(-3px)' : 'none',
          transition:    'border-color 0.2s, transform 0.2s',
        }}
      >
        {/* Poster */}
        <div style={{ position: 'relative', aspectRatio: '2/3', background: '#0a0a0a', flexShrink: 0 }}>
          {log.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={log.poster_url} alt={log.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
              🎬
            </div>
          )}

          {/* Type badge */}
          <div style={{
            position: 'absolute', top: '8px', left: '8px',
            background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(8px)',
            border: `1px solid ${TYPE_COLOR[log.type]}`,
            borderRadius: '100px', padding: '3px 9px',
            fontSize: '9px', letterSpacing: '0.18em',
            color: TYPE_COLOR[log.type],
            fontFamily: 'var(--ff-mono)', textTransform: 'uppercase',
          }}>
            {log.source === 'letterboxd' ? '⬛ ' : ''}{TYPE_LABEL[log.type]}
          </div>

          {/* Action buttons */}
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            display: 'flex', flexDirection: 'column', gap: '6px',
            opacity: hovered ? 1 : 0, transition: 'opacity 0.18s',
          }}>
            <button onClick={() => setShowStory(true)} title="Share to Instagram Story"
              style={{
                background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
              }}>
              <Share2 size={13} />
            </button>
            {isAdmin && onEdit && (
              <button onClick={() => onEdit(log)} title="Edit"
                style={{
                  background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(184,160,255,0.3)',
                  borderRadius: '50%', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#b8a0ff',
                }}>
                <Pencil size={13} />
              </button>
            )}
            {isAdmin && (
              <button onClick={handleDelete} disabled={deleting} title="Delete"
                style={{
                  background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(224,32,32,0.3)',
                  borderRadius: '50%', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: deleting ? 'not-allowed' : 'pointer', color: '#e02020',
                  opacity: deleting ? 0.5 : 1,
                }}>
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {/* Rewatch badge */}
          {log.rewatch && (
            <div style={{
              position: 'absolute', bottom: '8px', right: '8px',
              background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(130,255,31,0.3)',
              borderRadius: '100px', padding: '3px 8px',
              fontSize: '9px', color: '#82ff1f',
              fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <RefreshCw size={9} /> rewatch
            </div>
          )}

          {/* Favorite person overlay (bottom-left) */}
          {log.favorite_person && (
            <div style={{
              position: 'absolute', bottom: '8px', left: '8px',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(8px)',
              borderRadius: '100px', padding: '3px 8px 3px 4px',
              border: '1px solid rgba(184,160,255,0.2)',
            }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                {log.favorite_person.profile_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={log.favorite_person.profile_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>👤</div>
                }
              </div>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--ff-body)', whiteSpace: 'nowrap', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {log.favorite_person.name}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {seriesPrefix && (
            <div style={{ fontSize: '10px', color: '#b8a0ff', fontFamily: 'var(--ff-mono)' }}>
              {seriesPrefix}
            </div>
          )}

          <div style={{
            fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
            lineHeight: 1.3, fontFamily: 'var(--ff-body)',
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          } as React.CSSProperties}>
            {log.title}
          </div>

          {subtitle && (
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
              {subtitle}
            </div>
          )}

          {/* Vibe */}
          {log.vibe && <VibeBadge vibe={log.vibe} />}

          {/* Review snippet */}
          {log.review && (
            <p style={{
              fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5,
              margin: '2px 0 0', overflow: 'hidden',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              fontFamily: 'var(--ff-body)',
            } as React.CSSProperties}>
              {log.review}
            </p>
          )}

          {/* Platform + date */}
          <div style={{ marginTop: 'auto', paddingTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
            {log.platform
              ? <PlatformBadge platform={log.platform} />
              : <span />
            }
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', flexShrink: 0 }}>
              {new Date(log.watched_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {showStory && <StoryCardModal log={log} onClose={() => setShowStory(false)} />}
    </>
  )
}
