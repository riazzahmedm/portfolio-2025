'use client'
import { X, Download, Share2 } from 'lucide-react'
import { useState } from 'react'

export default function BlogStoryModal({
  slug,
  title,
  onClose,
}: {
  slug:    string
  title:   string
  onClose: () => void
}) {
  const [loading, setLoading] = useState(true)

  const imageUrl = `/api/blog-story-card/${slug}`

  async function download() {
    const res  = await fetch(imageUrl)
    const blob = await res.blob()
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `${title.replace(/\s+/g, '-')}-story.png`
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
        .bsm-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(16px);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 200;
        }
        @media (min-width: 540px) {
          .bsm-backdrop { align-items: center; }
        }
        .bsm-sheet {
          position: relative;
          width: 100%; max-width: 420px;
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px 20px 0 0;
          padding: 20px 20px 36px;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        @media (min-width: 540px) {
          .bsm-sheet {
            border-radius: 20px;
            padding: 24px;
          }
        }
        /* Drive sizing by height so aspect-ratio isn't fought by width:100% */
        .bsm-preview {
          height: 42dvh;
          aspect-ratio: 9/16;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(130,255,31,0.2);
          box-shadow: 0 0 40px rgba(130,255,31,0.08);
          position: relative;
          flex-shrink: 0;
        }
        .bsm-preview img {
          width: 100%; height: 100%; object-fit: cover;
          transition: opacity 0.2s;
        }
        .bsm-hint {
          font-family: var(--ff-mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.25);
          text-align: center;
          margin: 0;
        }
        .bsm-actions {
          display: flex; gap: 10px;
        }
        .bsm-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 13px; border-radius: 100px;
          font-size: 13px; font-family: var(--ff-body);
          cursor: pointer; border: 1px solid;
          transition: opacity 0.15s;
        }
        .bsm-btn:active { opacity: 0.7; }
        .bsm-close {
          position: absolute; top: 14px; right: 14px;
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.5);
        }
      `}</style>

      <div className="bsm-backdrop" onClick={onClose}>
        <div className="bsm-sheet" onClick={e => e.stopPropagation()}>

          <button className="bsm-close" onClick={onClose}>
            <X size={14} />
          </button>

          <p style={{ margin: 0, fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            Instagram Story
          </p>

          {/* Preview */}
          <div className="bsm-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Story card"
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

          <p className="bsm-hint">Download and post to your Instagram Stories</p>

          <div className="bsm-actions">
            <button
              className="bsm-btn"
              onClick={download}
              style={{ borderColor: 'rgba(184,160,255,0.3)', background: 'rgba(184,160,255,0.08)', color: '#b8a0ff' }}
            >
              <Download size={14} /> Download
            </button>
            <button
              className="bsm-btn"
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
