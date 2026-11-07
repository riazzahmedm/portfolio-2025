'use client'
import { useEffect, useState } from 'react'
import { Smartphone, X } from 'lucide-react'
import { enableGyro, initGyro, useGyroStatus } from '@/lib/tilt'

const DISMISS_KEY = 'tilt-prompt-dismissed'
const SCROLL_TRIGGER = 160   // px scrolled before the toast appears

function readDismissed() {
  try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

/**
 * Starts gyro tilt. Where the OS needs a tap to allow it (iPhone) this offers a small toast at the bottom of the screen,
 * but only once the visitor has started scrolling, so it arrives while they are already moving and engaged.
 * People who already allowed it get tilt back silently on later visits (initGyro probes on every load);
 * it stays until the visitor taps Enable or closes it with the X, which hides it for good.
 */
export default function TiltToggle({ what = 'cards' }: { what?: string }) {
  const status = useGyroStatus()
  const [dismissed, setDismissed] = useState(true)   // assume dismissed until storage has been read, so it never flashes
  const [scrolled,  setScrolled]  = useState(false)

  useEffect(() => { initGyro(); setDismissed(readDismissed()) }, [])

  const wanted = status === 'needs-permission' && !dismissed

  useEffect(() => {
    if (!wanted || scrolled) return
    // Only a real scroll counts: a page restored to an old scroll position must not pop the toast up on its own
    const onScroll = () => { if (window.scrollY > SCROLL_TRIGGER) setScrolled(true) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [wanted, scrolled])

  const show = wanted && scrolled

  if (!show) return null

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* private mode: it just comes back next visit */ }
    setDismissed(true)
  }

  return (
    <div className="tt-wrap" role="region" aria-label="Phone tilt">
      <style>{`
        .tt-wrap { position: fixed; left: 0; right: 0; bottom: calc(16px + env(safe-area-inset-bottom)); z-index: 150; display: flex; justify-content: center; padding: 0 16px; pointer-events: none; }
        .tt { pointer-events: auto; display: inline-flex; align-items: center; gap: 10px; max-width: 100%; padding: 6px 6px 6px 16px; border-radius: 99px;
          background: linear-gradient(135deg, rgba(24,24,32,0.88), rgba(12,12,18,0.82));
          -webkit-backdrop-filter: blur(14px) saturate(1.6); backdrop-filter: blur(14px) saturate(1.6);
          border: 1px solid rgba(255,255,255,0.22); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 14px 34px -10px rgba(0,0,0,0.8);
          font-family: var(--ff-body); font-size: 13px; color: rgba(255,255,255,0.88); animation: tt-up 0.45s cubic-bezier(.2,.9,.3,1.2); }
        @keyframes tt-up { from { opacity: 0; transform: translateY(24px) scale(0.96) } to { opacity: 1; transform: none } }
        .tt svg { flex: none; color: rgba(255,255,255,0.65); }
        .tt-text { min-width: 0; line-height: 1.3; }
        .tt-go { flex: none; padding: 8px 15px; border-radius: 99px; cursor: pointer; font: 600 12.5px var(--ff-body); color: #0a0a0a; background: #d6c8ff; border: 0; }
        .tt-go:hover { background: #e6dcff; }
        .tt-x { flex: none; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;
          background: transparent; border: 0; color: rgba(255,255,255,0.55); }
        .tt-x:hover { color: #fff; background: rgba(255,255,255,0.1); }
        .tt-go:focus-visible, .tt-x:focus-visible { outline: 2px solid #b8a0ff; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .tt { animation: none; } }
      `}</style>

      <div className="tt">
        <Smartphone size={15} aria-hidden="true" />
        <span className="tt-text">Tilt your phone to move the {what}</span>
        <button type="button" className="tt-go" onClick={() => enableGyro()}>Enable</button>
        <button type="button" className="tt-x" onClick={dismiss} aria-label="Hide this prompt"><X size={15} /></button>
      </div>
    </div>
  )
}
