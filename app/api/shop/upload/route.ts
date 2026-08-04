import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  const buffer      = Buffer.from(await file.arrayBuffer())
  const contentType = file.type || 'image/jpeg'
  const ext         = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename    = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('shop-images')
    .upload(filename, buffer, { contentType, upsert: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('shop-images')
    .getPublicUrl(filename)

  return Response.json({ url: publicUrl })
}
