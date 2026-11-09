/** Movie logs loaded together with the place they point at. */
export const LOGS_WITH_PLACE = '*, place:places(id,kind,name,city,area)'

/**
 * True when a query failed only because the places table or the place link does not exist yet (the SQL in
 * supabase/migrations.sql has not been run). The movies pages then fall back to plain logs instead of breaking.
 */
export function placesNotReady(error: { message?: string; code?: string } | null | undefined): boolean {
  if (!error) return false
  return /relationship|places|place_id|schema cache|PGRST200|PGRST204|42703|42P01/i.test(`${error.code ?? ''} ${error.message ?? ''}`)
}
