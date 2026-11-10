import Link from 'next/link'
import type { BlogPostSummary } from '@/lib/blog.types'
import AccentScope from './AccentScope'

const FALLBACKS = ['fn-c3', 'fn-c2', 'fn-c4']

export default function RelatedPosts({ posts }: { posts: BlogPostSummary[] }) {
  if (posts.length === 0) return null

  return (
    <section className="fn-keep" aria-label="More stories">
      <div className="fn-sec">Keep reading<i /></div>
      <div className="fn-grid">
        {posts.map((p, i) => (
          <AccentScope key={p.id} accent={p.accent} className="fn-cardwrap">
            <Link href={`/blog/${p.slug}`} className="fn-card">
              <div className={`fn-cv${p.cover_image ? '' : ` ${FALLBACKS[i % FALLBACKS.length]}`}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.cover_image && <img src={p.cover_image} alt="" data-cover crossOrigin="anonymous" loading="lazy" decoding="async" />}
              </div>
              <div className="fn-cbody">
                {p.tags[0] && <span className="fn-tag">{p.tags[0]}</span>}
                <h3>{p.title}</h3>
                <span className="fn-meta">{p.reading_minutes} min read</span>
              </div>
            </Link>
          </AccentScope>
        ))}
      </div>
    </section>
  )
}
