'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { navIcon, NAV_ICON_SIZE } from '@/components/ui/nav-icon'

type Theme = 'dark' | 'light'
const KEY = 'blog-theme'
const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} })

/**
 * The blog's own light/dark theme. It is kept apart from the rest of the site on purpose: the Shop and Movies
 * are dark-only designs, so flipping the blog to light must not follow you into them.
 */
export function BlogTheme({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState<Theme>('dark')

  // A reader's own choice wins. Until they make one, follow the device: light phones get light paper, dark phones stay dark,
  // and the page keeps following if the device switches (for instance at sunset) until they tap the toggle.
  useEffect(() => {
    let saved: string | null = null
    try { saved = localStorage.getItem(KEY) } catch { /* private mode: follow the device */ }
    if (saved === 'light' || saved === 'dark') { setTheme(saved); return }

    const media = window.matchMedia('(prefers-color-scheme: light)')
    const follow = () => {
      // once the reader has tapped the toggle (it stores their choice) the device no longer decides
      try { if (localStorage.getItem(KEY)) return } catch { /* follow the device */ }
      setTheme(media.matches ? 'light' : 'dark')
    }
    follow()
    media.addEventListener('change', follow)
    return () => media.removeEventListener('change', follow)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try { localStorage.setItem(KEY, next) } catch { /* it just won't be remembered */ }
  }

  // The post editor is a dark-only screen
  const effective: Theme = pathname.startsWith('/blog/admin') ? 'dark' : theme

  return (
    <Ctx.Provider value={{ theme: effective, toggle }}>
      <div className="fn" data-theme={effective}>{children}</div>
    </Ctx.Provider>
  )
}

/** Bare sun/moon icon for the top bar, in the same style as the other bar icons. */
export function ThemeToggle() {
  const { theme, toggle } = useContext(Ctx)
  const toLight = theme === 'dark'
  return (
    <button type="button" onClick={toggle} style={navIcon} aria-label={toLight ? 'Switch to light mode' : 'Switch to dark mode'} title={toLight ? 'Light mode' : 'Dark mode'}>
      {toLight ? <Sun size={NAV_ICON_SIZE} /> : <Moon size={NAV_ICON_SIZE} />}
    </button>
  )
}
