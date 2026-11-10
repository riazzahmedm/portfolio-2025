/** A post's colour, read from its cover: an "r,g,b" triple for the dark page and one for the light paper. */
export interface PostAccent { dark: string; light: string }

const STORE = 'blog-cover-accents-v1'

function hslToRgb(h: number, s: number, l: number): string {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)].map(v => Math.round(v * 255)).join(',')
}

/** True for a six-digit hex colour like #8a97a8. */
export const isHexColor = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min
  if (d === 0) return [0, 0, l]
  const s = d / (1 - Math.abs(2 * l - 1))
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

/**
 * A colour picked by hand instead of read from the cover: keeps the hue and saturation of the chosen colour and moves
 * its lightness into a bright range for the dark page and a deep range for the light paper, so any pick stays readable.
 */
export function accentFromHex(hex: unknown): PostAccent | null {
  if (!isHexColor(hex)) return null
  const [h, s, l] = rgbToHsl(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16))
  return { dark: hslToRgb(h, s, Math.min(0.72, Math.max(0.6, l))), light: hslToRgb(h, s, Math.min(0.32, Math.max(0.2, l))) }
}

/**
 * Reads a colour from a loaded cover photo: the strongest hue family among the vivid, reasonably bright pixels,
 * counting the top third less (skies sit there and would make every landscape blue). Returns a bright shade for the
 * dark page and a deep one for the light paper, or null for a photo with no real colour or one the browser will not let us read.
 */
export function accentFromImage(img: HTMLImageElement): PostAccent | null {
  try {
    const N = 32
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = N
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, N, N)
    const { data } = ctx.getImageData(0, 0, N, N)   // throws if the image is cross-origin without CORS: caught below

    const buckets = Array.from({ length: 12 }, () => 0)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
      if (max < 0.2 || d < 0.08) continue                       // near-black and grey carry no colour
      const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
      const row = Math.floor(i / 4 / N)
      const sky = row < N * 0.35 ? 0.5 : 1
      buckets[Math.floor((h / 6) * 12) % 12] += (d / max) * max * max * sky
    }
    const best = buckets.reduce((bi, v, i, arr) => (v > arr[bi] ? i : bi), 0)
    if (buckets[best] <= 0.5) return null
    const hue = Math.round((best + 0.5) * 30)
    return { dark: hslToRgb(hue, 0.92, 0.6), light: hslToRgb(hue, 0.75, 0.28) }
  } catch {
    return null
  }
}

type Stored = Record<string, PostAccent | 0>

/** A colour already worked out on this device (0 = looked, found none), so repeat visits start with the right colour. */
export function readCachedAccent(url: string): PostAccent | 0 | undefined {
  try { return (JSON.parse(localStorage.getItem(STORE) ?? '{}') as Stored)[url] } catch { return undefined }
}

export function storeAccent(url: string, accent: PostAccent | null) {
  try {
    const all = JSON.parse(localStorage.getItem(STORE) ?? '{}') as Stored
    all[url] = accent ?? 0
    localStorage.setItem(STORE, JSON.stringify(all))
  } catch { /* private mode: it is just worked out again next time */ }
}
