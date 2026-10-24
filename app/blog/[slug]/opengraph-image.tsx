import { ImageResponse } from 'next/og'
import { getPost } from '@/lib/blog.server'
import { loadCardFonts } from '@/lib/og-fonts'
import { SITE_NAME } from '@/lib/site'

export const alt   = 'Riaz Ahmed — Field Notes'
export const size  = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Posts are database-backed, so the card is rendered per request.
export const dynamic = 'force-dynamic'

const LIME = '#82ff1f'

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug).catch(() => null)
  const fonts = await loadCardFonts()

  const date = post
    ? new Date(post.published_at ?? post.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : ''

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        position: 'relative', background: '#050505', color: '#fff',
        padding: '64px 72px', justifyContent: 'space-between',
      }}>
        {post?.cover_image && (
          <img
            src={post.cover_image}
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28 }}
          />
        )}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          background: 'linear-gradient(110deg, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.9) 45%, rgba(5,5,5,0.6) 100%)',
        }} />
        <div style={{
          position: 'absolute', left: 0, top: '12%', bottom: '12%', width: '5px', display: 'flex',
          background: `linear-gradient(to bottom, transparent, ${LIME}, transparent)`,
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
          <span style={{ fontFamily: 'SpaceMono, monospace', fontSize: '20px', letterSpacing: '0.32em', color: LIME, display: 'flex' }}>
            FIELD NOTES
          </span>
          <span style={{ width: '180px', height: '1px', background: `${LIME}55`, display: 'flex' }} />
          {date && (
            <span style={{ fontFamily: 'SpaceMono, monospace', fontSize: '18px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.45)', display: 'flex' }}>
              {date}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', position: 'relative' }}>
          <div style={{
            fontFamily: 'Bebas, sans-serif', fontSize: post && post.title.length > 46 ? '78px' : '96px',
            lineHeight: 0.95, letterSpacing: '0.02em', display: 'flex',
          }}>
            {truncate(post?.title ?? 'Field Notes', 90)}
          </div>
          {post?.excerpt && (
            <div style={{ fontSize: '24px', lineHeight: 1.5, color: 'rgba(255,255,255,0.55)', display: 'flex', maxWidth: '900px' }}>
              {truncate(post.excerpt, 140)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {(post?.tags ?? []).slice(0, 3).map(tag => (
              <div key={tag} style={{
                display: 'flex', padding: '8px 18px', border: `1px solid ${LIME}44`,
                background: `${LIME}12`, color: `${LIME}dd`,
                fontFamily: 'SpaceMono, monospace', fontSize: '16px', letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>
                {tag}
              </div>
            ))}
          </div>
          <span style={{ fontFamily: 'SpaceMono, monospace', fontSize: '18px', letterSpacing: '0.24em', color: `${LIME}77`, display: 'flex' }}>
            {SITE_NAME.toUpperCase()}
          </span>
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}
