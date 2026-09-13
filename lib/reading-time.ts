import type { BlogPost, ContentBlock } from './blog.types'

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function readingTime(post: BlogPost | { content: ContentBlock[]; excerpt?: string | null }): number {
  const text = post.content
    .filter(b => b.type === 'text' || b.type === 'html')
    .map(b => {
      const block = b as { type: string; content: string }
      return b.type === 'html' ? stripHtml(block.content) : block.content
    })
    .join(' ')
    .trim()

  const source = text || ('excerpt' in post && post.excerpt) || ''
  if (!source) return 1

  const words = source.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
