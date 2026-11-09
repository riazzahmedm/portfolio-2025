import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { getPlaceDetail } from '@/lib/places-feed.server'
import PlaceDetail from '@/components/places/PlaceDetail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const data = await getPlaceDetail(id).catch(() => null)
  return data ? { title: `${data.place.name} — Been there`, alternates: { canonical: `/places/${id}` } } : { title: 'Been there' }
}

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getPlaceDetail(id)   // a database outage should surface as an error, not as "not found"
  if (!data) notFound()
  return <PlaceDetail data={data} isAdmin={await isAdmin()} />
}
