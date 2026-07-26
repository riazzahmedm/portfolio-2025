import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/admin-auth'
import convert from 'heic-convert'
import sharp from 'sharp'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const HEIC_EXTS = new Set(['heic', 'heif'])

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  let buffer = Buffer.from(await file.arrayBuffer())
  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'

  // Convert HEIC/HEIF to raw buffer first
  if (HEIC_EXTS.has(ext) || file.type === 'image/heic' || file.type === 'image/heif') {
    const output = await convert({ buffer, format: 'JPEG', quality: 1 })
    buffer = Buffer.from(output)
  }

  // Resize to max 1200px wide and compress to JPEG at 75% quality
  buffer = await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 75, progressive: true })
    .toBuffer()

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

  const { error } = await supabase.storage
    .from('shop-images')
    .upload(filename, buffer, { contentType: 'image/jpeg', upsert: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('shop-images')
    .getPublicUrl(filename)

  return Response.json({ url: publicUrl })
}
