'use client'
import { useState, useRef } from 'react'
import { Upload, AlertCircle, CheckCircle2, X } from 'lucide-react'
import type { LetterboxdRow } from '@/lib/movies.types'

/** Minimal CSV parser — handles quoted fields and escaped quotes */
function parseCsv(text: string): Record<string, string>[] {
  const lines  = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = splitCsvLine(lines[0])
  return lines.slice(1)
    .filter(l => l.trim())
    .map(l => {
      const vals: Record<string, string> = {}
      splitCsvLine(l).forEach((v, i) => { if (headers[i]) vals[headers[i]] = v })
      return vals
    })
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
      else inQ = !inQ
    } else if (c === ',' && !inQ) { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur)
  return out.map(s => s.trim())
}

function letterboxdRowToImport(raw: Record<string, string>): LetterboxdRow | null {
  // Letterboxd diary columns: Date, Name, Year, Letterboxd URI, Rating, Rewatch, Tags, Watched Date
  const name = raw['Name']?.trim()
  if (!name) return null
  return {
    name,
    year:      raw['Year']?.trim() ?? '',
    rating:    raw['Rating']?.trim() ?? '',
    watchedOn: (raw['Watched Date'] ?? raw['Date'] ?? '').trim(),
    rewatch:   raw['Rewatch']?.toLowerCase() === 'yes',
    tags:      raw['Tags'] ? raw['Tags'].split(',').map(t => t.trim()).filter(Boolean) : [],
  }
}

type ImportStatus = 'idle' | 'previewing' | 'importing' | 'done'

interface ImportResult {
  inserted: number
  skipped:  number
  errors:   string[]
}

