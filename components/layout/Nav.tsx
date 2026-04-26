'use client'
import { NAV_LINKS } from '@/lib/data'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useTheme } from '@/lib/theme'
import { getLenisInstance } from '@/lib/lenisInstance'

export default function Nav() {
  const active = useActiveSection()
  const { theme, toggle } = useTheme()

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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 lg:px-20 h-14 transition-colors duration-300"
      style={{
        borderBottom: '1px solid var(--border)',
        background: theme === 'dark' ? 'rgba(5,5,5,0.88)' : 'rgba(242,240,235,0.92)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Logo */}
      <button
        onClick={() => scrollTo('#hero')}
        className="text-xl font-extrabold tracking-tight transition-colors duration-300"
        style={{ fontFamily: 'var(--ff-display)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
      >
        R<span style={{ color: 'var(--lime)' }}>.</span>A
      </button>

      {/* Links */}
      <ul className="hidden md:flex items-center gap-5">
        {NAV_LINKS.map((link, i) => (
          <li key={link.href}>
            <button
              onClick={() => scrollTo(link.href)}
              className="text-[13px] font-medium tracking-wide transition-colors duration-200"
              style={{ color: active === i ? 'var(--lime)' : 'var(--text-dim)', fontFamily: 'var(--ff-body)' }}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Right: status + theme toggle */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#82ff1f] animate-pulse" />
          <span className="text-[12px] tracking-[0.14em] uppercase font-medium" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-body)' }}>
            Available
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 hover:border-lime-400"
          style={{ borderColor: 'var(--border-card)', background: 'var(--surface)', color: 'var(--text-muted)' }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  )
}
