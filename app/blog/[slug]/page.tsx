'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Trash2, Calendar, Clock } from 'lucide-react'
import { toast } from 'sonner'
import type { BlogPost, ContentBlock } from '@/lib/blog.types'
import BlockRenderer from '@/components/blog/BlockRenderer'
import ConfirmModal from '@/components/ui/ConfirmModal'

function readingTime(content: ContentBlock[]): number {
  const words = content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; content: string }).content)
    .join(' ')
    .split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export default function BlogPostPage() {
  const { slug }   = useParams<{ slug: string }>()
  const router     = useRouter()
  const [post,     setPost]     = useState<BlogPost | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [isAdmin,  setIsAdmin]  = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirm,  setConfirm]  = useState(false)

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setPost)
      .catch(() => toast.error('Post not found'))
      .finally(() => setLoading(false))

    fetch('/api/auth/blog').then(r => r.json()).then(d => setIsAdmin(d.authed))
  }, [slug])

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Post deleted')
      router.push('/blog')
    } else {
      toast.error('Failed to delete')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'var(--text-dim)' }}>Loading…</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'var(--text-dim)' }}>Post not found.</div>
        <Link href="/blog" style={{ color: '#82ff1f', fontFamily: 'var(--ff-mono)', fontSize: '12px' }}>← Back to blog</Link>
      </div>
    )
  }

  const date  = post.published_at ?? post.created_at
  const mins  = readingTime(post.content)
  const month = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>

      {confirm && (
        <ConfirmModal
          title="Delete post"
          description={`"${post.title}" will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(false)}
          danger
        />
      )}

      {/* ── Sticky header ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(18px)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', flexShrink: 0 }}>
            <ArrowLeft size={13} />
          </Link>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'rgba(255,255,255,0.6)' }}>
              {post.title}
            </div>
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <Link href={`/blog/admin?edit=${post.slug}`} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 12px', borderRadius: '100px',
                border: '1px solid rgba(130,255,31,0.25)', background: 'rgba(130,255,31,0.06)',
                color: '#82ff1f', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)',
              }}>
                <Pencil size={12} />
              </Link>
              <button
                onClick={() => setConfirm(true)}
                disabled={deleting}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px', borderRadius: '100px',
                  border: '1px solid rgba(224,96,96,0.25)', background: 'rgba(224,96,96,0.06)',
                  color: '#e06060', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--ff-mono)',
                }}>
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Cover image ── */}
      {post.cover_image && (
        <div style={{ position: 'relative', width: '100%', maxHeight: '420px', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--bg))' }} />
        </div>
      )}

      {/* ── Article ── */}
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: post.cover_image ? '0 24px 80px' : '48px 24px 80px' }}>

        {/* Draft badge */}
        {!post.published && isAdmin && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '100px', marginBottom: '20px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
            color: '#f59e0b', fontSize: '11px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em',
          }}>
            Draft — not published
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', marginTop: post.cover_image ? '32px' : '0' }}>
            {post.tags.map(t => (
              <Link key={t} href={`/blog?tag=${t}`} style={{
                fontSize: '10px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#82ff1f',
                background: 'rgba(130,255,31,0.1)', border: '1px solid rgba(130,255,31,0.2)',
                borderRadius: '100px', padding: '3px 8px', textDecoration: 'none',
              }}>
                {t}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 style={{
          margin: '0 0 16px',
          fontFamily: 'var(--ff-display)',
          fontWeight: 400,
          fontSize: 'clamp(1.8rem, 5vw, 3rem)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          lineHeight: 1.1,
          color: '#fff',
        }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'var(--ff-mono)', color: 'rgba(255,255,255,0.65)' }}>
            <Calendar size={12} />
            {month}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'var(--ff-mono)', color: 'rgba(130,255,31,0.6)' }}>
            <Clock size={12} />
            {mins} min read
          </span>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <div style={{ margin: '0 0 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', lineHeight: 1, color: '#e02020', fontFamily: 'Georgia, serif', marginBottom: '6px' }}>&ldquo;</div>
            <p style={{
              margin: 0,
              fontSize: '15px',
              fontFamily: 'var(--ff-serif)',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.62)',
              lineHeight: 1.7,
            }}>
              {post.excerpt}
            </p>
          </div>
        )}

        {/* Content blocks */}
        <BlockRenderer blocks={post.content} />
      </article>
    </div>
  )
}
