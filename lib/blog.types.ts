export interface TextBlock {
  type: 'text'
  content: string   // markdown
}

export interface ImageBlock {
  type: 'image'
  url: string
  alt?: string
  caption?: string
}

export interface VideoBlock {
  type: 'video'
  url: string       // YouTube, Vimeo, or direct .mp4/.webm URL
  caption?: string
}

export interface HtmlBlock {
  type: 'html'
  content: string   // raw HTML — admin-only, rendered as-is
}

export type ContentBlock = TextBlock | ImageBlock | VideoBlock | HtmlBlock

/** A post's colour, read from its cover: an "r,g,b" triple for the dark page and one for the light paper. */
export interface PostAccent { dark: string; light: string }

/** A post without its body — what listing pages need, plus a precomputed read time and its colour. */
export type BlogPostSummary = Omit<BlogPost, 'content'> & { reading_minutes: number; accent: PostAccent | null }

export interface BlogPost {
  id:           string
  title:        string
  slug:         string
  excerpt:      string | null
  cover_image:  string | null
  content:      ContentBlock[]
  tags:         string[]
  published:    boolean
  published_at: string | null
  created_at:   string
  updated_at:   string
}
