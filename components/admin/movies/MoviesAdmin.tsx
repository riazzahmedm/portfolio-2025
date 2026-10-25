'use client'
import AdminForm from '@/components/movies/AdminForm'

export default function MoviesAdmin() {
  // AdminForm resets itself after a save (movies clear fully; series keep title + season
  // so episodes can be logged back to back), so it must not be remounted here.
  return (
    <div style={{ padding: '0 0 40px' }}>
      <AdminForm onSuccess={() => {}} />
    </div>
  )
}
