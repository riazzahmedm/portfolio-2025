import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { ShareCard, bigPoster, loadCardFonts, type CardTheme } from '@/lib/share-card'

export const runtime = 'nodejs'

/** How it felt decides the headline and the colours. */
const LOOKS: Record<string, { theme: CardTheme; headline: string }> = {
  masterpiece: { theme: { glow: '120,84,0',  gradient: ['#ffb300', '#fff0a0'], sparks: ['#ffc933', '#fff0a0', '#b8860b'] }, headline: 'THIS IS CINEMA' },
  loved:       { theme: { glow: '84,48,196', gradient: ['#b8a0ff', '#efe6ff'], sparks: ['#b8a0ff', '#d9c9ff', '#6d28d9'] }, headline: 'ABSOLUTELY LOVED IT' },
  solid:       { theme: { glow: '24,80,52',  gradient: ['#4ade80', '#d9f99d'], sparks: ['#4ade80', '#a3e635', '#166534'] }, headline: 'IT WAS MID' },
  fine:        { theme: { glow: '40,52,72',  gradient: ['#94a3b8', '#e2e8f0'], sparks: ['#94a3b8', '#cbd5e1', '#475569'] }, headline: 'SO BORING' },
  painful:     { theme: { glow: '110,6,6',   gradient: ['#ff3b30', '#ff9a8a'], sparks: ['#ff3b30', '#ff8a7a', '#7a0c0c'] }, headline: 'ABSOLUTE PAIN' },
}
/** A log with no vibe yet: the loved colours and a plain headline. */
const NO_VIBE = { theme: LOOKS.loved.theme, headline: 'JUST WATCHED' }

/** The story card for a watched title, in the same style as the Watch Later "super hyped" card. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: log } = await supabase.from('logs').select('title,poster_url,vibe,type,season,episode').eq('id', id).maybeSingle()
    if (!log) return new Response('Not found', { status: 404 })

    const look = LOOKS[log.vibe as string] ?? NO_VIBE
    const title = log.type === 'episode' ? `${log.title}  S${String(log.season ?? '').padStart(2, '0')}E${String(log.episode ?? '').padStart(2, '0')}` : String(log.title)
    const image = <ShareCard theme={look.theme} poster={bigPoster(log.poster_url)} headline={look.headline} kicker={look === NO_VIBE ? 'IN MY WATCHLOG' : 'JUST WATCHED'} title={title} />
    return new ImageResponse(image, { width: 1080, height: 1920, fonts: await loadCardFonts() })
  } catch (err) {
    console.error('[watched-card]', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}
