// Reads colors out of artwork so type and backgrounds can follow the piece on screen

const swatchCache = new Map<string, string>()

/** Reads a vivid background color from an image: the most saturated, bright hue family, lifted so it works as a poster block. */
export function sampleColor(url: string): Promise<string | null> {
  const hit = swatchCache.get(url)
  if (hit) return Promise.resolve(hit)
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const N = 24
        const c = document.createElement('canvas')
        c.width = c.height = N
        const ctx = c.getContext('2d', { willReadFrequently: true })
        if (!ctx) return resolve(null)
        ctx.drawImage(img, 0, 0, N, N)
        const { data } = ctx.getImageData(0, 0, N, N)
        const buckets = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }))
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255
          const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
          if (max < 0.18 || d < 0.12) continue            // skip near-black and grey
          const h = d === 0 ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
          const w = (d / max) * max * max                   // favour saturated, bright pixels
          const k = buckets[Math.floor((h / 6) * 12) % 12]
          k.w += w; k.r += r * w; k.g += g * w; k.b += b * w
        }
        const best = buckets.reduce((a, b) => (b.w > a.w ? b : a))
        if (best.w === 0) return resolve(null)
        const [r, g, b] = [best.r, best.g, best.b].map(v => v / best.w)
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        // Lift into a bright, saturated poster color while keeping the hue
        const l = (max + min) / 2, d = max - min
        const hh = d === 0 ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
        const color = `hsl(${Math.round(hh * 60)} 88% ${l > 0.5 ? 58 : 54}%)`
        swatchCache.set(url, color)
        resolve(color)
      } catch { resolve(null) }                            // canvas blocked (CORS): keep the fallback
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

/** Dark or light type, whichever reads on the block color. */
export function inkFor(color: string): string {
  const m = color.match(/hsl\((\d+) (\d+)% (\d+)%\)/)
  if (!m) return 'rgba(10,10,10,0.9)'
  const h = Number(m[1]), l = Number(m[3])
  // Yellows and greens look bright at the same lightness
  const bright = (h > 45 && h < 180) || l > 62
  return bright ? 'rgba(10,10,10,0.9)' : 'rgba(255,255,255,0.94)'
}


/** A light, glowing version of a sampled block color, for type that sits directly on the artwork. */
export function glowFor(color: string): string {
  const m = color.match(/hsl\((\d+) /)
  return m ? `hsl(${m[1]} 96% 70%)` : '#ffffff'
}
