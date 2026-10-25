import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const { error } = await supabase.from('watchlist').delete().eq('id', id)
  if (error) return dbError(error)
  return new Response(null, { status: 204 })
}
