'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import AdminForm from '@/components/movies/AdminForm'

export default function MoviesAdmin() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div style={{ padding: '0 0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>Movies</h2>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{ padding: '8px 18px', borderRadius: '10px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}
        >
          {showForm ? 'Close' : '+ Add entry'}
        </button>
      </div>
      {showForm && (
        <AdminForm
          onSuccess={() => { setShowForm(false); toast.success('Saved') }}
        />
      )}
      {!showForm && (
        <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>
          Entries are managed from the <a href="/movies" style={{ color: 'var(--lavender)' }}>movies page</a>.
          Use this panel to add new entries.
        </p>
      )}
    </div>
  )
}
