'use client'
import { useEffect } from 'react'

const RADII = [
  '60% 40% 70% 30% / 50% 60% 40% 70%',
  '40% 60% 30% 70% / 60% 40% 70% 50%',
  '70% 30% 50% 50% / 40% 70% 50% 60%',
  '50% 50% 60% 40% / 70% 30% 60% 40%',
  '35% 65% 40% 60% / 55% 45% 65% 35%',
]

export function useCursor() {
  useEffect(() => {
    const dot  = document.querySelector('.cursor')      as HTMLElement
    const blob = document.querySelector('.cursor-ring') as HTMLElement
    if (!dot || !blob) return

    // Promote both elements to their own compositor layer — avoids reflow
    dot.style.willChange  = 'transform'
    blob.style.willChange = 'transform'

    // Dot — small precise white orb
    Object.assign(dot.style, {
      width:        '8px',
      height:       '8px',
      background:   '#ffffff',
      borderRadius: '50%',
      border:       'none',
      // Use transform instead of left/top — compositor-only, no reflow
      transform:    'translate(-50%, -50%)',
      transition:   'width 0.15s ease, height 0.15s ease',
    })

    // Blob — violet morphing follower
    Object.assign(blob.style, {
      width:        '72px',
      height:       '72px',
      background:   'radial-gradient(ellipse at center, rgba(140,60,255,0.35) 0%, rgba(100,20,220,0.12) 70%, transparent 100%)',
      border:       'none',
      borderRadius: RADII[0],
      boxShadow:    '0 0 40px 12px rgba(120,40,255,0.22)',
      filter:       'blur(4px)',
      transform:    'translate(-50%, -50%)',
      transition:   'border-radius 0.8s ease, width 0.2s ease, height 0.2s ease',
      backdropFilter: 'none',
    })

    let mouseX = 0, mouseY = 0
    let blobX   = 0, blobY = 0
    let frame   = 0
    let raf: number
    let radiusIdx = 0

    // Store raw coords; apply via transform in the rAF tick (no reflow)
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const tick = () => {
      // Move dot — transform-only, GPU composited
      dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`

      // Lerp blob toward cursor
      blobX += (mouseX - blobX) * 0.09
      blobY += (mouseY - blobY) * 0.09
      blob.style.transform = `translate(calc(${blobX}px - 50%), calc(${blobY}px - 50%))`

      // Morph shape every 25 frames (~2.5s at 60fps)
      frame++
      if (frame % 25 === 0) {
        radiusIdx = (radiusIdx + 1) % RADII.length
        blob.style.borderRadius = RADII[radiusIdx]
      }

      raf = requestAnimationFrame(tick)
    }

    const onEnter = () => {
      Object.assign(blob.style, {
        width:      '88px',
        height:     '88px',
        background: 'radial-gradient(ellipse at center, rgba(150,70,255,0.28) 0%, rgba(110,30,220,0.10) 65%, transparent 100%)',
        boxShadow:  '0 0 48px 14px rgba(130,50,255,0.18)',
        filter:     'blur(5px)',
      })
      Object.assign(dot.style, {
        width:      '6px',
        height:     '6px',
        background: '#d4a8ff',
      })
    }

    const onLeave = () => {
      Object.assign(blob.style, {
        width:      '72px',
        height:     '72px',
        background: 'radial-gradient(ellipse at center, rgba(140,60,255,0.35) 0%, rgba(100,20,220,0.12) 70%, transparent 100%)',
        boxShadow:  '0 0 40px 12px rgba(120,40,255,0.22)',
        filter:     'blur(4px)',
      })
      Object.assign(dot.style, {
        width:      '8px',
        height:     '8px',
        background: '#ffffff',
      })
    }

    // Use event delegation on document instead of attaching to every element.
    // This avoids the MutationObserver re-attach pattern and never leaks listeners.
    const onDocEnter = (e: MouseEvent) => {
      if ((e.target as Element)?.closest('a, button, [role="button"], input, textarea, select, label')) {
        onEnter()
      }
    }
    const onDocLeave = (e: MouseEvent) => {
      const related = e.relatedTarget as Element | null
      if (
        (e.target as Element)?.closest('a, button, [role="button"], input, textarea, select, label') &&
        !related?.closest('a, button, [role="button"], input, textarea, select, label')
      ) {
        onLeave()
      }
    }

    document.addEventListener('mouseover',  onDocEnter)
    document.addEventListener('mouseout',   onDocLeave)
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove',   onMove)
      document.removeEventListener('mouseover', onDocEnter)
      document.removeEventListener('mouseout',  onDocLeave)
      cancelAnimationFrame(raf)
    }
  }, [])
}
