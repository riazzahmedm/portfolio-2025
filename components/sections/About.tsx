'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import SectionFooter from '@/components/layout/SectionFooter'
import SectionTag from '@/components/ui/SectionTag'
import { TECH_JOKES, ABOUT_BIG_TEXT, ABOUT_TICKER } from '@/lib/data'

// ── Top marquee strip (0°, combined) ─────────────────────────────────────────
function TopMarquee() {
  const doubled = [...ABOUT_TICKER, ...ABOUT_TICKER]
  return (
    <div
      className="flex-shrink-0 overflow-hidden py-3"
      style={{
        background: 'rgba(184,160,255,0.05)',
        borderTop: '1px solid rgba(184,160,255,0.12)',
        borderBottom: '1px solid rgba(184,160,255,0.12)',
      }}
    >
      <div className="ticker-inner">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="text-[12px] tracking-[0.24em] uppercase px-5 inline-flex items-center"
            style={{
              color: item === '∞' || item === '◆' ? 'var(--lavender)' : 'rgba(184,160,255,0.5)',
              fontFamily: 'var(--ff-mono)',
              whiteSpace: 'nowrap',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Bottom marquee strip — tech jokes (moved from Skills) ─────────────────────
function BottomMarquee() {
  const doubled = [...TECH_JOKES, ...TECH_JOKES]
  return (
    <div
      className="flex-shrink-0 overflow-hidden py-2.5"
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="ticker-inner-fast">
        {doubled.map((j, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6">
            <span
              className="text-[11px] tracking-[0.2em] uppercase px-2 py-0.5 rounded"
              style={{
                background: 'var(--surface-alt)',
                color: 'var(--lavender)',
                fontFamily: 'var(--ff-mono)',
              }}
            >
              {j.lang}
            </span>
            <span
              className="text-[12px] tracking-wide"
              style={{
                color: 'var(--text-dim)',
                fontFamily: 'var(--ff-mono)',
                whiteSpace: 'nowrap',
              }}
            >
              {j.text}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function About() {
  const outerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start end', 'end end'],
  })

  // Big text scrolls fully left — spring adds smooth follow-through on the visual only
  const xRaw = useTransform(scrollYProgress, [0.2, 1], ['4%', '-50%'])
  const x = useSpring(xRaw, { stiffness: 50, damping: 22, restDelta: 0.001 })

  return (
    <div id="about" ref={outerRef} style={{ height: '450vh', position: 'relative' }}>

      <div
        className="sticky top-0 overflow-hidden flex flex-col"
        style={{ height: '100dvh', background: 'var(--section-bg, #040810)' }}
      >
        {/* Background decorations */}
        <div className="dot-grid absolute inset-0 z-0" />
        <div className="vignette absolute inset-0 z-0" />
        <div className="red-orb absolute z-0" style={{ bottom: '-200px', left: '-150px' }} />
        <div className="section-watermark select-none" style={{ bottom: '-2rem', right: '-1rem' }}>02</div>

        {/* ── Main content ── */}
        <div className="relative flex flex-col h-full mt-14" style={{ zIndex: 10 }}>

          {/* Label + read-progress bar */}
          <div className="px-8 md:px-14 lg:px-20 xl:px-32 2xl:px-48 pt-8 pb-4 flex-shrink-0">
            <SectionTag num="02" label="The Dark Knight" />
            <div className="h-px w-full relative" style={{ background: 'var(--border)' }}>
              <motion.div
                className="absolute inset-y-0 left-0 origin-left"
                style={{
                  scaleX: scrollYProgress,
                  background: 'linear-gradient(90deg, var(--lavender), var(--lime))',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* TOP marquee strip — 0°, combined */}
          {/* <TopMarquee /> */}

          {/* Big scrolling text — slightly tilted −3°, composed via Framer Motion */}
          <div className="flex-1 flex items-center overflow-hidden min-h-0">
            <motion.div
              style={{ x }}
              className="whitespace-nowrap"
            >
              <span
                style={{
                  fontFamily: 'var(--ff-display)',
                  fontSize: 'clamp(3rem, 7vw, 6.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                {ABOUT_BIG_TEXT + ABOUT_BIG_TEXT}
              </span>
            </motion.div>
          </div>

          {/* BOTTOM marquee strip — tech jokes from Skills */}
          <BottomMarquee />

          {/* Supporting copy */}
          <div className="px-8 md:px-14 lg:px-20 xl:px-32 2xl:px-48 py-3 md:py-5 flex-shrink-0 flex items-end justify-between gap-8">
            <div className="max-w-xl">
              <p
                className="text-[13px] md:text-[15px] leading-[1.75] md:leading-[1.95] mb-2 md:mb-3"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--ff-body)' }}
              >
                Bruce Wayne didn't become Batman overnight — neither did I. Bad apps annoyed me,
                I thought "I could fix this," and 7+ years later I'm still showing up like the
                city needs saving. 20+ shipped products. Zero lorem ipsum.
              </p>
              <p
                className="text-[11px] md:text-[13px] leading-[1.75] md:leading-[1.85]"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-body)' }}
              >
                I work in React, Next.js and React Native. I operate best in the dark — dark mode,
                late nights, hard problems.{' '}
                <span style={{ color: 'var(--lavender)' }}>
                  Not everyone works in the shadows. The ones who do are my kind of people.
                </span>
              </p>
            </div>

            {/* Keep scrolling hint — desktop only */}
            <motion.div
              className="hidden md:flex flex-shrink-0 flex-col items-center gap-1.5"
              style={{ opacity: useTransform(scrollYProgress, [0, 0.85], [1, 0]) }}
            >
              <span
                className="text-[10px] tracking-[0.2em] uppercase"
                style={{ color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)' }}
              >
                keep scrolling
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-px h-6"
                style={{ background: 'linear-gradient(to bottom, var(--lavender), transparent)' }}
              />
            </motion.div>
          </div>

          <SectionFooter current={2} hideLabel />
        </div>
      </div>
    </div>
  )
}
