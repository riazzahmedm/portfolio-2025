'use client'
import { X, Download, Share2 } from 'lucide-react'
import type { MovieLog } from '@/lib/movies.types'

export default function StoryCardModal({
  log,
  onClose,
}: {
  log:     MovieLog
  onClose: () => void
}) {
  const imageUrl = `/api/story-card/${log.id}`

  async function download() {
    const res  = await fetch(imageUrl)
    const blob = await res.blob()
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `${log.title.replace(/\s+/g, '-')}-story.png`
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
    } catch { /* fall through to download */ }
    download()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position:       'fixed', inset: 0,
        background:     'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(20px)',
        display:        'flex', alignItems: 'center', justifyContent: 'center',
        zIndex:         200, padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display:       'flex', flexDirection: 'column',
          alignItems:    'center', gap: '20px',
          position:      'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position:     'absolute', top: '-14px', right: '-14px',
            width: '34px', height: '34px',
            borderRadius: '50%',
            border:       '1px solid rgba(255,255,255,0.1)',
            background:   '#141414',
            display:      'flex', alignItems: 'center', justifyContent: 'center',
            cursor:       'pointer', color: 'rgba(255,255,255,0.55)',
          }}
        >
          <X size={15} />
        </button>

        {/* Preview — 9:16, max 280px wide */}
        <div style={{
          width:        'min(280px, 70vw)',
          aspectRatio:  '9/16',
          borderRadius: '14px',
          overflow:     'hidden',
          border:       '1px solid rgba(255,255,255,0.08)',
          boxShadow:    '0 32px 80px rgba(0,0,0,0.7)',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Story card preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.35)', fontSize: '11px',
          fontFamily: 'var(--ff-mono)', letterSpacing: '0.12em', textAlign: 'center', margin: 0,
        }}>
          Download → post to Instagram Stories
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={download}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px', borderRadius: '100px',
              border: '1px solid rgba(184,160,255,0.3)',
              background: 'rgba(184,160,255,0.08)',
              color: '#b8a0ff', fontSize: '13px',
              cursor: 'pointer', fontFamily: 'var(--ff-body)',
            }}
          >
            <Download size={14} /> Download
          </button>
          <button
            onClick={share}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px', borderRadius: '100px',
              border: '1px solid rgba(130,255,31,0.25)',
              background: 'rgba(130,255,31,0.06)',
              color: '#82ff1f', fontSize: '13px',
              cursor: 'pointer', fontFamily: 'var(--ff-body)',
            }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>
    </div>
  )
}
