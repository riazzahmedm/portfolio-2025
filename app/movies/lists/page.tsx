'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, List } from 'lucide-react'

interface MovieList {
  id:          string
  title:       string
  slug:        string
  description: string | null
  created_at:  string
  movie_list_items: { count: number }[]
}

export default function ListsPage() {
  const [lists,   setLists]   = useState<MovieList[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/movies/lists')
      .then(r => r.json())
      .then(d => { setLists(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(18px)', padding: '14px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/movies" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em' }}>
            <ArrowLeft size={13} /> Watchlog
          </Link>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>LISTS</div>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#b8a0ff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '18px', height: '1px', background: '#b8a0ff', display: 'inline-block' }} />
            Curated
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--ff-display)', fontWeight: 400, fontSize: 'clamp(2.5rem, 10vw, 5rem)', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 0.95, background: 'linear-gradient(135deg, #ffffff 0%, rgba(184,160,255,0.85) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } as React.CSSProperties}>
            Lists
          </h1>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2,3].map(i => <div key={i} style={{ height: '80px', borderRadius: '16px', background: 'var(--surface)', animation: 'pulse 1.6s ease infinite' }} />)}
          </div>
        ) : lists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '14px' }}>
            No lists yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lists.map(list => {
              const count = list.movie_list_items?.[0]?.count ?? 0
              return (
                <Link key={list.id} href={`/movies/lists/${list.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '20px 24px', borderRadius: '16px',
                    background: 'var(--surface)', border: '1px solid var(--border-card)',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    transition: 'border-color 0.18s, transform 0.18s',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(184,160,255,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(184,160,255,0.1)', border: '1px solid rgba(184,160,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <List size={16} color="#b8a0ff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', fontFamily: 'var(--ff-body)' }}>{list.title}</div>
                      {list.description && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ff-body)', marginTop: '3px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{list.description}</div>}
                    </div>
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                      {count} {count === 1 ? 'title' : 'titles'}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
