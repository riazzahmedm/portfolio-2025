'use client'
import { useState } from 'react'
import { Trash2, PlayCircle, Eye } from 'lucide-react'
import { toast } from 'sonner'
import type { WatchlistItem, TMDBResult } from '@/lib/movies.types'
import ConfirmModal from '@/components/ui/ConfirmModal'
import TMDBPreviewModal from '@/components/movies/TMDBPreviewModal'

export default function WatchlistCard({
  item,
  isAdmin,
  onRemoved,
  onLog,
}: {
  item:      WatchlistItem
  isAdmin?:  boolean
  onRemoved: (id: string) => void
  onLog:     (item: WatchlistItem) => void
}) {
  const [hovered,     setHovered]     = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [preview,     setPreview]     = useState(false)

  async function confirmRemove() {
    setConfirmOpen(false)
    setDeleting(true)
    const res = await fetch(`/api/watchlist/${item.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Removed from Watch Later', { description: item.title })
      onRemoved(item.id)
    } else {
      toast.error('Failed to remove — try again')
      setDeleting(false)
    }
  }

  // Shape WatchlistItem into a TMDBResult for the preview modal
  const tmdbResult: TMDBResult = {
    id:           item.tmdb_id ?? 0,
    title:        item.type === 'movie' ? item.title : undefined,
    name:         item.type === 'series' ? item.title : undefined,
    poster_path:  item.poster_url  ? item.poster_url.replace(/^https:\/\/image\.tmdb\.org\/t\/p\/\w+/, '')  : null,
    backdrop_path:item.backdrop_url ? item.backdrop_url.replace(/^https:\/\/image\.tmdb\.org\/t\/p\/\w+/, '') : null,
    release_date:  item.type === 'movie'  && item.year ? `${item.year}-01-01` : undefined,
    first_air_date:item.type === 'series' && item.year ? `${item.year}-01-01` : undefined,
    genre_ids:    [],
    overview:     item.overview ?? '',
    vote_average: item.tmdb_rating ?? 0,
  }

  return (
    <>
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    'var(--surface)',
        border:        `1px solid ${hovered ? 'rgba(184,160,255,0.25)' : 'var(--border-card)'}`,
        borderRadius:  '14px', overflow: 'hidden',
        display:       'flex', flexDirection: 'column',
        transform:     hovered ? 'translateY(-3px)' : 'none',
        transition:    'border-color 0.2s, transform 0.2s',
      }}
    >
      {/* Poster */}
      <div style={{ position: 'relative', aspectRatio: '2/3', background: '#0a0a0a', flexShrink: 0 }}>
        {item.poster_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.poster_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🎬</div>
        }

        {/* Type badge */}
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(8px)',
          border: `1px solid ${item.type === 'movie' ? '#82ff1f' : '#b8a0ff'}`,
          borderRadius: '100px', padding: '3px 9px',
          fontSize: '9px', letterSpacing: '0.18em',
          color: item.type === 'movie' ? '#82ff1f' : '#b8a0ff',
          fontFamily: 'var(--ff-mono)', textTransform: 'uppercase',
        }}>
          {item.type}
        </div>

        {/* Hover actions */}
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          display: 'flex', flexDirection: 'column', gap: '6px',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.18s',
        }}>
          {/* View detail — always visible to everyone */}
          {item.tmdb_id && (
            <button onClick={() => setPreview(true)} title="View details"
              style={{
                background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(184,160,255,0.35)',
                borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#b8a0ff',
              }}>
              <Eye size={13} />
            </button>
          )}
          {isAdmin && (
            <button onClick={() => onLog(item)} title="Log it now"
              style={{
                background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(130,255,31,0.35)',
                borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#82ff1f',
              }}>
              <PlayCircle size={14} />
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setConfirmOpen(true)} disabled={deleting} title="Remove"
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

        {/* "Later" ribbon */}
        <div style={{
          position: 'absolute', bottom: '8px', right: '8px',
          background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(184,160,255,0.3)',
          borderRadius: '100px', padding: '3px 8px',
          fontSize: '9px', color: '#b8a0ff',
          fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em',
        }}>
          later
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{
          fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
          lineHeight: 1.3, fontFamily: 'var(--ff-body)',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        } as React.CSSProperties}>
          {item.title}
        </div>

        {item.year && (
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
            {item.year}
          </div>
        )}

        {item.genres.length > 0 && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--ff-mono)', marginTop: '2px' }}>
            {item.genres.slice(0, 2).join(' · ')}
          </div>
        )}

        {item.tmdb_rating && (
          <div style={{ fontSize: '10px', color: '#fbbf24', fontFamily: 'var(--ff-mono)', marginTop: '2px' }}>
            ★ {item.tmdb_rating}
          </div>
        )}
      </div>
    </div>

    {confirmOpen && (
      <ConfirmModal
        title="Remove from Watch Later?"
        description={`"${item.title}" will be removed from your list.`}
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setConfirmOpen(false)}
      />
    )}

    {preview && item.tmdb_id && (
      <TMDBPreviewModal
        result={tmdbResult}
        mediaType={item.type === 'movie' ? 'movie' : 'tv'}
        onClose={() => setPreview(false)}
        onPick={() => setPreview(false)}
      />
    )}
    </>
  )
}
