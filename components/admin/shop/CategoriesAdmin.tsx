'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Trash2, Plus } from 'lucide-react'
import type { ShopCategory, ShopTag } from '@/lib/shop.types'

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [tags,       setTags]       = useState<ShopTag[]>([])
  const [newCat,     setNewCat]     = useState('')
  const [newTag,     setNewTag]     = useState('')
  const [loading,    setLoading]    = useState(true)

  function refresh() {
    Promise.all([
      fetch('/api/shop/categories').then(r => r.json()),
      fetch('/api/shop/tags').then(r => r.json()),
    ]).then(([cats, tgs]) => { setCategories(cats); setTags(tgs); setLoading(false) })
  }

  useEffect(() => { refresh() }, [])

  function toSlug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

  async function addCategory() {
    if (!newCat.trim()) return
    const res = await fetch('/api/shop/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat.trim(), slug: toSlug(newCat), position: categories.length }),
    })
    if (res.ok) { toast.success('Category added'); setNewCat(''); refresh() }
    else { const e = await res.json(); toast.error(e.error) }
  }

  async function deleteCategory(id: string) {
    await fetch(`/api/shop/categories/${id}`, { method: 'DELETE' })
    toast.success('Deleted'); refresh()
  }

  async function addTag() {
    if (!newTag.trim()) return
    const res = await fetch('/api/shop/tags', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTag.trim(), slug: toSlug(newTag) }),
    })
    if (res.ok) { toast.success('Tag added'); setNewTag(''); refresh() }
    else { const e = await res.json(); toast.error(e.error) }
  }

  async function deleteTag(id: string) {
    await fetch(`/api/shop/tags/${id}`, { method: 'DELETE' })
    toast.success('Deleted'); refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '600px' }}>
      <style>{`.sk{background:var(--surface-raised);border-radius:6px;animation:pulse 1.6s ease-in-out infinite}`}</style>
      <Section title="Categories" items={categories} loading={loading} newValue={newCat} onNewChange={setNewCat} onAdd={addCategory} onDelete={deleteCategory} placeholder="e.g. Stickers" />
      <Section title="Tags" items={tags} loading={loading} newValue={newTag} onNewChange={setNewTag} onAdd={addTag} onDelete={deleteTag} placeholder="e.g. Marvel" />
    </div>
  )
}

function Section({ title, items, loading, newValue, onNewChange, onAdd, onDelete, placeholder }: {
  title: string
  items: { id: string; name: string }[]
  loading: boolean
  newValue: string
  onNewChange: (v: string) => void
  onAdd: () => void
  onDelete: (id: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px', color: 'var(--text-primary)' }}>{title}</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          value={newValue} onChange={e => onNewChange(e.target.value)} placeholder={placeholder}
          onKeyDown={e => e.key === 'Enter' && onAdd()}
          style={{ flex: 1, padding: '9px 13px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none' }}
        />
        <button onClick={onAdd} style={{ padding: '9px 14px', borderRadius: '10px', background: 'rgba(184,160,255,0.1)', color: 'var(--lavender)', border: '1px solid rgba(184,160,255,0.25)', cursor: 'pointer' }}>
          <Plus size={16} />
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {loading
          ? [0,1,2,3].map(i => <div key={i} className="sk" style={{ width: `${60 + i * 20}px`, height: '32px', borderRadius: '999px' }} />)
          : items.length === 0
            ? <span style={{ color: 'var(--text-dim)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>None yet</span>
            : items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '999px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                  <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0 0 0 2px', display: 'flex' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
        }
      </div>
    </div>
  )
}
