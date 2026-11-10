'use client'
import { useState } from 'react'
import { Trash2, PlayCircle, Eye } from 'lucide-react'
import { toast } from 'sonner'
import type { WatchlistItem, TMDBResult, WatchProvidersLite } from '@/lib/movies.types'
import ConfirmModal from '@/components/ui/ConfirmModal'
import TMDBPreviewModal from '@/components/movies/TMDBPreviewModal'
import { tiltProps, gyroRef } from '@/lib/tilt'
import { useTapReveal } from './useTapReveal'

const LOGO_SHADOW = '0 0 0 1px rgba(255,255,255,0.28), 0 4px 12px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)'

/**
 * Where to watch, top-left of the poster: up to three streaming logos (names in the tooltip) on the poster, bare like the
 * log cards' platform logo, or a small "Rent · Buy" pill when it can only be hired. Series also get a "Series" tag; movies
 * need none. Renders nothing while the lookup is pending or when there is nothing to say.
 */
function Availability({ info, series }: { info?: WatchProvidersLite | null; series: boolean }) {
  const streaming = info?.streaming ?? []
  const shown = streaming.slice(0, 3)
  const more  = streaming.length - shown.length
  const names = streaming.map(s => s.name).join(', ')
  const pill: React.CSSProperties = { color: 'rgba(255,255,255,0.85)', textTransform: 'none', letterSpacing: '0.06em', fontSize: '10px' }
  if (!series && !info) return null
  if (!series && streaming.length === 0 && !info?.rentBuy) return null

  return (
    <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', zIndex: 2, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', pointerEvents: 'none' }}>
      {series && <span className="gc-pill" style={{ position: 'static', color: '#b8a0ff' }}>Series</span>}
      {shown.length > 0 ? (
        <span title={`Streaming on ${names}`} aria-label={`Streaming on ${names}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          {shown.map(s => (
            s.logo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img key={s.name} src={s.logo} alt="" onError={e => { e.currentTarget.style.display = 'none' }} style={{ width: '26px', height: '26px', borderRadius: '7px', objectFit: 'cover', boxShadow: LOGO_SHADOW }} />
              : <span key={s.name} className="gc-pill" style={{ position: 'static', ...pill }}>{s.name}</span>
          ))}
          {more > 0 && <span className="gc-pill" style={{ position: 'static', padding: '4px 8px', ...pill }}>+{more}</span>}
        </span>
      ) : info?.rentBuy ? (
        <span className="gc-pill" style={{ position: 'static', ...pill }} title="Available to rent or buy">Rent · Buy</span>
      ) : null}
    </div>
  )
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
  const { setBox, showing: hovered, bind } = useTapReveal()
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
      ref={el => { gyroRef(el); setBox(el) }}
      {...tiltProps}
      {...bind}
      style={{ border: `1px solid ${hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}` }}
    >
      {item.poster_url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img className="gc-art" src={item.poster_url} alt={item.title} />
        : <div className="gc-fallback">🎬</div>
      }
      <div className="tilt-glare" />

      {/* Where to watch (and a Series tag for series) */}
      <Availability info={providers} series={item.type === 'series'} />

      {/* Actions: hover with a mouse, tap the card on a touch screen */}
      <div style={{
        position: 'absolute', top: '10px', right: '10px', zIndex: 4,
        display: 'flex', flexDirection: 'column', gap: '6px',
        opacity: hovered ? 1 : 0, pointerEvents: hovered ? 'auto' : 'none', transition: 'opacity 0.18s',
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
