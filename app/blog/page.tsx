'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import type { BlogPost } from '@/lib/blog.types'
import PostCard from '@/components/blog/PostCard'

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.6s ease infinite' }} />
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ height: '10px', width: '40%', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ height: '14px', width: '80%', borderRadius: '4px', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ height: '10px', width: '60%', borderRadius: '4px', background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [posts,   setPosts]   = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search,  setSearch]  = useState('')
  const [tag,     setTag]     = useState('')

  const fetchPosts = useCallback(async () => {
    try {
      const res  = await fetch('/api/blog')
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
    fetch('/api/auth/blog').then(r => r.json()).then(d => setIsAdmin(d.authed))
  }, [fetchPosts])

  // All tags from posts
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort()

  const filtered = posts
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.excerpt ?? '').toLowerCase().includes(search.toLowerCase()))
    .filter(p => !tag    || p.tags.includes(tag))

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        .blog-header-inner { padding: 14px 24px; }
        @media (max-width: 640px) {
          .blog-header-inner { padding: 12px 16px; }
          .blog-hero  { padding: 20px 16px 0 !important; }
          .blog-main  { padding: 14px 16px 60px !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(18px)' }}>
        <div className="blog-header-inner" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em' }}>
            <ArrowLeft size={13} />
          </Link>
          {isAdmin && (
            <Link href="/blog/admin" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '100px',
              border: '1px solid rgba(130,255,31,0.28)', background: 'rgba(130,255,31,0.08)',
              color: '#82ff1f', textDecoration: 'none',
              fontSize: '12px', letterSpacing: '0.1em', fontFamily: 'var(--ff-mono)',
            }}>
              <Plus size={13} />
            </Link>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="blog-hero" style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#82ff1f' }}>
            Personal Writing
          </span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(130,255,31,0.35), transparent)' }} />
        </div>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--ff-display)',
          fontWeight: 400,
          fontSize: 'clamp(3rem, 10vw, 6rem)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          lineHeight: 0.95,
          background: 'linear-gradient(135deg, #ffffff 0%, rgba(130,255,31,0.85) 60%, rgba(184,160,255,0.6) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        } as React.CSSProperties}>
          Notes
        </h1>
        <p style={{
          margin: '10px 0 0',
          fontFamily: 'var(--ff-mono)', fontSize: '10px',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.2)', display: 'inline-block', flexShrink: 0 }} />
          Thoughts written down.
        </p>
      </div>

      {/* ── Main ── */}
      <main className="blog-main" style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 60px' }}>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts…"
            style={{
              width: '100%', padding: '10px 38px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${search ? 'rgba(130,255,31,0.35)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '12px', color: '#fff',
              fontSize: '14px', fontFamily: 'var(--ff-body)',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px', display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Tag pills */}
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
            {allTags.map(t => {
              const on = tag === t
              return (
                <button key={t} type="button"
                  onClick={() => setTag(on ? '' : t)}
                  style={{
                    padding:       '6px 13px', borderRadius: '100px', cursor: 'pointer',
                    border:        `1px solid ${on ? 'rgba(130,255,31,0.45)' : 'rgba(255,255,255,0.08)'}`,
                    background:    on ? 'rgba(130,255,31,0.1)' : 'transparent',
                    color:         on ? '#82ff1f' : 'rgba(255,255,255,0.4)',
                    fontSize:      '11px', fontFamily: 'var(--ff-mono)',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    transition:    'all 0.18s',
                  }}>
                  {t}
                </button>
              )
            })}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '14px' }}>
            {search || tag ? 'No posts match your filters.' : 'No posts yet.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map(post => (
              <PostCard key={post.id} post={post} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
