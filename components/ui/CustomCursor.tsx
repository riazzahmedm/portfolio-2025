'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCursor } from '@/hooks/useCursor'

// Routes where the custom cursor should be disabled — system cursor stays visible
const EXCLUDED = ['/blog', '/movies', '/admin']

function isExcluded(pathname: string) {
  return EXCLUDED.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))
}

export default function CustomCursor() {
  const pathname  = usePathname()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setIsDesktop(
      window.matchMedia('(pointer: fine) and (hover: hover) and (min-width: 1025px)').matches
    )
  }, [])

  const active = isDesktop && !isExcluded(pathname)

  useEffect(() => {
    if (active) {
      document.documentElement.setAttribute('data-cursor', 'custom')
    } else {
      document.documentElement.removeAttribute('data-cursor')
    }
    return () => {
      document.documentElement.removeAttribute('data-cursor')
    }
  }, [active])

  useCursor()

  // Always render so useCursor can find the elements on mount.
  // Visibility is driven by the data-cursor attribute + CSS, not by conditional rendering.
  return (
    <>
      <div className="cursor"      style={{ opacity: active ? 1 : 0, pointerEvents: 'none' }} />
      <div className="cursor-ring" style={{ opacity: active ? 1 : 0, pointerEvents: 'none' }} />
    </>
  )
}
