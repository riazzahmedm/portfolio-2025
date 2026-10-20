import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json({ error: 'Only JPEG, PNG, WebP and GIF images are allowed' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  if (buffer.length > MAX_BYTES) {
    return Response.json({ error: 'File too large — maximum 10 MB' }, { status: 400 })
  }

  const ext      = file.type === 'image/jpeg' ? 'jpg'
                 : file.type === 'image/png'  ? 'png'
                 : file.type === 'image/webp' ? 'webp'
                 : 'gif'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('shop-images')
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('shop-images')
    .getPublicUrl(filename)

  return Response.json({ url: publicUrl })
}
