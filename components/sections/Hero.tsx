'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionFooter from '@/components/layout/SectionFooter'
import { STATS, TICKER_ITEMS, TICKER_ITEMS_2 } from '@/lib/data'
import { getLenisInstance } from '@/lib/lenisInstance'

const NAME_CHARS_1 = 'RIAZ'.split('')
const NAME_CHARS_2 = 'AHMED'.split('')

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
  // ─── Differential parallax setup ─────────────────────────────────────
  // Ref on the main content grid — it spans the full visible hero area.
  // useScroll tracks it from when its top hits the viewport top (progress=0)
  // to when its bottom hits the viewport top (progress=1, section gone).
  // SectionShell already moves ALL content -14%; the transforms below are
  // ADDITIVE offsets that create relative depth between individual layers.
  const heroGridRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroGridRef,
    offset: ['start start', 'end start'],
  })

  const smoothed = useSpring(scrollYProgress, { stiffness: 70, damping: 22 })

  // Layer 1 — "RIAZ" line: barely moves extra (feels like it floats, lingers longest)
  const riazY = useTransform(smoothed, [0, 1], [0, 18])
  // Layer 2 — "AHMED" outlined: moves down extra relative to shell (exits faster)
  const ahmedY = useTransform(smoothed, [0, 1], [0, -55])
  // Layer 3 — eyebrow + tagline: exits fastest
  const eyebrowY = useTransform(smoothed, [0, 1], [0, 28])
  const taglineY = useTransform(smoothed, [0, 1], [0, -90])
  // Layer 4 — CTAs: fastest exit
  const ctaY = useTransform(smoothed, [0, 1], [0, -130])
  // Photo: lags behind everything (feels closest, stays longest)
  const photoY = useTransform(smoothed, [0, 1], ['0%', '8%'])

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

      {/* Main grid — ref here so useScroll has a real DOM element from first render */}
      <div ref={heroGridRef} className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] min-h-0">

        {/* LEFT — Text with differential parallax layers */}
        <div className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-6 lg:py-0">

          {/* Eyebrow — layer 3 */}
          <motion.div
            style={{ y: eyebrowY }}
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

          {/* Name — each line is its own parallax layer */}
          <div className="mb-6" style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(4.5rem,11vw,9.5rem)', lineHeight: '0.88', letterSpacing: '-0.02em', fontWeight: 800 }}>

            {/* RIAZ — layer 1, slowest (positive offset = lags behind, floats) */}
            <motion.div style={{ y: riazY }} className="overflow-hidden flex">
              {NAME_CHARS_1.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.25 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{ color: 'var(--text-primary)', display: 'inline-block' }}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.div>

            {/* AHMED — layer 2, fast (negative offset = exits ahead of RIAZ) */}
            <motion.div style={{ y: ahmedY }} className="overflow-hidden flex">
              {NAME_CHARS_2.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'inline-block', color: 'transparent', WebkitTextStroke: '1.5px var(--heading-outline-stroke)' }}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Tagline — layer 3, exits faster than the name */}
          <motion.div style={{ y: taglineY }}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
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
          </motion.div>

          {/* CTAs — layer 4, exits fastest */}
          <motion.div
            style={{ y: ctaY }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
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
        </div>

        {/* RIGHT — Portrait photo, lags behind everything (closest layer) */}
        <div className="hidden lg:flex items-end justify-center relative overflow-hidden">

          {/* Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-15"
            style={{ background: 'var(--lime)' }} />

          {/* Photo — slowest parallax, appears to stay in place while text exits */}
          <motion.div
            style={{ y: photoY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            {/* Accent bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-0.5 mb-3"
              style={{
                width: '340px',
                background: 'linear-gradient(90deg, var(--lime), transparent)',
                transformOrigin: 'left',
              }}
            />

            {/* Photo container */}
            <div
              style={{
                width: '340px',
                borderRadius: '2px',
                border: '1px solid rgba(130,255,31,0.15)',
                aspectRatio: '3/4',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image
                src="/assets/img/about.jpeg"
                alt="Riaz Ahmed"
                fill
                className="object-cover object-top"
                priority
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

            {/* Name label */}
            <div className="flex items-center justify-between mt-3" style={{ width: '340px' }}>
              <div>
                <div className="text-[11px] tracking-[0.28em] uppercase" style={{ color: 'var(--lime)', fontFamily: 'var(--ff-mono)' }}>
                  Riaz Ahmed
                </div>
                <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)' }}>
                  Chennai, India
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22cc44] animate-pulse" />
                <span className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
                  Open to work
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats — right edge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6"
          >
            {STATS.slice(0, 3).map((s, i) => (
              <div key={i} className="text-right">
                <div className="text-[10px] tracking-[0.22em] uppercase mb-0.5" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
                  {s.key}
                </div>
                <div className="leading-none" style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: 'var(--text-primary)', fontWeight: 700 }}>
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
