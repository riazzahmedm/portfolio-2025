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

/** Published posts for the blog index — bodies are dropped so they don't ship in the page payload. */
export const getPublishedPostList = cache(async (): Promise<BlogPostSummary[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error || !data) return []

  return (data as BlogPost[]).map(({ content, ...post }) => ({
    ...post,
    reading_minutes: readingTime({ content, excerpt: post.excerpt }),
  }))
})

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
