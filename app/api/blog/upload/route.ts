import { supabase } from '@/lib/supabase'
import convert from 'heic-convert'
import { isAdmin } from '@/lib/admin-auth'

const HEIC_EXTS = new Set(['heic', 'heif'])

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  let buffer      = Buffer.from(await file.arrayBuffer())
  let contentType = file.type
  let ext         = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'

  // Convert HEIC/HEIF to JPEG
  if (HEIC_EXTS.has(ext) || file.type === 'image/heic' || file.type === 'image/heif') {
    const output = await convert({ buffer, format: 'JPEG', quality: 0.88 })
    buffer      = Buffer.from(output)
    contentType = 'image/jpeg'
    ext         = 'jpg'
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(filename, buffer, { contentType, upsert: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filename)

  return Response.json({ url: publicUrl })
}
