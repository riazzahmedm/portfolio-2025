import { cache } from 'react'
import { supabase } from './supabase'
import { isAdmin } from './admin-auth'
import { readingTime } from './reading-time'
import type { BlogPost, BlogPostSummary } from './blog.types'

/**
 * Loads a post for server rendering. Drafts are visible to a signed-in admin only.
 * Wrapped in `cache` so the page and its `generateMetadata` share one query per request.
 */
export const getPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const admin = await isAdmin()

  let query = supabase.from('blog_posts').select('*').eq('slug', slug)
  if (!admin) query = query.eq('published', true)

  const { data, error } = await query.single()
  if (error || !data) return null
  return data as BlogPost
})

/**
 * Published posts for the blog index, newest story first. "Newest" is when a story was written (created_at), not when its
 * publish button was last pressed: posts published in one sitting would otherwise sort by the order of the clicks.
 * Bodies are dropped so they don't ship in the page payload.
 */
export const getPublishedPostList = cache(async (): Promise<BlogPostSummary[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return (data as BlogPost[]).map(({ content, ...post }) => ({
    ...post,
    reading_minutes: readingTime({ content, excerpt: post.excerpt }),
  }))
})

/**
 * Up to `limit` other published posts for the "keep reading" row: posts sharing tags with this one first
 * (most overlap, then newest), then the newest remaining posts, so a small blog never shows an empty row.
 */
export async function getRelatedPosts(slug: string, tags: string[], limit = 3): Promise<BlogPostSummary[]> {
  const norm = (t: string) => t.trim().toLowerCase()
  const mine = new Set(tags.map(norm))
  const time = (p: BlogPostSummary) => new Date(p.created_at).getTime()

  const others = (await getPublishedPostList()).filter(p => p.slug !== slug)
  return others
    .map(p => ({ p, score: p.tags.filter(t => mine.has(norm(t))).length }))
    .sort((a, b) => b.score - a.score || time(b.p) - time(a.p))
    .slice(0, limit)
    .map(x => x.p)
}

/** Published posts, newest first — used by the sitemap. */
export async function getPublishedPosts(): Promise<Pick<BlogPost, 'slug' | 'updated_at' | 'published_at'>[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return data as Pick<BlogPost, 'slug' | 'updated_at' | 'published_at'>[]
}
