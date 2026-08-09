'use client'
import { X, Download, Share2 } from 'lucide-react'
import { useState } from 'react'
import type { MovieLog } from '@/lib/movies.types'

const VARIANTS: { id: number; label: string; accent: string }[] = [
  { id: 1, label: 'Neon',   accent: '#ff0080' },
  { id: 2, label: 'Matrix', accent: '#00ff41' },
  { id: 3, label: 'Pop',    accent: '#ffe600' },
  { id: 4, label: 'Aurora', accent: '#00ffc8' },
  { id: 5, label: 'OG',     accent: '#b8a0ff' },
]

export default function StoryCardModal({
  log,
  onClose,
}: {
  log:     MovieLog
  onClose: () => void
}) {
  const [variant,  setVariant]  = useState(1)
  const [imgKey,   setImgKey]   = useState(0)
  const [loading,  setLoading]  = useState(false)

  const imageUrl = `/api/story-card/${log.id}?variant=${variant}`

  function pickVariant(v: number) {
    setVariant(v)
    setLoading(true)
    setImgKey(k => k + 1)
  }

  async function download() {
    const res  = await fetch(imageUrl)
    const blob = await res.blob()
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `${log.title.replace(/\s+/g, '-')}-story-v${variant}.png`
    a.click()
  }

  async function share() {
    try {
      const res  = await fetch(imageUrl)
      const blob = await res.blob()
      const file = new File([blob], 'story.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
        return
      }
    } catch { /* fall through */ }
    download()
  }

  const active = VARIANTS.find(v => v.id === variant)!

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(24px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', position: 'relative', width: '100%', maxWidth: '340px' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '-14px', right: '-14px',
            width: '34px', height: '34px', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)', background: '#141414',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.55)',
          }}
        >
          <X size={15} />
        </button>

        {/* Preview */}
        <div style={{
          width: '100%', aspectRatio: '9/16',
          borderRadius: '14px', overflow: 'hidden',
          border: `1px solid ${active.accent}30`,
          boxShadow: `0 0 60px ${active.accent}18, 0 32px 80px rgba(0,0,0,0.7)`,
          transition: 'box-shadow 0.3s, border-color 0.3s',
          position: 'relative',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={imgKey}
            src={imageUrl}
            alt="Story card preview"
            onLoad={() => setLoading(false)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: loading ? 0.4 : 1, transition: 'opacity 0.2s' }}
          />
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
            }}>
              Rendering...
            </div>
          )}
        </div>

        {/* Variant picker */}
        <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
          {VARIANTS.map(v => (
            <button
              key={v.id}
              onClick={() => pickVariant(v.id)}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '8px 4px',
                background: variant === v.id ? `${v.accent}14` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${variant === v.id ? v.accent + '55' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: variant === v.id ? v.accent : 'rgba(255,255,255,0.15)',
                transition: 'background 0.15s',
              }} />
              <span style={{
                fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.06em',
                color: variant === v.id ? v.accent : 'rgba(255,255,255,0.3)',
                transition: 'color 0.15s',
              }}>
                {v.label}
              </span>
            </button>
          ))}
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.28)', fontSize: '11px',
          fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', textAlign: 'center', margin: 0,
        }}>
          Download → post to Instagram Stories
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button
            onClick={download}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '100px',
              border: '1px solid rgba(184,160,255,0.3)', background: 'rgba(184,160,255,0.08)',
              color: '#b8a0ff', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--ff-body)',
            }}
          >
            <Download size={14} /> Download
          </button>
          <button
            onClick={share}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '100px',
              border: '1px solid rgba(130,255,31,0.25)', background: 'rgba(130,255,31,0.06)',
              color: '#82ff1f', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--ff-body)',
            }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>
    </div>
  )
}
