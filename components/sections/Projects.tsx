'use client'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import SectionTag from '@/components/ui/SectionTag'
import SectionFooter from '@/components/layout/SectionFooter'
import { PROJECTS } from '@/lib/data'

// ─── Mockup screen visual ─────────────────────────────────────────────────────
function MockupScreen({ gradient, accent, type, image }: { gradient: string; accent: string; type: string; image?: string }) {
  const isMobile = type === 'Mobile App'

  return (
    <div className="relative w-full rounded-t-xl overflow-hidden" style={{ height: '220px', background: gradient }}>
      {image ? (
        <>
          {/* Real screenshot */}
          <Image
            src={image}
            alt={type}
            fill
            className="object-cover object-top"
            sizes="460px"
          />
          {/* Subtle overlay so text/badge remains legible */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 45%)' }}
          />
          {/* Scanline texture */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.5) 1px, rgba(255,255,255,0.5) 2px)',
              backgroundSize: '100% 2px',
            }}
          />
        </>
      ) : (
        <>
          {/* Fallback — browser/phone chrome */}
          {!isMobile && (
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b" style={{ background: 'rgba(0,0,0,0.45)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#e02020', opacity: 0.85 }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffaa00', opacity: 0.85 }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22cc44', opacity: 0.85 }} />
              <div className="flex-1 ml-2 h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          )}
          {isMobile && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-40 rounded-2xl border-2 flex flex-col overflow-hidden"
                style={{ borderColor: accent, boxShadow: `0 0 40px ${accent}44` }}>
                <div className="h-3 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <div className="w-8 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
                </div>
                <div className="flex-1" style={{ background: 'rgba(0,0,0,0.3)' }} />
              </div>
            </div>
          )}
          <div className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full opacity-50 blur-3xl" style={{ background: accent }} />
        </>
      )}

      {/* Type badge — always shown */}
      <div className="absolute bottom-3 left-3">
        <span className="text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
          style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}55`, fontFamily: 'var(--ff-mono)', backdropFilter: 'blur(6px)' }}>
          {type}
        </span>
      </div>
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ScrollProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-px" style={{ background: 'var(--border)' }}>
      <div
        className="h-full transition-none"
        style={{
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, var(--lime), var(--lavender))',
        }}
      />
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function Projects() {
  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollRange, setScrollRange] = useState(0)
  const [activeIdx, setActiveIdx] = useState(0)
  const NUM = PROJECTS.length
  // extra 2 viewport heights: 1 for entry, 1 for exit buffer
  const outerHeight = `${(NUM + 2) * 100}vh`

  // measure how far the track needs to travel
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        const dist = trackRef.current.scrollWidth - window.innerWidth
        setScrollRange(Math.max(0, dist))
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // scroll progress through the OUTER tall container
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  })

  // smooth x transform — spring adds a touch of inertia on top of Lenis
  const xRaw = useTransform(
    scrollYProgress,
    [0.05, 0.95],
    [0, -scrollRange],
  )
  const x = useSpring(xRaw, { stiffness: 80, damping: 28, restDelta: 1 })

  // derive active card from scroll progress
  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      const clamped = Math.max(0, Math.min(1, (v - 0.05) / 0.9))
      setActiveIdx(Math.round(clamped * (NUM - 1)))
    })
    return unsub
  }, [scrollYProgress, NUM])

  return (
    <div
      id="projects"
      ref={outerRef}
      className="projects-outer"
      style={{ height: outerHeight, '--section-bg': '#050810', '--section-orb': 'rgba(130,255,31,0.10)' } as React.CSSProperties}
    >
      <div className="projects-sticky">
        {/* Shared decorations */}
        <div className="dot-grid absolute inset-0 z-0" />
        <div className="vignette absolute inset-0 z-0" />
        <div className="red-orb absolute z-0" style={{ bottom: '-200px', left: '-100px' }} />
        <div
          className="section-watermark"
          style={{ bottom: '-2rem', right: '2rem', color: 'var(--text-faint)' }}
        >05</div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col pt-14">
          {/* Progress bar */}
          <motion.div
            className="absolute top-14 left-0 right-0 h-px z-20"
            style={{
              background: 'linear-gradient(90deg, var(--lime), var(--lavender))',
              scaleX: scrollYProgress,
              transformOrigin: 'left',
            }}
          />

          {/* Header */}
          <div className="px-8 md:px-14 lg:px-20 xl:px-32 2xl:px-48 pt-8 pb-3 flex items-end justify-between gap-4 flex-shrink-0">
            <div>
              <SectionTag num="05" label="Things I Actually Shipped" />
            </div>

            {/* Scroll hint */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="flex items-center gap-2.5 pb-2"
            >
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ color: 'var(--lime)', fontFamily: 'var(--ff-mono)', fontSize: '18px' }}
              >→</motion.span>
              <span className="text-[11px] tracking-[0.18em] uppercase" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
                scroll to explore
              </span>
            </motion.div>
          </div>

          {/* Horizontal track — driven by scroll progress */}
          <div className="flex-1 overflow-hidden relative">
            <motion.div
              ref={trackRef}
              className="projects-track absolute inset-y-0"
              style={{ x, left: '4rem', paddingRight: '4rem' }}
            >
              {PROJECTS.map((project, i) => {
                const slug = project.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                return (
                  <motion.div
                    key={project.name}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10%' }}
                    transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="project-card-h group border rounded-xl overflow-hidden flex flex-col transition-colors duration-300"
                    style={{
                      borderColor: 'var(--border-card)',
                      background: 'var(--surface)',
                      minHeight: '72%',
                      alignSelf: 'center',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = project.mockupAccent)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-card)')}
                    whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
                  >
                    <MockupScreen
                      gradient={project.mockupGradient}
                      accent={project.mockupAccent}
                      type={project.type}
                      image={project.mockupImage}
                    />

                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[11px] tracking-[0.22em] uppercase mb-1" style={{ color: project.mockupAccent, fontFamily: 'var(--ff-mono)' }}>
                            {project.year}
                          </div>
                          <div className="text-[17px] font-bold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--ff-display)' }}>
                            {project.name}
                          </div>
                        </div>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[18px] opacity-30 hover:opacity-100 transition-opacity mt-1"
                            style={{ color: project.mockupAccent }}
                            onClick={e => e.stopPropagation()}
                          >↗</a>
                        )}
                      </div>

                      <p className="text-[13px] leading-relaxed flex-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-body)' }}>
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] tracking-[0.14em] uppercase px-2 py-1 rounded-full border"
                            style={{ color: 'var(--text-dim)', borderColor: 'var(--border-card)', fontFamily: 'var(--ff-mono)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] tracking-[0.14em] pt-2 border-t" style={{ color: 'var(--text-faint)', borderColor: 'var(--border)', fontFamily: 'var(--ff-mono)' }}>
                        npm run {slug}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          {/* Dot nav + counter */}
          <div className="flex items-center justify-between px-8 md:px-14 py-3 flex-shrink-0">
            <div className="flex gap-2">
              {PROJECTS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: activeIdx === i ? '20px' : '6px',
                    height: '6px',
                    background: activeIdx === i ? 'var(--lime)' : 'var(--text-dim)',
                  }}
                />
              ))}
            </div>
            <div className="text-[12px] tracking-[0.14em]" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
              {String(activeIdx + 1).padStart(2, '0')} / {String(NUM).padStart(2, '0')}
            </div>
          </div>

          <SectionFooter current={5} hideLabel />
        </div>
      </div>
    </div>
  )
}
