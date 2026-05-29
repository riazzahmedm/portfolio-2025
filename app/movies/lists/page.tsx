'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, List, Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface MovieList {
  id:          string
  title:       string
  slug:        string
  description: string | null
  created_at:  string
  movie_list_items: { count: number }[]
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function NewListModal({ onClose, onCreated }: { onClose: () => void; onCreated: (list: MovieList) => void }) {
  const [title,       setTitle]       = useState('')
  const [slug,        setSlug]        = useState('')
  const [description, setDescription] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving,      setSaving]      = useState(false)

  function handleTitleChange(v: string) {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  async function handleCreate() {
    if (!title.trim() || !slug.trim()) return
    setSaving(true)
    const res = await fetch('/api/movies/lists', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title: title.trim(), slug: slug.trim(), description: description.trim() || null }),
    })
    setSaving(false)
    if (res.ok) {
      const list = await res.json()
      onCreated({ ...list, movie_list_items: [{ count: 0 }] })
      toast.success(`"${title}" created`)
      onClose()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? 'Failed to create list')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: '100%', maxWidth: '480px',
        background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b8a0ff' }}>New List</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>TITLE *</label>
            <input
              autoFocus
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. Best of 2024"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '10px 14px',
                color: '#fff', fontFamily: 'var(--ff-body)', fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          {/* Slug */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>SLUG *</label>
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugTouched(true) }}
              placeholder="best-of-2024"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '10px 14px',
                color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--ff-mono)', fontSize: '13px', outline: 'none',
              }}
            />
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>
              /movies/lists/{slug || '…'}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>DESCRIPTION</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A short description…"
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box', resize: 'vertical',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '10px 14px',
                color: '#fff', fontFamily: 'var(--ff-body)', fontSize: '13px', outline: 'none',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px', borderRadius: '10px', cursor: 'pointer',
              background: 'none', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ff-body)', fontSize: '13px',
            }}>Cancel</button>
            <button onClick={handleCreate} disabled={!title.trim() || !slug.trim() || saving} style={{
              flex: 2, padding: '11px', borderRadius: '10px',
              cursor: title.trim() && slug.trim() && !saving ? 'pointer' : 'not-allowed',
              background: title.trim() && slug.trim() && !saving ? '#b8a0ff' : 'rgba(255,255,255,0.08)',
              border: 'none',
              color: title.trim() && slug.trim() && !saving ? '#000' : 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--ff-body)', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.15s',
            }}>
              {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating…</> : 'Create List'}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function ListsPage() {
  const [lists,    setLists]    = useState<MovieList[]>([])
  const [loading,  setLoading]  = useState(true)
  const [isAdmin,  setIsAdmin]  = useState(false)
  const [showNew,  setShowNew]  = useState(false)

  useEffect(() => {
    fetch('/api/movies/lists')
      .then(r => r.json())
      .then(d => { setLists(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/auth/movies').then(r => r.json()).then(d => setIsAdmin(d.authed))
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
      {showNew && isAdmin && (
        <NewListModal
          onClose={() => setShowNew(false)}
          onCreated={list => setLists(prev => [list, ...prev])}
        />
      )}

      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(18px)', padding: '14px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/movies" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em' }}>
            <ArrowLeft size={13} /> Watchlog
          </Link>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>LISTS</div>
          {isAdmin && (
            <button onClick={() => setShowNew(true)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
              background: 'rgba(184,160,255,0.1)', border: '1px solid rgba(184,160,255,0.25)',
              color: '#b8a0ff', fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.1em',
            }}>
              <Plus size={12} /> New List
            </button>
          )}
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
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '14px', marginBottom: '20px' }}>No lists yet.</div>
            {isAdmin && (
              <button onClick={() => setShowNew(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                background: 'rgba(184,160,255,0.1)', border: '1px solid rgba(184,160,255,0.25)',
                color: '#b8a0ff', fontFamily: 'var(--ff-mono)', fontSize: '12px',
              }}>
                <Plus size={13} /> Create your first list
              </button>
            )}
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
