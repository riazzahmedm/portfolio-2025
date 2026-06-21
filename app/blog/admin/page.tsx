'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Lock, Eye, EyeOff, LogOut, FileText, Plus } from 'lucide-react'
import { toast } from 'sonner'
import AdminForm from '@/components/blog/AdminForm'
import type { BlogPost } from '@/lib/blog.types'

// ── Password gate (same pattern as movies/admin) ──────────────────────────────
function PasswordGate({ onAuthed }: { onAuthed: () => void }) {
  const [pw,      setPw]      = useState('')
  const [show,    setShow]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/blog', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) { onAuthed() }
    else { setError('Wrong password'); setPw('') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'var(--ff-body)' }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(130,255,31,0.08)', border: '1px solid rgba(130,255,31,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={22} color="#82ff1f" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Admin access</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '6px 0 0', fontFamily: 'var(--ff-mono)' }}>
              blog · riazahmed.com
            </p>
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Password"
              autoFocus
              style={{
                width: '100%', padding: '12px 44px 12px 16px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? 'rgba(224,96,96,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px', color: '#fff', fontSize: '15px',
                fontFamily: 'var(--ff-body)', outline: 'none',
              }}
            />
            <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px', display: 'flex' }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <div style={{ fontSize: '13px', color: '#e06060', fontFamily: 'var(--ff-mono)' }}>{error}</div>}
          <button type="submit" disabled={loading || !pw} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(130,255,31,0.12)', color: '#82ff1f', fontSize: '14px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', cursor: loading ? 'wait' : 'pointer', opacity: (!pw || loading) ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {loading ? 'Checking…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Admin dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
  const searchParams = useSearchParams()
  const editSlug     = searchParams.get('edit')

  const [posts,     setPosts]     = useState<BlogPost[]>([])
  const [loading,   setLoading]   = useState(true)
  const [view,      setView]      = useState<'list' | 'new' | 'edit'>(editSlug ? 'edit' : 'list')
  const [editPost,  setEditPost]  = useState<BlogPost | null>(null)

  useEffect(() => {
    fetch('/api/blog')
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []) })
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoading(false))
  }, [])

  // If edit slug in URL, find and load that post
  useEffect(() => {
    if (editSlug && posts.length > 0) {
      const found = posts.find(p => p.slug === editSlug)
      if (found) { setEditPost(found); setView('edit') }
    }
  }, [editSlug, posts])

  async function logout() {
    await fetch('/api/auth/blog', { method: 'DELETE' })
    window.location.reload()
  }

  function handleSaved(saved: BlogPost) {
    setPosts(prev => {
      const exists = prev.find(p => p.id === saved.id)
      return exists ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev]
    })
    setView('list')
    setEditPost(null)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(18px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)' }}>
              <ArrowLeft size={13} />
            </Link>
            <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '3px' }}>
              {(['list', 'new'] as const).map(v => (
                <button key={v} type="button"
                  onClick={() => { setView(v); if (v === 'list') setEditPost(null) }}
                  style={{
                    padding: '6px 14px', borderRadius: '100px', border: 'none', cursor: 'pointer',
                    background: view === v ? 'rgba(130,255,31,0.12)' : 'transparent',
                    color: view === v ? '#82ff1f' : 'rgba(255,255,255,0.35)',
                    fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.18s',
                  }}>
                  {v === 'list' ? <><FileText size={12} /> Posts</> : <><Plus size={12} /> New</>}
                </button>
              ))}
            </div>
            {view === 'edit' && editPost && (
              <span style={{ fontSize: '12px', fontFamily: 'var(--ff-mono)', color: '#82ff1f' }}>Editing: {editPost.title}</span>
            )}
          </div>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--ff-mono)' }}>
            <LogOut size={12} /> Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Posts list */}
        {view === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>Loading…</div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>
                No posts yet. <button onClick={() => setView('new')} style={{ background: 'none', border: 'none', color: '#82ff1f', cursor: 'pointer', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>Write your first post →</button>
              </div>
            ) : posts.map(post => (
              <div key={post.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border-card)',
                borderRadius: '12px',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.title}
                  </div>
                  <div style={{ marginTop: '4px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--ff-mono)', color: 'var(--text-dim)' }}>
                      /blog/{post.slug}
                    </span>
                    <span style={{
                      fontSize: '10px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
                      color: post.published ? '#82ff1f' : '#f59e0b',
                    }}>
                      {post.published ? '● Live' : '○ Draft'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Link href={`/blog/${post.slug}`} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '11px', fontFamily: 'var(--ff-mono)' }}>
                    View
                  </Link>
                  <button
                    onClick={() => { setEditPost(post); setView('edit') }}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(130,255,31,0.25)', background: 'rgba(130,255,31,0.06)', color: '#82ff1f', cursor: 'pointer', fontSize: '11px', fontFamily: 'var(--ff-mono)' }}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New post */}
        {view === 'new' && (
          <AdminForm onSuccess={handleSaved} />
        )}

        {/* Edit post */}
        {view === 'edit' && editPost && (
          <AdminForm initial={editPost} onSuccess={handleSaved} />
        )}
      </div>
    </div>
  )
}

// ── Page: auth gate → dashboard ───────────────────────────────────────────────
export default function BlogAdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/auth/blog').then(r => r.json()).then(d => setAuthed(d.authed))
  }, [])

  if (authed === null) return null
  if (!authed) return <PasswordGate onAuthed={() => setAuthed(true)} />
  return <Dashboard />
}
