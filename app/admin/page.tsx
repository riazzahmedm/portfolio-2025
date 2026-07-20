'use client'
import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import PasswordGate from '@/components/admin/PasswordGate'
import BlogAdmin    from '@/components/admin/blog/BlogAdmin'
import MoviesAdmin  from '@/components/admin/movies/MoviesAdmin'
import ShopAdmin    from '@/components/admin/shop/ShopAdmin'

type Tab = 'blog' | 'movies' | 'shop'

const TABS: { key: Tab; label: string }[] = [
  { key: 'blog',   label: 'Blog' },
  { key: 'movies', label: 'Movies' },
  { key: 'shop',   label: 'Shop' },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [tab,    setTab]    = useState<Tab>('shop')

  useEffect(() => {
    fetch('/api/auth/admin').then(r => r.json()).then(d => {
      if (d.authed) setAuthed(true)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/admin', { method: 'DELETE' })
    setAuthed(false)
    toast.success('Logged out')
  }

  if (!authed) return <PasswordGate endpoint="/api/auth/admin" onAuthed={() => setAuthed(true)} label="Admin portal" />

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: 'var(--ff-body)' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', display: 'flex', alignItems: 'center', gap: '0',
        height: '56px',
      }}>
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)', marginRight: '24px' }}>
          Admin
        </span>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '0 18px', height: '56px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontFamily: 'var(--ff-body)', fontWeight: tab === t.key ? 600 : 400,
            color: tab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${tab === t.key ? 'var(--lavender)' : 'transparent'}`,
          }}>
            {t.label}
          </button>
        ))}
        <button onClick={logout} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', fontFamily: 'var(--ff-body)' }}>
          <LogOut size={15} /> Logout
        </button>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px' }}>
        {tab === 'blog'   && <BlogAdmin />}
        {tab === 'movies' && <MoviesAdmin />}
        {tab === 'shop'   && <ShopAdmin />}
      </div>
    </div>
  )
}
