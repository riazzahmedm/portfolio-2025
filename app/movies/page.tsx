'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Film, Tv, PlaySquare, X } from 'lucide-react'
import type { MovieLog } from '@/lib/movies.types'
import { VIBES } from '@/lib/movies.types'
import LogCard from '@/components/movies/LogCard'
import FilterTabs, { type LogFilter } from '@/components/movies/FilterTabs'
import AdminForm from '@/components/movies/AdminForm'

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      padding: '16px 24px',
      background: 'var(--surface)', border: '1px solid var(--border-card)',
      borderRadius: '14px', minWidth: '100px',
    }}>
      <div style={{ color: '#b8a0ff' }}>{icon}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--ff-display)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
        {label}
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '16px',
    }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--surface)', border: '1px solid var(--border-card)',
          borderRadius: '14px', overflow: 'hidden',
        }}>
          <div style={{ aspectRatio: '2/3', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.6s ease infinite' }} />
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '13px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', width: '80%' }} />
            <div style={{ height: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MoviesPage() {
  const [logs,       setLogs]       = useState<MovieLog[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState<LogFilter>('all')
  const [isAdmin,    setIsAdmin]    = useState(false)
  const [editingLog, setEditingLog] = useState<MovieLog | null>(null)

  const fetchLogs = useCallback(async () => {
    const res  = await fetch('/api/movies')
    const data = await res.json()
    setLogs(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLogs()
    // Check admin status
    fetch('/api/auth/movies')
      .then(r => r.json())
      .then(d => setIsAdmin(d.authed))
  }, [fetchLogs])

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter)

  const counts: Record<LogFilter, number> = {
    all:     logs.length,
    movie:   logs.filter(l => l.type === 'movie').length,
    series:  logs.filter(l => l.type === 'series').length,
    episode: logs.filter(l => l.type === 'episode').length,
  }

  // Most common vibe
  const vibeFreq = logs.reduce<Record<string, number>>((acc, l) => {
    if (l.vibe) acc[l.vibe] = (acc[l.vibe] ?? 0) + 1
    return acc
  }, {})
  const topVibeKey  = Object.entries(vibeFreq).sort((a, b) => b[1] - a[1])[0]?.[0]
  const topVibeData = VIBES.find(v => v.key === topVibeKey)

  function handleDeleted(id: string) {
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  function handleEditSaved() {
    setEditingLog(null)
    fetchLogs()
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>

      {/* ── Edit drawer ── */}
      {editingLog && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setEditingLog(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            }}
          />
          {/* Panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101,
            width: 'min(520px, 100vw)',
            background: 'var(--bg)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Drawer header */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 10,
              background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(18px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: '16px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>Edit entry</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginTop: '2px' }}>
                  {editingLog.title}
                </div>
              </div>
              <button
                onClick={() => setEditingLog(null)}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                }}
              >
                <X size={14} />
              </button>
            </div>
            {/* Form */}
            <div style={{ padding: '28px 24px 60px' }}>
              <AdminForm initialLog={editingLog} onSuccess={handleEditSaved} />
            </div>
          </div>
        </>
      )}

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(18px)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: 'var(--text-dim)', textDecoration: 'none',
              fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
              transition: 'color 0.2s',
            }}>
              <ArrowLeft size={13} /> Portfolio
            </Link>
            <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>Watched</span>
          </div>
          {isAdmin && (
            <Link href="/movies/admin" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '100px',
              border: '1px solid rgba(184,160,255,0.28)',
              background: 'rgba(184,160,255,0.08)',
              color: '#b8a0ff', textDecoration: 'none',
              fontSize: '12px', letterSpacing: '0.1em', fontFamily: 'var(--ff-mono)',
            }}>
              <Plus size={13} /> Log
            </Link>
          )}
        </div>
      </header>

      {/* ── Hero heading ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 0' }}>
        <h1 style={{
          fontSize: 'clamp(2.6rem, 6vw, 4rem)',
          fontFamily: 'var(--ff-display)', fontWeight: 400,
          margin: 0, letterSpacing: '-0.01em', lineHeight: 1,
        }}>
          My{' '}
          <span style={{
            WebkitTextStroke: '1px rgba(255,255,255,0.22)', color: 'transparent',
          }}>
            Watchlog
          </span>
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: '8px 0 0', fontFamily: 'var(--ff-mono)' }}>
          Every movie, series &amp; episode — one place.
        </p>
      </div>

      {/* ── Stats ── */}
      {!loading && logs.length > 0 && (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 0' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Stat icon={<Film size={16} />}      value={counts.movie}   label="Movies"   />
            <Stat icon={<Tv size={16} />}         value={counts.series}  label="Series"   />
            <Stat icon={<PlaySquare size={16} />} value={counts.episode} label="Episodes" />
            {topVibeData && (
              <Stat
                icon={<span style={{ fontSize: '16px' }}>{topVibeData.emoji}</span>}
                value={vibeFreq[topVibeKey!]}
                label={topVibeData.label}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Filters + Grid ── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <FilterTabs active={filter} counts={counts} onChange={setFilter} />
          {!loading && (
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </div>

        {loading ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '14px' }}>
            Nothing logged yet.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '16px',
          }}>
            {filtered.map(log => (
              <LogCard key={log.id} log={log} isAdmin={isAdmin} onDeleted={handleDeleted} onEdit={isAdmin ? setEditingLog : undefined} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
