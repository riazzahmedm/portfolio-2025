import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { placesDb as supabase } from '@/lib/places.server'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json({ error: 'Only JPEG, PNG and WebP images are allowed' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  if (buffer.length > MAX_BYTES) {
    return Response.json({ error: 'File too large — maximum 10 MB' }, { status: 400 })
  }

  const ext      = file.type === 'image/jpeg' ? 'jpg'
                 : file.type === 'image/png'  ? 'png'
                 : 'webp'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('place-photos')
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  // Before the SQL block runs there is no bucket yet: say so instead of a generic failure
  if (error && /bucket not found/i.test(error.message)) return Response.json({ error: 'Run the Been there SQL block in supabase/migrations.sql first' }, { status: 503 })
  if (error) return dbError(error)

  const { data: { publicUrl } } = supabase.storage
    .from('place-photos')
    .getPublicUrl(filename)

  return Response.json({ url: publicUrl })
}
