import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog.server'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,       lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/hub`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/shop`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/blog`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/movies`, lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
  ]

  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = []
  try {
    posts = await getPublishedPosts()
  } catch {
    // Sitemap still works with the static routes if the blog can't be reached.
  }

  const postRoutes: MetadataRoute.Sitemap = posts.map(post => ({
    url:              `${SITE_URL}/blog/${post.slug}`,
    lastModified:     new Date(post.updated_at ?? post.published_at ?? Date.now()),
    changeFrequency:  'monthly',
    priority:         0.6,
  }))

  return [...staticRoutes, ...postRoutes]
}
