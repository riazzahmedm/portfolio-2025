export type OgFont = { name: string; data: ArrayBuffer; weight: 400; style: 'normal' }

const fontCache = new Map<string, ArrayBuffer>()

/** Fetches a Google Font file for use inside ImageResponse. Returns null on failure. */
export async function loadGoogleFont(family: string): Promise<ArrayBuffer | null> {
  if (fontCache.has(family)) return fontCache.get(family)!
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}&display=swap`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; next/og)' } },
    ).then(r => r.text())
    const url = css.match(/src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1]
    if (!url) return null
    const data = await fetch(url).then(r => r.arrayBuffer())
    fontCache.set(family, data)
    return data
  } catch {
    return null
  }
}

/** Loads the display + mono fonts used by the generated cards. */
export async function loadCardFonts(): Promise<OgFont[]> {
  const [display, mono] = await Promise.all([
    loadGoogleFont('Bebas+Neue'),
    loadGoogleFont('Space+Mono'),
  ])
  const fonts: OgFont[] = []
  if (display) fonts.push({ name: 'Bebas',     data: display, weight: 400, style: 'normal' })
  if (mono)    fonts.push({ name: 'SpaceMono', data: mono,    weight: 400, style: 'normal' })
  return fonts
}
