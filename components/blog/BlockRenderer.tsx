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
function TextBlock({ content, lead }: { content: string; lead?: boolean }) {
  return (
    <div style={{
      fontFamily:   'var(--ff-body)',
      fontSize:     '18px',
      lineHeight:   1.85,
      color:        'rgba(var(--fn-ink), 0.82)',
    }}
      className={`blog-markdown${lead ? ' fn-lead' : ''}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

function ImageBlock({ url, alt, caption }: { url: string; alt?: string; caption?: string }) {
  return (
    <figure className="fn-fig">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt ?? caption ?? ''} loading="lazy" decoding="async" />
      {caption && <figcaption>{caption}</figcaption>}
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
        border:       '1px solid var(--fn-line)',
      }}>
        {embed}
      </div>
      {caption && (
        <figcaption style={{
          marginTop:    '10px',
          fontSize:     '11px',
          fontFamily:   'var(--ff-mono)',
          color:        'var(--fn-dim)',
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
.blog-markdown p  { margin: 0 0 1.4em; }
.blog-markdown p:last-child { margin-bottom: 0; }
.blog-markdown.fn-lead > p:first-child::first-letter {
  float: left; font: 400 5.4rem/.8 var(--ff-display); color: var(--fn-lime); padding: 8px 12px 0 0;
}
.blog-markdown h1,.blog-markdown h2,.blog-markdown h3 {
  font-family: var(--ff-display);
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--fn-text);
  margin: 1.8em 0 0.5em;
  text-transform: uppercase;
  line-height: 1.05;
}
.blog-markdown h1 { font-size: 2.6rem; }
.blog-markdown h2 { font-size: 2.2rem; }
.blog-markdown h3 { font-size: 1.5rem; }
.blog-markdown strong { color: var(--fn-text); font-weight: 600; }
.blog-markdown em { color: rgba(var(--fn-ink), 0.75); font-style: italic; }
.blog-markdown a { color: var(--fn-lime); text-decoration: underline; text-underline-offset: 3px; }
.blog-markdown code {
  font-family: var(--ff-mono);
  font-size: 0.85em;
  background: rgba(var(--fn-accent-rgb), 0.1);
  border: 1px solid rgba(var(--fn-accent-rgb), 0.2);
  border-radius: 4px;
  padding: 2px 6px;
  color: var(--fn-lime);
}
.blog-markdown pre {
  background: rgba(var(--fn-ink), 0.04);
  border: 1px solid var(--fn-line);
  border-radius: 10px;
  padding: 16px 20px;
  overflow-x: auto;
  margin: 0 0 1.4em;
}
.blog-markdown pre code { background: none; border: none; padding: 0; color: rgba(var(--fn-ink), 0.8); font-size: 0.9em; }
.blog-markdown ul,.blog-markdown ol { padding-left: 1.4em; margin: 0 0 1.4em; }
.blog-markdown li { margin-bottom: 0.4em; }
.blog-markdown blockquote {
  margin: 1.8em 0; padding: 26px 28px; border-left: 3px solid var(--fn-red);
  background: linear-gradient(to right, rgba(224,32,32,0.07), transparent);
  font: italic 400 1.6rem/1.4 var(--ff-serif); color: var(--fn-text);
}
.blog-markdown blockquote p { margin: 0; }
.blog-markdown hr { border: none; border-top: 1px solid var(--fn-line); margin: 1.8em 0; }

.fn-fig { margin: 0; }
.fn-fig img { width: 100%; height: auto; display: block; border-radius: 16px; }
.fn-fig figcaption { margin-top: 10px; font: 11px/1.6 var(--ff-mono); color: var(--fn-dim); letter-spacing: 0.04em; }
@media (min-width: 1000px) { .fn-fig { margin-left: -60px; margin-right: -60px; } }
`

// ── HTML block — maps the blog HTML's CSS variables to our portfolio theme ────
const HTML_VARS_CSS = `
.blog-html-block {
  --color-text-primary:        var(--fn-text);
  --color-text-secondary:      rgba(var(--fn-ink), 0.66);
  --color-text-tertiary:       var(--fn-dim);
  --color-background-secondary:rgba(var(--fn-ink), 0.07);
  --color-border-tertiary:     var(--fn-line);
  --color-border-secondary:    var(--fn-line);
  --font-sans:                 var(--ff-body);
  --font-serif:                var(--ff-display);
  font-family: var(--ff-body);
  color: var(--fn-text);
}
`

// Posts imported as HTML carry dark-theme colours of their own (white-based text, the lime accent). Map those to the
// blog's theme tokens so the same post reads correctly in both light and dark.
function themeColours(css: string): string {
  return css
    .replace(/rgba\(255,\s*180,\s*180,\s*0?\.85\)/gi, 'var(--fn-warn)')
    .replace(/rgba\(255,\s*255,\s*255,/gi, 'rgba(var(--fn-ink),')
    .replace(/rgba\(130,\s*255,\s*31,/gi, 'rgba(var(--fn-accent-rgb),')
    .replace(/#82ff1f\b/gi, 'var(--fn-lime)')
    .replace(/color:\s*#fff(?:fff)?\b/gi, 'color: var(--fn-text)')
}

// Strip the HTML document boilerplate and scope embedded <style> rules so they
// don't leak out and affect the rest of the page (body, * selectors etc.).
function processHtml(raw: string): { styles: string; body: string } {
  // Extract all <style>…</style> blocks
  const styleBlocks: string[] = []
  const withoutStyles = raw.replace(/<style[\s\S]*?<\/style>/gi, m => {
    // Pull out just the CSS text
    const css = m.replace(/<\/?style[^>]*>/gi, '')
    styleBlocks.push(css)
    return ''
  })

  // Scope each CSS rule to .blog-html-block so it cannot affect the outer page.
  // Rewrite selectors like `body { … }` → `.blog-html-block { … }` and
  // `* { … }` → `.blog-html-block * { … }`.
  const scopedCss = styleBlocks
    .join('\n')
    .replace(/([^{}]+)\{/g, (match, selector) => {
      const scoped = selector
        .split(',')
        .map((s: string) => {
          const t = s.trim()
          if (!t) return ''
          // Replace bare html/body selectors with the wrapper class
          if (/^(html|body|\*)$/.test(t)) return `.blog-html-block`
          // Prefix everything else
          return `.blog-html-block ${t}`
        })
        .filter(Boolean)
        .join(', ')
      return `${scoped} {`
    })

  // Extract just the <body> content (strip html/head/body wrapper tags)
  let bodyContent = withoutStyles
  bodyContent = bodyContent.replace(/<!DOCTYPE[^>]*>/gi, '')
  bodyContent = bodyContent.replace(/<\/?html[^>]*>/gi, '')
  bodyContent = bodyContent.replace(/<head[\s\S]*?<\/head>/gi, '')
  bodyContent = bodyContent.replace(/<\/?body[^>]*>/gi, '')

  return { styles: themeColours(scopedCss), body: themeColours(bodyContent.trim()) }
}

function HtmlBlock({ content }: { content: string }) {
  const { styles, body } = processHtml(content)
  return (
    <>
      {styles && <style>{styles}</style>}
      <div
        className="blog-html-block"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  )
}

// ── Public API ────────────────────────────────────────────────────────────────
export default function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      <style>{MARKDOWN_CSS}</style>
      <style>{HTML_VARS_CSS}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {blocks.map((block, i) => {
          if (block.type === 'text')  return <TextBlock  key={i} content={block.content} lead={i === 0} />
          if (block.type === 'image') return <ImageBlock key={i} url={block.url} alt={block.alt} caption={block.caption} />
          if (block.type === 'video') return <VideoBlock key={i} url={block.url} caption={block.caption} />
          if (block.type === 'html')  return <HtmlBlock  key={i} content={block.content} />
          return null
        })}
      </div>
    </>
  )
}
