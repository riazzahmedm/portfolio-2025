'use client'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionFooter from '@/components/layout/SectionFooter'
import { getLenisInstance } from '@/lib/lenisInstance'

export default function Hero() {
  const { scrollY } = useScroll()

  const imgScale = useTransform(scrollY, [0, 700], [1, 1.14])
  const imgY     = useTransform(scrollY, [0, 700], ['0%', '-10%'])
  const riazX    = useTransform(scrollY, [0, 600], ['0%', '-16%'])
  const ahmedX   = useTransform(scrollY, [0, 600], ['0%',  '16%'])
  const fadeOut  = useTransform(scrollY, [0, 400], [1, 0])
  const overlayY = useTransform(scrollY, [0, 600], ['0%', '-8%'])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <SectionShell id="hero" orbPosition="top-right">

      {/* Full-screen background photo */}
      <motion.div
        style={{ scale: imgScale, y: imgY }}
        className="absolute inset-0 z-0 origin-center"
      >
        <Image
          src="/assets/img/about.jpeg"
          alt="Riaz Ahmed"
          fill
          className="object-contain object-center"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(5,5,5,0.3) 0%, transparent 20%, transparent 50%, rgba(5,5,5,0.75) 78%, rgba(5,5,5,0.97) 100%)',
          }}
        />
      </motion.div>

      {/* Content overlay */}
      <motion.div
        style={{ opacity: fadeOut, y: overlayY }}
        className="relative z-10 h-full flex flex-col"
      >
        {/* Nav clearance */}
        <div className="flex-shrink-0 pt-14" />

        {/* Push name to lower third */}
        <div className="flex-1" />

        {/* Name + info */}
        <div className="flex-shrink-0 px-6 md:px-14 lg:px-20 pb-4">

          <div
            className="overflow-hidden mb-5"
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(4.5rem, 13vw, 12rem)',
              fontWeight: 800,
              lineHeight: 0.86,
              letterSpacing: '-0.025em',
            }}
          >
            <motion.div style={{ x: riazX }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="whitespace-nowrap"
            >
              <span style={{ color: '#ffffff' }}>RIAZ</span>
            </motion.div>

            <motion.div style={{ x: ahmedX }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="whitespace-nowrap"
            >
              <span style={{ color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.45)' }}>
                AHMED
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-px mb-5 origin-left"
            style={{ background: 'linear-gradient(90deg, var(--lime), rgba(130,255,31,0.08))' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-5"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#82ff1f] animate-pulse flex-shrink-0" />
                <span
                  className="text-[11px] tracking-[0.32em] uppercase"
                  style={{ color: 'var(--lime)', fontFamily: 'var(--ff-mono)' }}
                >
                  Senior Software Engineer · Open to work
                </span>
              </div>
              <p
                className="text-[13px] leading-[1.7] max-w-sm"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--ff-body)' }}
              >
                React · Next.js · React Native · 5+ years · 40+ projects · Chennai, India
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => scrollTo('projects')}
                className="text-[11px] tracking-[0.22em] uppercase px-7 py-3.5 rounded-sm font-semibold transition-all duration-200 hover:brightness-110 hover:scale-[1.02] whitespace-nowrap"
                style={{ background: 'var(--lime)', color: '#050505', fontFamily: 'var(--ff-body)' }}
              >
                View Work
              </button>
              <button
                onClick={() => scrollTo('contact')}
                className="text-[11px] tracking-[0.22em] uppercase px-7 py-3.5 rounded-sm border transition-all duration-200 hover:border-white/40 whitespace-nowrap"
                style={{ color: 'rgba(255,255,255,0.65)', borderColor: 'rgba(255,255,255,0.18)', fontFamily: 'var(--ff-body)' }}
              >
                Say Hello →
              </button>
            </div>
          </motion.div>
        </div>

        <SectionFooter current={1} />
      </motion.div>

    </SectionShell>
  )
}
