'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Share2 } from 'lucide-react'
import type { BlogPostSummary } from '@/lib/blog.types'
import { accentStyle } from '@/lib/blog-accent-style'
import BlogStoryModal from './BlogStoryModal'

const FALLBACKS = ['fn-c1', 'fn-c2', 'fn-c3', 'fn-c4', 'fn-c5']
const month = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

/** One story: the large featured card, a wide card, or a regular card. */
export default function StoryCard({ post, variant, number }: { post: BlogPostSummary; variant: 'feature' | 'wide' | 'card'; number: number }) {
  const [showStory, setShowStory] = useState(false)
  const meta = `${month(post.created_at)} · ${post.reading_minutes} min read`
  const topics = post.tags.slice(0, 2).join(' · ')

  const cover = (
    <div className={`fn-cv${post.cover_image ? '' : ` ${FALLBACKS[(number - 1) % FALLBACKS.length]}`}`}>
      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_image} alt="" loading={number <= 2 ? 'eager' : 'lazy'} decoding="async" />
      )}
      {variant !== 'feature' && <span className="fn-num" aria-hidden="true">{String(number).padStart(2, '0')}</span>}
    </div>
  )

  return (
    <>
      {showStory && <BlogStoryModal slug={post.slug} title={post.title} onClose={() => setShowStory(false)} />}
      <div className={`fn-cardwrap fn-cardwrap--${variant} fn-accent`} style={accentStyle(post.accent)}>
        <button type="button" className="fn-share" onClick={() => setShowStory(true)} aria-label={`Share "${post.title}" as a story card`} title="Share as a story card">
          <Share2 size={14} />
        </button>

        <Link href={`/blog/${post.slug}`} className="fn-card">
          {cover}
          {variant === 'feature' ? (
            <div className="fn-fbody">
              <span className="fn-badge">Featured</span>
              {topics && <span className="fn-tag">{topics}</span>}
              <h2>{post.title}</h2>
              {post.excerpt && <p>{post.excerpt}</p>}
              <div className="fn-meta">{meta}</div>
              <span className="fn-more">Read the story <span aria-hidden="true">→</span></span>
            </div>
          ) : (
            <div className="fn-cbody">
              {topics && <span className="fn-tag">{topics}</span>}
              <h3>{post.title}</h3>
              {post.excerpt && <p>{post.excerpt}</p>}
              <div className="fn-meta">{meta}</div>
            </div>
          )}
        </Link>
      </div>
    </>
  )
}
