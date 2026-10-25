import Link from 'next/link'
import type { BlogPostSummary } from '@/lib/blog.types'

export default function RelatedPosts({ posts }: { posts: BlogPostSummary[] }) {
  if (posts.length === 0) return null

  return (
    <section style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#82ff1f' }}>Keep reading</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(130,255,31,0.3), transparent)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        {posts.map(p => (
          <Link key={p.id} href={`/blog/${p.slug}`} style={{
            display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {p.cover_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.cover_image} alt="" style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: '15px', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2, color: '#fff' }}>
                {p.title}
              </div>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(130,255,31,0.6)' }}>
                {p.reading_minutes} min read
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
