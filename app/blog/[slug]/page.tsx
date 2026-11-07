import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { readingTime } from '@/lib/reading-time'
import { getPost, getRelatedPosts } from '@/lib/blog.server'
import { getCoverAccent } from '@/lib/blog-accent'
import { accentStyle } from '@/lib/blog-accent-style'
import { isAdmin } from '@/lib/admin-auth'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import BlockRenderer from '@/components/blog/BlockRenderer'
import RelatedPosts from '@/components/blog/RelatedPosts'
import PostAdminActions from '@/components/blog/PostAdminActions'
import ScrollNav from '@/components/ui/ScrollNav'
import ReadingProgress from '@/components/blog/ReadingProgress'
import PostRail from '@/components/blog/PostRail'
import { ThemeToggle } from '@/components/blog/BlogTheme'

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
  const [related, accent] = await Promise.all([
    post.published ? getRelatedPosts(post.slug, post.tags).catch(() => []) : Promise.resolve([]),
    getCoverAccent(post.cover_image),
  ])

  const mins  = readingTime(post)
  const month = new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

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
    <div className="fn-accent" style={accentStyle(accent)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ReadingProgress />

      {/* ── Top bar: the story's title once you scroll, the theme switch, and the admin actions ── */}
      <ScrollNav>
        <div className="fn-navin" style={{ justifyContent: 'space-between' }}>
          <div className="fn-navtitle">{post.title}</div>
          <ThemeToggle />
          {admin && <PostAdminActions slug={post.slug} title={post.title} />}
        </div>
      </ScrollNav>

      {/* ── Hero: the cover runs full-bleed behind the title ── */}
      <section className="fn-hero">
        {post.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_image} alt="" fetchPriority="high" decoding="async" />
        )}
        <div className="fn-hero-in">
          {!post.published && admin && <div className="fn-draft">Draft — not published</div>}
          {post.tags.length > 0 && (
            <div className="fn-tags">
              {post.tags.map(t => (
                <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="fn-herotag">{t}</Link>
              ))}
            </div>
          )}
          <h1>{post.title}</h1>
          {post.excerpt && <p className="fn-dek">{post.excerpt}</p>}
        </div>
      </section>

      {/* ── Meta rail beside the story ── */}
      <div className="fn-shell">
        <PostRail slug={post.slug} title={post.title} written={month} minutes={mins} />
        <article className="fn-article">
          <BlockRenderer blocks={post.content} />
        </article>
      </div>

      <RelatedPosts posts={related} />
    </div>
  )
}
