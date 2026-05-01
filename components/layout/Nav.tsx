'use client'
import { NAV_LINKS, SECTIONS } from '@/lib/data'
import { useActiveSection } from '@/hooks/useActiveSection'
import { getLenisInstance } from '@/lib/lenisInstance'
import { Home, User, Code2, Briefcase, FolderOpen, Globe, Mail } from 'lucide-react'

const NAV_ICONS = [Home, User, Code2, Briefcase, FolderOpen, Globe, Mail]

export default function Nav() {
  const active = useActiveSection()
  const isHero = active === 0

  const scrollTo = (href: string) => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0 sm:gap-0.5 px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-full transition-all duration-500 ${isHero ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-card)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Logo */}
      <button
        onClick={() => scrollTo('#hero')}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[12px] sm:text-[13px] font-extrabold mr-0.5 sm:mr-1 flex-shrink-0"
        style={{
          fontFamily: 'var(--ff-display)',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border-card)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        R<span style={{ color: 'var(--lime)' }}>.</span>
      </button>

      {/* Divider */}
      <div className="w-px h-4 mx-1.5 flex-shrink-0" style={{ background: 'var(--border-card)' }} />

      {/* Icon links */}
      {NAV_LINKS.map((link, i) => {
        const Icon = NAV_ICONS[i]
        const isActive = link.href === `#${SECTIONS[active]}`
        return (
          <button
            key={link.href}
            onClick={() => scrollTo(link.href)}
            title={link.label}
            className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              background: isActive ? 'rgba(130,255,31,0.1)' : 'transparent',
              color: isActive ? 'var(--lime)' : 'var(--text-dim)',
            }}
          >
            <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
            {isActive && (
              <span
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ background: 'var(--lime)' }}
              />
            )}
          </button>
        )
      })}

      {/* Divider */}
      <div className="w-px h-4 mx-1.5 flex-shrink-0" style={{ background: 'var(--border-card)' }} />

      {/* Available dot */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--lime)' }} />
      </div>
    </nav>
  )
}
