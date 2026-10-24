import { ImageResponse } from 'next/og'
import { loadCardFonts } from '@/lib/og-fonts'
import { SITE_NAME } from '@/lib/site'

export const alt = 'Riaz Ahmed — Senior Software Engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const LIME = '#82ff1f'

export default async function Image() {
  const fonts = await loadCardFonts()

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', position: 'relative',
        background: 'linear-gradient(135deg, #050505 0%, #0b0b12 55%, #050505 100%)',
        color: '#fff', padding: '68px 76px',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: '14%', bottom: '14%', width: '5px', display: 'flex',
          background: `linear-gradient(to bottom, transparent, ${LIME}, transparent)`,
        }} />
        <div style={{
          position: 'absolute', right: '-120px', top: '-120px', width: '420px', height: '420px',
          borderRadius: '999px', display: 'flex', background: 'rgba(224,32,32,0.12)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
          <span style={{ fontFamily: 'SpaceMono, monospace', fontSize: '19px', letterSpacing: '0.34em', color: LIME, display: 'flex' }}>
            PORTFOLIO · SHOP · MOVIES · BLOG
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
          <div style={{
            fontFamily: 'Bebas, sans-serif', fontSize: '164px', lineHeight: 0.9,
            letterSpacing: '0.02em', display: 'flex',
          }}>
            {SITE_NAME.toUpperCase()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ width: '64px', height: '2px', background: LIME, display: 'flex' }} />
            <span style={{ fontFamily: 'SpaceMono, monospace', fontSize: '24px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.62)', display: 'flex' }}>
              SENIOR SOFTWARE ENGINEER
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
          <div style={{ fontSize: '26px', lineHeight: 1.45, color: 'rgba(255,255,255,0.5)', display: 'flex', maxWidth: '720px' }}>
            Building immersive digital products with React, Next.js &amp; React Native.
          </div>
          <span style={{ fontFamily: 'SpaceMono, monospace', fontSize: '20px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.32)', display: 'flex' }}>
            CHENNAI, IN
          </span>
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}
