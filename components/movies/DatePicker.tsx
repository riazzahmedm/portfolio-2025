'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS      = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function parseISO(iso: string): Date | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toISO(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatDisplay(iso: string) {
  const d = parseISO(iso)
  if (!d) return ''
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Calendar grid builder ────────────────────────────────────────────────────
function buildCells(year: number, month: number) {
  const firstDay     = new Date(year, month, 1).getDay()
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const daysInPrev   = new Date(year, month, 0).getDate()

  type Cell = { day: number; offset: -1 | 0 | 1 } // offset: prev / cur / next month
  const cells: Cell[] = []

  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, offset: -1 })

  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, offset: 0 })

  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++)
    cells.push({ day: d, offset: 1 })

  return cells
}

// ── Component ────────────────────────────────────────────────────────────────
export default function DatePicker({
  value,
  onChange,
}: {
  value:    string
  onChange: (v: string) => void
}) {
  const today    = new Date()
  const selected = parseISO(value)

  const [open,      setOpen]      = useState(false)
  const [viewYear,  setViewYear]  = useState(() => selected?.getFullYear()  ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => selected?.getMonth()     ?? today.getMonth())

  const wrapRef = useRef<HTMLDivElement>(null)

  // Sync view when value changes from outside
  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear())
      setViewMonth(selected.getMonth())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function prevMonth() {
    setViewMonth(m => {
      if (m === 0) { setViewYear(y => y - 1); return 11 }
      return m - 1
    })
  }
  function nextMonth() {
    setViewMonth(m => {
      if (m === 11) { setViewYear(y => y + 1); return 0 }
      return m + 1
    })
  }

  function selectCell(cell: { day: number; offset: number }) {
    let m = viewMonth + cell.offset
    let y = viewYear
    if (m < 0)  { m = 11; y-- }
    if (m > 11) { m = 0;  y++ }
    onChange(toISO(new Date(y, m, cell.day)))
    setOpen(false)
  }

  function isSelected(cell: { day: number; offset: number }) {
    if (!selected || cell.offset !== 0) return false
    return (
      selected.getFullYear() === viewYear &&
      selected.getMonth()    === viewMonth &&
      selected.getDate()     === cell.day
    )
  }

  function isToday(cell: { day: number; offset: number }) {
    if (cell.offset !== 0) return false
    return (
      today.getFullYear() === viewYear &&
      today.getMonth()    === viewMonth &&
      today.getDate()     === cell.day
    )
  }

  const cells = buildCells(viewYear, viewMonth)

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>

      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '10px 14px', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(184,160,255,0.45)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '10px',
          color: value ? '#fff' : 'rgba(255,255,255,0.28)',
          fontSize: '14px', fontFamily: 'var(--ff-body)',
          cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'border-color 0.2s',
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value ? formatDisplay(value) : 'Pick a date'}</span>
        {/* calendar icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={open ? '#b8a0ff' : 'rgba(255,255,255,0.28)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {/* ── Calendar popup ── */}
      {open && (
        <div style={{
          position:     'absolute',
          top:          'calc(100% + 8px)',
          left:         '50%',
          transform:    'translateX(-50%)',
          zIndex:       200,
          background:   '#111111',
          border:       '1px solid rgba(184,160,255,0.18)',
          borderRadius: '18px',
          padding:      '20px',
          boxShadow:    '0 28px 72px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)',
          width:        'min(308px, calc(100vw - 48px))',
          userSelect:   'none',
        }}>

          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <button type="button" onClick={prevMonth}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', width: '30px', height: '30px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(184,160,255,0.4)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              <ChevronLeft size={14} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', fontFamily: 'var(--ff-body)' }}>
                {MONTHS[viewMonth]}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--ff-mono)', marginTop: '1px' }}>
                {viewYear}
              </div>
            </div>

            <button type="button" onClick={nextMonth}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', width: '30px', height: '30px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(184,160,255,0.4)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '6px' }}>
            {DAY_HEADERS.map(h => (
              <div key={h} style={{
                textAlign: 'center', fontSize: '10px',
                color: 'rgba(255,255,255,0.22)',
                fontFamily: 'var(--ff-mono)', letterSpacing: '0.06em',
                padding: '4px 0',
              }}>
                {h}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((cell, i) => {
              const sel = isSelected(cell)
              const tod = isToday(cell)
              const cur = cell.offset === 0

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectCell(cell)}
                  style={{
                    width: '36px', height: '36px',
                    borderRadius: '10px',
                    border: tod && !sel
                      ? '1px solid rgba(184,160,255,0.5)'
                      : '1px solid transparent',
                    background: sel ? '#b8a0ff' : 'transparent',
                    color: sel
                      ? '#0a0a0a'
                      : cur
                        ? tod ? '#b8a0ff' : 'rgba(255,255,255,0.85)'
                        : 'rgba(255,255,255,0.15)',
                    fontSize: '13px',
                    fontFamily: 'var(--ff-body)',
                    fontWeight: sel || tod ? 700 : 400,
                    cursor: 'pointer',
                    transition: 'background 0.12s, color 0.12s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={e => {
                    if (!sel) {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.background = 'rgba(184,160,255,0.14)'
                      el.style.color      = '#fff'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!sel) {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.background = 'transparent'
                      el.style.color      = cur
                        ? tod ? '#b8a0ff' : 'rgba(255,255,255,0.85)'
                        : 'rgba(255,255,255,0.15)'
                    }
                  }}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: '16px', paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.28)', fontSize: '11px',
                fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em',
                textTransform: 'uppercase', transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.28)' }}
            >
              Clear
            </button>
            <button type="button"
              onClick={() => { onChange(toISO(today)); setOpen(false) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#b8a0ff', fontSize: '11px',
                fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em',
                textTransform: 'uppercase', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
