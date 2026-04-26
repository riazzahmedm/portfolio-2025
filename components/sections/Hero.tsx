'use client'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionFooter from '@/components/layout/SectionFooter'
import { STATS, TICKER_ITEMS, TICKER_ITEMS_2 } from '@/lib/data'
import { getLenisInstance } from '@/lib/lenisInstance'

function MarqueeStrip({ items, reverse = false, bg, textColor }: {
  items: string[]
  reverse?: boolean
  bg: string
  textColor: string
}) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden py-2.5" style={{ background: bg, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className={reverse ? 'ticker-inner-reverse' : 'ticker-inner'}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="text-[12px] tracking-[0.22em] uppercase px-5 inline-flex items-center gap-2"
            style={{ color: textColor, fontFamily: item === '∞' || item === '◆' ? 'var(--ff-display)' : 'var(--ff-mono)', whiteSpace: 'nowrap' }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Hero() {
  // Scroll-driven horizontal text drift.
  // As the user scrolls down the page, RIAZ drifts left and AHMED drifts right.
  // useScroll with no target tracks window scroll — direct, no ref needed.
  const { scrollY } = useScroll()

  // Map the first 500px of scroll to the text drift.
  // No spring — Lenis already smooths it. Immediate response feels best.
  const riazX    = useTransform(scrollY, [0, 500], ['0%', '-12%'])
  const ahmedX   = useTransform(scrollY, [0, 500], ['0%',  '12%'])
  const contentY = useTransform(scrollY, [0, 500], ['0%',  '-6%'])
  const fadeOut  = useTransform(scrollY, [0, 400], [1, 0])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <SectionShell id="hero" orbPosition="top-right">
      {/* Top marquee */}
      <div className="flex-shrink-0 pt-14">
        <MarqueeStrip items={TICKER_ITEMS} bg="var(--surface)" textColor="var(--text-dim)" />
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] min-h-0">

        {/* LEFT — text */}
        <motion.div
          style={{ y: contentY, opacity: fadeOut }}
          className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-6 lg:py-0"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="h-px w-8" style={{ background: 'var(--lime)' }} />
            <span className="text-[12px] tracking-[0.36em] uppercase" style={{ color: 'var(--lime)', fontFamily: 'var(--ff-mono)' }}>
              Senior Software Engineer
            </span>
          </motion.div>

          {/* Name — each row drifts in opposite directions on scroll */}
          <div
            className="mb-6 overflow-hidden"
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(4.5rem, 11vw, 9.5rem)',
              lineHeight: '0.88',
              letterSpacing: '-0.02em',
              fontWeight: 800,
            }}
          >
            {/* RIAZ — slides left on scroll */}
            <motion.div
              style={{ x: riazX }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="whitespace-nowrap"
            >
              <span style={{ color: 'var(--text-primary)' }}>RIAZ</span>
            </motion.div>

            {/* AHMED — slides right on scroll */}
            <motion.div
              style={{ x: ahmedX }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="whitespace-nowrap"
            >
              <span style={{ color: 'transparent', WebkitTextStroke: '1.5px var(--heading-outline-stroke)' }}>
                AHMED
              </span>
            </motion.div>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-[15px] leading-[1.85] mb-8 max-w-sm"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-body)', fontWeight: 400 }}
          >
            Building immersive digital products with{' '}
            <span style={{ color: 'var(--lavender)' }}>React</span>,{' '}
            <span style={{ color: 'var(--lavender)' }}>Next.js</span> &amp;{' '}
            <span style={{ color: 'var(--lavender)' }}>React Native</span>.
            <br />
            <span style={{ color: 'var(--text-dim)' }}>5+ years · 40+ projects · Chennai, India.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <button
              onClick={() => scrollTo('projects')}
              className="text-[12px] tracking-[0.24em] uppercase px-7 py-3.5 rounded-sm font-semibold transition-all duration-200 hover:scale-[1.04] hover:brightness-110"
              style={{ background: 'var(--lime)', color: '#050505', fontFamily: 'var(--ff-body)' }}
            >
              View Work
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="flex items-center gap-2 text-[12px] tracking-[0.24em] uppercase border px-7 py-3.5 rounded-sm transition-all duration-200 hover:border-white/40"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-body)', borderColor: 'var(--border-card)' }}
            >
              Say Hello <span style={{ color: 'var(--lavender)' }}>→</span>
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT — photo */}
        <div className="hidden lg:flex items-end justify-center relative overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-15"
            style={{ background: 'var(--lime)' }} />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
            style={{ width: '340px' }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-0.5 w-full mb-3"
              style={{ background: 'linear-gradient(90deg, var(--lime), transparent)', transformOrigin: 'left' }}
            />

            <div
              className="relative overflow-hidden"
              style={{ borderRadius: '2px', border: '1px solid rgba(130,255,31,0.15)', aspectRatio: '3/4' }}
            >
              <Image
                src="/assets/img/about.jpeg"
                alt="Riaz Ahmed"
                fill
                className="object-cover object-top"
                priority
                sizes="340px"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, var(--section-bg) 0%, transparent 30%, transparent 70%, rgba(5,5,5,0.2) 100%)' }}
              />
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.5) 1px, rgba(255,255,255,0.5) 2px)',
                  backgroundSize: '100% 2px',
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <div>
                <div className="text-[11px] tracking-[0.28em] uppercase" style={{ color: 'var(--lime)', fontFamily: 'var(--ff-mono)' }}>Riaz Ahmed</div>
                <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)' }}>Chennai, India</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22cc44] animate-pulse" />
                <span className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>Open to work</span>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6"
          >
            {STATS.slice(0, 3).map((s, i) => (
              <div key={i} className="text-right">
                <div className="text-[10px] tracking-[0.22em] uppercase mb-0.5" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>{s.key}</div>
                <div style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1 }}>
                  {s.value.replace('+', '')}<span style={{ color: 'var(--lime)' }}>{s.value.includes('+') ? '+' : ''}</span>
                </div>
                <div className="text-[10px] tracking-[0.12em] mt-0.5" style={{ color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)' }}>{s.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom marquee */}
      <div className="flex-shrink-0">
        <MarqueeStrip items={TICKER_ITEMS_2} bg="transparent" textColor="var(--lavender)" reverse />
        <SectionFooter current={1} />
      </div>
    </SectionShell>
  )
}
