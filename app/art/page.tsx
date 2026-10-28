import type { Metadata } from 'next'
import { getPublishedArt } from '@/lib/art.server'
import ArtGallery from '@/components/art/ArtGallery'

export const metadata: Metadata = {
  title: 'Art',
  description: 'Digital art and illustration by Riaz Ahmed.',
  alternates: { canonical: '/art' },
}

// Rendered on the server and refreshed in the background, like the blog
export const revalidate = 60

export default async function ArtPage() {
  const pieces = await getPublishedArt()
  return <ArtGallery pieces={pieces} />
}
