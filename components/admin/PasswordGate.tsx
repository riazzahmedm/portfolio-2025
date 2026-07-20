'use client'
import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface Props {
  endpoint: string
  onAuthed: () => void
  label?: string
}

export default function PasswordGate({ endpoint, onAuthed, label = 'Admin access' }: Props) {
  const [pw,      setPw]      = useState('')
  const [show,    setShow]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) { onAuthed() }
    else { setError('Wrong password'); setPw('') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'var(--ff-body)' }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(130,255,31,0.08)', border: '1px solid rgba(130,255,31,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={22} color="#82ff1f" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{label}</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '6px 0 0', fontFamily: 'var(--ff-mono)' }}>
              riazahmed.com
            </p>
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Password"
              style={{ width: '100%', padding: '12px 44px 12px 14px', background: 'var(--surface)', border: `1px solid ${error ? 'var(--red)' : 'var(--border-input)'}`, borderRadius: '12px', color: 'var(--text-primary)', fontSize: '15px', fontFamily: 'var(--ff-body)', outline: 'none', boxSizing: 'border-box' }}
            />
            <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <div style={{ fontSize: '13px', color: 'var(--red)', fontFamily: 'var(--ff-mono)' }}>{error}</div>}
          <button type="submit" disabled={loading || !pw} style={{ padding: '13px', borderRadius: '12px', background: '#82ff1f', color: '#0a0a0a', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--ff-body)' }}>
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
