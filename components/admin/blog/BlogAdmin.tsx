'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FileText, Plus } from 'lucide-react'
import { toast } from 'sonner'
import AdminForm from '@/components/blog/AdminForm'
import type { BlogPost } from '@/lib/blog.types'

function BlogAdminContent() {
  const searchParams = useSearchParams()
  const editSlug     = searchParams.get('edit')

  const [posts,    setPosts]    = useState<BlogPost[]>([])
  const [loading,  setLoading]  = useState(true)
  const [view,     setView]     = useState<'list' | 'new' | 'edit'>(editSlug ? 'edit' : 'list')
  const [editPost, setEditPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    fetch('/api/blog')
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []) })
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (editSlug && posts.length > 0) {
      const found = posts.find(p => p.slug === editSlug)
      if (found) { setEditPost(found); setView('edit') }
    }
  }, [editSlug, posts])

  function handleSaved(saved: BlogPost) {
    setPosts(prev => {
      const exists = prev.find(p => p.id === saved.id)
      return exists ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev]
    })
    setView('list')
    setEditPost(null)
  }

  return (
    <div>
      {/* View switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '100px', padding: '3px' }}>
          {(['list', 'new'] as const).map(v => (
            <button key={v} type="button"
              onClick={() => { setView(v); if (v === 'list') setEditPost(null) }}
              style={{
                padding: '6px 14px', borderRadius: '100px', border: 'none', cursor: 'pointer',
                background: view === v ? 'rgba(130,255,31,0.12)' : 'transparent',
                color: view === v ? '#82ff1f' : 'var(--text-secondary)',
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
                <Link href={`/blog/${post.slug}`} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '11px', fontFamily: 'var(--ff-mono)' }}>
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

      {view === 'new' && <AdminForm onSuccess={handleSaved} />}
      {view === 'edit' && editPost && <AdminForm initial={editPost} onSuccess={handleSaved} />}
    </div>
  )
}

export default function BlogAdmin() {
  return (
    <Suspense fallback={null}>
      <BlogAdminContent />
    </Suspense>
  )
}