export default function LetterboxdImport({ onSuccess }: { onSuccess: () => void }) {
  const [rows,     setRows]     = useState<LetterboxdRow[]>([])
  const [status,   setStatus]   = useState<ImportStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [result,   setResult]   = useState<ImportResult | null>(null)
  const [error,    setError]    = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a .csv file (diary.csv from your Letterboxd export)')
      return
    }
    const reader = new FileReader()
    reader.onload = e => {
      const text    = e.target?.result as string
      const raw     = parseCsv(text)
      const parsed  = raw.map(letterboxdRowToImport).filter(Boolean) as LetterboxdRow[]
      setRows(parsed)
      setStatus('previewing')
      setError('')
    }
    reader.readAsText(file)
  }

  async function startImport() {
    setStatus('importing')
    setProgress(0)

    // Send in batches of 50 to avoid huge payloads / timeouts
    const BATCH = 50
    let inserted = 0, skipped = 0
    const errors: string[] = []

    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH)
      const res   = await fetch('/api/movies/import', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rows: batch }),
      })
      if (!res.ok) { errors.push(`Batch ${i / BATCH + 1} failed`); continue }
      const data: ImportResult = await res.json()
      inserted += data.inserted
      skipped  += data.skipped
      errors.push(...data.errors)
      setProgress(Math.min(100, Math.round(((i + BATCH) / rows.length) * 100)))
    }

    setResult({ inserted, skipped, errors })
    setStatus('done')
    if (inserted > 0) onSuccess()
  }

  function reset() {
    setRows([]); setStatus('idle'); setResult(null)
    setProgress(0); setError('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Intro */}
      <div style={{
        padding: '14px 18px', borderRadius: '12px',
        background: 'rgba(184,160,255,0.05)',
        border: '1px solid rgba(184,160,255,0.15)',
        fontSize: '13px', color: 'rgba(255,255,255,0.55)',
        lineHeight: 1.6, fontFamily: 'var(--ff-body)',
      }}>
        <strong style={{ color: '#b8a0ff' }}>How to export from Letterboxd:</strong>
        <br />
        letterboxd.com → Settings → <strong>Import &amp; Export</strong> → Export Your Data → download the ZIP → extract <strong>diary.csv</strong>
      </div>

      {/* Drop zone */}
      {status === 'idle' && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          style={{
            border: '2px dashed rgba(184,160,255,0.25)',
            borderRadius: '14px',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(184,160,255,0.5)'
            ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(184,160,255,0.03)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(184,160,255,0.25)'
            ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
          }}
        >
          <Upload size={28} color="#b8a0ff" strokeWidth={1.5} />
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--ff-body)' }}>
            Drop <strong style={{ color: '#b8a0ff' }}>diary.csv</strong> here or click to browse
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--ff-mono)' }}>
            .csv only
          </div>
          <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: '10px',
          background: 'rgba(224,32,32,0.08)', border: '1px solid rgba(224,32,32,0.25)',
          color: '#e06060', fontSize: '13px', fontFamily: 'var(--ff-body)',
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Preview table */}
      {status === 'previewing' && rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--ff-body)' }}>
              Found <strong style={{ color: '#b8a0ff' }}>{rows.length}</strong> diary entries
            </div>
            <button onClick={reset} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', fontFamily: 'var(--ff-mono)',
            }}>
              <X size={12} /> Clear
            </button>
          </div>

          {/* Sample rows */}
          <div style={{
            background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto',
              padding: '8px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: '10px', letterSpacing: '0.16em',
              color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)',
              textTransform: 'uppercase',
            }}>
              <span>Title</span><span>Year</span><span>Rating</span>
            </div>
            {rows.slice(0, 8).map((r, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px',
                padding: '8px 16px',
                borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                fontSize: '13px', fontFamily: 'var(--ff-body)',
                color: 'rgba(255,255,255,0.65)',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--ff-mono)', fontSize: '11px' }}>{r.year}</span>
                <span style={{ color: '#b8a0ff', fontFamily: 'var(--ff-mono)', fontSize: '11px' }}>
                  {r.rating ? `${r.rating}★` : '—'}
                </span>
              </div>
            ))}
            {rows.length > 8 && (
              <div style={{ padding: '8px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--ff-mono)', textAlign: 'center' }}>
                + {rows.length - 8} more
              </div>
            )}
          </div>

          <div style={{
            padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(255,200,0,0.05)', border: '1px solid rgba(255,200,0,0.15)',
            fontSize: '12px', color: 'rgba(255,200,0,0.7)', fontFamily: 'var(--ff-body)', lineHeight: 1.5,
          }}>
            ⚡ Each entry will be matched against TMDB. This may take a minute for large libraries.
            Only movies are imported (Letterboxd diary = movies only).
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={startImport} style={{
              flex: 1, padding: '13px', borderRadius: '100px',
              border: '1px solid rgba(184,160,255,0.4)',
              background: 'rgba(184,160,255,0.12)',
              color: '#b8a0ff', fontSize: '14px', cursor: 'pointer',
              fontFamily: 'var(--ff-body)', fontWeight: 600,
            }}>
              Import {rows.length} entries
            </button>
            <button onClick={reset} style={{
              padding: '13px 22px', borderRadius: '100px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.4)', fontSize: '14px',
              cursor: 'pointer', fontFamily: 'var(--ff-body)',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Importing progress */}
      {status === 'importing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--ff-body)' }}>
            Matching against TMDB &amp; importing…
          </div>
          <div style={{ width: '100%', height: '4px', borderRadius: '100px', background: 'rgba(255,255,255,0.08)' }}>
            <div style={{
              height: '100%', borderRadius: '100px',
              background: 'linear-gradient(90deg, #7c5ccc, #b8a0ff)',
              width: `${progress}%`, transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--ff-mono)' }}>
            {progress}%
          </div>
        </div>
      )}

      {/* Done */}
      {status === 'done' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '14px',
            padding: '18px', borderRadius: '14px',
            background: 'rgba(130,255,31,0.06)', border: '1px solid rgba(130,255,31,0.2)',
          }}>
            <CheckCircle2 size={20} color="#82ff1f" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)', color: '#82ff1f' }}>
                Import complete
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--ff-body)' }}>
                {result.inserted} imported · {result.skipped} skipped (no TMDB match)
                {result.errors.length > 0 && ` · ${result.errors.length} errors`}
              </div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <details style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-mono)' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                {result.errors.length} errors (click to expand)
              </summary>
              <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.errors.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            </details>
          )}

          <button onClick={reset} style={{
            padding: '11px', borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
            color: 'rgba(255,255,255,0.45)', fontSize: '13px',
            cursor: 'pointer', fontFamily: 'var(--ff-body)',
          }}>
            Import another file
          </button>
        </div>
      )}
    </div>
  )
}
