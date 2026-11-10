'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { hasBackControl, navState, sectionParts } from '@/lib/nav-state'

/**
 * The way back, mounted once for the whole app. On a section's front page (Art, Shop, Movies, Blog) it is a "← Hub" pill;
 * deeper inside a section it is just a round arrow that goes back one step. Glass in the bottom-left corner, in thumb reach.
 * It steps aside while the tilt prompt is on screen (the prompt renders `.tt-wrap`) and while the page is scrolling.
 */
export default function HubBadge() {
  const pathname = usePathname()
  const router = useRouter()
  const wrap = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)   // wait one commit so a page's nav bar can claim the back button first
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    navState.inApp = true
  }, [pathname])

  useEffect(() => setMounted(true), [])   // eslint-disable-line react-hooks/set-state-in-effect -- must run after the page's own layout effect

  // Toggle a class straight on the element: scroll fires constantly, and this should never re-render anything
  useEffect(() => {
    let timer = 0
    const onScroll = () => {
      wrap.current?.classList.add('is-scrolling')
      window.clearTimeout(timer)
      timer = window.setTimeout(() => wrap.current?.classList.remove('is-scrolling'), 450)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.clearTimeout(timer) }
  }, [])

  const parts = sectionParts(pathname)
  if (!mounted || !hasBackControl(pathname)) return null
  const home = parts.length === 1

  // Arrived straight on an inner page (a shared link, say)? History would leave the site, so go up one level instead
  const goBack = () => {
    if (navState.inApp) router.back()
    else router.push('/' + parts.slice(0, -1).join('/'))
  }

  return (
    <>
      <style>{`
        .hub-fab-wrap { position: fixed; left: calc(14px + env(safe-area-inset-left, 0px)); bottom: calc(16px + env(safe-area-inset-bottom, 0px)); z-index: 90;
          transition: opacity 0.25s, transform 0.25s; }
        html[data-nav] .hub-fab-wrap { display: none; }   /* pages with a nav bar carry the back button there */
        body:has(.tt-wrap) .hub-fab-wrap, .hub-fab-wrap.is-scrolling { opacity: 0; transform: translateY(10px); pointer-events: none; }
        .hub-fab { display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 40px; border: 1px solid rgba(255,255,255,0.22); border-radius: 100px;
          color: #fff; text-decoration: none; cursor: pointer; font: 600 13px/1 var(--ff-body); background: rgba(12,10,20,0.6);
          -webkit-backdrop-filter: blur(12px) saturate(1.5); backdrop-filter: blur(12px) saturate(1.5); box-shadow: 0 10px 26px -10px rgba(0,0,0,0.75); transition: background 0.2s; }
        .hub-fab--pill { padding: 0 16px 0 12px; }
        .hub-fab--round { width: 40px; padding: 0; }
        .hub-fab:active { background: rgba(12,10,20,0.85); }
        .hub-fab:focus-visible { outline: 2px solid #f59e0b; outline-offset: 2px; }
        @media (hover: hover) and (pointer: fine) and (min-width: 641px) { .hub-fab:hover { background: rgba(12,10,20,0.85); } }
        @media (prefers-reduced-motion: reduce) { .hub-fab-wrap { transition: none; } }
      `}</style>
      <div ref={wrap} className="hub-fab-wrap">
        {home ? (
          <Link href="/hub" className="hub-fab hub-fab--pill" aria-label="Back to hub">
            <ArrowLeft size={16} aria-hidden="true" />
            <span aria-hidden="true">Hub</span>
          </Link>
        ) : (
          <button type="button" onClick={goBack} className="hub-fab hub-fab--round" aria-label="Go back">
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </>
  )
}
