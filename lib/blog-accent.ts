import 'server-only'
import sharp from 'sharp'
import type { PostAccent } from './blog.types'

const cache = new Map<string, PostAccent | null>()

function hslToRgb(h: number, s: number, l: number): string {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)].map(v => Math.round(v * 255)).join(',')
}

/**
 * Reads a post's colour from its cover photo: the strongest hue family among the vivid, reasonably bright pixels.
 * Returns an RGB triple for each theme (bright on the dark page, deep on the light paper) so text stays readable in both.
 * Photos with no real colour (or an image that cannot be fetched) return null and the post keeps the blog's green.
 */
export async function getCoverAccent(url: string | null): Promise<PostAccent | null> {
  if (!url) return null
  if (cache.has(url)) return cache.get(url) ?? null

  let result: PostAccent | null = null
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } })
    if (res.ok) {
      const N = 32
      const { data } = await sharp(Buffer.from(await res.arrayBuffer()), { failOn: 'none' })
        .resize(N, N, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })

      const buckets = Array.from({ length: 12 }, () => 0)
      for (let i = 0; i < data.length; i += 3) {
        const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255
        const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
        if (max < 0.2 || d < 0.08) continue                       // near-black and grey carry no colour
        const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
        const row = Math.floor(i / 3 / N)
        const skyDiscount = row < N * 0.35 ? 0.5 : 1               // skies sit at the top and would win every landscape
        buckets[Math.floor((h / 6) * 12) % 12] += (d / max) * max * max * skyDiscount   // favour saturated, bright pixels
      }
      const best = buckets.reduce((bi, v, i, arr) => (v > arr[bi] ? i : bi), 0)
      if (buckets[best] > 0.5) {
        const hue = Math.round((best + 0.5) * 30)
        result = { dark: hslToRgb(hue, 0.92, 0.6), light: hslToRgb(hue, 0.75, 0.28) }
      }
    }
  } catch { /* leave it null: the post just keeps the default green */ }

  cache.set(url, result)
  return result
}
