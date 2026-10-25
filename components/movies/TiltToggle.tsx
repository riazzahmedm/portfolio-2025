'use client'
import { useEffect } from 'react'
import { Smartphone } from 'lucide-react'
import { enableGyro, initGyro, useGyroStatus } from '@/lib/tilt'

/** Starts gyro tilt and, only where the OS needs a tap to allow it (iPhone), shows a small opt-in chip. */
export default function TiltToggle() {
  const status = useGyroStatus()

  useEffect(() => { initGyro() }, [])

  if (status !== 'needs-permission') return null

  return (
    <div className="wl-hero" style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px 0' }}>
      <button
        type="button"
        onClick={() => enableGyro()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '7px 14px', borderRadius: '100px', cursor: 'pointer',
          border: '1px solid rgba(184,160,255,0.4)', background: 'rgba(184,160,255,0.08)', color: '#b8a0ff',
          fontSize: '10px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}
      >
        <Smartphone size={12} /> Enable tilt
      </button>
    </div>
  )
}
