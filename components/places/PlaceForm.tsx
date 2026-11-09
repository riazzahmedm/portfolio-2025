'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MapPin, Plus, X } from 'lucide-react'
import DatePicker from '@/components/movies/DatePicker'
import { CITIES, type Place } from '@/lib/places'
import { PLACE_KINDS, PLACE_VIBES, TIMINGS, THEATRE_KIND, timingForHour, type TimelineEntry, type TimingKey, type PlaceVibeKey } from '@/lib/places-core'
import { uploadPlacePhoto } from '@/lib/place-photos'
import PhotoPicker, { MAX_PHOTOS } from './PhotoPicker'
import { chip, field, label } from './form-styles'

const CITY_KEY = 'places-city'
const KEEP_KEY = 'places-kind'
const remembered = (k: string) => { try { return typeof window === 'undefined' ? '' : localStorage.getItem(k) ?? '' } catch { return '' } }
const isListed = (c: string) => (CITIES as readonly string[]).includes(c)
const remember   = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* not remembered */ } }
const today = () => { const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-') }

type LoggableKind = typeof PLACE_KINDS[number]['key']

/**
 * One scrolling form for a place visit (or a wishlist entry). Pass `initial.entry` to edit a visit, or `initial.placeId`
 * to log another visit to a saved place (also how a wishlist place becomes a visit).
 */
export default function PlaceForm({ initial, onSaved }: { initial?: { entry?: TimelineEntry; placeId?: string }; onSaved: (entry?: TimelineEntry) => void }) {
  const editing = initial?.entry?.source === 'visit' ? initial.entry : undefined

  const [mode,     setMode]     = useState<'visited' | 'wishlist'>('visited')
  // A new entry starts on the kind and city used last time (this form only ever renders in the browser)
  const fresh = !editing && !initial?.placeId
  const [kind,     setKind]     = useState<LoggableKind>(() => {
    if (editing) return editing.place.kind as LoggableKind
    const k = fresh ? remembered(KEEP_KEY) : ''
    return PLACE_KINDS.some(x => x.key === k) ? (k as LoggableKind) : 'cafe'
  })
  const [city,     setCity]     = useState(() => editing?.place.city ?? (fresh ? remembered(CITY_KEY) : ''))
  const [other,    setOther]    = useState(() => { const c = editing?.place.city ?? (fresh ? remembered(CITY_KEY) : ''); return Boolean(c) && !isListed(c) })
  const [query,    setQuery]    = useState('')
  const [place,    setPlace]    = useState<Place | null>(editing ? (editing.place as unknown as Place) : null)
  const [hasVisits, setHasVisits] = useState(Boolean(editing))
  const [area,     setArea]     = useState('')
  const [mapsUrl,  setMapsUrl]  = useState('')
  const [date,     setDate]     = useState(editing?.date ?? today())
  const [timing,   setTiming]   = useState<TimingKey | ''>(editing?.timing ?? timingForHour(new Date().getHours()))
  const [vibe,     setVibe]     = useState<PlaceVibeKey | ''>(editing?.vibe ?? '')
  const [spend,    setSpend]    = useState(editing?.spend != null ? String(editing.spend) : '')
  const [must,     setMust]     = useState<string[]>(editing?.mustOrder ?? [])
  const [dish,     setDish]     = useState('')
  const [note,     setNote]     = useState(editing?.note ?? '')
  const [saved,    setSaved]    = useState<string[]>(editing?.photos ?? [])
  const [files,    setFiles]    = useState<File[]>([])
  const [suggest,  setSuggest]  = useState<Place[]>([])
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  // "Log another visit": load the saved place
  useEffect(() => {
    if (!initial?.placeId) return
    fetch(`/api/places/${initial.placeId}/detail`).then(r => (r.ok ? r.json() : null)).then(d => {
      if (!d?.place || d.place.kind === THEATRE_KIND) return
      setPlace(d.place); setKind(d.place.kind); setCity(d.place.city ?? ''); setHasVisits(d.entries.length > 0)
      setOther(!!d.place.city && !isListed(d.place.city))
    }).catch(() => {})
  }, [initial?.placeId])

  // Saved places that match what is being typed
  useEffect(() => {
    if (place || editing) return
    const ctl = new AbortController()
    const t = setTimeout(() => {
      const qs = new URLSearchParams({ kind })
      if (city.trim())  qs.set('city', city.trim())
      if (query.trim()) qs.set('q', query.trim())
      fetch(`/api/places?${qs}`, { signal: ctl.signal }).then(r => (r.ok ? r.json() : [])).then(d => setSuggest(Array.isArray(d) ? d : [])).catch(() => {})
    }, 180)
    return () => { clearTimeout(t); ctl.abort() }
  }, [kind, city, query, place, editing])

  function pickPlace(p: Place) {
    setPlace(p); setQuery(''); setCity(p.city ?? city); setOther(!!p.city && !isListed(p.city))
    fetch(`/api/places/${p.id}/detail`).then(r => (r.ok ? r.json() : null)).then(d => {
      const visited = (d?.entries?.length ?? 0) > 0
      setHasVisits(visited)
      if (visited) setMode('visited')
    }).catch(() => {})
  }

  const typed = query.trim()
  const exact = suggest.some(p => p.name.toLowerCase() === typed.toLowerCase())
  const wishlist = mode === 'wishlist'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const name = place?.name ?? typed
    if (!name)        return setError('Enter the place name')
    if (!city.trim()) return setError('Choose a city')
    if (!wishlist && !date) return setError('Choose a date')
    setBusy(true)
    try {
      // 1. The place: a picked one, or save a new one (the server returns an existing match instead of a duplicate)
      let placeId = place?.id
      if (!placeId) {
        const res = await fetch('/api/places', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          kind, name, city: city.trim(), area: area.trim(), maps_url: mapsUrl.trim(), ...(wishlist ? { wishlisted: true } : {}),
        }) })
        const d = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(d.error ?? 'Could not save the place')
        placeId = d.id
      } else if (wishlist) {
        const res = await fetch('/api/places', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: place!.kind, name: place!.name, city: place!.city, wishlisted: true }) })
        const d = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(d.error ?? 'Could not add to the wishlist')
      }
      if (wishlist) { toast.success('Added to wishlist', { description: name }); resetAfter(); onSaved(); return }

      // 2. Photos first: if one fails the visit is not saved, so there is never a broken photo link
      const urls: string[] = []
      for (const f of files) urls.push(await uploadPlacePhoto(f))

      // 3. The visit
      const body = {
        place_id: placeId, visited_on: date, timing: timing || null, vibe: vibe || null, note: note.trim() || null,
        spend_per_head: spend.trim() === '' ? null : Number(spend), must_order: kind === 'activity' ? [] : must, photos: [...saved, ...urls],
      }
      const res = await fetch(editing ? `/api/places/visits/${editing.id}` : '/api/places/visits', {
        method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error ?? 'Could not save the visit')
      toast.success(editing ? 'Visit updated' : 'Visit logged', { description: name })
      remember(CITY_KEY, city.trim()); remember(KEEP_KEY, kind)
      if (!editing) resetAfter()
      onSaved()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg); toast.error('Not saved', { description: msg })
    } finally { setBusy(false) }
  }

  // Ready for the next entry; keeps the kind, city and date you were on
  function resetAfter() {
    setPlace(null); setQuery(''); setArea(''); setMapsUrl(''); setHasVisits(false); setVibe(''); setSpend(''); setMust([]); setDish(''); setNote('')
    setSaved([]); setFiles([]); setTiming(timingForHour(new Date().getHours()))
  }

  const addDish = () => { const d = dish.trim(); if (d && !must.includes(d) && must.length < 12) setMust([...must, d]); setDish('') }
  const section: React.CSSProperties = { display: 'flex', flexDirection: 'column' }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '560px' }}>

      {!editing && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" style={chip(!wishlist)} onClick={() => setMode('visited')}>Visited</button>
          <button type="button" style={{ ...chip(wishlist), opacity: hasVisits ? 0.4 : 1 }} disabled={hasVisits} title={hasVisits ? 'You have already visited this place' : undefined} onClick={() => setMode('wishlist')}>Wishlist</button>
        </div>
      )}

      <div style={section}>
        <div style={label}>Kind</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PLACE_KINDS.map(k => (
            <button key={k.key} type="button" style={chip(kind === k.key)} disabled={!!place} onClick={() => setKind(k.key)}>{k.label}</button>
          ))}
        </div>
      </div>

      <div style={section}>
        <div style={label}>City</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CITIES.map(c => <button key={c} type="button" style={chip(!other && city === c)} disabled={!!place} onClick={() => { setOther(false); setCity(c) }}>{c}</button>)}
          <button type="button" style={chip(other)} disabled={!!place} onClick={() => { setOther(true); setCity('') }}>Other</button>
        </div>
        {other && <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" maxLength={60} style={{ ...field, marginTop: '10px' }} aria-label="City" disabled={!!place} />}
      </div>

      <div style={section}>
        <div style={label}>Place</div>
        {place ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 13px', borderRadius: '10px', border: '1px solid rgba(184,160,255,0.4)', background: 'rgba(184,160,255,0.1)' }}>
            <MapPin size={15} color="#cdbcff" />
            <div style={{ flex: 1, minWidth: 0, fontSize: '14px', color: '#fff' }}>{place.name}{place.area ? ` · ${place.area}` : ''}</div>
            {!editing && (
              <button type="button" aria-label="Choose a different place" onClick={() => { setPlace(null); setHasVisits(false) }} style={{ background: 'none', border: 0, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', padding: '4px' }}><X size={16} /></button>
            )}
          </div>
        ) : (
          <>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, e.g. Roast Lab" maxLength={90} style={field} aria-label="Place name" />
            {suggest.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {suggest.slice(0, 8).map(p => <button key={p.id} type="button" style={chip(false)} onClick={() => pickPlace(p)}><MapPin size={12} /> {p.name}{p.area ? ` · ${p.area}` : ''}</button>)}
              </div>
            )}
            {typed && !exact && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cdbcff', fontFamily: 'var(--ff-mono)' }}><Plus size={13} /> New place: &ldquo;{typed}&rdquo; will be saved</div>
                <input value={area} onChange={e => setArea(e.target.value)} placeholder="Area, e.g. Jubilee Hills (optional)" maxLength={60} style={field} aria-label="Area" />
                <input value={mapsUrl} onChange={e => setMapsUrl(e.target.value)} placeholder="Paste a Google Maps link (optional)" maxLength={500} inputMode="url" style={field} aria-label="Map link" />
              </div>
            )}
          </>
        )}
      </div>

      {!wishlist && (
        <>
          <div style={section}>
            <div style={label}>When</div>
            <DatePicker value={date} onChange={setDate} />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
              {TIMINGS.map(t => <button key={t.key} type="button" style={chip(timing === t.key)} onClick={() => setTiming(timing === t.key ? '' : t.key)}>{t.label}</button>)}
            </div>
          </div>

          <div style={section}>
            <div style={label}>How was it</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PLACE_VIBES.map(v => <button key={v.key} type="button" style={chip(vibe === v.key)} onClick={() => setVibe(vibe === v.key ? '' : v.key)}>{v.emoji} {v.label}</button>)}
            </div>
          </div>

          <div style={section}>
            <div style={label}>Spent per head (₹)</div>
            <input value={spend} onChange={e => setSpend(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" placeholder="350" style={{ ...field, maxWidth: '180px' }} aria-label="Spent per head in rupees" />
          </div>

          {kind !== 'activity' && (
            <div style={section}>
              <div style={label}>Must order</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: must.length ? '10px' : 0 }}>
                {must.map(m => <button key={m} type="button" style={chip(true)} onClick={() => setMust(must.filter(x => x !== m))}>★ {m} <X size={12} /></button>)}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={dish} onChange={e => setDish(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDish() } }} placeholder="A dish or drink" maxLength={60} style={field} aria-label="Must order" />
                <button type="button" style={chip(false)} onClick={addDish}><Plus size={14} /> Add</button>
              </div>
            </div>
          )}

          <div style={section}>
            <div style={label}>Note</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="A line to remember it by" maxLength={500} rows={3} style={{ ...field, resize: 'vertical' }} aria-label="Note" />
          </div>

          <div style={section}>
            <div style={label}>Photos <span style={{ opacity: 0.6, textTransform: 'none', letterSpacing: 0 }}>(up to {MAX_PHOTOS})</span></div>
            <PhotoPicker saved={saved} files={files} onAdd={p => setFiles(f => [...f, ...p].slice(0, MAX_PHOTOS - saved.length))}
              onRemoveSaved={i => setSaved(saved.filter((_, j) => j !== i))} onRemoveFile={i => setFiles(files.filter((_, j) => j !== i))} />
          </div>
        </>
      )}

      {error && <div role="alert" style={{ color: '#ff8585', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>{error}</div>}

      <button type="submit" disabled={busy} style={{ ...chip(true), justifyContent: 'center', padding: '12px 18px', fontSize: '14px', opacity: busy ? 0.6 : 1 }}>
        {busy ? 'Saving…' : editing ? 'Save changes' : wishlist ? 'Add to wishlist' : 'Log it'}
      </button>
    </form>
  )
}
