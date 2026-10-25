type DbError = { message: string; code?: string; status?: number }

/**
 * Turns a Supabase/Postgres error into a safe JSON response. The raw message
 * (table, column and constraint names) is logged server-side only.
 */
export function dbError(error: DbError, fallbackStatus = 500) {
  console.error('[api]', error.code ?? '', error.message)

  if (error.status === 429) return Response.json({ error: 'Too many requests — please wait and try again' }, { status: 429 })
  if (error.code === '23505') return Response.json({ error: 'That already exists' }, { status: 409 })
  if (error.code === '23503') return Response.json({ error: 'Related records prevent this change' }, { status: 409 })
  if (error.code === 'PGRST116' || fallbackStatus === 404) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({ error: 'Something went wrong' }, { status: fallbackStatus })
}
