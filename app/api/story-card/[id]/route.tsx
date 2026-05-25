import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { VIBES, PLATFORMS } from '@/lib/movies.types'
import type { MovieLog } from '@/lib/movies.types'

export const runtime = 'nodejs'

const LAVENDER = '#b8a0ff'
const BG       = '#050505'

function typeLabel(type: string) {
  return type === 'movie' ? 'MOVIE' : type === 'series' ? 'SERIES' : 'EPISODE'
}

function displayTitle(log: MovieLog) {
  if (log.type !== 'episode') return log.title
  const s = String(log.season ?? '').padStart(2, '0')
  const e = String(log.episode ?? '').padStart(2, '0')
  return `${log.title}  S${s}E${e}`
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: log } = await supabase.from('logs').select('*').eq('id', id).single()
    if (!log) return new Response('Not found', { status: 404 })

    const poster   = log.poster_url ?? null
    const vibe     = VIBES.find(v => v.key === log.vibe)
    const platform = PLATFORMS.find(p => p.key === log.platform)
    const review   = log.review
      ? `"${log.review.slice(0, 120)}${log.review.length > 120 ? '…' : ''}"`
      : null
    const date     = new Date(log.watched_on).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
    const favName  = log.favorite_person?.name ?? null
    const favRole  = log.favorite_person?.role ?? null
    const favImg   = log.favorite_person?.profile_url ?? null

    return new ImageResponse(
      (
        <div
          style={{
            width: '1080px', height: '1920px',
            display: 'flex', flexDirection: 'column',
            position: 'relative', background: BG,
            fontFamily: 'sans-serif', overflow: 'hidden',
          }}
        >
          {/* Blurred poster backdrop — single filter only (Satori limitation) */}
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt=""
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', opacity: 0.15,
              }}
            />
          )}

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(5,5,5,0.3) 0%, rgba(5,5,5,0.7) 40%, rgba(5,5,5,0.97) 100%)',
            display: 'flex',
          }} />

          {/* Content */}
          <div style={{
            position: 'relative',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '100%', padding: '100px 80px',
          }}>
            {/* Type badge */}
            <div style={{
              display: 'flex',
              background: 'rgba(184,160,255,0.12)',
              border: '1px solid rgba(184,160,255,0.35)',
              borderRadius: '100px', padding: '14px 40px',
              color: LAVENDER, fontSize: '26px', letterSpacing: '0.3em',
              marginBottom: '72px',
            }}>
              {typeLabel(log.type)}
              {platform ? `  ·  ${platform.emoji} ${platform.label}` : ''}
            </div>

            {/* Poster */}
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt={log.title}
                style={{
                  width: '300px', height: '450px',
                  objectFit: 'cover', borderRadius: '16px',
                  marginBottom: '72px',
                }}
              />
            )}

            {/* Title */}
            <div style={{
              color: '#ffffff', fontSize: '64px', fontWeight: 700,
              textAlign: 'center', lineHeight: 1.1,
              marginBottom: '16px', maxWidth: '900px',
              display: 'flex',
            }}>
              {displayTitle(log)}
            </div>

            {/* Episode title */}
            {log.episode_title && (
              <div style={{
                display: 'flex',
                color: 'rgba(255,255,255,0.45)', fontSize: '32px',
                marginBottom: '16px', textAlign: 'center',
              }}>
                {log.episode_title}
              </div>
            )}

            {/* Year */}
            {log.year && log.type !== 'episode' && (
              <div style={{
                display: 'flex',
                color: 'rgba(255,255,255,0.3)', fontSize: '28px',
                marginBottom: '48px',
              }}>
                {log.year}
              </div>
            )}

            {/* Vibe */}
            {vibe && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                marginBottom: '52px',
                padding: '18px 40px', borderRadius: '100px',
                background: `${vibe.color}18`,
                border: `1px solid ${vibe.color}55`,
              }}>
                <span style={{ fontSize: '48px' }}>{vibe.emoji}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: vibe.color, fontSize: '36px', fontWeight: 700 }}>{vibe.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '24px' }}>{vibe.sub}</span>
                </div>
              </div>
            )}

            {/* Favourite person */}
            {favName && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '20px',
                marginBottom: '52px',
                padding: '16px 32px 16px 16px',
                background: 'rgba(184,160,255,0.08)',
                border: '1px solid rgba(184,160,255,0.2)',
                borderRadius: '100px',
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  overflow: 'hidden', background: '#1a1a1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {favImg
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={favImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '28px' }}>👤</span>
                  }
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: LAVENDER, fontSize: '28px', fontWeight: 600 }}>♥ {favName}</span>
                  {favRole && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '22px' }}>{favRole}</span>}
                </div>
              </div>
            )}

            {/* Review */}
            {review && (
              <div style={{
                display: 'flex',
                color: 'rgba(255,255,255,0.65)', fontSize: '30px',
                textAlign: 'center', lineHeight: 1.65,
                maxWidth: '820px', fontStyle: 'italic',
                marginBottom: '56px',
                paddingLeft: '36px',
                borderLeft: '3px solid rgba(184,160,255,0.4)',
              }}>
                {review}
              </div>
            )}

            {/* Date */}
            <div style={{
              display: 'flex',
              color: 'rgba(255,255,255,0.22)', fontSize: '26px',
              letterSpacing: '0.14em', marginBottom: '80px',
            }}>
              {date}
            </div>

            {/* Watermark */}
            <div style={{
              position: 'absolute', bottom: '72px',
              display: 'flex', color: 'rgba(255,255,255,0.18)',
              fontSize: '26px', letterSpacing: '0.22em',
            }}>
              riazahmed.com
            </div>
          </div>
        </div>
      ),
      { width: 1080, height: 1920 }
    )
  } catch (err) {
    console.error('[story-card]', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}
