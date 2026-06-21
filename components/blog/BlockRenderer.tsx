'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ContentBlock } from '@/lib/blog.types'

// ── Video URL helpers ─────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const m =
    url.match(/youtu\.be\/([^?&]+)/) ??
    url.match(/[?&]v=([^?&]+)/) ??
    url.match(/embed\/([^?&]+)/)
  return m?.[1] ?? null
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/)
  return m?.[1] ?? null
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
}

// ── Block components ──────────────────────────────────────────────────────────
function TextBlock({ content }: { content: string }) {
  return (
    <div style={{
      fontFamily:   'var(--ff-body)',
      fontSize:     '17px',
      lineHeight:   1.8,
      color:        'rgba(255,255,255,0.82)',
      letterSpacing: '0.01em',
    }}
      className="blog-markdown"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

function ImageBlock({ url, alt, caption }: { url: string; alt?: string; caption?: string }) {
  return (
    <figure style={{ margin: '0 auto', maxWidth: '600px' }}>
      <img
        src={url}
        alt={alt ?? caption ?? ''}
        style={{
          width:        '100%',
          borderRadius: '12px',
          display:      'block',
          objectFit:    'cover',
          border:       '1px solid rgba(255,255,255,0.07)',
        }}
      />
      {caption && (
        <figcaption style={{
          marginTop:    '10px',
          textAlign:    'center',
          fontSize:     '13px',
          fontFamily:   'var(--ff-mono)',
          color:        'var(--text-dim)',
          letterSpacing: '0.04em',
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function VideoBlock({ url, caption }: { url: string; caption?: string }) {
  const ytId    = getYouTubeId(url)
  const vimeoId = getVimeoId(url)

  const embed = ytId ? (
    <iframe
      src={`https://www.youtube.com/embed/${ytId}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
    />
  ) : vimeoId ? (
    <iframe
      src={`https://player.vimeo.com/video/${vimeoId}`}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
    />
  ) : isDirectVideo(url) ? (
    <video
      src={url}
      controls
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#000' }}
    />
  ) : (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>
      Unsupported video URL
    </div>
  )

  return (
    <figure style={{ margin: 0 }}>
      <div style={{
        position:     'relative',
        paddingBottom: '56.25%',
        borderRadius: '12px',
        overflow:     'hidden',
        background:   '#0a0a0a',
        border:       '1px solid rgba(255,255,255,0.07)',
      }}>
        {embed}
      </div>
      {caption && (
        <figcaption style={{
          marginTop:    '10px',
          textAlign:    'center',
          fontSize:     '13px',
          fontFamily:   'var(--ff-mono)',
          color:        'var(--text-dim)',
          letterSpacing: '0.04em',
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// ── Markdown styles injected once ─────────────────────────────────────────────
const MARKDOWN_CSS = `
.blog-markdown p  { margin: 0 0 1.1em; }
.blog-markdown p:last-child { margin-bottom: 0; }
.blog-markdown h1,.blog-markdown h2,.blog-markdown h3 {
  font-family: var(--ff-display);
  font-weight: 400;
  letter-spacing: 0.04em;
  color: #fff;
  margin: 1.6em 0 0.5em;
  text-transform: uppercase;
}
.blog-markdown h1 { font-size: 2rem; }
.blog-markdown h2 { font-size: 1.4rem; }
.blog-markdown h3 { font-size: 1.1rem; }
.blog-markdown strong { color: #fff; font-weight: 600; }
.blog-markdown em { color: rgba(255,255,255,0.75); font-style: italic; }
.blog-markdown a { color: #82ff1f; text-decoration: underline; text-underline-offset: 3px; }
.blog-markdown a:hover { color: rgba(130,255,31,0.75); }
.blog-markdown code {
  font-family: var(--ff-mono);
  font-size: 0.85em;
  background: rgba(130,255,31,0.1);
  border: 1px solid rgba(130,255,31,0.2);
  border-radius: 4px;
  padding: 2px 6px;
  color: #82ff1f;
}
.blog-markdown pre {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 16px 20px;
  overflow-x: auto;
  margin: 0 0 1.1em;
}
.blog-markdown pre code {
  background: none;
  border: none;
  padding: 0;
  color: rgba(255,255,255,0.8);
  font-size: 0.9em;
}
.blog-markdown ul,.blog-markdown ol { padding-left: 1.4em; margin: 0 0 1.1em; }
.blog-markdown li { margin-bottom: 0.35em; }
.blog-markdown blockquote {
  border-left: 3px solid #82ff1f;
  margin: 0 0 1.1em;
  padding: 4px 16px;
  color: rgba(255,255,255,0.6);
  font-style: italic;
}
.blog-markdown hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.6em 0; }
`

// ── HTML block — maps the blog HTML's CSS variables to our portfolio theme ────
const HTML_VARS_CSS = `
.blog-html-block {
  --color-text-primary:        var(--text-primary);
  --color-text-secondary:      rgba(255,255,255,0.62);
  --color-text-tertiary:       var(--text-dim);
  --color-background-secondary:rgba(255,255,255,0.07);
  --color-border-tertiary:     var(--border-card);
  --color-border-secondary:    var(--border-card);
  --font-sans:                 var(--ff-body);
  --font-serif:                var(--ff-display);
  font-family: var(--ff-body);
  color: var(--text-primary);
}
`

function HtmlBlock({ content }: { content: string }) {
  return (
    <div
      className="blog-html-block"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

// ── Public API ────────────────────────────────────────────────────────────────
export default function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      <style>{MARKDOWN_CSS}</style>
      <style>{HTML_VARS_CSS}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {blocks.map((block, i) => {
          if (block.type === 'text')  return <TextBlock  key={i} content={block.content} />
          if (block.type === 'image') return <ImageBlock key={i} url={block.url} alt={block.alt} caption={block.caption} />
          if (block.type === 'video') return <VideoBlock key={i} url={block.url} caption={block.caption} />
          if (block.type === 'html')  return <HtmlBlock  key={i} content={block.content} />
          return null
        })}
      </div>
    </>
  )
}
