import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { createClient } from '@supabase/supabase-js'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const storage = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })

type Kind = { type: string; ext: string; matches: (b: Uint8Array) => boolean }
const starts = (b: Uint8Array, sig: number[], at = 0) => sig.every((v, i) => b[at + i] === v)
const KINDS: Kind[] = [
  { type: 'image/jpeg', ext: 'jpg',  matches: b => starts(b, [0xff, 0xd8, 0xff]) },
  { type: 'image/png',  ext: 'png',  matches: b => starts(b, [0x89, 0x50, 0x4e, 0x47]) },
  { type: 'image/webp', ext: 'webp', matches: b => starts(b, [0x52, 0x49, 0x46, 0x46]) && starts(b, [0x57, 0x45, 0x42, 0x50], 8) },
  { type: 'image/gif',  ext: 'gif',  matches: b => starts(b, [0x47, 0x49, 0x46, 0x38]) },
]

/**
 * Admin-only image upload into a public Storage bucket. The size is checked before the file is read into memory, and
 * the type comes from the file's own first bytes, not from what the browser claims.
 */
export async function handleImageUpload(req: Request, opts: { bucket: string; allowGif?: boolean; missingBucketMessage?: string }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return Response.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_BYTES) return Response.json({ error: 'File too large — maximum 10 MB' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const kind = KINDS.find(k => (opts.allowGif || k.type !== 'image/gif') && k.matches(buffer))
  if (!kind) {
    return Response.json({ error: `Only JPEG, PNG, WebP${opts.allowGif ? ' and GIF' : ''} images are allowed` }, { status: 400 })
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${kind.ext}`
  const { error } = await storage.storage.from(opts.bucket).upload(filename, buffer, { contentType: kind.type, upsert: false })
  if (error) {
    if (opts.missingBucketMessage && /bucket not found/i.test(error.message)) return Response.json({ error: opts.missingBucketMessage }, { status: 503 })
    return dbError(error)
  }
  return Response.json({ url: storage.storage.from(opts.bucket).getPublicUrl(filename).data.publicUrl })
}
