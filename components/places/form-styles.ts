import type { CSSProperties } from 'react'

export const chip = (on: boolean): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '100px', cursor: 'pointer',
  border: `1px solid ${on ? 'rgba(184,160,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
  background: on ? 'rgba(184,160,255,0.14)' : 'rgba(255,255,255,0.02)',
  color: on ? '#cdbcff' : 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: 'var(--ff-body)', transition: 'all 0.18s', whiteSpace: 'nowrap',
})

export const field: CSSProperties = {
  width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
  color: '#fff', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none', boxSizing: 'border-box',
}

export const label: CSSProperties = {
  fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-mono)', marginBottom: '8px',
}
