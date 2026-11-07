'use client'
import { useEffect } from 'react'

/**
 * Hover effects are for a mouse on a real desktop window. On phones (and narrow windows) browsers still fire
 * mouseover/mouseout after a tap, which leaves "hover" styles stuck on whatever was touched.
 * React builds onMouseEnter/onMouseLeave out of those two events, so swallowing them here, before React sees them,
 * switches every such handler off at small sizes without touching each component. (CSS :hover rules are gated separately.)
 */
export default function HoverGuard() {
  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 641px)')
    const block = (e: Event) => { if (!canHover.matches) e.stopPropagation() }
    window.addEventListener('mouseover', block, true)
    window.addEventListener('mouseout', block, true)
    return () => { window.removeEventListener('mouseover', block, true); window.removeEventListener('mouseout', block, true) }
  }, [])
  return null
}
