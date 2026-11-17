import { dbError } from '@/lib/api-error'
import { getOnThisDay } from '@/lib/places-feed.server'

/** Public: ?md=MM-DD&year=YYYY — visits made on that day in earlier years. The browser sends its own date, so the day is the visitor's. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const md = sp.get('md') ?? '', year = Number(sp.get('year'))
  if (!/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(md) || !Number.isInteger(year) || year < 2000 || year > 2100) return Response.json([])
  try {
    return Response.json(await getOnThisDay(md, year))
  } catch (e) { return dbError(e as { message: string; code?: string }) }
}
