/** PostgREST returns at most this many rows per request, so longer lists are read in pages. */
export const PAGE_SIZE = 1000

type Page<T> = { data: T[] | null; error: { message?: string; code?: string } | null }

/**
 * Reads every row of a query in pages. The query must have a stable order (add the id as a tie-break) so pages never
 * overlap. Stops at the first error and returns it.
 */
export async function fetchAll<T = Record<string, unknown>>(range: (from: number, to: number) => PromiseLike<Page<T>>): Promise<Page<T>> {
  const all: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await range(from, from + PAGE_SIZE - 1)
    if (error) return { data: null, error }
    all.push(...(data ?? []))
    if ((data ?? []).length < PAGE_SIZE) return { data: all, error: null }
  }
}
