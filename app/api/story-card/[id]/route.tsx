import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { VIBES, PLATFORMS } from '@/lib/movies.types'
import type { MovieLog } from '@/lib/movies.types'

export const runtime = 'nodejs'

type VibeDef     = typeof VIBES[number]     | undefined
type PlatformDef = typeof PLATFORMS[number] | undefined
type FontEntry   = { name: string; data: ArrayBuffer; weight: 400; style: 'normal' }

// ── Font loading (cached per warm instance) ──────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function typeLabel(type: string) {
  return type === 'movie' ? 'MOVIE' : type === 'series' ? 'SERIES' : 'EPISODE'
}
function displayTitle(log: MovieLog) {
  if (log.type !== 'episode') return log.title
  return `${log.title}  S${String(log.season ?? '').padStart(2,'0')}E${String(log.episode ?? '').padStart(2,'0')}`
}

// ── V1: NEON CYBERPUNK ───────────────────────────────────────────────────────
function v1(log: MovieLog, poster: string|null, vibe: VibeDef, platform: PlatformDef, review: string|null) {
  const PINK = '#ff0080', CYAN = '#00e5ff'
  return (
    <div style={{ width:'1080px', height:'1920px', background:'#000', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      {/* Blurred poster backdrop */}
      {poster && <img src={poster} alt="" style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.18 }} />}
      {/* Dark overlay to keep neon readable */}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.75) 50%,rgba(0,0,0,0.92) 100%)', display:'flex' }} />
      {/* Grid overlay */}
      <div style={{ position:'absolute', inset:0, display:'flex', background:`repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,0,128,0.07) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(0,229,255,0.05) 80px)` }} />
      {/* Scanlines */}
      <div style={{ position:'absolute', inset:0, display:'flex', background:'repeating-linear-gradient(0deg,rgba(0,0,0,0.14),rgba(0,0,0,0.14) 1px,transparent 2px,transparent 4px)' }} />

      <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:'140px 100px' }}>
        {/* Type badge */}
        <div style={{ display:'flex', padding:'12px 44px', border:`1px solid ${PINK}55`, color:PINK, fontSize:'24px', letterSpacing:'0.55em', marginBottom:'56px', textShadow:`0 0 12px ${PINK}` }}>
          {typeLabel(log.type)}{platform ? `  ·  ${platform.label}` : ''}
        </div>
        {/* Cyan rule */}
        <div style={{ width:'100%', height:'1px', background:`linear-gradient(to right,transparent,${CYAN}80,transparent)`, marginBottom:'56px', display:'flex' }} />
        {/* Poster */}
        {poster && <img src={poster} alt={log.title} style={{ width:'280px', height:'420px', objectFit:'cover', border:`2px solid ${PINK}80`, marginBottom:'56px' }} />}
        {/* Title */}
        <div style={{ color:'#fff', fontFamily:'Bebas,sans-serif', fontSize:'108px', letterSpacing:'0.04em', textAlign:'center', lineHeight:0.93, marginBottom:'28px', display:'flex', textShadow:`0 0 30px ${PINK}55,0 0 60px ${PINK}28` }}>
          {displayTitle(log)}
        </div>
        {/* Year */}
        {log.year && log.type!=='episode' && <div style={{ color:CYAN, fontFamily:'Bebas,sans-serif', fontSize:'36px', letterSpacing:'0.4em', marginBottom:'48px', display:'flex', textShadow:`0 0 10px ${CYAN}` }}>{log.year}</div>}
        {/* Cyan rule */}
        <div style={{ width:'100%', height:'1px', background:`linear-gradient(to right,transparent,${CYAN}80,transparent)`, marginBottom:'48px', display:'flex' }} />
        {/* Vibe */}
        {vibe && (
          <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'44px' }}>
            <span style={{ fontSize:'56px', display:'flex' }}>{vibe.emoji}</span>
            <span style={{ color:PINK, fontFamily:'Bebas,sans-serif', fontSize:'50px', letterSpacing:'0.1em', display:'flex', textShadow:`0 0 16px ${PINK}` }}>{vibe.label}</span>
          </div>
        )}
        {/* Review */}
        {review && <div style={{ color:'rgba(255,255,255,0.52)', fontSize:'26px', textAlign:'center', lineHeight:1.6, fontStyle:'italic', display:'flex', maxWidth:'800px' }}>{review}</div>}
        <div style={{ position:'absolute', bottom:'84px', color:`${PINK}38`, fontSize:'18px', letterSpacing:'0.35em', display:'flex' }}>RIAZ AHMED</div>
      </div>
    </div>
  )
}

