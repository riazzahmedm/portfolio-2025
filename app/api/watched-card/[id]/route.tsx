import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { ShareCard, FlameHeart, Trophy, Face, bigPoster, loadCardFonts, type CardTheme } from '@/lib/share-card'

export const runtime = 'nodejs'

/** How it felt decides the headline, the colours and the sticker on the poster's corner. */
const LOOKS: Record<string, { theme: CardTheme; headline: string; sticker: React.ReactNode }> = {
  masterpiece: { theme: { glow: '120,84,0',  gradient: ['#ffb300', '#fff0a0'], sparks: ['#ffc933', '#fff0a0', '#b8860b'] }, headline: 'THIS IS CINEMA',  sticker: <Trophy size={250} /> },
  loved:       { theme: { glow: '150,10,10', gradient: ['#ff6a1a', '#ffb347'], sparks: ['#ff7a1a', '#ffb347', '#c2260e'] }, headline: 'ABSOLUTELY LOVED IT', sticker: <FlameHeart size={240} /> },
  solid:       { theme: { glow: '24,80,52',  gradient: ['#4ade80', '#d9f99d'], sparks: ['#4ade80', '#a3e635', '#166534'] }, headline: 'IT WAS MID',      sticker: <Face size={220} mood="flat" /> },
  fine:        { theme: { glow: '60,40,120', gradient: ['#a78bfa', '#e0d4ff'], sparks: ['#a78bfa', '#c4b5fd', '#5b3fd1'] }, headline: 'SO BORING',       sticker: <Face size={220} mood="blank" /> },
  painful:     { theme: { glow: '110,6,6',   gradient: ['#ff3b30', '#ff9a8a'], sparks: ['#ff3b30', '#ff8a7a', '#7a0c0c'] }, headline: 'ABSOLUTE PAIN',   sticker: <Face size={220} mood="dead" /> },
}
/** A log with no vibe yet: the loved colours, no sticker, and a plain headline. */
const NO_VIBE = { theme: LOOKS.loved.theme, headline: 'JUST WATCHED', sticker: null }

/** The story card for a watched title, in the same style as the Watch Later "super hyped" card. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: log } = await supabase.from('logs').select('title,poster_url,vibe,type,season,episode').eq('id', id).maybeSingle()
    if (!log) return new Response('Not found', { status: 404 })

    const look = LOOKS[log.vibe as string] ?? NO_VIBE
    const title = log.type === 'episode' ? `${log.title}  S${String(log.season ?? '').padStart(2, '0')}E${String(log.episode ?? '').padStart(2, '0')}` : String(log.title)
    const image = <ShareCard theme={look.theme} poster={bigPoster(log.poster_url)} sticker={look.sticker} headline={look.headline} kicker={look === NO_VIBE ? 'IN MY WATCHLOG' : 'JUST WATCHED'} title={title} />
    return new ImageResponse(image, { width: 1080, height: 1920, fonts: await loadCardFonts() })
  } catch (err) {
    console.error('[watched-card]', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}
