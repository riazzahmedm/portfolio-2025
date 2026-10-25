'use client'
import { useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

const TRIGGER    = 72    // indicator travel (px) that arms the refresh
const MAX_PULL   = 110
const RESISTANCE = 0.5   // finger travel → indicator travel
const HIDDEN_Y   = 60    // indicator rests this far above the top edge

// Areas where people enter data — never refresh these, whatever is currently rendered
const NO_REFRESH_ROUTES = /^\/(admin|blog\/admin|shop\/checkout)(\/|$)/

const TYPED_FIELDS =
  'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=range]), textarea'

/**
 * Pull down at the top of any page to reload it (touch screens only).
 * Never active where a reload could throw work away: any page with a <form> in it,
 * typed text in any box, or a touch that starts in a field, modal or drawer.
 */
export default function PullToRefresh() {
  const indicator = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return
    const el = indicator.current
    if (!el) return

    let startX = 0, startY = 0
    let tracking = false, pulling = false, armed = false, busy = false
    let offset = 0

    const paint = (state: 'idle' | 'pull' | 'armed' | 'loading', animate: boolean) => {
      el.style.transition = animate ? 'transform 0.25s ease, opacity 0.25s ease' : 'none'
      el.style.transform  = `translate(-50%, ${offset - HIDDEN_Y}px)`
      el.style.opacity    = String(Math.min(1, offset / (TRIGGER * 0.8)))
      el.dataset.state    = state
      const icon = el.firstElementChild as HTMLElement | null
      if (icon && state !== 'loading') icon.style.transform = `rotate(${offset * 3}deg)`
    }

    const blocked = (target: EventTarget | null) => {
      if (NO_REFRESH_ROUTES.test(location.pathname) || document.querySelector('form, textarea')) return true
      for (const f of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(TYPED_FIELDS)) {
        if (f.value.trim()) return true
      }
      const t = target instanceof Element ? target : null
      if (t?.closest('input, textarea, select, [contenteditable="true"], [data-no-ptr]')) return true
      for (let n: Element | null = t; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n)
        if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 1 && n.scrollTop > 0) return true
        if (cs.position === 'fixed') {
          const r = n.getBoundingClientRect()
          if (r.height >= innerHeight * 0.8 && r.width >= innerWidth * 0.6) return true   // modal, drawer, loader
        }
      }
      return false
    }

    const reset = () => {
      tracking = pulling = armed = false
      offset = 0
      paint('idle', true)
    }

    const onStart = (e: TouchEvent) => {
      tracking = pulling = armed = false
      if (busy || e.touches.length !== 1 || window.scrollY > 0 || blocked(e.target)) return
      tracking = true
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const onMove = (e: TouchEvent) => {
      if (!tracking) return
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY

      if (!pulling) {
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) { tracking = false; return }
        if (dy < -4) { tracking = false; return }
        if (dy < 8) return
        pulling = true
      }
      if (window.scrollY > 0) { reset(); return }

      if (e.cancelable) e.preventDefault()
      offset = Math.min(MAX_PULL, dy * RESISTANCE)
      const nowArmed = offset >= TRIGGER
      if (nowArmed && !armed) navigator.vibrate?.(8)
      armed = nowArmed
      paint(armed ? 'armed' : 'pull', false)
    }

    const onEnd = () => {
      if (!pulling) { tracking = false; return }
      if (!armed) { reset(); return }
      busy = true
      tracking = pulling = false
      offset = TRIGGER
      paint('loading', true)
      setTimeout(() => window.location.reload(), 350)
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd, { passive: true })
    document.addEventListener('touchcancel', reset, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', reset)
    }
  }, [])

  return (
    <>
      <style>{`
        .ptr {
          position: fixed; top: env(safe-area-inset-top, 0px); left: 50%; z-index: 9999;
          width: 40px; height: 40px; border-radius: 50%; pointer-events: none; opacity: 0;
          transform: translate(-50%, -${HIDDEN_Y}px);
          display: flex; align-items: center; justify-content: center;
          background: #0b0b0d; color: rgba(255,255,255,0.6);
          border: 1px solid rgba(184,160,255,0.35); box-shadow: 0 8px 24px -8px rgba(0,0,0,0.8);
        }
        .ptr[data-state='armed'], .ptr[data-state='loading'] { color: #82ff1f; border-color: rgba(130,255,31,0.55); box-shadow: 0 8px 24px -8px rgba(130,255,31,0.35); }
        .ptr[data-state='loading'] svg { animation: ptr-spin 0.8s linear infinite; }
        @keyframes ptr-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .ptr[data-state='loading'] svg { animation: none; } }
      `}</style>
      <div ref={indicator} className="ptr" data-state="idle" role="status" aria-label="Pull to refresh" aria-hidden="true">
        <RefreshCw size={18} />
      </div>
    </>
  )
}
