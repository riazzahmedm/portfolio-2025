'use client'
import { useEffect, useState } from 'react'
import { SECTIONS } from '@/lib/data'

export function useActiveSection() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const getActive = () => {
      const midY = window.scrollY + window.innerHeight * 0.45
      let found = 0
      for (let i = 0; i < SECTIONS.length; i++) {
        const el = document.getElementById(SECTIONS[i])
        if (el) {
          const elTop = el.getBoundingClientRect().top + window.scrollY
          if (elTop <= midY) found = i
        }
      }
      setActive(found)
    }

    getActive()
    window.addEventListener('scroll', getActive, { passive: true })
    return () => window.removeEventListener('scroll', getActive)
  }, [])

  return active
}