// ── V2: MATRIX TERMINAL ──────────────────────────────────────────────────────
function v2(log: MovieLog, poster: string|null, vibe: VibeDef, platform: PlatformDef, review: string|null, date: string) {
  const G = '#00ff41'
  const strips = Array.from({length:22},(_,i)=>i)
  return (
    <div style={{ width:'1080px', height:'1920px', background:'#000', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', fontFamily:'SpaceMono,monospace' }}>
      {/* Rain strips */}
      {strips.map(i => <div key={i} style={{ position:'absolute', left:`${i*50}px`, top:0, bottom:0, width:'1px', background:`linear-gradient(to bottom,transparent,${G}18 20%,${G}28 50%,${G}18 80%,transparent)`, display:'flex' }} />)}
      {/* Terminal border */}
      <div style={{ position:'absolute', inset:'50px', border:`1px solid ${G}28`, display:'flex' }} />
      <div style={{ position:'absolute', inset:'54px', border:`1px solid ${G}12`, display:'flex' }} />

      <div style={{ position:'relative', display:'flex', flexDirection:'column', justifyContent:'center', padding:'120px 100px', height:'100%' }}>
        {/* Window dots */}
        <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'60px' }}>
          <div style={{ display:'flex', gap:'10px' }}>
            {['#ff5f57','#febc2e','#28c840'].map((c,i) => <div key={i} style={{ width:'20px', height:'20px', borderRadius:'50%', background:c, opacity:0.65, display:'flex' }} />)}
          </div>
          <div style={{ color:`${G}55`, fontSize:'20px', letterSpacing:'0.14em', display:'flex', marginLeft:'16px' }}>
            SYSTEM LOG — {typeLabel(log.type)}{platform ? ` / ${platform.label.toUpperCase()}` : ''}
          </div>
        </div>

        {/* Poster framed */}
        {poster && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', marginBottom:'44px' }}>
            <div style={{ color:`${G}45`, fontSize:'18px', display:'flex', marginBottom:'10px' }}>{'/* VISUAL RECORD */'}</div>
            <img src={poster} alt={log.title} style={{ width:'220px', height:'330px', objectFit:'cover', border:`1px solid ${G}45`, marginBottom:'8px' }} />
            <div style={{ color:`${G}30`, fontSize:'16px', display:'flex' }}>{log.year ? `[${log.year}]` : ''}</div>
          </div>
        )}

        {/* > Title */}
        <div style={{ display:'flex', alignItems:'flex-start', marginBottom:'28px' }}>
          <span style={{ color:`${G}50`, fontSize:'40px', marginRight:'20px', display:'flex', flexShrink:0, paddingTop:'8px' }}>&gt;</span>
          <div style={{ color:G, fontFamily:'SpaceMono,monospace', fontSize:'70px', fontWeight:700, lineHeight:0.94, display:'flex', textShadow:`0 0 20px ${G}55,0 0 40px ${G}28` }}>
            {displayTitle(log)}
          </div>
        </div>
        {log.episode_title && <div style={{ color:`${G}65`, fontSize:'26px', marginBottom:'16px', marginLeft:'60px', display:'flex' }}>{log.episode_title}</div>}

        {/* Divider */}
        <div style={{ width:'100%', height:'1px', background:`${G}28`, margin:'28px 0', display:'flex' }} />

        {/* STATUS */}
        {vibe && (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'28px' }}>
            <div style={{ color:`${G}45`, fontSize:'18px', letterSpacing:'0.18em', display:'flex' }}>STATUS:</div>
            <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
              <span style={{ fontSize:'38px', display:'flex' }}>{vibe.emoji}</span>
              <span style={{ color:G, fontFamily:'SpaceMono,monospace', fontSize:'38px', fontWeight:700, display:'flex', textShadow:`0 0 10px ${G}` }}>{vibe.label.toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* NOTES */}
        {review && (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'28px' }}>
            <div style={{ color:`${G}45`, fontSize:'18px', letterSpacing:'0.18em', display:'flex' }}>NOTES:</div>
            <div style={{ color:`${G}75`, fontSize:'24px', lineHeight:1.6, display:'flex' }}>{review}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ position:'absolute', bottom:'82px', left:'100px', right:'100px', display:'flex', justifyContent:'space-between' }}>
          <span style={{ color:`${G}38`, fontSize:'16px', letterSpacing:'0.1em', display:'flex' }}>{date}</span>
          <span style={{ color:`${G}28`, fontSize:'16px', letterSpacing:'0.1em', display:'flex' }}>RIAZ AHMED</span>
        </div>
      </div>
    </div>
  )
}

