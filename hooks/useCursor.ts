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
    const dot  = document.querySelector('.cursor') as HTMLElement
    const blob = document.querySelector('.cursor-ring') as HTMLElement
    if (!dot || !blob) return

    // Dot — small precise white orb
    Object.assign(dot.style, {
      width: '8px',
      height: '8px',
      background: '#ffffff',
      borderRadius: '50%',
      boxShadow: 'none',
      border: 'none',
      transition: 'width 0.15s ease, height 0.15s ease',
    })

    // Blob — violet morphing follower
    Object.assign(blob.style, {
      width: '72px',
      height: '72px',
      background: 'radial-gradient(ellipse at center, rgba(140,60,255,0.35) 0%, rgba(100,20,220,0.12) 70%, transparent 100%)',
      border: 'none',
      borderRadius: RADII[0],
      boxShadow: '0 0 40px 12px rgba(120,40,255,0.22)',
      filter: 'blur(4px)',
      transition: 'border-radius 0.8s ease, width 0.2s ease, height 0.2s ease',
      backdropFilter: 'none',
    })

    let mouseX = 0, mouseY = 0
    let blobX = 0, blobY = 0
    let frame = 0
    let raf: number
    let radiusIdx = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.left = mouseX + 'px'
      dot.style.top  = mouseY + 'px'
    }

    const tick = () => {
      // Lerp blob toward cursor — slower = more lag = more "following" feel
      blobX += (mouseX - blobX) * 0.09
      blobY += (mouseY - blobY) * 0.09

      blob.style.left = blobX + 'px'
      blob.style.top  = blobY + 'px'

      // Morph shape every 25 frames (~2.5s cycle)
      frame++
      if (frame % 25 === 0) {
        radiusIdx = (radiusIdx + 1) % RADII.length
        blob.style.borderRadius = RADII[radiusIdx]
      }

      raf = requestAnimationFrame(tick)
    }

    const onEnter = () => {
      Object.assign(blob.style, {
        width: '88px',
        height: '88px',
        background: 'radial-gradient(ellipse at center, rgba(150,70,255,0.28) 0%, rgba(110,30,220,0.10) 65%, transparent 100%)',
        boxShadow: '0 0 48px 14px rgba(130,50,255,0.18)',
        filter: 'blur(5px)',
      })
      Object.assign(dot.style, {
        width: '6px',
        height: '6px',
        background: '#d4a8ff',
      })
    }

    const onLeave = () => {
      Object.assign(blob.style, {
        width: '72px',
        height: '72px',
        background: 'radial-gradient(ellipse at center, rgba(140,60,255,0.35) 0%, rgba(100,20,220,0.12) 70%, transparent 100%)',
        boxShadow: '0 0 40px 12px rgba(120,40,255,0.22)',
        filter: 'blur(4px)',
      })
      Object.assign(dot.style, {
        width: '8px',
        height: '8px',
        background: '#ffffff',
        boxShadow: 'none',
      })
    }

    const interactables = () => document.querySelectorAll('a, button, [role="button"], input, textarea, select, label')

    const attachListeners = () => {
      interactables().forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    attachListeners()

    const observer = new MutationObserver(attachListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      observer.disconnect()
      interactables().forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])
}
