'use client'
import { useEffect, useLayoutEffect, useState } from 'react'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * The top bar for every screen: invisible at the top of the page, so the content owns the whole screen,
 * then a frosted glass bar once content starts scrolling under it. Screens with nothing to put in it simply don't render one.
 */
export default function ScrollNav({ as: Tag = 'header', style, children }: { as?: 'header' | 'nav'; style?: React.CSSProperties; children: React.ReactNode }) {
  const [solid, setSolid] = useState(false)

  // Tell the floating Hub button this page has a nav bar (which carries the back button), before the first paint
  useIsoLayoutEffect(() => {
    document.documentElement.dataset.nav = '1'
    return () => { delete document.documentElement.dataset.nav }
  }, [])

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        .scroll-nav { position: sticky; top: 0; z-index: 50; background-color: transparent; box-shadow: 0 1px 0 transparent;
          transition: background-color 0.3s, box-shadow 0.3s, -webkit-backdrop-filter 0.3s, backdrop-filter 0.3s; }
        .scroll-nav.is-solid { background-color: color-mix(in srgb, var(--bg) 66%, transparent);
          -webkit-backdrop-filter: blur(18px) saturate(1.5); backdrop-filter: blur(18px) saturate(1.5);
          box-shadow: 0 1px 0 color-mix(in srgb, var(--text-primary) 8%, transparent); }
      `}</style>
      <Tag className={`scroll-nav${solid ? ' is-solid' : ''}`} style={style}>{children}</Tag>
    </>
  )
}