// ── V3: BRUTALIST POP ────────────────────────────────────────────────────────
function v3(log: MovieLog, poster: string|null, vibe: VibeDef, platform: PlatformDef, review: string|null, date: string) {
  const accent = vibe?.color ?? '#ffe600'
  return (
    <div style={{ width:'1080px', height:'1920px', background:'#f2ede6', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      {/* Ghost year bg */}
      {log.year && <div style={{ position:'absolute', top:'-40px', right:'-30px', color:'rgba(0,0,0,0.045)', fontSize:'500px', fontWeight:900, fontFamily:'Bebas,sans-serif', lineHeight:1, display:'flex' }}>{log.year}</div>}

      {/* Top color block */}
      <div style={{ width:'100%', height:'440px', background:accent, display:'flex', flexShrink:0, position:'relative', alignItems:'flex-end', padding:'32px 64px' }}>
        <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(0,0,0,0.04) 5px,rgba(0,0,0,0.04) 6px)', display:'flex' }} />
        <div style={{ position:'relative', color:'#000', fontFamily:'Bebas,sans-serif', fontSize:'28px', letterSpacing:'0.5em', display:'flex' }}>
          {typeLabel(log.type)}{platform ? `  ·  ${platform.label}` : ''}
        </div>
      </div>

      {/* Thick black border */}
      <div style={{ width:'100%', height:'8px', background:'#000', display:'flex', flexShrink:0 }} />

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'52px 64px', position:'relative' }}>
        {/* Poster row */}
        <div style={{ display:'flex', gap:'40px', alignItems:'flex-start', marginBottom:'48px' }}>
          {poster && <img src={poster} alt={log.title} style={{ width:'220px', height:'330px', objectFit:'cover', flexShrink:0, border:'4px solid #000' }} />}
          <div style={{ display:'flex', flexDirection:'column', gap:'20px', paddingTop:'8px', flex:1 }}>
            {vibe && (
              <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 20px', background:'#000', alignSelf:'flex-start' }}>
                <span style={{ fontSize:'30px', display:'flex' }}>{vibe.emoji}</span>
                <span style={{ color:accent, fontFamily:'Bebas,sans-serif', fontSize:'28px', letterSpacing:'0.08em', display:'flex' }}>{vibe.label}</span>
              </div>
            )}
            <div style={{ color:'rgba(0,0,0,0.35)', fontSize:'20px', letterSpacing:'0.1em', display:'flex' }}>{date}</div>
          </div>
        </div>

        {/* Thick rule */}
        <div style={{ width:'100%', height:'6px', background:'#000', marginBottom:'40px', display:'flex' }} />

        {/* BIG title */}
        <div style={{ color:'#000', fontFamily:'Bebas,sans-serif', fontSize:'116px', lineHeight:0.91, marginBottom:'40px', display:'flex' }}>
          {displayTitle(log)}
        </div>

        {/* Thick rule */}
        <div style={{ width:'100%', height:'6px', background:'#000', marginBottom:'36px', display:'flex' }} />

        {/* Review */}
        {review && <div style={{ color:'rgba(0,0,0,0.6)', fontSize:'30px', lineHeight:1.6, fontStyle:'italic', fontFamily:'Georgia,serif', display:'flex' }}>{review}</div>}

        <div style={{ position:'absolute', bottom:'52px', right:'64px', color:'rgba(0,0,0,0.18)', fontSize:'18px', letterSpacing:'0.16em', display:'flex' }}>RIAZ AHMED</div>
      </div>
    </div>
  )
}

