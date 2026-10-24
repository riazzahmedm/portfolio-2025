import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { readingTime } from '@/lib/reading-time'
import { getPost } from '@/lib/blog.server'
import { isAdmin } from '@/lib/admin-auth'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import BlockRenderer from '@/components/blog/BlockRenderer'
import RelatedPosts from '@/components/blog/RelatedPosts'
import PostAdminActions from '@/components/blog/PostAdminActions'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post not found' }

  const description = post.excerpt?.trim() || `${post.title} — notes and essays by ${SITE_NAME}.`
  const url         = `/blog/${post.slug}`

  return {
    title:       post.title,
    description,
    keywords:    post.tags,
    alternates:  { canonical: url },
    openGraph: {
      type:           'article',
      url,
      title:          post.title,
      description,
      siteName:       SITE_NAME,
      publishedTime:  post.published_at ?? post.created_at,
      modifiedTime:   post.updated_at,
      authors:        [SITE_NAME],
      tags:           post.tags,
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.title,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params
  const [post, admin] = await Promise.all([getPost(slug), isAdmin()])
  if (!post) notFound()

  const date  = post.published_at ?? post.created_at
  const mins  = readingTime(post)
  const month = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const jsonLd = {
    '@context':      'https://schema.org',
    '@type':         'BlogPosting',
    headline:        post.title,
    description:     post.excerpt ?? undefined,
    image:           post.cover_image ?? `${SITE_URL}/blog/${post.slug}/opengraph-image`,
    datePublished:   post.published_at ?? post.created_at,
    dateModified:    post.updated_at,
    author:          { '@type': 'Person', name: SITE_NAME, url: SITE_URL },
    keywords:        post.tags.join(', '),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
          {admin && <PostAdminActions slug={post.slug} title={post.title} />}
        </div>
      </header>

      {/* ── Cover image ── */}
      {post.cover_image && (
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ position: 'relative', maxHeight: '420px', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_image} alt={post.title} style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--bg))' }} />
          </div>
        </div>
      )}

      {/* ── Article ── */}
      <article style={{ maxWidth: '720px', margin: '0 auto', padding: post.cover_image ? '0 20px 80px' : '48px 20px 80px' }}>

        {/* Draft badge */}
        {!post.published && admin && (
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
              <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} style={{
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

      <RelatedPosts current={post} />
    </div>
  )
}
