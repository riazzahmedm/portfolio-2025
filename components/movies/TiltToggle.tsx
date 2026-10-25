'use client'
import { useEffect, useState } from 'react'
import { Smartphone, X } from 'lucide-react'
import { enableGyro, initGyro, useGyroStatus } from '@/lib/tilt'

const DISMISS_KEY = 'tilt-prompt-dismissed'

function readDismissed() {
  try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

/**
 * Starts gyro tilt. Where the OS needs a tap to allow it (iPhone) this shows a small opt-in prompt.
 * People who already allowed it get tilt back silently on later visits (initGyro probes on every load);
 * dismissing the prompt hides it for good.
 */
export default function TiltToggle() {
  const status = useGyroStatus()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => { initGyro(); setDismissed(readDismissed()) }, [])

  if (status !== 'needs-permission' || dismissed) return null

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* private mode: it just comes back next visit */ }
    setDismissed(true)
  }

  return (
    <div className="wl-hero" style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px 0' }}>
      <style>{`
        .tt { display: inline-flex; align-items: center; gap: 10px; max-width: 100%; padding: 5px 6px 5px 14px; border-radius: 99px;
          background: linear-gradient(135deg, rgba(20,20,28,0.72), rgba(12,12,18,0.58));
          -webkit-backdrop-filter: blur(12px) saturate(1.6); backdrop-filter: blur(12px) saturate(1.6);
          border: 1px solid rgba(255,255,255,0.22); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 16px -8px rgba(0,0,0,0.7);
          font-family: var(--ff-body); font-size: 12.5px; color: rgba(255,255,255,0.82); }
        .tt svg { flex: none; color: rgba(255,255,255,0.6); }
        .tt-text { min-width: 0; line-height: 1.3; }
        .tt-go { flex: none; padding: 6px 13px; border-radius: 99px; cursor: pointer; font: 600 12px var(--ff-body); color: #0a0a0a;
          background: #d6c8ff; border: 0; }
        .tt-go:hover { background: #e6dcff; }
        .tt-x { flex: none; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;
          background: transparent; border: 0; color: rgba(255,255,255,0.55); }
        .tt-x:hover { color: #fff; background: rgba(255,255,255,0.1); }
        .tt-go:focus-visible, .tt-x:focus-visible { outline: 2px solid #b8a0ff; outline-offset: 2px; }
        .tt-short { display: none; }
        @media (max-width: 440px) { .tt { font-size: 12px; gap: 8px; padding-left: 12px; } .tt-long { display: none; } .tt-short { display: inline; } }
      `}</style>

      <div className="tt" role="group" aria-label="Phone tilt">
        <Smartphone size={14} aria-hidden="true" />
        <span className="tt-text"><span className="tt-long">Tilt your phone to move the cards</span><span className="tt-short">Tilt to move the cards</span></span>
        <button type="button" className="tt-go" onClick={() => enableGyro()}>Enable</button>
        <button type="button" className="tt-x" onClick={dismiss} aria-label="Hide this prompt"><X size={14} /></button>
      </div>
    </div>
  )
}