// ── V4: AURORA COSMOS ────────────────────────────────────────────────────────
function v4(log: MovieLog, poster: string|null, vibe: VibeDef, platform: PlatformDef, review: string|null, date: string) {
  const TEAL = '#00ffc8', PURPLE = '#bf5fff', ROSE = '#ff2d87'
  const stars = Array.from({length:65},(_,i)=>({ x:(i*173+41)%1080, y:(i*97+23)%1920, s:1+(i%3), o:0.15+(i%6)*0.09 }))
  return (
    <div style={{ width:'1080px', height:'1920px', background:'#000814', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', fontFamily:'sans-serif' }}>
      {/* Aurora orbs */}
      <div style={{ position:'absolute', top:'-300px', left:'-200px', width:'900px', height:'900px', borderRadius:'50%', background:`radial-gradient(circle,${TEAL}22 0%,transparent 70%)`, display:'flex' }} />
      <div style={{ position:'absolute', top:'300px', right:'-350px', width:'1000px', height:'1000px', borderRadius:'50%', background:`radial-gradient(circle,${PURPLE}1a 0%,transparent 70%)`, display:'flex' }} />
      <div style={{ position:'absolute', bottom:'100px', left:'-150px', width:'850px', height:'850px', borderRadius:'50%', background:`radial-gradient(circle,${ROSE}15 0%,transparent 70%)`, display:'flex' }} />
      <div style={{ position:'absolute', bottom:'-300px', right:'-200px', width:'900px', height:'900px', borderRadius:'50%', background:`radial-gradient(circle,${TEAL}12 0%,transparent 70%)`, display:'flex' }} />
      {/* Stars */}
      {stars.map((s,i) => <div key={i} style={{ position:'absolute', left:`${s.x}px`, top:`${s.y}px`, width:`${s.s}px`, height:`${s.s}px`, borderRadius:'50%', background:'#fff', opacity:s.o, display:'flex' }} />)}

      <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:'100px 80px' }}>
        {/* Type label */}
        <div style={{ color:`${TEAL}88`, fontSize:'20px', letterSpacing:'0.55em', textTransform:'uppercase', marginBottom:'80px', display:'flex', textShadow:`0 0 12px ${TEAL}` }}>
          {typeLabel(log.type)}{platform ? `  ·  ${platform.label}` : ''}
        </div>

        {/* Poster in circular frame */}
        {poster && (
          <div style={{ position:'relative', marginBottom:'72px', display:'flex' }}>
            <div style={{ position:'absolute', inset:'-24px', borderRadius:'50%', background:`radial-gradient(circle,${PURPLE}35 0%,transparent 70%)`, display:'flex' }} />
            <img src={poster} alt={log.title} style={{ width:'290px', height:'290px', objectFit:'cover', borderRadius:'50%', border:`1px solid ${PURPLE}40`, position:'relative' }} />
          </div>
        )}

        {/* Title */}
        <div style={{ color:TEAL, fontSize:'72px', fontWeight:700, textAlign:'center', lineHeight:1.04, marginBottom:'20px', display:'flex', textShadow:`0 0 32px ${TEAL}45` }}>
          {displayTitle(log)}
        </div>
        {log.episode_title && <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'28px', marginBottom:'16px', textAlign:'center', display:'flex' }}>{log.episode_title}</div>}
        {log.year && log.type!=='episode' && <div style={{ color:'rgba(255,255,255,0.25)', fontSize:'28px', letterSpacing:'0.22em', marginBottom:'56px', display:'flex' }}>{log.year}</div>}

        {/* Aurora divider */}
        <div style={{ width:'220px', height:'2px', background:`linear-gradient(to right,${TEAL},${PURPLE},${ROSE})`, marginBottom:'56px', display:'flex' }} />

        {/* Vibe */}
        {vibe && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', marginBottom:'56px' }}>
            <span style={{ fontSize:'76px', display:'flex' }}>{vibe.emoji}</span>
            <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'32px', fontWeight:600, letterSpacing:'0.12em', display:'flex' }}>{vibe.label}</span>
            <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'22px', letterSpacing:'0.08em', display:'flex' }}>{vibe.sub}</span>
          </div>
        )}

        {/* Review */}
        {review && <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'28px', textAlign:'center', lineHeight:1.7, fontStyle:'italic', maxWidth:'820px', display:'flex', borderLeft:`2px solid ${ROSE}50`, paddingLeft:'36px' }}>{review}</div>}

        <div style={{ position:'absolute', bottom:'76px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
          <div style={{ color:'rgba(255,255,255,0.18)', fontSize:'20px', letterSpacing:'0.12em', display:'flex' }}>{date}</div>
          <div style={{ color:'rgba(255,255,255,0.1)', fontSize:'16px', letterSpacing:'0.18em', display:'flex' }}>RIAZ AHMED</div>
        </div>
      </div>
    </div>
  )
}

