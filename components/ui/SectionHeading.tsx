'use client'
import { motion } from 'framer-motion'

interface Props {
  solid: string
  outline: string
  size?: string
}

export default function SectionHeading({ solid, outline, size = 'text-[clamp(3rem,8vw,6rem)]' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`leading-[0.9] tracking-tight mb-5 ${size}`}
      style={{ fontFamily: 'var(--ff-display)', fontWeight: 800 }}
    >
      <div className="transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>{solid}</div>
      <div className="heading-outline">{outline}</div>
    </motion.div>
  )
}
