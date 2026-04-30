'use client'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionFooter from '@/components/layout/SectionFooter'

export default function Hero() {
  const { scrollY } = useScroll()

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
      <div className="absolute inset-0 z-[10] flex items-center justify-end pr-6 md:pr-14 lg:pr-60 overflow-hidden">
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
      <div className="absolute inset-0 z-[0] flex items-center justify-start pl-8 md:pl-14 lg:pl-60 overflow-hidden">
        <motion.div
          style={{ x: riazX, opacity: riazOpacity }}
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span style={{ ...nameStyle, display: 'inline-block', color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.25)' }} className='mb-10'>AHMED</span>
        </motion.div>
      </div>

      {/* Status + footer — always on top */}
      <div className="relative z-[20] h-full flex flex-col pointer-events-none">
        <div className="flex-1" />
        <motion.div style={{ opacity: infoFade }} className="w-full">
          <div className="text-right px-6 md:px-14 lg:px-20 pb-3">
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