// ── V5: OG CLASSIC (original design) ─────────────────────────────────────────
function v5(log: MovieLog, poster: string|null, vibe: VibeDef, platform: PlatformDef, review: string|null, date: string) {
  const LAVENDER = '#b8a0ff'
  return (
    <div style={{ width:'1080px', height:'1920px', display:'flex', flexDirection:'column', position:'relative', background:'#050505', fontFamily:'sans-serif', overflow:'hidden' }}>
      {poster && <img src={poster} alt="" style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.15 }} />}
      <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'linear-gradient(to bottom,rgba(5,5,5,0.3) 0%,rgba(5,5,5,0.7) 40%,rgba(5,5,5,0.97) 100%)', display:'flex' }} />
      <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:'100px 80px' }}>
        <div style={{ display:'flex', background:'rgba(184,160,255,0.12)', border:'1px solid rgba(184,160,255,0.35)', borderRadius:'100px', padding:'14px 40px', color:LAVENDER, fontSize:'26px', letterSpacing:'0.3em', marginBottom:'72px' }}>
          {typeLabel(log.type)}{platform ? `  ·  ${platform.label}` : ''}
        </div>
        {poster && <img src={poster} alt={log.title} style={{ width:'300px', height:'450px', objectFit:'cover', borderRadius:'16px', marginBottom:'72px' }} />}
        <div style={{ color:'#ffffff', fontSize:'64px', fontWeight:700, textAlign:'center', lineHeight:1.1, marginBottom:'16px', maxWidth:'900px', display:'flex' }}>{displayTitle(log)}</div>
        {log.episode_title && <div style={{ display:'flex', color:'rgba(255,255,255,0.45)', fontSize:'32px', marginBottom:'16px', textAlign:'center' }}>{log.episode_title}</div>}
        {log.year && log.type!=='episode' && <div style={{ display:'flex', color:'rgba(255,255,255,0.3)', fontSize:'28px', marginBottom:'48px' }}>{log.year}</div>}
        {vibe && (
          <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'52px', padding:'18px 40px', borderRadius:'100px', background:`${vibe.color}18`, border:`1px solid ${vibe.color}55` }}>
            <span style={{ fontSize:'48px' }}>{vibe.emoji}</span>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <span style={{ color:vibe.color, fontSize:'36px', fontWeight:700 }}>{vibe.label}</span>
              <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'24px' }}>{vibe.sub}</span>
            </div>
          </div>
        )}
        {review && <div style={{ display:'flex', color:'rgba(255,255,255,0.65)', fontSize:'30px', textAlign:'center', lineHeight:1.65, maxWidth:'820px', fontStyle:'italic', marginBottom:'56px', paddingLeft:'36px', borderLeft:'3px solid rgba(184,160,255,0.4)' }}>{review}</div>}
        <div style={{ display:'flex', color:'rgba(255,255,255,0.22)', fontSize:'26px', letterSpacing:'0.14em', marginBottom:'80px' }}>{date}</div>
        <div style={{ position:'absolute', bottom:'72px', display:'flex', color:'rgba(255,255,255,0.18)', fontSize:'26px', letterSpacing:'0.22em' }}>RIAZ AHMED</div>
      </div>
    </div>
  )
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url     = new URL(_req.url)
    const variant = Math.max(1, Math.min(5, parseInt(url.searchParams.get('variant') ?? '1', 10)))

    const { data: log } = await supabase.from('logs').select('*').eq('id', id).single()
    if (!log) return new Response('Not found', { status: 404 })

    const poster   = log.poster_url ?? null
    const vibe     = VIBES.find(v => v.key === log.vibe)
    const platform = PLATFORMS.find(p => p.key === log.platform)
    const review   = log.review
      ? `"${log.review.slice(0, 120)}${log.review.length > 120 ? '…' : ''}"`
      : null
    const date = new Date(log.watched_on).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })

    // Load fonts in parallel
    const [bebasData, spaceData] = await Promise.all([
      loadGoogleFont('Bebas+Neue'),
      loadGoogleFont('Space+Mono'),
    ])
    const fonts: FontEntry[] = []
    if (bebasData)  fonts.push({ name:'Bebas',     data:bebasData,  weight:400, style:'normal' })
    if (spaceData)  fonts.push({ name:'SpaceMono', data:spaceData,  weight:400, style:'normal' })

    const card =
      variant === 1 ? v1(log, poster, vibe, platform, review) :
      variant === 2 ? v2(log, poster, vibe, platform, review, date) :
      variant === 3 ? v3(log, poster, vibe, platform, review, date) :
      variant === 4 ? v4(log, poster, vibe, platform, review, date) :
                      v5(log, poster, vibe, platform, review, date)

    return new ImageResponse(card, { width:1080, height:1920, fonts })
  } catch (err) {
    console.error('[story-card]', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}
