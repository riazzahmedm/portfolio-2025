import type { CSSProperties } from 'react'

/** Top-bar icons everywhere share the shop cart icon's look: a bare 22px icon, no pill or border, with a small pill for counts. */
export const NAV_ICON_SIZE = 22

export const navIcon: CSSProperties = {
  position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--text-primary)', background: 'none', border: 0, padding: 0, cursor: 'pointer', textDecoration: 'none',
  transition: 'color 0.18s',
}

export const navBadge: CSSProperties = {
  position: 'absolute', top: '-6px', right: '-9px', background: '#b8a0ff', color: '#0a0a0a',
  borderRadius: '999px', fontSize: '10px', fontWeight: 700, minWidth: '16px', height: '16px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--ff-mono)',
}
