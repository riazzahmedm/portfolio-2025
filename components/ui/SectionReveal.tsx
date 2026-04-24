'use client'
import { motion } from 'framer-motion'

interface Props {
  color?: string
  direction?: 'left' | 'right' | 'top'
}

export default function SectionReveal({ color = 'var(--bg)', direction = 'left' }: Props) {
  const variants = {
    left: { initial: { scaleX: 1, originX: 0 }, animate: { scaleX: 0, originX: 0 } },
    right: { initial: { scaleX: 1, originX: 1 }, animate: { scaleX: 0, originX: 1 } },
    top: { initial: { scaleY: 1, originY: 0 }, animate: { scaleY: 0, originY: 0 } },
  }[direction]

  return (
    <motion.div
      className="absolute inset-0 z-20 pointer-events-none"
      style={{ background: color }}
      initial={variants.initial}
      whileInView={variants.animate}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    />
  )
}
