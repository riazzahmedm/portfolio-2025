'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/blog.types'
import { readingTime } from '@/lib/reading-time'

const norm = (t: string) => t.trim().toLowerCase()

export default function RelatedPosts({ current }: { current: BlogPost }) {
  const [related, setRelated] = useState<BlogPost[]>([])

  useEffect(() => {
    const mine = new Set(current.tags.map(norm))
    if (mine.size === 0) return
    fetch('/api/blog')
      .then(r => r.ok ? r.json() : [])
      .then((all: BlogPost[]) => {
        const scored = all
          .filter(p => p.published && p.slug !== current.slug)
          .map(p => ({ p, score: p.tags.filter(t => mine.has(norm(t))).length }))
          .filter(x => x.score > 0)
          .sort((a, b) =>
            b.score - a.score ||
            new Date(b.p.published_at ?? b.p.created_at).getTime() - new Date(a.p.published_at ?? a.p.created_at).getTime()
          )
          .slice(0, 3)
          .map(x => x.p)
        setRelated(scored)
      })
      .catch(() => {})
  }, [current.slug, current.tags])

  if (related.length === 0) return null

  return (
    <section style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#82ff1f' }}>Keep reading</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(130,255,31,0.3), transparent)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        {related.map(p => (
          <Link key={p.id} href={`/blog/${p.slug}`} style={{
            display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {p.cover_image && (
              <img src={p.cover_image} alt="" style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: '15px', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2, color: '#fff' }}>
                {p.title}
              </div>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(130,255,31,0.6)' }}>
                {readingTime(p)} min read
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
