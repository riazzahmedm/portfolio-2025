'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, X, ChevronDown, Check, RefreshCw, Eye } from 'lucide-react'
import { toast } from 'sonner'
import type { LogType, LogStatus, TMDBResult, TMDBEpisode, FavoritePerson, MovieLog } from '@/lib/movies.types'
import DatePicker from './DatePicker'
import TMDBPreviewModal from './TMDBPreviewModal'
import { VIBES, PLATFORMS, DRAWS } from '@/lib/movies.types'

// ── Shared style helpers ────────────────────────────────────────────────────
const TMDB_IMG = (path: string | null, size = 'w92') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null

const INPUT: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#fff',
  fontSize: '14px', fontFamily: 'var(--ff-body)',
  outline: 'none', boxSizing: 'border-box',
}

const LABEL: React.CSSProperties = {
  fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-mono)',
  marginBottom: '10px', display: 'block',
}

const SECTION: React.CSSProperties = {
  borderTop: '1px solid rgba(255,255,255,0.06)',
  paddingTop: '22px',
}

// ── Types ────────────────────────────────────────────────────────────────────
interface TMDBPersonRaw {
  id: number; name: string; role: string; profile_path: string | null; dept: string
}

interface FormState {
  vibe:     string
  review:   string
  overview: string
  watchedOn:string
  status:   LogStatus
  platform: string
  draws:    string[]
  rewatch:  boolean
}

const blank: FormState = {
  vibe: '', review: '', overview: '',
  watchedOn: new Date().toISOString().split('T')[0],
  status: 'watched', platform: '', draws: [], rewatch: false,
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span style={LABEL}>{children}</span>
}

function VibeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {VIBES.map(v => {
        const on = value === v.key
        return (
          <button
            key={v.key} type="button"
            title={v.sub}
            onClick={() => onChange(on ? '' : v.key)}
            style={{
              display:    'flex', alignItems: 'center', gap: '6px',
              padding:    '9px 16px', borderRadius: '100px', cursor: 'pointer',
              border:     `1px solid ${on ? v.color + '66' : 'rgba(255,255,255,0.08)'}`,
              background: on ? v.color + '1a' : 'rgba(255,255,255,0.02)',
              color:      on ? v.color : 'rgba(255,255,255,0.45)',
              fontSize:   '13px', fontFamily: 'var(--ff-body)',
              transition: 'all 0.18s', fontWeight: on ? 600 : 400,
            }}
          >
            <span>{v.emoji}</span>
            <span>{v.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function PlatformSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {PLATFORMS.map(p => {
        const on = value === p.key
        return (
          <button
            key={p.key} type="button"
            title={p.label}
            onClick={() => onChange(on ? '' : p.key)}
            style={{
              display:    'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap:        '4px',
              width:      p.logo ? '56px' : 'auto',
              minWidth:   p.logo ? '56px' : '64px',
              height:     '56px',
              padding:    p.logo ? '0' : '0 14px',
              borderRadius: '12px', cursor: 'pointer',
              border:     `1px solid ${on ? 'rgba(184,160,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
              background: on ? 'rgba(184,160,255,0.14)' : 'rgba(255,255,255,0.03)',
              transition: 'all 0.18s', flexShrink: 0,
            }}
          >
            {p.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.logo} alt={p.label} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }} />
            ) : (
              <>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{p.emoji}</span>
                <span style={{ fontSize: '9px', color: on ? '#b8a0ff' : 'rgba(255,255,255,0.4)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                  {p.label.toUpperCase()}
                </span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}

function DrawsSelector({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  function toggle(key: string) {
    onChange(value.includes(key) ? value.filter(k => k !== key) : [...value, key])
  }
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {DRAWS.map(d => {
        const on = value.includes(d.key)
        return (
          <button
            key={d.key} type="button"
            onClick={() => toggle(d.key)}
            style={{
              display:    'flex', alignItems: 'center', gap: '5px',
              padding:    '7px 14px', borderRadius: '100px', cursor: 'pointer',
              border:     `1px solid ${on ? 'rgba(130,255,31,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: on ? 'rgba(130,255,31,0.08)' : 'rgba(255,255,255,0.02)',
              color:      on ? '#82ff1f' : 'rgba(255,255,255,0.45)',
              fontSize:   '12px', fontFamily: 'var(--ff-body)',
              transition: 'all 0.18s',
            }}
          >
            <span>{d.emoji}</span>
            <span>{d.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function PersonGrid({
  people,
  selected,
  onSelect,
}: {
  people:   TMDBPersonRaw[]
  selected: FavoritePerson | null
  onSelect: (p: FavoritePerson | null) => void
}) {
  if (!people.length) return null

  const crew  = people.filter(p => p.dept === 'Crew')
  const cast  = people.filter(p => p.dept === 'Cast')

  function PersonCard({ p }: { p: TMDBPersonRaw }) {
    const isSelected = selected?.id === p.id
    const thumb      = TMDB_IMG(p.profile_path, 'w185')

    return (
      <button
        type="button"
        title={`${p.name} — ${p.role}`}
        onClick={() => onSelect(isSelected ? null : {
          id:          p.id,
          name:        p.name,
          role:        p.role,
          profile_url: TMDB_IMG(p.profile_path, 'w185'),
        })}
        style={{
          display:        'flex', flexDirection: 'column', alignItems: 'center',
          gap:            '6px', cursor: 'pointer',
          background:     isSelected ? 'rgba(184,160,255,0.1)' : 'transparent',
          border:         `2px solid ${isSelected ? '#b8a0ff' : 'transparent'}`,
          borderRadius:   '12px', padding: '8px 6px',
          transition:     'all 0.18s', minWidth: '72px',
        }}
      >
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          overflow: 'hidden', background: '#0a0a0a', flexShrink: 0,
          border: isSelected ? '2px solid #b8a0ff' : '2px solid rgba(255,255,255,0.08)',
        }}>
          {thumb
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={thumb} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', color: 'rgba(255,255,255,0.2)',
              }}>
                👤
              </div>
            )
          }
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '10px', fontWeight: 600, color: isSelected ? '#b8a0ff' : 'rgba(255,255,255,0.75)',
            fontFamily: 'var(--ff-body)', lineHeight: 1.2,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            maxWidth: '72px',
          } as React.CSSProperties}>
            {p.name}
          </div>
          <div style={{
            fontSize: '9px', color: 'rgba(255,255,255,0.3)',
            fontFamily: 'var(--ff-mono)', marginTop: '2px',
            overflow: 'hidden', whiteSpace: 'nowrap',
            textOverflow: 'ellipsis', maxWidth: '72px',
          }}>
            {p.role}
          </div>
        </div>
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {crew.length > 0 && (
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Crew
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {crew.map(p => <PersonCard key={`${p.id}-${p.role}`} p={p} />)}
          </div>
        </div>
      )}
      {cast.length > 0 && (
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Cast
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {cast.map(p => <PersonCard key={`${p.id}-${p.role}`} p={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main form ────────────────────────────────────────────────────────────────
export default function AdminForm({
  onSuccess,
  initialLog,
  preSelectedTmdb,
}: {
  onSuccess:        () => void
  initialLog?:      MovieLog
  preSelectedTmdb?: { id: number; title: string; poster_url: string | null; type: 'movie' | 'series' }
}) {
  const isEdit = !!initialLog

  const [type,            setType]            = useState<LogType>(initialLog?.type ?? preSelectedTmdb?.type ?? 'movie')
  const [query,           setQuery]           = useState(preSelectedTmdb?.title ?? '')
  const [results,         setResults]         = useState<TMDBResult[]>([])
  const [selected,        setSelected]        = useState<TMDBResult | null>(null)
  const [seasons,         setSeasons]         = useState<number[]>([])
  const [selectedSeason,  setSelectedSeason]  = useState<number | null>(initialLog?.season ?? null)
  const [episodes,        setEpisodes]        = useState<TMDBEpisode[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState<TMDBEpisode | null>(null)
  const [people,          setPeople]          = useState<TMDBPersonRaw[]>([])
  const [favPerson,       setFavPerson]       = useState<FavoritePerson | null>(initialLog?.favorite_person ?? null)
  const [loadingPeople,   setLoadingPeople]   = useState(false)
  const [form,            setForm]            = useState<FormState>(initialLog ? {
    vibe:      initialLog.vibe ?? '',
    review:    initialLog.review ?? '',
    overview:  initialLog.overview ?? '',
    watchedOn: initialLog.watched_on,
    status:    initialLog.status,
    platform:  initialLog.platform ?? '',
    draws:     initialLog.draws ?? [],
    rewatch:   initialLog.rewatch ?? false,
  } : blank)
  const [editTmdbOverride, setEditTmdbOverride] = useState<TMDBResult | null>(null)
  const [editQuery,        setEditQuery]        = useState('')
  const [editResults,      setEditResults]      = useState<TMDBResult[]>([])
  const [previewItem,      setPreviewItem]      = useState<TMDBResult | null>(null)
  const [submitting,       setSubmitting]       = useState(false)
  const [error,            setError]            = useState('')
  const debounce    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced TMDB search for edit mode title override
  useEffect(() => {
    if (!isEdit || !editQuery || editTmdbOverride) { setEditResults([]); return }
    if (editDebounce.current) clearTimeout(editDebounce.current)
    const tmdbType = type === 'movie' ? 'movie' : 'tv'
    editDebounce.current = setTimeout(async () => {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(editQuery)}&type=${tmdbType}`)
      setEditResults(await res.json())
    }, 380)
    return () => { if (editDebounce.current) clearTimeout(editDebounce.current) }
  }, [isEdit, editQuery, editTmdbOverride, type])

  // Pre-select a TMDB item when coming from Watch Later
  useEffect(() => {
    if (!preSelectedTmdb || isEdit) return
    const tmdbType = preSelectedTmdb.type === 'movie' ? 'movie' : 'tv'
    fetch(`/api/tmdb/search?q=${preSelectedTmdb.id}&type=${tmdbType}`)
      .then(r => r.json())
      .then((results: TMDBResult[]) => { if (results[0]) pick(results[0]) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // In edit mode, fetch cast/crew — re-runs when TMDB override is picked
  useEffect(() => {
    if (!isEdit) return
    const tmdbId   = editTmdbOverride?.id ?? initialLog?.tmdb_id
    const tmdbType = type === 'movie' ? 'movie' : 'tv'
    if (!tmdbId) return
    setLoadingPeople(true)
    setFavPerson(null)
    fetch(`/api/tmdb/credits?id=${tmdbId}&type=${tmdbType}`)
      .then(r => r.json())
      .then(d => { setPeople(d); setLoadingPeople(false) })
      .catch(() => setLoadingPeople(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTmdbOverride])

  const tmdbType = type === 'movie' ? 'movie' : 'tv'

  // Debounced TMDB search
  useEffect(() => {
    if (!query || selected) { setResults([]); return }
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&type=${tmdbType}`)
      setResults(await res.json())
    }, 380)
    return () => { if (debounce.current) clearTimeout(debounce.current) }
  }, [query, tmdbType, selected])

  // Fetch season count when TV selected
  useEffect(() => {
    if (!selected || type === 'movie') return
    fetch(`/api/tmdb/season?id=${selected.id}`)
      .then(r => r.json())
      .then(d => {
        const count = d.number_of_seasons ?? 1
        setSeasons(Array.from({ length: count }, (_, i) => i + 1))
      })
  }, [selected, type])

  // Fetch episodes when season + episode type
  useEffect(() => {
    if (!selected || !selectedSeason || type === 'movie') return
    fetch(`/api/tmdb/season?id=${selected.id}&season=${selectedSeason}`)
      .then(r => r.json())
      .then(d => setEpisodes(d.episodes ?? []))
  }, [selected, selectedSeason, type])

  // Fetch cast & crew whenever a title is selected
  useEffect(() => {
    if (!selected) { setPeople([]); setFavPerson(null); return }
    setLoadingPeople(true)
    fetch(`/api/tmdb/credits?id=${selected.id}&type=${tmdbType}`)
      .then(r => r.json())
      .then(d => { setPeople(d); setLoadingPeople(false) })
      .catch(() => setLoadingPeople(false))
  }, [selected, tmdbType])

  function pick(r: TMDBResult) {
    setSelected(r); setQuery(r.title ?? r.name ?? ''); setResults([])
  }

  function clear() {
    setSelected(null); setQuery(''); setResults([])
    setSeasons([]); setSelectedSeason(null)
    setEpisodes([]); setSelectedEpisode(null)
    setPeople([]); setFavPerson(null)
  }

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEdit && !selected) { setError('Select a title first'); return }
    setSubmitting(true); setError('')

    if (isEdit) {
      // PATCH — only update personal fields
      const patch = {
        type,
        ...(editTmdbOverride ? {
          tmdb_id:      editTmdbOverride.id,
          title:        editTmdbOverride.title ?? editTmdbOverride.name,
          poster_url:   editTmdbOverride.poster_path   ? `https://image.tmdb.org/t/p/w500${editTmdbOverride.poster_path}`   : initialLog!.poster_url,
          backdrop_url: editTmdbOverride.backdrop_path ? `https://image.tmdb.org/t/p/w1280${editTmdbOverride.backdrop_path}` : initialLog!.backdrop_url,
          year:         editTmdbOverride.release_date   ? new Date(editTmdbOverride.release_date).getFullYear()   :
                        editTmdbOverride.first_air_date ? new Date(editTmdbOverride.first_air_date).getFullYear() : initialLog!.year,
        } : {}),
        vibe:            form.vibe || null,
        review:          form.review.trim() || null,
        overview:        form.overview.trim() || null,
        watched_on:      form.watchedOn,
        platform:        form.platform || null,
        favorite_person: favPerson ?? null,
        draws:           form.draws,
        season:          selectedSeason ?? initialLog!.season ?? null,
        episode:         selectedEpisode?.episode_number ?? initialLog!.episode ?? null,
        episode_title:   selectedEpisode?.name ?? initialLog!.episode_title ?? null,
        status:          form.status,
        tags:            [],
        rewatch:         form.rewatch,
      }
      const res = await fetch(`/api/movies/${initialLog!.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (res.ok) {
        toast.success('Entry updated', { description: patch.title as string })
        onSuccess()
      } else {
        const d = await res.json()
        const msg = d.error ?? 'Something went wrong'
        setError(msg)
        toast.error('Update failed', { description: msg })
      }
      setSubmitting(false)
      return
    }

    // POST — new entry
    const year =
      selected!.release_date   ? new Date(selected!.release_date).getFullYear()   :
      selected!.first_air_date ? new Date(selected!.first_air_date).getFullYear() : null

    const body = {
      type,
      tmdb_id:         selected!.id,
      title:           selected!.title ?? selected!.name,
      poster_url:      TMDB_IMG(selected!.poster_path, 'w500'),
      backdrop_url:    TMDB_IMG(selected!.backdrop_path, 'w1280'),
      year,
      genres:          [],
      vibe:            form.vibe || null,
      review:          form.review.trim() || null,
      watched_on:      form.watchedOn,
      platform:        form.platform || null,
      favorite_person: favPerson ?? null,
      draws:           form.draws,
      season:          selectedSeason ?? null,
      episode:         selectedEpisode?.episode_number ?? null,
      episode_title:   selectedEpisode?.name ?? null,
      status:          form.status,
      tags:            [],
      rewatch:         form.rewatch,
      source:          'manual',
    }

    const res = await fetch('/api/movies', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      toast.success('Logged!', { description: body.title as string })
      clear(); setForm(blank); onSuccess()
    } else {
      const d = await res.json()
      const msg = d.error ?? 'Something went wrong'
      setError(msg)
      toast.error('Failed to log', { description: msg })
    }
    setSubmitting(false)
  }

  const posterThumb = selected?.poster_path ? TMDB_IMG(selected.poster_path, 'w185') : null

  return (
    <>
    {previewItem && (
      <TMDBPreviewModal
        result={previewItem}
        mediaType={type === 'movie' ? 'movie' : 'tv'}
        onClose={() => setPreviewItem(null)}
        onPick={r => {
          if (isEdit) {
            setEditTmdbOverride(r)
            setEditQuery(r.title ?? r.name ?? '')
            setEditResults([])
            if (r.overview) setField('overview', r.overview)
          } else {
            pick(r)
          }
          setPreviewItem(null)
        }}
        onWatchLater={async (r, genres) => {
          const year = r.release_date   ? new Date(r.release_date).getFullYear()   :
                       r.first_air_date ? new Date(r.first_air_date).getFullYear() : null
          const title = r.title ?? r.name ?? 'Title'
          const res = await fetch('/api/watchlist', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tmdb_id:     r.id,
              type:        type === 'movie' ? 'movie' : 'series',
              title,
              poster_url:  r.poster_path   ? `https://image.tmdb.org/t/p/w500${r.poster_path}`   : null,
              backdrop_url:r.backdrop_path ? `https://image.tmdb.org/t/p/w1280${r.backdrop_path}` : null,
              year,
              overview:    r.overview ?? null,
              genres,
              tmdb_rating: r.vote_average ?? null,
            }),
          })
          if (res.ok) {
            toast.success(`Added to Watch Later`, {
              description: title,
            })
          } else {
            toast.error('Failed to save — try again')
          }
          setPreviewItem(null)
        }}
      />
    )}
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── In edit mode: locked title preview + type selector ── */}
      {isEdit ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(184,160,255,0.06)', border: '1px solid rgba(184,160,255,0.18)', borderRadius: '12px', padding: '14px' }}>
            {(editTmdbOverride?.poster_path ? `https://image.tmdb.org/t/p/w185${editTmdbOverride.poster_path}` : initialLog!.poster_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={editTmdbOverride?.poster_path ? `https://image.tmdb.org/t/p/w185${editTmdbOverride.poster_path}` : initialLog!.poster_url!}
                alt="" style={{ width: '48px', height: '72px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
                {editTmdbOverride ? (editTmdbOverride.title ?? editTmdbOverride.name) : initialLog!.title}
              </div>
              {(editTmdbOverride?.overview ?? initialLog!.overview) ? (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-body)', marginTop: '4px', lineHeight: 1.5,
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                } as React.CSSProperties}>
                  {editTmdbOverride?.overview ?? initialLog!.overview}
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--ff-mono)', marginTop: '3px' }}>
                  {initialLog!.year}
                </div>
              )}
            </div>
            <Check size={16} color="#82ff1f" style={{ marginTop: '2px', flexShrink: 0 }} />
          </div>
          {/* Episode info — read-only pill when season/episode is stored */}
          {initialLog!.season != null && initialLog!.episode != null && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(184,160,255,0.06)',
              border: '1px solid rgba(184,160,255,0.18)',
              borderRadius: '10px', padding: '10px 14px',
            }}>
              <span style={{
                fontSize: '11px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.14em',
                color: '#b8a0ff', fontWeight: 700,
              }}>
                S{String(initialLog!.season).padStart(2, '0')}E{String(initialLog!.episode).padStart(2, '0')}
              </span>
              {initialLog!.episode_title && (
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--ff-body)' }}>
                  {initialLog!.episode_title}
                </span>
              )}
            </div>
          )}

          <div>
            <SectionLabel>Type</SectionLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['movie', 'series', 'episode'] as LogType[]).map(t => {
                const on = type === t
                return (
                  <button key={t} type="button" onClick={() => setType(t)}
                    style={{
                      padding: '8px 18px', borderRadius: '100px', cursor: 'pointer',
                      border: `1px solid ${on ? 'rgba(184,160,255,0.45)' : 'rgba(255,255,255,0.08)'}`,
                      background: on ? 'rgba(184,160,255,0.12)' : 'transparent',
                      color: on ? '#b8a0ff' : 'rgba(255,255,255,0.4)',
                      fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase',
                      fontFamily: 'var(--ff-mono)', transition: 'all 0.18s',
                    }}>
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
          {/* TMDB title search for edit mode */}
          <div style={{ position: 'relative' }}>
            <SectionLabel>Wrong title? Search TMDB to replace</SectionLabel>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
              <input
                value={editQuery}
                onChange={e => { setEditQuery(e.target.value); setEditTmdbOverride(null) }}
                placeholder={`Search TMDB for correct title…`}
                style={{ ...INPUT, paddingLeft: '36px', paddingRight: editTmdbOverride ? '36px' : '14px' }}
              />
              {editTmdbOverride && (
                <button type="button" onClick={() => { setEditTmdbOverride(null); setEditQuery('') }}
                  style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px' }}>
                  <X size={14} />
                </button>
              )}
            </div>
            {editResults.length > 0 && !editTmdbOverride && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
                background: '#141414', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', overflow: 'hidden',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              }}>
                {editResults.map(r => {
                  const year  = (r.release_date ?? r.first_air_date ?? '').slice(0, 4)
                  const thumb = r.poster_path ? `https://image.tmdb.org/t/p/w92${r.poster_path}` : null
                  return (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <button type="button"
                        onClick={() => {
                          setEditTmdbOverride(r)
                          setEditQuery(r.title ?? r.name ?? '')
                          setEditResults([])
                          if (r.overview) setField('overview', r.overview)
                        }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#fff' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        <div style={{ width: '32px', height: '48px', borderRadius: '4px', background: '#0a0a0a', flexShrink: 0, overflow: 'hidden' }}>
                          {thumb
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎬</div>
                          }
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>{r.title ?? r.name}</div>
                          {year && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-mono)' }}>{year}</div>}
                        </div>
                      </button>
                      <button type="button" onClick={() => setPreviewItem(r)}
                        title="Preview"
                        style={{ padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#b8a0ff' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.25)' }}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ── Type ── */}
          <div>
            <SectionLabel>Type</SectionLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['movie', 'series'] as LogType[]).map(t => {
                const on = type === t
                return (
                  <button key={t} type="button" onClick={() => { setType(t); clear() }}
                    style={{
                      padding: '8px 18px', borderRadius: '100px', cursor: 'pointer',
                      border: `1px solid ${on ? 'rgba(184,160,255,0.45)' : 'rgba(255,255,255,0.08)'}`,
                      background: on ? 'rgba(184,160,255,0.12)' : 'transparent',
                      color: on ? '#b8a0ff' : 'rgba(255,255,255,0.4)',
                      fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase',
                      fontFamily: 'var(--ff-mono)', transition: 'all 0.18s',
                    }}>
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── TMDB search ── */}
          <div style={{ position: 'relative' }}>
            <SectionLabel>Search {type === 'movie' ? 'Movie' : 'TV Show'}</SectionLabel>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); if (selected) setSelected(null) }}
                placeholder="Search TMDB…"
                style={{ ...INPUT, paddingLeft: '36px', paddingRight: selected ? '36px' : '14px' }}
              />
              {selected && (
                <button type="button" onClick={clear} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {results.length > 0 && !selected && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
                background: '#141414', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', overflow: 'hidden',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              }}>
                {results.map(r => {
                  const year  = (r.release_date ?? r.first_air_date ?? '').slice(0, 4)
                  const thumb = TMDB_IMG(r.poster_path, 'w92')
                  return (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <button type="button" onClick={() => pick(r)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#fff' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        <div style={{ width: '32px', height: '48px', borderRadius: '4px', background: '#0a0a0a', flexShrink: 0, overflow: 'hidden' }}>
                          {thumb
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎬</div>
                          }
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>{r.title ?? r.name}</div>
                          {year && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-mono)' }}>{year}</div>}
                        </div>
                      </button>
                      <button type="button" onClick={() => setPreviewItem(r)}
                        title="Preview"
                        style={{ padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#b8a0ff' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.25)' }}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Selected preview ── */}
          {selected && (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(184,160,255,0.06)', border: '1px solid rgba(184,160,255,0.18)', borderRadius: '12px', padding: '14px' }}>
              {posterThumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={posterThumb} alt="" style={{ width: '48px', height: '72px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>{selected.title ?? selected.name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-mono)', marginTop: '3px' }}>
                  {(selected.release_date ?? selected.first_air_date ?? '').slice(0, 4)}
                  {selected.vote_average ? ` · TMDB ${selected.vote_average.toFixed(1)}` : ''}
                </div>
                {selected.overview && (
                  <div style={{
                    fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-body)',
                    marginTop: '6px', lineHeight: 1.5,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                  } as React.CSSProperties}>
                    {selected.overview}
                  </div>
                )}
              </div>
              <Check size={16} color="#82ff1f" style={{ marginTop: '2px', flexShrink: 0 }} />
            </div>
          )}
        </>
      )}

      {/* ── Season ── */}
      {type !== 'movie' && selected && seasons.length > 0 && (
        <div>
          <SectionLabel>Season</SectionLabel>
          <div style={{ position: 'relative' }}>
            <select value={selectedSeason ?? ''} onChange={e => { setSelectedSeason(Number(e.target.value)); setSelectedEpisode(null) }}
              style={{ ...INPUT, appearance: 'none', paddingRight: '36px' }}>
              <option value="">— pick a season —</option>
              {seasons.map(s => <option key={s} value={s}>Season {s}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          </div>
        </div>
      )}

      {/* ── Episode ── */}
      {type !== 'movie' && episodes.length > 0 && (
        <div>
          <SectionLabel>Episode</SectionLabel>
          <div style={{ position: 'relative' }}>
            <select value={selectedEpisode?.episode_number ?? ''} onChange={e => setSelectedEpisode(episodes.find(ep => ep.episode_number === Number(e.target.value)) ?? null)}
              style={{ ...INPUT, appearance: 'none', paddingRight: '36px' }}>
              <option value="">— pick an episode —</option>
              {episodes.map(ep => (
                <option key={ep.episode_number} value={ep.episode_number}>
                  E{String(ep.episode_number).padStart(2, '0')} — {ep.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── Vibe ── */}
      <div style={SECTION}>
        <SectionLabel>How was it?</SectionLabel>
        <VibeSelector value={form.vibe} onChange={v => setField('vibe', v)} />
      </div>

      {/* ── Platform ── */}
      <div style={SECTION}>
        <SectionLabel>Watched on</SectionLabel>
        <PlatformSelector value={form.platform} onChange={v => setField('platform', v)} />
      </div>

      {/* ── Favorite person ── */}
      <div style={SECTION}>
        <SectionLabel>
          {loadingPeople ? 'Loading cast & crew…' : selected ? 'Who was your favourite?' : 'Select a title to pick your favourite'}
        </SectionLabel>
        {loadingPeople && (
          <div style={{ display: 'flex', gap: '12px', opacity: 0.4 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.6s ease infinite' }} />
                <div style={{ width: '56px', height: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.6s ease infinite' }} />
              </div>
            ))}
          </div>
        )}
        {!loadingPeople && people.length > 0 && (
          <PersonGrid people={people} selected={favPerson} onSelect={setFavPerson} />
        )}
        {!loadingPeople && !selected && (
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--ff-mono)' }}>
            Cast &amp; crew will appear after selecting a title above.
          </div>
        )}
        {favPerson && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(184,160,255,0.08)', border: '1px solid rgba(184,160,255,0.2)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              {favPerson.profile_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={favPerson.profile_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
              }
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#b8a0ff', fontFamily: 'var(--ff-body)' }}>{favPerson.name}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--ff-mono)' }}>{favPerson.role}</div>
            </div>
            <button type="button" onClick={() => setFavPerson(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* ── What drew you ── */}
      <div style={SECTION}>
        <SectionLabel>What drew you to it? (pick all that apply)</SectionLabel>
        <DrawsSelector value={form.draws} onChange={v => setField('draws', v)} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── Synopsis (edit mode only) ── */}
      {isEdit && (
        <div style={SECTION}>
          <SectionLabel>Synopsis</SectionLabel>
          <textarea value={form.overview} onChange={e => setField('overview', e.target.value)} rows={4}
            placeholder="Plot summary…"
            style={{ ...INPUT, resize: 'vertical', lineHeight: 1.55 }} />
        </div>
      )}

      {/* ── Review ── */}
      <div style={SECTION}>
        <SectionLabel>Your take (optional)</SectionLabel>
        <textarea value={form.review} onChange={e => setField('review', e.target.value)} rows={3}
          placeholder="Thoughts, feelings, spoilers…"
          style={{ ...INPUT, resize: 'vertical', lineHeight: 1.55 }} />
      </div>

      {/* ── Date watched (full width) ── */}
      <div>
        <SectionLabel>Date watched</SectionLabel>
        <DatePicker value={form.watchedOn} onChange={v => setField('watchedOn', v)} />
      </div>

      {/* ── Status + Rewatch (same row) ── */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <SectionLabel>Status</SectionLabel>
          <div style={{ position: 'relative' }}>
            <select value={form.status} onChange={e => setField('status', e.target.value as LogStatus)}
              style={{ ...INPUT, appearance: 'none', paddingRight: '36px' }}>
              <option value="watched">Watched</option>
              <option value="watching">Watching</option>
              <option value="dropped">Dropped</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          </div>
        </div>
        <button type="button" onClick={() => setField('rewatch', !form.rewatch)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 16px', borderRadius: '10px', flexShrink: 0,
            border: `1px solid ${form.rewatch ? 'rgba(130,255,31,0.4)' : 'rgba(255,255,255,0.08)'}`,
            background: form.rewatch ? 'rgba(130,255,31,0.08)' : 'transparent',
            color: form.rewatch ? '#82ff1f' : 'rgba(255,255,255,0.35)',
            fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--ff-mono)',
            letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.18s',
            whiteSpace: 'nowrap', height: '42px',
          }}>
          <RefreshCw size={13} /> Rewatch
        </button>
      </div>

      {/* ── Validation error (inline — for "select a title first" etc.) ── */}
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(224,32,32,0.08)', border: '1px solid rgba(224,32,32,0.25)', color: '#e06060', fontSize: '13px', fontFamily: 'var(--ff-body)' }}>
          {error}
        </div>
      )}

      {/* ── Submit ── */}
      <button type="submit" disabled={submitting} style={{
        padding: '13px 28px', borderRadius: '100px',
        border: '1px solid rgba(184,160,255,0.4)',
        background: submitting ? 'rgba(184,160,255,0.05)' : 'rgba(184,160,255,0.12)',
        color: '#b8a0ff', fontSize: '14px', letterSpacing: '0.1em',
        cursor: submitting ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--ff-body)', fontWeight: 600,
        opacity: submitting ? 0.6 : 1, transition: 'all 0.2s',
      }}>
        {submitting ? (isEdit ? 'Saving…' : 'Logging…') : (isEdit ? 'Save changes' : '+ Log Entry')}
      </button>
    </form>
    </>
  )
}
