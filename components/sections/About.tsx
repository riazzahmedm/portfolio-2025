'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring, type MotionValue } from 'framer-motion'
import SectionTag from '@/components/ui/SectionTag'
import SectionHeading from '@/components/ui/SectionHeading'
import SectionFooter from '@/components/layout/SectionFooter'
import { EXPERIENCE } from '@/lib/data'

const BIO =
  'Five years of engineering precision. I build web and mobile experiences that feel inevitable — where every interaction is considered, every pixel earns its place, and the code beneath is as clean as the surface above.'

// Each word is purely scroll-progress driven from the outer container.
// This is the key difference from viewport-intersection: the animation
// is spread across the full 380vh of scrollable height.
function RevealWord({
  word,
  index,
  total,
  progress,
}: {
  word: string
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const f = index / Math.max(total - 1, 1)
  // Spread illumination across 4%–76% of the section's scroll progress
  const on = 0.04 + f * 0.68
  const opacity = useTransform(progress, [on, on + 0.06], [0.08, 1])
  const y = useTransform(progress, [on, on + 0.06], [14, 0])

  return (
    <motion.span style={{ opacity, y, display: 'inline-block', marginRight: '0.28em' }}>
      {word}
    </motion.span>
  )
}

export default function About() {
  const outerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  })

  // Spring-smoothed for photo parallax
  const smoothed = useSpring(scrollYProgress, { stiffness: 55, damping: 22 })

  // ─── Parallax layers — each moves at a different rate ───────────────
  // Layer 1 (far background): watermark moves slowest
  const bgY = useTransform(smoothed, [0, 1], ['0%', '-6%'])
  // Layer 2 (midground): heading moves medium
  const headingY = useTransform(smoothed, [0, 1], ['0%', '-10%'])
  // Layer 3 (foreground): portrait rises aggressively — most parallax depth
  const photoY = useTransform(smoothed, [0, 1], ['14%', '-30%'])

  // Stats and timeline fade in at mid-to-late scroll
  const statsOpacity = useTransform(scrollYProgress, [0.42, 0.58], [0, 1])
  const statsY = useTransform(scrollYProgress, [0.42, 0.58], [32, 0])
  const timelineOpacity = useTransform(scrollYProgress, [0.62, 0.76], [0, 1])
  const timelineY = useTransform(scrollYProgress, [0.62, 0.76], [24, 0])

  const words = BIO.split(' ')
  const jobs = EXPERIENCE.slice(0, 3)

  return (
    <div
      id="about"
      ref={outerRef}
      style={{
        position: 'relative',
        height: '380vh',
        '--section-bg': '#040810',
        '--section-orb': 'rgba(184,160,255,0.15)',
      } as React.CSSProperties}
    >
      {/* ─── Sticky viewport — scrolls into this for 380vh ─────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--section-bg)',
        }}
      >
        {/* Static decorations */}
        <div className="dot-grid absolute inset-0 z-0 pointer-events-none" />
        <div className="vignette absolute inset-0 z-0 pointer-events-none" />
        <div className="red-orb absolute z-0 pointer-events-none" style={{ top: '-80px', left: '-80px' }} />

        {/* Background watermark — slowest parallax layer */}
        <motion.div
          style={{ y: bgY }}
          className="section-watermark absolute z-0 pointer-events-none"
          aria-hidden
        >
          02
        </motion.div>

        {/* ─── All content ─────────────────────────────────────────────── */}
        <div className="relative z-10 flex-1 flex flex-col pt-14 min-h-0">

          {/* Heading — medium parallax layer */}
          <motion.div
            style={{ y: headingY }}
            className="px-8 md:px-14 lg:px-20 pt-5 flex-shrink-0"
          >
            <SectionTag num="02" label="About Me" />
            <SectionHeading solid="WHO" outline="I AM" />
          </motion.div>

          {/* Main grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr] min-h-0">

            {/* LEFT — Portrait, fastest parallax layer */}
            <div className="hidden lg:flex items-end justify-center relative overflow-hidden px-8 lg:px-10 pb-0">
              <motion.div
                style={{ y: photoY }}
                className="relative z-10 w-full max-w-[260px]"
              >
                {/* Accent bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-0.5 w-full mb-3"
                  style={{ background: 'linear-gradient(90deg, var(--lavender), transparent)', transformOrigin: 'left' }}
                />

                {/* Photo */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    borderRadius: '2px',
                    border: '1px solid rgba(184,160,255,0.18)',
                    aspectRatio: '3/4',
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
                    style={{
                      background: 'linear-gradient(to top, var(--section-bg) 0%, transparent 30%)',
                    }}
                  />
                  {/* Scanline */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.025]"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.5) 1px, rgba(255,255,255,0.5) 2px)',
                      backgroundSize: '100% 2px',
                    }}
                  />
                </div>

                {/* Photo label */}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <div className="text-[11px] tracking-[0.28em] uppercase" style={{ color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>
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
            </div>

            {/* RIGHT — Scroll-driven text reveal */}
            <div className="flex flex-col justify-center px-8 md:px-10 lg:px-14 py-6 lg:py-0 gap-7">

              {/* Bio — word by word, driven by outer scroll progress */}
              <div
                style={{
                  fontSize: 'clamp(1.1rem, 2.2vw, 1.75rem)',
                  lineHeight: 1.7,
                  fontFamily: 'var(--ff-body)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  maxWidth: '580px',
                }}
              >
                {words.map((word, i) => (
                  <RevealWord
                    key={i}
                    word={word}
                    index={i}
                    total={words.length}
                    progress={scrollYProgress}
                  />
                ))}
              </div>

              {/* Stats — fade in at mid-scroll */}
              <motion.div
                style={{ opacity: statsOpacity, y: statsY }}
                className="flex flex-wrap gap-7"
              >
                {[
                  { value: '5+', label: 'Years', sub: 'in the stack' },
                  { value: '40+', label: 'Projects', sub: 'shipped to prod' },
                  { value: '300+', label: 'Conflicts', sub: 'merge-resolved' },
                ].map((s) => (
                  <div key={s.label}>
                    <div
                      style={{
                        fontFamily: 'var(--ff-display)',
                        fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        lineHeight: 1,
                      }}
                    >
                      {s.value.replace('+', '')}
                      <span style={{ color: 'var(--lavender)' }}>
                        {s.value.includes('+') ? '+' : ''}
                      </span>
                    </div>
                    <div className="text-[11px] tracking-[0.22em] uppercase mt-1" style={{ color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>
                      {s.label}
                    </div>
                    <div className="text-[10px] tracking-[0.12em]" style={{ color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)' }}>
                      {s.sub}
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Career timeline — fades in late */}
              <motion.div
                style={{ opacity: timelineOpacity, y: timelineY }}
                className="flex flex-col gap-4"
              >
                <div
                  className="text-[11px] tracking-[0.28em] uppercase flex items-center gap-3 mb-1"
                  style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}
                >
                  <div className="h-px w-6" style={{ background: 'var(--lavender)' }} />
                  Career path
                </div>
                <div className="flex flex-col gap-3 border-l-2 pl-5" style={{ borderColor: 'rgba(184,160,255,0.2)' }}>
                  {jobs.map((job, i) => (
                    <div key={i}>
                      <div
                        className="text-[11px] tracking-[0.2em] uppercase mb-0.5"
                        style={{ color: job.current ? 'var(--lavender)' : 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}
                      >
                        {job.year} · {job.company}
                        {job.current && (
                          <span
                            className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(130,255,31,0.12)', color: 'var(--lime)' }}
                          >
                            now
                          </span>
                        )}
                      </div>
                      <div
                        className="text-[14px] font-semibold"
                        style={{ color: job.current ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: 'var(--ff-body)' }}
                      >
                        {job.role}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <SectionFooter current={2} />
        </div>
      </div>
    </div>
  )
}
