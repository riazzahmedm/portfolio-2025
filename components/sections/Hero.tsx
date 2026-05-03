'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionFooter from '@/components/layout/SectionFooter'

function useAspectRatio() {
  const [ratio, setRatio] = useState('16:9')
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const r = w / h
      if (r > 2.3) return setRatio('21:9')
      if (r > 1.7) return setRatio('16:9')
      if (r > 1.5) return setRatio('16:10')
      if (r > 1.2) return setRatio('4:3')
      if (r > 0.9) return setRatio('1:1')
      return setRatio('9:16')
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])
  return ratio
}

export default function Hero() {
  const { scrollY } = useScroll()
  const aspectRatio = useAspectRatio()

  const imgScale     = useTransform(scrollY, [0, 700], [1, 1.14])
  const imgY         = useTransform(scrollY, [0, 700], ['0%', '-10%'])
  const riazX        = useTransform(scrollY, [0, 500], ['0%', '-40%'])
  const riazOpacity  = useTransform(scrollY, [0, 500], [1, 0])
  const ahmedX       = useTransform(scrollY, [0, 500], ['0%', '40%'])
  const ahmedOpacity = useTransform(scrollY, [0, 500], [1, 0])
  const infoFade     = useTransform(scrollY, [0, 350], [1, 0])

  const nameStyle: React.CSSProperties = {
    fontFamily: 'var(--ff-display)',
    fontSize: 'clamp(4.5rem, 13vw, 12rem)',
    fontWeight: 800,
    lineHeight: 0.86,
    letterSpacing: '-0.025em',
    whiteSpace: 'nowrap',
    display: 'block',
  }

  return (
    <SectionShell id="hero" noDecorations>

      {/* AHMED — behind image, right-aligned, vertically centered */}
      <div className="absolute inset-0 z-[10] flex items-center justify-end pr-8 md:pr-30 lg:pr-80 overflow-hidden">
        <motion.div
          style={{ x: ahmedX, opacity: ahmedOpacity }}
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <span style={{ ...nameStyle, color: '#ffffff' }} className='whitespace-nowrap mt-30'>
            RIAZ
          </span>
        </motion.div>
      </div>

      {/* Image — between AHMED and RIAZ */}
      <motion.div
        style={{ scale: imgScale, y: imgY }}
        className="absolute inset-0 z-[1] origin-center"
      >
        <Image
          src="/assets/img/me.PNG"
          alt="Riaz Ahmed"
          fill
          className="object-contain object-center"
          priority
          sizes="100vw"
        />
      </motion.div>

      {/* RIAZ — in front of image, left-aligned, vertically centered */}
      <div className="absolute inset-0 z-[0] flex items-center justify-start pl-5 md:pl-14 lg:pl-50 overflow-hidden">
        <motion.div
          style={{ x: riazX, opacity: riazOpacity }}
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span style={{ ...nameStyle, display: 'inline-block', color: 'rgba(255,255,255,0.25)' }} className='mb-10'>AHMED</span>
        </motion.div>
      </div>

      {/* Top cinematic bar — all screens */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-[30] flex items-center justify-between px-5 py-4 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1.0 }}
      >
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
          MMXXV
        </span>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.24em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
          {aspectRatio}
        </span>
      </motion.div>

      {/* Bottom letterbox bar — mobile only */}
      <motion.div
        className="md:hidden absolute bottom-0 left-0 right-0 z-[30] px-5 pb-40 pt-6 flex flex-col items-center gap-3 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1.0 }}
      >
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '8px', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', textAlign: 'center' }}>
          THIS EXPERIENCE WAS ENGINEERED FOR
        </div>
        <div style={{ fontFamily: 'var(--ff-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '0.12em', color: '#ffffff', textTransform: 'uppercase', lineHeight: 1 }}>
          LARGE SCREENS
        </div>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '8px', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', textAlign: 'center' }}>
          FOR FULL IMAX EXPERIENCE · OPEN ON DESKTOP
        </div>
      </motion.div>

      {/* Status + footer — always on top */}
      <div className="relative z-[35] h-full flex flex-col pointer-events-none">
        <div className="flex-1" />
        <motion.div style={{ opacity: infoFade }} className="w-full">
          <div className="hidden md:block text-right px-6 md:px-14 lg:px-20 pb-3">
            <span
              className="text-[11px] tracking-[0.32em] uppercase"
              style={{ color: 'var(--lime)', fontFamily: 'var(--ff-mono)' }}
            >
              
              Senior Software Engineer
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#82ff1f] animate-pulse ml-2 mb-1 align-middle" />
            </span>
          </div>
        </motion.div>
        <SectionFooter current={1} />
      </div>

    </SectionShell>
  )
}
