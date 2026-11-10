'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { NAV_ICON_SIZE } from '@/components/ui/nav-icon'
import { hasBackControl, navState, sectionParts } from '@/lib/nav-state'

/**
 * The way back, for pages that have a nav bar. On a section's front page it is "← Hub"; deeper in a section it is an arrow
 * that goes back one step. Pages without a nav bar (Art, a movie, a place) keep the floating button instead.
 */
export default function NavBack({ style }: { style?: React.CSSProperties }) {
  const pathname = usePathname()
  const router = useRouter()
  if (!hasBackControl(pathname)) return null

  const parts = sectionParts(pathname)
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px', flex: 'none', color: 'inherit', background: 'none', border: 0, padding: 0,
    cursor: 'pointer', textDecoration: 'none', font: '600 13px/1 var(--ff-body)', ...style,
  }

  if (parts.length === 1) {
    return (
      <Link href="/hub" aria-label="Back to hub" style={base}>
        <ArrowLeft size={NAV_ICON_SIZE} aria-hidden="true" />
        <span aria-hidden="true">Hub</span>
      </Link>
    )
  }
  // Arrived straight on an inner page (a shared link, say)? History would leave the site, so go up one level instead
  const goBack = () => (navState.inApp ? router.back() : router.push('/' + parts.slice(0, -1).join('/')))
  return (
    <button type="button" onClick={goBack} aria-label="Go back" style={base}>
      <ArrowLeft size={NAV_ICON_SIZE} aria-hidden="true" />
    </button>
  )
}
