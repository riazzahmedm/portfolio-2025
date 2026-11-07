'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * The logo in the shop's top bar. On the shop's front page the big stamp in the page heading is the logo,
 * so this one stays hidden until you scroll, then slides into the bar. On every other shop page it is always there.
 */
export default function ShopNavLogo() {
  const home = usePathname() === '/shop'
  return (
    <>
      <style>{`
        .shop-nav-logo { display: flex; align-items: center; text-decoration: none; transition: opacity 0.35s, transform 0.35s cubic-bezier(.2,.8,.2,1), visibility 0.35s; }
        .shop-nav-logo img { height: 44px; width: auto; display: block; }
        .shop-nav-logo.is-home { opacity: 0; visibility: hidden; transform: translateY(14px) rotate(-9deg) scale(0.6); }
        .scroll-nav.is-solid .shop-nav-logo.is-home { opacity: 1; visibility: visible; transform: none; }
        @media (prefers-reduced-motion: reduce) { .shop-nav-logo { transition: none; } }
      `}</style>
      <Link href="/shop" className={`shop-nav-logo${home ? ' is-home' : ''}`} aria-label="Shop">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shop-logo.png" alt="Art prints from Riaz" />
      </Link>
    </>
  )
}
