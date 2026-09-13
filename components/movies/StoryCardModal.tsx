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
  const [variant, setVariant] = useState(1)
  const [imgKey,  setImgKey]  = useState(0)
  const [loading, setLoading] = useState(true)

  const imageUrl = `/api/story-card/${log.id}?variant=${variant}`
  const active   = VARIANTS.find(v => v.id === variant)!

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

  return (
    <>
      <style>{`
        .scm-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(16px);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 200;
        }
        @media (min-width: 540px) {
          .scm-backdrop { align-items: center; }
        }
        .scm-sheet {
          position: relative;
          width: 100%; max-width: 420px;
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px 20px 0 0;
          padding: 20px 20px 36px;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        @media (min-width: 540px) {
          .scm-sheet { border-radius: 20px; padding: 24px; }
        }
        .scm-preview {
          height: 42dvh;
          aspect-ratio: 9/16;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .scm-preview img {
          width: 100%; height: 100%; object-fit: cover;
          transition: opacity 0.2s;
        }
        .scm-variants {
          display: flex; gap: 6px; width: 100%;
          overflow-x: auto; padding-bottom: 2px;
        }
        .scm-hint {
          font-family: var(--ff-mono);
          font-size: 11px; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.25);
          text-align: center; margin: 0;
        }
        .scm-actions { display: flex; gap: 10px; width: 100%; }
        .scm-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 13px; border-radius: 100px; border: 1px solid;
          font-size: 13px; font-family: var(--ff-body);
          cursor: pointer; transition: opacity 0.15s;
        }
        .scm-btn:active { opacity: 0.7; }
        .scm-close {
          position: absolute; top: 14px; right: 14px;
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.5);
        }
      `}</style>

      <div className="scm-backdrop" onClick={onClose}>
        <div className="scm-sheet" onClick={e => e.stopPropagation()}>

          <button className="scm-close" onClick={onClose}>
            <X size={14} />
          </button>

          <p style={{ margin: 0, fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', alignSelf: 'flex-start' }}>
            Instagram Story
          </p>

          {/* Preview */}
          <div
            className="scm-preview"
            style={{
              border: `1px solid ${active.accent}30`,
              boxShadow: `0 0 40px ${active.accent}18`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={imgKey}
              src={imageUrl}
              alt="Story card preview"
              onLoad={() => setLoading(false)}
              style={{ opacity: loading ? 0.3 : 1 }}
            />
            {loading && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.3)', fontSize: '11px',
                fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
              }}>
                Rendering…
              </div>
            )}
          </div>

          {/* Variant picker */}
          <div className="scm-variants">
            {VARIANTS.map(v => (
              <button
                key={v.id}
                onClick={() => pickVariant(v.id)}
                style={{
                  flex: '1 0 52px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  padding: '8px 4px',
                  background: variant === v.id ? `${v.accent}14` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${variant === v.id ? v.accent + '55' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
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

          <p className="scm-hint">Download and post to your Instagram Stories</p>

          <div className="scm-actions">
            <button
              className="scm-btn"
              onClick={download}
              style={{ borderColor: 'rgba(184,160,255,0.3)', background: 'rgba(184,160,255,0.08)', color: '#b8a0ff' }}
            >
              <Download size={14} /> Download
            </button>
            <button
              className="scm-btn"
              onClick={share}
              style={{ borderColor: 'rgba(130,255,31,0.3)', background: 'rgba(130,255,31,0.06)', color: '#82ff1f' }}
            >
              <Share2 size={14} /> Share
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
