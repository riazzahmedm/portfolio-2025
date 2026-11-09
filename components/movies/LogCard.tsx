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
import PlatformIcon from './PlatformIcon'
import { placeLine, screenFormatLabel } from '@/lib/places'
import { PLACE_VIBES, TIMINGS } from '@/lib/places-core'
import { useTapReveal } from './useTapReveal'

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

/** Whether the badge needs words: only a theatre with a saved name does. Streaming logos speak for themselves. */
const hasPlatformLabel = (log: MovieLog) => log.platform === 'theatre' && !!log.place

function PlatformBadge({ platform, log }: { platform: string; log: MovieLog }) {
  const p = PLATFORMS.find(x => x.key === platform)
  if (!p || p.key === 'unofficial') return null   // never shown on the card
  const withLabel = hasPlatformLabel(log)
  // A theatre visit shows which theatre (and the format, when there is one)
  const format = platform === 'theatre' ? screenFormatLabel(log.screen_format) : null
  const label  = log.place?.name ?? ''   // the format and city are in the tooltip, so the name has room on a narrow card
  const tvibe  = PLACE_VIBES.find(v => v.key === log.theatre_vibe)
  const ttime  = TIMINGS.find(t => t.key === log.theatre_timing)
  const full   = platform === 'theatre' ? [placeLine(log.place), format, ttime ? `${ttime.label} show` : null, tvibe ? `${tvibe.emoji} ${tvibe.label}` : null].filter(Boolean).join(' · ') || p.label : p.label
  return (
    <div title={full} aria-label={full} style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px', minWidth: 0,
      fontSize: withLabel ? '10.5px' : '9px', color: 'rgba(255,255,255,0.9)',
      fontFamily: withLabel ? 'var(--ff-body)' : 'var(--ff-mono)', letterSpacing: withLabel ? '0.01em' : '0.08em',
      whiteSpace: 'nowrap',
    }}>
      <PlatformIcon platform={p} size={withLabel ? 13 : 16} />
      {withLabel && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{label}</span>}
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
  const { setBox, showing: hovered, bind } = useTapReveal()
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
        ref={el => { gyroRef(el); setBox(el) }}
        {...tiltProps}
        {...bind}
        style={{ border: `1px solid ${hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}` }}
      >
        {log.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="gc-art" src={log.poster_url} alt={log.title} />
        ) : (
          <div className="gc-fallback">🎬</div>
        )}
        <div className="tilt-glare" />

        {/* Top-left pill: where it was watched, plus Series/Episode when the list mixes types */}
        {(() => {
          const typeTag = showType && log.type !== 'movie'
          const via     = log.platform && log.platform !== 'unofficial'
          if (!typeTag && !via) return null
          // A streaming logo is already a rounded tile, so it sits on the poster bare, lifted by a shadow and a faint ring
          const logoOnly = !typeTag && via && !hasPlatformLabel(log) && PLATFORMS.find(x => x.key === log.platform)?.logo
          if (logoOnly) {
            const lp = PLATFORMS.find(x => x.key === log.platform)!
            return (
              <div title={lp.label} aria-label={lp.label} style={{
                position: 'absolute', top: '10px', left: '10px', zIndex: 2, display: 'flex',
                width: '26px', height: '26px', borderRadius: '7px',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.28), 0 4px 12px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)',
              }}>
                <PlatformIcon platform={lp} size={26} />
              </div>
            )
          }
          return (
            <div className="gc-pill" style={{ display: 'flex', alignItems: 'center', gap: '7px', maxWidth: 'calc(100% - 20px)', textTransform: 'none', letterSpacing: '0.06em', ...(hasPlatformLabel(log) ? { padding: '4px 9px' } : null), ...(!typeTag && !hasPlatformLabel(log) ? { padding: '5px' } : null) }}>
              {typeTag && <span style={{ color: TYPE_COLOR[log.type], textTransform: 'uppercase', letterSpacing: '0.18em' }}>{TYPE_LABEL[log.type]}</span>}
              {via && <PlatformBadge platform={log.platform!} log={log} />}
            </div>
          )
        })()}

        {/* Action buttons */}
        <div style={{
          position: 'absolute', top: '10px', right: '10px', zIndex: 4,
          display: 'flex', flexDirection: 'column', gap: '6px',
          opacity: hovered ? 1 : 0, pointerEvents: hovered ? 'auto' : 'none', transition: 'opacity 0.18s',
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
