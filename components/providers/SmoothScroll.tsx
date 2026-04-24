'use client'
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { setLenisInstance } from '@/lib/lenisInstance'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
    })

    setLenisInstance(lenis)

    function raf(time: number) {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lenis.destroy()
      setLenisInstance(null)
    }
  }, [])

  return <>{children}</>
}
