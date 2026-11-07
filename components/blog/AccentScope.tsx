'use client'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { accentFromImage, readCachedAccent, storeAccent } from '@/lib/cover-accent'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Gives everything inside it the colour of its cover photo: the first <img data-cover crossOrigin="anonymous"> in the box.
 * The colour is written straight onto the element as CSS variables (no re-render), and remembered on the device,
 * so a repeat visit paints in the right colour immediately. With no readable colour the blog's green stays.
 */
export default function AccentScope({ className = '', children }: { className?: string; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null)

  useIsoLayoutEffect(() => {
    const el = box.current
    const img = el?.querySelector<HTMLImageElement>('img[data-cover]')
    if (!el || !img) return

    const apply = (a: { dark: string; light: string } | null | 0 | undefined) => {
      if (!a) return
      el.style.setProperty('--pa-dark-rgb', a.dark)
      el.style.setProperty('--pa-light-rgb', a.light)
    }
    const read = () => {
      const url = img.currentSrc || img.src
      const known = readCachedAccent(url)
      if (known !== undefined) { apply(known); return }
      const found = accentFromImage(img)
      storeAccent(url, found)
      apply(found)
    }

    if (img.complete && img.naturalWidth > 0) read()
    else {
      const cached = readCachedAccent(img.currentSrc || img.src)
      if (cached !== undefined) apply(cached)         // paint the remembered colour while the photo is still loading
      img.addEventListener('load', read, { once: true })
    }
    return () => img.removeEventListener('load', read)
  }, [])

  return <div ref={box} className={`fn-accent ${className}`.trim()}>{children}</div>
}
