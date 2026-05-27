'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock, Eye, EyeOff, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import AdminForm from '@/components/movies/AdminForm'

/* ── Password gate ──────────────────────────────────────────────────────── */
function PasswordGate({ onAuthed }: { onAuthed: () => void }) {
  const [pw,      setPw]      = useState('')
  const [show,    setShow]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/movies', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) { onAuthed() }
    else { setError('Wrong password'); setPw('') }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'var(--ff-body)',
    }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'rgba(184,160,255,0.08)', border: '1px solid rgba(184,160,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={22} color="#b8a0ff" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, fontFamily: 'var(--ff-body)' }}>Admin access</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '6px 0 0', fontFamily: 'var(--ff-mono)' }}>
              watchlog · riazahmed.com
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
              autoFocus
              style={{
                width: '100%', padding: '12px 40px 12px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${error ? 'rgba(224,32,32,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px', color: '#fff', fontSize: '15px',
                fontFamily: 'var(--ff-body)', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <button type="button" onClick={() => setShow(s => !s)} style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', padding: '4px',
            }}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <div style={{
              fontSize: '12px', color: '#e06060',
              fontFamily: 'var(--ff-mono)', textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !pw} style={{
            padding: '13px', borderRadius: '100px',
            border: '1px solid rgba(184,160,255,0.35)',
            background: 'rgba(184,160,255,0.12)',
            color: '#b8a0ff', fontSize: '14px', fontWeight: 600,
            cursor: loading || !pw ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--ff-body)', opacity: !pw ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}>
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>

        <Link href="/movies" style={{
          textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)',
          textDecoration: 'none', fontFamily: 'var(--ff-mono)',
        }}>
          ← Back to watchlog
        </Link>
      </div>
    </div>
  )
}

/* ── Main admin page ────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [authed,   setAuthed]   = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/auth/movies')
      .then(r => r.json())
      .then(d => { setAuthed(d.authed); setChecking(false) })
  }, [])

  async function logout() {
    await fetch('/api/auth/movies', { method: 'DELETE' })
    setAuthed(false)
    toast.success('Logged out')
  }

  if (checking) return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(184,160,255,0.3)', borderTopColor: '#b8a0ff', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!authed) return <PasswordGate onAuthed={() => setAuthed(true)} />

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(18px)',
      }}>
        <div style={{
          maxWidth: '720px', margin: '0 auto',
          padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <Link href="/movies" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: 'var(--text-dim)', textDecoration: 'none',
              fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
            }}>
              <ArrowLeft size={13} /> Watchlog
            </Link>
            <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Admin</span>
          </div>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '100px', padding: '7px 14px',
            color: 'var(--text-dim)', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'var(--ff-mono)',
          }}>
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          <h1 style={{
            margin: 0, fontFamily: 'var(--ff-mono)', fontWeight: 400,
            fontSize: 'clamp(1rem, 2.8vw, 1.25rem)',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: '14px', color: '#fff',
          }}>
            <span style={{ color: '#b8a0ff' }}>—</span>
            Log Entry
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: 0, fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em' }}>
            Add a movie or series to your watchlog.
          </p>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-card)',
          borderRadius: '16px', padding: '28px',
        }}>
          <AdminForm onSuccess={() => {}} />
        </div>
      </main>

    </div>
  )
}
