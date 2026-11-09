'use client'
import { useEffect, useState } from 'react'
import { MapPin, Plus, X } from 'lucide-react'
import { CITIES, SCREEN_FORMATS, SEATING } from '@/lib/places'
import type { Place, PlaceLite } from '@/lib/places'

/** What the log form keeps while you fill in a theatre visit. A theatre is either an already-saved place or a new one to create on save. */
export interface TheatreState {
  city:   string            // 'Hyderabad', 'Chennai' or whatever was typed under Other
  query:  string            // the name being typed
  place:  PlaceLite | null  // a saved theatre that was picked
  area:   string            // for a new theatre only
  format: string            // a SCREEN_FORMATS key, or '' for an ordinary screen
  seating: string           // a SEATING key, or ''
}

const CITY_KEY = 'movies-theatre-city'
const rememberedCity = () => { try { return localStorage.getItem(CITY_KEY) ?? '' } catch { return '' } }

export const blankTheatre = (): TheatreState => ({ city: '', query: '', place: null, area: '', format: '', seating: '' })

export function theatreFromLog(log: { place?: PlaceLite | null; screen_format?: string | null; seating?: string | null }): TheatreState {
  return { city: log.place?.city ?? '', query: '', place: log.place ?? null, area: '', format: log.screen_format ?? '', seating: log.seating ?? '' }
}

const chip = (on: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '100px', cursor: 'pointer',
  border: `1px solid ${on ? 'rgba(184,160,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
  background: on ? 'rgba(184,160,255,0.14)' : 'rgba(255,255,255,0.02)',
  color: on ? '#cdbcff' : 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: 'var(--ff-body)', transition: 'all 0.18s', whiteSpace: 'nowrap',
})
const field: React.CSSProperties = {
  width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
  color: '#fff', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none', boxSizing: 'border-box',
}
const label: React.CSSProperties = { fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-mono)', marginBottom: '8px' }

/** City, theatre name (picked from the ones you have saved, or a new one) and screen format, for a film seen in a theatre. */
export default function TheatreFields({ value, onChange }: { value: TheatreState; onChange: (next: TheatreState) => void }) {
  const [saved, setSaved] = useState<Place[]>([])
  const isKnownCity = (CITIES as readonly string[]).includes(value.city)
  const [other, setOther] = useState(Boolean(value.city) && !isKnownCity)

  const set = (patch: Partial<TheatreState>) => onChange({ ...value, ...patch })

  // Start in the city you used last time
  useEffect(() => {
    if (value.city || value.place) return
    const last = rememberedCity()
    if (last) { onChange({ ...value, city: last }); setOther(!(CITIES as readonly string[]).includes(last)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Saved theatres in this city that match what is being typed
  useEffect(() => {
    if (value.place) return
    const ctl = new AbortController()
    const t = setTimeout(() => {
      const qs = new URLSearchParams({ kind: 'theatre' })
      if (value.city.trim()) qs.set('city', value.city.trim())
      if (value.query.trim()) qs.set('q', value.query.trim())
      fetch(`/api/places?${qs}`, { signal: ctl.signal }).then(r => (r.ok ? r.json() : [])).then(d => setSaved(Array.isArray(d) ? d : [])).catch(() => {})
    }, 180)
    return () => { clearTimeout(t); ctl.abort() }
  }, [value.city, value.query, value.place])

  function pickCity(city: string) {
    try { localStorage.setItem(CITY_KEY, city) } catch { /* not remembered */ }
    setOther(false)
    // a picked theatre belongs to one city: changing city clears it
    set({ city, place: value.place && value.place.city?.toLowerCase() === city.toLowerCase() ? value.place : null })
  }

  const typed = value.query.trim()
  const exact = saved.some(p => p.name.toLowerCase() === typed.toLowerCase())
  const suggestions = saved.slice(0, 8)

  return (
    <div style={{ marginTop: '16px', padding: '16px', borderRadius: '14px', border: '1px solid rgba(184,160,255,0.18)', background: 'rgba(184,160,255,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* City */}
      <div>
        <div style={label}>City</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CITIES.map(c => (
            <button key={c} type="button" style={chip(!other && value.city === c)} onClick={() => pickCity(c)}>{c}</button>
          ))}
          <button type="button" style={chip(other)} onClick={() => { setOther(true); set({ city: '', place: null }) }}>Other</button>
        </div>
        {other && (
          <input value={value.city} onChange={e => set({ city: e.target.value, place: null })} placeholder="City" maxLength={60} style={{ ...field, marginTop: '10px' }} aria-label="City" />
        )}
      </div>

      {/* Theatre */}
      <div>
        <div style={label}>Theatre</div>
        {value.place ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 13px', borderRadius: '10px', border: '1px solid rgba(184,160,255,0.4)', background: 'rgba(184,160,255,0.1)' }}>
            <MapPin size={15} color="#cdbcff" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value.place.name}</div>
              {(value.place.area || value.place.city) && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--ff-mono)' }}>{[value.place.area, value.place.city].filter(Boolean).join(' · ')}</div>
              )}
            </div>
            <button type="button" onClick={() => set({ place: null, query: '' })} aria-label="Choose a different theatre" style={{ background: 'none', border: 0, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <input value={value.query} onChange={e => set({ query: e.target.value })} placeholder="Theatre name, e.g. Prasads Multiplex" maxLength={90} style={field} aria-label="Theatre name" />

            {suggestions.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {suggestions.map(p => (
                  <button key={p.id} type="button" style={chip(false)} onClick={() => set({ place: p, query: '', city: p.city ?? value.city })}>
                    <MapPin size={12} /> {p.name}{p.area ? ` · ${p.area}` : ''}
                  </button>
                ))}
              </div>
            )}

            {typed && !exact && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cdbcff', fontFamily: 'var(--ff-mono)' }}>
                  <Plus size={13} /> New theatre: &ldquo;{typed}&rdquo; will be saved{value.city.trim() ? ` in ${value.city.trim()}` : ''}
                </div>
                <input value={value.area} onChange={e => set({ area: e.target.value })} placeholder="Area, e.g. Kukatpally (optional)" maxLength={60} style={field} aria-label="Area" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Screen format */}
      <div>
        <div style={label}>Screen format <span style={{ opacity: 0.6, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SCREEN_FORMATS.map(f => (
            <button key={f.key} type="button" style={chip(value.format === f.key)} onClick={() => set({ format: value.format === f.key ? '' : f.key })}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Seating */}
      <div>
        <div style={label}>Seating <span style={{ opacity: 0.6, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SEATING.map(f => (
            <button key={f.key} type="button" style={chip(value.seating === f.key)} onClick={() => set({ seating: value.seating === f.key ? '' : f.key })}>{f.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
