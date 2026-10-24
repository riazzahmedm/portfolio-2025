import { getPublishedPostList } from '@/lib/blog.server'
import BlogIndex from '@/components/blog/BlogIndex'

// Posts are rendered on the server and refreshed in the background, so crawlers
// and first paint both get the full list without hitting the database every request.
export const revalidate = 60

export default async function BlogPage() {
  const posts = await getPublishedPostList()
  return <BlogIndex posts={posts} />
}
