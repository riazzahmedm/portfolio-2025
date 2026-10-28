const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const dim  = (v: unknown) => (Number.isInteger(v) && (v as number) > 0 && (v as number) < 20000 ? (v as number) : null)
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Whitelists and validates the editable art fields. `full` (create) requires an image URL. */
export function sanitizeArt(body: unknown, full: boolean): { value: Record<string, unknown> } | { error: string } {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const out: Record<string, unknown> = {}

  if ('title' in b || full)     out.title = clip(b.title, 120) || 'Untitled'
  if ('caption' in b)           out.caption = clip(b.caption, 600) || null
  if ('width' in b)             out.width = dim(b.width)
  if ('height' in b)            out.height = dim(b.height)
  if ('is_published' in b)      out.is_published = b.is_published === true
  if ('sort_order' in b && Number.isInteger(b.sort_order)) out.sort_order = b.sort_order
  if ('tags' in b) {
    out.tags = (Array.isArray(b.tags) ? b.tags : [])
      .map(t => clip(t, 30).toLowerCase()).filter(Boolean).slice(0, 8)
  }
  if ('product_id' in b) {
    if (b.product_id && (typeof b.product_id !== 'string' || !UUID.test(b.product_id))) return { error: 'Invalid shop product' }
    out.product_id = b.product_id || null
  }
  if ('image_url' in b || full) {
    const url = clip(b.image_url, 1000)
    if (!/^https:\/\//.test(url)) return { error: 'An image is required' }
    out.image_url = url
  }
  return { value: out }
}
