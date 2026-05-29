'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ListItem {
  id: string; title: string; poster_url: string | null; type: string | null
  year: number | null; note: string | null; rank: number; log_id: string | null
}
interface MovieList {
  id: string; title: string; description: string | null; created_at: string
  movie_list_items: ListItem[]
}

export default function ListDetailPage() {
  const params = useParams()
  const slug   = params?.slug as string
  const [list,    setList]    = useState<MovieList | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/movies/lists/${slug}`)
      .then(r => r.json())
      .then(d => { setList(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>LOADING…</div>
    </div>
  )

  if (!list) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>List not found</div>
      <Link href="/movies/lists" style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: '#b8a0ff', textDecoration: 'none' }}>← All lists</Link>
    </div>
  )

  const items = (list.movie_list_items ?? []).sort((a, b) => a.rank - b.rank)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(18px)', padding: '14px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/movies/lists" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em' }}>
            <ArrowLeft size={13} /> Lists
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ margin: '0 0 10px', fontFamily: 'var(--ff-display)', fontWeight: 400, fontSize: 'clamp(2rem, 8vw, 4rem)', letterSpacing: '0.04em', color: '#fff', lineHeight: 1 }}>
            {list.title}
          </h1>
          {list.description && (
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--ff-body)', lineHeight: 1.65 }}>
              {list.description}
            </p>
          )}
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '12px' }}>
            {items.length} {items.length === 1 ? 'title' : 'titles'}
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>
            Nothing on this list yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-card)' }}>
            {items.map((item, i) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '16px',
                padding: '16px 20px',
                background: i % 2 === 0 ? 'var(--surface)' : 'rgba(255,255,255,0.01)',
              }}>
                {/* Rank */}
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'rgba(255,255,255,0.2)', width: '22px', textAlign: 'right', flexShrink: 0, marginTop: '2px' }}>
                  {i + 1}
                </div>
                {/* Poster */}
                <div style={{ width: '42px', flexShrink: 0, aspectRatio: '2/3', borderRadius: '6px', overflow: 'hidden', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {item.poster_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={item.poster_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎬</div>
                  }
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', fontFamily: 'var(--ff-body)' }}>
                      {item.log_id
                        ? <Link href={`/movies/${item.log_id}`} style={{ color: '#fff', textDecoration: 'none' }}>{item.title}</Link>
                        : item.title
                      }
                    </div>
                    {item.year && <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{item.year}</span>}
                    {item.type && (
                      <span style={{
                        padding: '2px 8px', borderRadius: '100px', fontSize: '9px', letterSpacing: '0.14em',
                        border: `1px solid ${item.type === 'movie' ? 'rgba(130,255,31,0.3)' : 'rgba(184,160,255,0.3)'}`,
                        color: item.type === 'movie' ? '#82ff1f' : '#b8a0ff',
                        fontFamily: 'var(--ff-mono)', textTransform: 'uppercase',
                      }}>
                        {item.type}
                      </span>
                    )}
                  </div>
                  {item.note && (
                    <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ff-body)', lineHeight: 1.5, fontStyle: 'italic' }}>
                      {item.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
