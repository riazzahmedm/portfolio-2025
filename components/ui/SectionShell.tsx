'use client'
import { useRef, ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface Props {
  id: string
  children: ReactNode
  orbPosition?: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right'
  watermark?: string
  className?: string
  revealColor?: string
  revealDirection?: 'left' | 'right' | 'top'
  noDecorations?: boolean
  noFade?: boolean
}

const ORB_POSITIONS: Record<string, string> = {
  'top-right': '-top-32 -right-20',
  'top-left': '-top-32 -left-20',
  'bottom-left': '-bottom-32 -left-20',
  'bottom-right': '-bottom-32 -right-20',
}

export default function SectionShell({
  id,
  children,
  orbPosition = 'top-right',
  watermark,
  className = '',
  noDecorations = false,
  noFade = false,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-14%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5, 0.9], [1, 0.7, 0])

  return (
    <section id={id} ref={sectionRef} className={`snap-section ${className}`}>
      {/* Static decorations — not affected by exit parallax */}
      {!noDecorations && <div className="dot-grid" />}
      {!noDecorations && <div className="vignette" />}
      {!noDecorations && <div className={`red-orb ${ORB_POSITIONS[orbPosition]}`} />}

      {watermark && (
        <div className="section-watermark select-none" style={{ bottom: '-2rem', right: '-1rem' }}>
          {watermark}
        </div>
      )}

      {/* Content wrapper — scroll-driven exit */}
      <motion.div
        style={{ y: contentY, opacity: noFade ? 1 : contentOpacity }}
        className="relative z-10 h-full flex flex-col"
      >
        {children}
      </motion.div>
    </section>
  )
}
