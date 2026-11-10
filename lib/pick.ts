/** Only the listed fields of a request body, so a stray key (an id, a counter, a total) can never reach the database. */
export function pickFields(body: unknown, allowed: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (!body || typeof body !== 'object') return out
  for (const key of allowed) if (key in body) out[key] = (body as Record<string, unknown>)[key]
  return out
}

/** Everything except the listed fields: for tables with many columns where only the identity columns must stay fixed. */
export function omitFields(body: unknown, denied: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (!body || typeof body !== 'object') return out
  for (const [key, value] of Object.entries(body)) if (!denied.includes(key)) out[key] = value
  return out
}

export const EMPTY_PATCH = () => Response.json({ error: 'Nothing to update' }, { status: 400 })
