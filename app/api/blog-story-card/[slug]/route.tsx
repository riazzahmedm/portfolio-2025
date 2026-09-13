import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/lib/blog.types'

export const runtime = 'nodejs'

type FontEntry = { name: string; data: ArrayBuffer; weight: 400; style: 'normal' }

const fontCache = new Map<string, ArrayBuffer>()
async function loadGoogleFont(family: string): Promise<ArrayBuffer | null> {
  if (fontCache.has(family)) return fontCache.get(family)!
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}&display=swap`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; next/og)' } }
    ).then(r => r.text())
    const url = css.match(/src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1]
    if (!url) return null
    const data = await fetch(url).then(r => r.arrayBuffer())
    fontCache.set(family, data)
    return data
  } catch { return null }
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

function editorial(post: BlogPost, date: string) {
  const LIME = '#82ff1f'
  return (
    <div style={{ width: '1080px', height: '1920px', background: '#050505', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Cover image backdrop */}
      {post.cover_image && (
        <img src={post.cover_image} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22 }} />
      )}
      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.72) 35%, rgba(5,5,5,0.97) 75%)', display: 'flex' }} />
      {/* Lime left strip */}
      <div style={{ position: 'absolute', left: 0, top: '8%', bottom: '8%', width: '5px', background: `linear-gradient(to bottom, transparent, ${LIME}, transparent)`, display: 'flex' }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: '120px 90px' }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '60px' }}>
          {post.tags.slice(0, 4).map(tag => (
            <div key={tag} style={{
              display: 'flex', padding: '10px 28px',
              border: `1px solid ${LIME}55`, background: `${LIME}14`,
              color: LIME, fontSize: '20px', letterSpacing: '0.2em',
              textTransform: 'uppercase', fontFamily: 'SpaceMono, monospace',
            }}>
              {tag}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex' }} />

        {/* Lime rule */}
        <div style={{ width: '100%', height: '1px', background: `linear-gradient(to right, ${LIME}80, transparent)`, marginBottom: '56px', display: 'flex' }} />

        {/* Title */}
        <div style={{ color: '#ffffff', fontFamily: 'Bebas, sans-serif', fontSize: '118px', letterSpacing: '0.03em', lineHeight: 0.92, marginBottom: '40px', display: 'flex' }}>
          {truncate(post.title, 80)}
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <div style={{ color: 'rgba(255,255,255,0.52)', fontSize: '32px', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '52px', display: 'flex' }}>
            {truncate(post.excerpt, 160)}
          </div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '24px', letterSpacing: '0.14em', fontFamily: 'SpaceMono, monospace', display: 'flex' }}>
            {date}
          </span>
          <span style={{ color: `${LIME}55`, fontSize: '22px', letterSpacing: '0.22em', fontFamily: 'SpaceMono, monospace', display: 'flex' }}>
            RIAZ AHMED
          </span>
        </div>
      </div>
    </div>
  )
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).single()
    if (!post) return new Response('Not found', { status: 404 })

    const date = new Date(post.published_at ?? post.created_at).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })

    const [bebasData, spaceData] = await Promise.all([
      loadGoogleFont('Bebas+Neue'),
      loadGoogleFont('Space+Mono'),
    ])
    const fonts: FontEntry[] = []
    if (bebasData) fonts.push({ name: 'Bebas',     data: bebasData, weight: 400, style: 'normal' })
    if (spaceData) fonts.push({ name: 'SpaceMono', data: spaceData, weight: 400, style: 'normal' })

    return new ImageResponse(editorial(post as BlogPost, date), { width: 1080, height: 1920, fonts })
  } catch (err) {
    console.error('[blog-story-card]', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}
