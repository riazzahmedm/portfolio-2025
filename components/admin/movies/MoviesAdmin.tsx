'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import AdminForm from '@/components/movies/AdminForm'

export default function MoviesAdmin() {
  const [key, setKey] = useState(0)

  return (
    <div style={{ padding: '0 0 40px' }}>
      <AdminForm
        key={key}
        onSuccess={() => { toast.success('Entry saved'); setKey(k => k + 1) }}
      />
    </div>
  )
}
