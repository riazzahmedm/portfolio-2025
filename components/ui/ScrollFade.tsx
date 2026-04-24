'use client'
/**
 * ScrollFade — maxmilkin-style scroll-linked text visibility.
 *
 * Each wrapped element tracks its own position in the viewport. As it scrolls
 * into the centre it becomes fully visible; as it moves away it fades out.
 * This means the text literally disappears as you scroll past it.
 */
import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

interface ScrollFadeProps {
  children: React.ReactNode
  className?: string
  /** How much y to shift on entry (px). Default 40 */
  yOffset?: number
  /** Delay the start of the animation (0–0.3). Default 0 */
  delay?: number
  /** Keep visible even after scrolling past. Default false */
  keepVisible?: boolean
  style?: React.CSSProperties
}

export default function ScrollFade({
  children,
  className,
  yOffset = 40,
  delay = 0,
  keepVisible = false,
  style,
}: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // 0 = element entering from below   (bottom of viewport)
  // 0.5 = element centred in viewport
  // 1 = element exiting at top        (top of viewport)

  const start = Math.min(delay, 0.25)
  const fullyIn = start + 0.22
  const startFade = keepVisible ? 0.98 : 0.72
  const gone = keepVisible ? 1 : 0.92

  const opacity = useTransform(
    scrollYProgress,
    [start, fullyIn, startFade, gone],
    [0, 1, 1, 0],
  )
  const y = useTransform(
    scrollYProgress,
    [start, fullyIn, startFade, gone],
    [yOffset, 0, 0, -yOffset * 0.6],
  )

  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 })
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 })

  return (
    <motion.div
      ref={ref}
      style={{ opacity: smoothOpacity, y: smoothY, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
