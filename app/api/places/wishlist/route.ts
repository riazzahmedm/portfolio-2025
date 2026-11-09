import { dbError } from '@/lib/api-error'
import { getWishlist } from '@/lib/places-feed.server'

/** Public: places still on the wishlist, newest first. */
export async function GET() {
  try { return Response.json(await getWishlist()) } catch (e) { return dbError(e as { message: string; code?: string }) }
}
