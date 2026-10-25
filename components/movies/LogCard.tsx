'use client'
import { useState } from 'react'
import { Share2, Trash2, Pencil, RefreshCw, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { MovieLog, TMDBResult } from '@/lib/movies.types'
import { VIBES, PLATFORMS } from '@/lib/movies.types'
import StoryCardModal from './StoryCardModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import TMDBPreviewModal from './TMDBPreviewModal'
import { tiltProps, gyroRef } from '@/lib/tilt'

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

/** Month and day; the year only when it isn't this year, so it never wraps on a narrow card. */
function shortDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  const base = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return d.getFullYear() === new Date().getFullYear() ? base : `${base} ’${String(d.getFullYear()).slice(2)}`
}

function VibeBadge({ vibe }: { vibe: string }) {
  const v = VIBES.find(x => x.key === vibe)
  if (!v) return null
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '10px', fontFamily: 'var(--ff-body)',
      color: v.color, whiteSpace: 'nowrap', flex: '0 0 auto',
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
      fontSize: '9px', color: 'rgba(255,255,255,0.7)',
      fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em',
      whiteSpace: 'nowrap',
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
  showType = true,
  onDeleted,
  onEdit,
}: {
  log:        MovieLog
  isAdmin?:   boolean
  showType?:  boolean   // the Movie/Series badge is redundant when the list is already filtered by type
  onDeleted?: (id: string) => void
  onEdit?:    (log: MovieLog) => void
}) {
  const [showStory,   setShowStory]   = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const [hovered,     setHovered]     = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Shape MovieLog into TMDBResult for the preview modal
  const tmdbResult: TMDBResult | null = log.tmdb_id ? {
    id:            log.tmdb_id,
    title:         log.type === 'movie' ? log.title : undefined,
    name:          log.type !== 'movie' ? log.title : undefined,
    poster_path:   log.poster_url   ? log.poster_url.replace(/^https:\/\/image\.tmdb\.org\/t\/p\/\w+/, '')   : null,
    backdrop_path: log.backdrop_url ? log.backdrop_url.replace(/^https:\/\/image\.tmdb\.org\/t\/p\/\w+/, '') : null,
    release_date:   log.type === 'movie' && log.year ? `${log.year}-01-01` : undefined,
    first_air_date: log.type !== 'movie' && log.year ? `${log.year}-01-01` : undefined,
    genre_ids:     [],
    overview:      log.overview ?? '',
    vote_average:  log.tmdb_rating ?? 0,
  } : null

  // An episode-of-series = type 'episode' OR type 'series' with episode number filled
  const isEpisodeLog = log.type === 'episode' || (log.type === 'series' && log.episode != null)

  const seriesPrefix = isEpisodeLog
    ? `S${String(log.season ?? '').padStart(2, '0')}E${String(log.episode ?? '').padStart(2, '0')}`
    : null

  const subtitle = isEpisodeLog
    ? log.episode_title ?? ''
    : log.year?.toString() ?? ''

  async function confirmDelete() {
    setConfirmOpen(false)
    setDeleting(true)
    const res = await fetch(`/api/movies/${log.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Entry deleted', { description: log.title })
      onDeleted?.(log.id)
    } else {
      toast.error('Failed to delete — try again')
      setDeleting(false)
    }
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
        {log.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="gc-art" src={log.poster_url} alt={log.title} />
        ) : (
          <div className="gc-fallback">🎬</div>
        )}
        <div className="tilt-glare" />

        {/* Type badge */}
        {showType && <div className="gc-pill" style={{ color: TYPE_COLOR[log.type] }}>{TYPE_LABEL[log.type]}</div>}

        {/* Action buttons */}
        <div style={{
          position: 'absolute', top: '10px', right: '10px', zIndex: 4,
          display: 'flex', flexDirection: 'column', gap: '6px',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.18s',
        }}>
          {tmdbResult && (
            <button className="gc-btn" onClick={() => setShowPreview(true)} title="Quick preview" style={{ color: '#d6c8ff' }}>
              <Eye size={13} />
            </button>
          )}
          <button className="gc-btn" onClick={() => setShowStory(true)} title="Share to Instagram Story" style={{ color: '#ffffff' }}>
            <Share2 size={13} />
          </button>
          {isAdmin && onEdit && (
            <button className="gc-btn" onClick={() => onEdit(log)} title="Edit" style={{ color: '#d6c8ff' }}>
              <Pencil size={13} />
            </button>
          )}
          {isAdmin && (
            <button className="gc-btn" onClick={() => setConfirmOpen(true)} disabled={deleting} title="Delete" style={{ color: '#ff8585' }}>
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Rewatch badge — top-right (action buttons layer over it on hover) */}
        {log.rewatch && (
          <div className="gc-btn" style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 3, width: '28px', height: '28px',
            color: '#82ff1f', cursor: 'default', transition: 'opacity 0.18s', opacity: hovered ? 0 : 1,
          }}>
            <RefreshCw size={11} />
          </div>
        )}

        {/* Details plate */}
        <div className="gc-plate">
          <div className="gc-spec" />
          {seriesPrefix && <div className="gc-prefix">{seriesPrefix}</div>}

          <div className="gc-titlerow">
            <Link href={`/movies/${log.id}`} style={{ textDecoration: 'none' }}>
              <div className="gc-title">{log.title}</div>
            </Link>
            {log.favorite_person && (
              <span className="gc-avatar" title={`Favourite: ${log.favorite_person.name}`} aria-label={`Favourite: ${log.favorite_person.name}`}>
                {log.favorite_person.profile_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={log.favorite_person.profile_url} alt="" />
                  : '👤'}
              </span>
            )}
          </div>

          {(subtitle || log.vibe) && (
            <div className="gc-line">
              {subtitle && <span className="gc-sub">{subtitle}</span>}
              {log.vibe && <VibeBadge vibe={log.vibe} />}
            </div>
          )}

          <div className="gc-row">
            {log.platform ? <PlatformBadge platform={log.platform} /> : <span />}
            <span style={{ whiteSpace: 'nowrap' }}>{shortDate(log.watched_on)}</span>
          </div>
        </div>
      </div>

      {showStory && <StoryCardModal log={log} onClose={() => setShowStory(false)} />}

      {showPreview && tmdbResult && (
        <TMDBPreviewModal
          result={tmdbResult}
          mediaType={log.type === 'movie' ? 'movie' : 'tv'}
          onClose={() => setShowPreview(false)}
          onPick={() => setShowPreview(false)}
        />
      )}

      {confirmOpen && (
        <ConfirmModal
          title="Delete entry?"
          description={`"${log.title}" will be permanently removed.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  )
}
