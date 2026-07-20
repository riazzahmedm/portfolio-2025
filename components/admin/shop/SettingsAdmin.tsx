'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { ShopSettings } from '@/lib/shop.types'

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<ShopSettings>({ upi_id: '', qr_code_url: '', store_name: '', store_tagline: '' })
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/shop/settings').then(r => r.json()).then(setSettings)
  }, [])

  async function save() {
    setSaving(true)
    const res = await fetch('/api/shop/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (res.ok) toast.success('Settings saved')
    else toast.error('Failed to save')
    setSaving(false)
  }

  async function uploadQR(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res  = await fetch('/api/shop/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (data.url) {
      setSettings(s => ({ ...s, qr_code_url: data.url }))
      toast.success('QR uploaded')
    } else {
      toast.error(data.error ?? 'Upload failed')
    }
    setUploading(false)
  }

  const field = (label: string, key: keyof ShopSettings, placeholder?: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>{label}</label>
      <input
        value={settings[key]}
        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none' }}
      />
    </div>
  )

  return (
    <div style={{ maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>Settings</h2>
      {field('Store name',    'store_name',    'Riaz Ahmed Art')}
      {field('Store tagline', 'store_tagline', 'Original digital art')}
      {field('UPI ID',        'upi_id',        'yourname@upi')}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>QR Code image</label>
        {settings.qr_code_url && (
          <img src={settings.qr_code_url} alt="QR" style={{ width: '120px', height: '120px', objectFit: 'contain', background: '#fff', borderRadius: '10px', padding: '6px' }} />
        )}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--ff-body)', width: 'fit-content' }}>
          {uploading ? 'Uploading...' : 'Upload QR image'}
          <input type="file" accept="image/*" onChange={uploadQR} style={{ display: 'none' }} />
        </label>
      </div>

      <button onClick={save} disabled={saving}
        style={{ padding: '12px 28px', borderRadius: '10px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)', width: 'fit-content' }}>
        {saving ? 'Saving...' : 'Save settings'}
      </button>
    </div>
  )
}
