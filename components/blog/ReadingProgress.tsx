'use client'
import { useEffect, useRef } from 'react'

/** A thin bar across the top that fills as you read. Written straight to the element so scrolling never re-renders. */
export default function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const paint = () => {
      raf = 0
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      if (bar.current) bar.current.style.width = `${max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0}%`
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint) }
    paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return <div ref={bar} className="fn-progress" role="presentation" />
}
