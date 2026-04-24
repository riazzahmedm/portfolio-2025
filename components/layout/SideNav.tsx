'use client'
import { SECTIONS } from '@/lib/data'
import { useActiveSection } from '@/hooks/useActiveSection'
import { getLenisInstance } from '@/lib/lenisInstance'

export default function SideNav() {
  const active = useActiveSection()

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2">
      {SECTIONS.map((id, i) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          title={id}
          className="w-1.5 rounded-full transition-all duration-300"
          style={{
            height: active === i ? '20px' : '6px',
            background: active === i ? 'var(--red)' : 'var(--text-dim)',
            boxShadow: active === i ? '0 0 8px rgba(220,30,30,0.6)' : 'none',
          }}
        />
      ))}
    </div>
  )
}
