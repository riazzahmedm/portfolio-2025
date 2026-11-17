import Link from 'next/link'
import { ExternalLink, Plus } from 'lucide-react'
import { PLACE_VIBES, THEATRE_KIND, type TimelineEntry, type PlaceVibeKey } from '@/lib/places-core'
import { screenFormatLabel, type Place } from '@/lib/places'
import { kindLabel } from './shared'
import PlaceVisits from './PlaceVisits'

type Stats = { visits: number; avgSpend?: number | null; usualFormat?: string | null; usualVibe: PlaceVibeKey | null }
export interface PlaceDetailData { place: Place; entries: TimelineEntry[]; stats: Stats; mustOrder: string[]; wishlisted: boolean }

const mono: React.CSSProperties = { fontFamily: 'var(--ff-mono)', fontSize: '10.5px', color: 'var(--text-dim)' }
const sectionLabel: React.CSSProperties = { ...mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', margin: '26px 0 10px' }

function Tile({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: '12px', background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px' }}>
      <div style={{ fontFamily: 'var(--ff-body)', fontWeight: 600, fontSize: '17px', lineHeight: 1.2, overflowWrap: 'anywhere' }}>{value}</div>
      <div style={{ ...mono, marginTop: '2px' }}>{label}</div>
    </div>
  )
}

/** A place with all its visits. A theatre lists the movies seen there instead, with no photos or must-order. */
export default function PlaceDetail({ data, isAdmin }: { data: PlaceDetailData; isAdmin: boolean }) {
  const { place, entries, stats, mustOrder } = data
  const isTheatre = place.kind === THEATRE_KIND
  const hero  = entries.flatMap(e => e.photos)[0]
  const vibe  = PLACE_VIBES.find(v => v.key === stats.usualVibe)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', paddingBottom: '80px' }}>
      <div style={{ position: 'relative', height: '220px', background: 'var(--surface-raised)', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {hero && <img src={hero} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '64px 20px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.55) 60%, transparent)' }}>
          <h1 style={{ margin: 0, fontFamily: 'var(--ff-display)', fontSize: '30px', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 600, color: '#fff' }}>{place.name}</h1>
          <div style={{ ...mono, color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>{[kindLabel(place.kind), place.area, place.city].filter(Boolean).join(' · ')}</div>
        </div>
      </div>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tile value={stats.visits} label={stats.visits === 1 ? 'visit' : 'visits'} />
          {isTheatre
            ? <Tile value={screenFormatLabel(stats.usualFormat) ?? '—'} label="usual format" />
            : <Tile value={stats.avgSpend != null ? `₹${stats.avgSpend}` : '—'} label="avg per head" />}
          <Tile value={vibe ? vibe.emoji : '—'} label={vibe ? `usually ${vibe.label.toLowerCase()}` : 'no rating yet'} />
        </div>

        {mustOrder.length > 0 && (
          <>
            <div style={sectionLabel}>Must order</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {mustOrder.map(m => <span key={m} style={{ padding: '6px 12px', borderRadius: '99px', border: '1px solid rgba(243,195,77,0.4)', color: '#f3c34d', fontFamily: 'var(--ff-body)', fontSize: '13px' }}>★ {m}</span>)}
            </div>
          </>
        )}

        {place.maps_url && (
          <a href={place.maps_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', color: '#b8a0ff', fontFamily: 'var(--ff-body)', fontSize: '14px', textDecoration: 'none' }}>
            Open in Maps <ExternalLink size={14} />
          </a>
        )}

        <div style={sectionLabel}>{isTheatre ? 'Movies seen here' : 'Visits'}</div>
        {entries.length === 0 && <p style={{ ...mono, fontSize: '12px' }}>{data.wishlisted ? 'On your wishlist. No visits yet.' : 'No visits yet.'}</p>}
        <PlaceVisits entries={entries} isAdmin={isAdmin} />

        {isAdmin && !isTheatre && (
          <Link href={`/admin?tab=places&place=${place.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '24px', padding: '12px', borderRadius: '99px', border: '1px solid rgba(184,160,255,0.5)', background: 'rgba(184,160,255,0.12)', color: '#cdbcff', fontFamily: 'var(--ff-body)', fontSize: '14px', textDecoration: 'none' }}>
            <Plus size={15} /> Log another visit
          </Link>
        )}
      </main>
    </div>
  )
}
