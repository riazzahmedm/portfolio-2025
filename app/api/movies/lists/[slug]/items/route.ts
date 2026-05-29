import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

async function isAdmin() {
  const jar = await cookies()
  return jar.get('movies-admin')?.value === 'true'
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params

  // Resolve list_id from slug
  const { data: list, error: listErr } = await supabase
    .from('movie_lists').select('id').eq('slug', slug).single()
  if (listErr || !list) return Response.json({ error: 'List not found' }, { status: 404 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('movie_list_items')
    .insert({ ...body, list_id: list.id })
    .select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
