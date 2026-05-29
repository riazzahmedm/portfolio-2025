import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

async function isAdmin() {
  const jar = await cookies()
  return jar.get('movies-admin')?.value === 'true'
}

export async function GET() {
  const { data, error } = await supabase
    .from('movie_lists')
    .select('*, movie_list_items(count)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { title, slug, description, is_public = true } = body
  if (!title || !slug) return Response.json({ error: 'title and slug required' }, { status: 400 })

  const { data, error } = await supabase
    .from('movie_lists').insert({ title, slug, description, is_public }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
