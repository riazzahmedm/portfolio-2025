'use client'
import { useState } from 'react'
import { Trash2, PlayCircle, Eye } from 'lucide-react'
import { toast } from 'sonner'
import type { WatchlistItem, TMDBResult, WatchProvidersLite } from '@/lib/movies.types'
import ConfirmModal from '@/components/ui/ConfirmModal'
import TMDBPreviewModal from '@/components/movies/TMDBPreviewModal'
import { tiltProps, gyroRef } from '@/lib/tilt'

/** Up to three streaming logos (names in the tooltip), or a small "Rent · Buy" when it is only available to hire. */
function WhereToWatch({ info }: { info?: WatchProvidersLite | null }) {
  if (!info) return null
  if (info.streaming.length > 0) {
    const shown = info.streaming.slice(0, 3)
    const more  = info.streaming.length - shown.length
    const names = info.streaming.map(s => s.name).join(', ')
    return (
      <span title={`Streaming on ${names}`} aria-label={`Streaming on ${names}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', minWidth: 0 }}>
        {shown.map(s => (
          s.logo
            // eslint-disable-next-line @next/next/no-img-element
            ? <img key={s.name} src={s.logo} alt="" onError={e => { e.currentTarget.style.display = 'none' }} style={{ width: '18px', height: '18px', borderRadius: '5px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 2px 6px -2px rgba(0,0,0,0.7)' }} />
            : <span key={s.name} style={{ fontSize: '9px' }}>{s.name}</span>
        ))}
        {more > 0 && <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>+{more}</span>}
      </span>
    )
  }
  return info.rentBuy ? <span style={{ color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>Rent · Buy</span> : null
}

export default function WatchlistCard({
  item,
  isAdmin,
  onRemoved,
  onLog,
  providers,
}: {
  item:      WatchlistItem
  isAdmin?:  boolean
  onRemoved: (id: string) => void
  onLog:     (item: WatchlistItem) => void
  providers?: WatchProvidersLite | null   // undefined while loading or unknown
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
      className="tilt gc"
      ref={gyroRef}
      {...tiltProps}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ border: `1px solid ${hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}` }}
    >
      {item.poster_url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img className="gc-art" src={item.poster_url} alt={item.title} />
        : <div className="gc-fallback">🎬</div>
      }
      <div className="tilt-glare" />

      {/* Type badge */}
      <div className="gc-pill" style={{ color: item.type === 'movie' ? '#82ff1f' : '#b8a0ff' }}>{item.type}</div>

      {/* Hover actions */}
      <div style={{
        position: 'absolute', top: '10px', right: '10px', zIndex: 4,
        display: 'flex', flexDirection: 'column', gap: '6px',
        opacity: hovered ? 1 : 0, transition: 'opacity 0.18s',
      }}>
        {/* View detail — always visible to everyone */}
        {item.tmdb_id && (
          <button className="gc-btn" onClick={() => setPreview(true)} title="View details" style={{ color: '#b8a0ff' }}>
            <Eye size={13} />
          </button>
        )}
        {isAdmin && (
          <button className="gc-btn" onClick={() => onLog(item)} title="Log it now" style={{ color: '#82ff1f' }}>
            <PlayCircle size={14} />
          </button>
        )}
        {isAdmin && (
          <button className="gc-btn" onClick={() => setConfirmOpen(true)} disabled={deleting} title="Remove" style={{ color: '#ff6b6b' }}>
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Details plate */}
      <div className="gc-plate">
        <div className="gc-spec" />
        <div className="gc-title">{item.title}</div>

        {item.year && <div className="gc-sub">{item.year}</div>}

        {item.genres.length > 0 && (
          <div className="gc-sub" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.genres.slice(0, 2).join(' · ')}</div>
        )}

        <div className="gc-row">
          {item.tmdb_rating ? <span style={{ color: '#fbbf24', whiteSpace: 'nowrap', flex: 'none' }}>★ {Number(item.tmdb_rating).toFixed(1)}</span> : <span />}
          <WhereToWatch info={providers} />
        </div>
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
