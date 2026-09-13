'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Share2 } from 'lucide-react'
import type { BlogPost } from '@/lib/blog.types'
import { readingTime } from '@/lib/reading-time'
import BlogStoryModal from './BlogStoryModal'

export default function PostCard({ post, isAdmin }: { post: BlogPost; isAdmin: boolean }) {
  const [showStory, setShowStory] = useState(false)

  const mins  = readingTime(post)
  const date  = post.published_at ?? post.created_at
  const month = new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <>
      {showStory && (
        <BlogStoryModal
          slug={post.slug}
          title={post.title}
          onClose={() => setShowStory(false)}
        />
      )}

      <div style={{ position: 'relative' }}>
        {/* Share button — outside the Link so it doesn't navigate */}
        <button
          onClick={() => setShowStory(true)}
          title="Share to Instagram Story"
          style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 10,
            background: 'rgba(5,5,5,0.75)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50%', width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.65)',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(130,255,31,0.4)'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#82ff1f'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)'
          }}
        >
          <Share2 size={13} />
        </button>

        <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
          <article style={{
            background:    'var(--surface)',
            border:        '1px solid var(--border-card)',
            borderRadius:  '16px',
            overflow:      'hidden',
            cursor:        'pointer',
            transition:    'border-color 0.2s, transform 0.2s',
            display:       'flex',
            flexDirection: 'column',
            height:        '100%',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(130,255,31,0.35)'
              ;(e.currentTarget as HTMLElement).style.transform  = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-card)'
              ;(e.currentTarget as HTMLElement).style.transform  = 'translateY(0)'
            }}
          >
            {/* Cover image */}
            {post.cover_image && (
              <div style={{ position: 'relative', aspectRatio: '16/9', flexShrink: 0, overflow: 'hidden' }}>
                <img
                  src={post.cover_image}
                  alt={post.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position:   'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                }} />
              </div>
            )}

            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {/* Tags */}
              {post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {post.tags.slice(0, 3).map(tag => (
                    <span key={tag} style={{
                      fontSize:      '10px',
                      fontFamily:    'var(--ff-mono)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color:         '#82ff1f',
                      background:    'rgba(130,255,31,0.1)',
                      border:        '1px solid rgba(130,255,31,0.2)',
                      borderRadius:  '100px',
                      padding:       '3px 8px',
                    }}>
                      {tag}
                    </span>
                  ))}
                  {!post.published && isAdmin && (
                    <span style={{
                      fontSize: '10px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em',
                      textTransform: 'uppercase', color: '#f59e0b',
                      background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                      borderRadius: '100px', padding: '3px 8px',
                    }}>
                      Draft
                    </span>
                  )}
                </div>
              )}

              {/* Title */}
              <h2 style={{
                margin:        0,
                fontSize:      '16px',
                fontWeight:    600,
                fontFamily:    'var(--ff-body)',
                color:         'var(--text-primary)',
                lineHeight:    1.35,
                letterSpacing: '-0.01em',
              }}>
                {post.title}
              </h2>

              {/* Excerpt */}
              {post.excerpt && (
                <p style={{
                  margin:     0,
                  fontSize:   '13px',
                  color:      'var(--text-dim)',
                  lineHeight: 1.55,
                  display:    '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow:   'hidden',
                } as React.CSSProperties}>
                  {post.excerpt}
                </p>
              )}

              {/* Footer meta */}
              <div style={{
                marginTop:      'auto',
                paddingTop:     '10px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                borderTop:      '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--ff-mono)', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                  {month}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--ff-mono)', color: 'rgba(130,255,31,0.6)', letterSpacing: '0.06em' }}>
                  {mins} min read
                </span>
              </div>
            </div>
          </article>
        </Link>
      </div>
    </>
  )
}
