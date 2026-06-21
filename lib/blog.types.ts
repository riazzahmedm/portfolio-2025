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
