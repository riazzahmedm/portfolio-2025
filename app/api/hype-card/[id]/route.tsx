import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { ShareCard, FlameHeart, bigPoster, loadCardFonts, type CardTheme } from '@/lib/share-card'

export const runtime = 'nodejs'

const THEME: CardTheme = { glow: '150,10,10', gradient: ['#ff6a1a', '#ffb347'], sparks: ['#ff7a1a', '#ffb347', '#c2260e'] }

/** The "I'm super hyped" story card for a Watch Later item. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: item } = await supabase.from('watchlist').select('title,poster_url').eq('id', id).maybeSingle()
    if (!item) return new Response('Not found', { status: 404 })
    const image = <ShareCard theme={THEME} poster={bigPoster(item.poster_url)} sticker={<FlameHeart size={240} />} headline="I'M SUPER HYPED" kicker="TO WATCH" title={String(item.title)} />
    return new ImageResponse(image, { width: 1080, height: 1920, fonts: await loadCardFonts() })
  } catch (err) {
    console.error('[hype-card]', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}
