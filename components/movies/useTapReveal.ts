'use client'
import { useEffect, useRef, useState } from 'react'

const CAN_HOVER = '(hover: hover) and (pointer: fine) and (min-width: 641px)'

/**
 * Card action buttons (preview, share, edit, delete) show on hover with a mouse, and on a touch screen or narrow window
 * they show when you tap the card and hide when you tap anywhere else. Links and buttons inside the card keep working
 * as normal, so tapping the title still opens the film. Keyboard focus reveals them too.
 */
export function useTapReveal() {
  const box = useRef<HTMLDivElement | null>(null)
  const [hovered, setHovered] = useState(false)
  const [open,    setOpen]    = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  const bind = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onClick: (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) return
      if (!window.matchMedia(CAN_HOVER).matches) setOpen(o => !o)
    },
    onFocus: () => setFocused(true),
    onBlur:  (e: React.FocusEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false) },
  }

  return { box, showing: hovered || open || focused, bind }
}
