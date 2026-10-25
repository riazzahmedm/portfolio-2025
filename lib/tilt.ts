import type { PointerEvent } from 'react'

/** Pointer handlers for the `.tilt` / `.nw-card` effect: writes the pointer position into CSS variables. */
export function tiltMove(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget
  const r  = el.getBoundingClientRect()
  const x  = (e.clientX - r.left) / r.width
  const y  = (e.clientY - r.top) / r.height
  el.classList.add('is-tilting')
  el.style.setProperty('--mx', (x - 0.5).toFixed(3))
  el.style.setProperty('--my', (y - 0.5).toFixed(3))
  el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
  el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
}

export function tiltLeave(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget
  el.classList.remove('is-tilting')
  el.style.setProperty('--mx', '0')
  el.style.setProperty('--my', '0')
}

export const tiltProps = { onPointerMove: tiltMove, onPointerLeave: tiltLeave }
