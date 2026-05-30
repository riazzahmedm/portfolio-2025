'use client'

export type LogFilter = 'all' | 'movie' | 'series'

const TABS: { key: LogFilter; label: string }[] = [
  { key: 'all',    label: 'All'    },
  { key: 'movie',  label: 'Movies' },
  { key: 'series', label: 'Series' },
]

export default function FilterTabs({
  active,
  counts,
  onChange,
}: {
  active:   LogFilter
  counts:   Record<LogFilter, number>
  onChange: (f: LogFilter) => void
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' } as React.CSSProperties}>
      {TABS.map(tab => {
        const on = active === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              padding:      '8px 18px',
              borderRadius: '100px',
              border:       `1px solid ${on ? 'rgba(184,160,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background:   on ? 'rgba(184,160,255,0.1)' : 'transparent',
              color:        on ? '#b8a0ff' : 'rgba(255,255,255,0.45)',
              fontSize:     '10px',
              letterSpacing:'0.14em',
              textTransform:'uppercase',
              cursor:       'pointer',
              fontFamily:   'var(--ff-mono)',
              transition:   'all 0.2s',
              display:      'flex',
              alignItems:   'center',
              gap:          '6px',
              flexShrink:   0,
              whiteSpace:   'nowrap',
            }}
          >
            {tab.label}
            <span style={{
              fontSize:   '10px',
              background: on ? 'rgba(184,160,255,0.2)' : 'rgba(255,255,255,0.07)',
              borderRadius:'100px',
              padding:    '1px 7px',
              color:      on ? '#b8a0ff' : 'rgba(255,255,255,0.3)',
            }}>
              {counts[tab.key]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
