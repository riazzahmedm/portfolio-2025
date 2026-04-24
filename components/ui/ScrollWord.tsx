'use client'
/**
 * ScrollWord — splits text into words, each with its own scroll-linked opacity.
 * Words light up in sequence as you scroll, creating the maxmilkin reading effect
 * where text appears word-by-word and disappears as you scroll past.
 */
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface Props {
  text: string
  className?: string
  style?: React.CSSProperties
  /** Font colour when active. Default var(--text-primary) */
  activeColor?: string
  /** Font colour when inactive. Default 0.12 opacity of active */
  dimColor?: string
  /** keepVisible = true: words don't fade out after being read */
  keepVisible?: boolean
}

function Word({
  word,
  index,
  total,
  scrollYProgress,
  activeColor,
  dimColor,
  keepVisible,
}: {
  word: string
  index: number
  total: number
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
  activeColor: string
  dimColor: string
  keepVisible: boolean
}) {
  // Each word lights up at a proportional point in the scroll progress.
  // Entry window: 0.1 → 0.55
  // Exit window (if not keepVisible): 0.55 → 0.9
  const wordFraction = index / Math.max(total - 1, 1)
  const entryStart = 0.05 + wordFraction * 0.40
  const entryEnd = entryStart + 0.12
  const exitStart = keepVisible ? 0.99 : 0.60 + wordFraction * 0.25
  const exitEnd = keepVisible ? 1 : exitStart + 0.12

  const opacity = useTransform(
    scrollYProgress,
    [entryStart, entryEnd, exitStart, exitEnd],
    [0.12, 1, 1, 0.08],
  )

  return (
    <motion.span
      style={{ opacity, color: activeColor, display: 'inline-block', marginRight: '0.22em' }}
    >
      {word}
    </motion.span>
  )
}

export default function ScrollWord({
  text,
  className,
  style,
  activeColor = 'var(--text-primary)',
  dimColor = 'rgba(255,255,255,0.12)',
  keepVisible = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const words = text.split(' ')

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  return (
    <div ref={ref} className={className} style={{ lineHeight: 1.5, ...style }}>
      {words.map((word, i) => (
        <Word
          key={i}
          word={word}
          index={i}
          total={words.length}
          scrollYProgress={scrollYProgress}
          activeColor={activeColor}
          dimColor={dimColor}
          keepVisible={keepVisible}
        />
      ))}
    </div>
  )
}
