'use client'
import PlaceForm from '@/components/places/PlaceForm'

export default function PlacesAdmin() {
  // `?place=<id>` (from the wishlist's "Visited ✓" or a place page's "Log another visit") opens the form on that place.
  // Read straight from the address bar, like the admin page reads `tab`; this only renders after the page has mounted.
  // The form resets itself after a save, so it must not be remounted here.
  const placeId = new URLSearchParams(window.location.search).get('place') ?? undefined
  return (
    <div style={{ padding: '0 0 40px' }}>
      <PlaceForm initial={{ placeId }} onSaved={() => {}} />
    </div>
  )
}
