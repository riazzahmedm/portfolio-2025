'use client'
import { motion } from 'framer-motion'

interface Props {
  solid: string
  outline: string
  size?: string
  delay?: number
}

const wordVariants = {
  hidden: { y: '110%', opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.75, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

function WordSplit({ text, baseDelay = 0, color }: { text: string; baseDelay?: number; color?: string }) {
  const words = text.split(' ')
  return (
    <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.18em' }}>
      {words.map((word, i) => (
        <span key={i} className="word-reveal-wrapper">
          <motion.span
            custom={baseDelay + i}
            variants={wordVariants}
            style={{ display: 'inline-block', color }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export default function AnimatedHeading({ solid, outline, size = 'text-[clamp(3rem,8vw,6rem)]', delay = 0 }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`leading-[0.92] tracking-tight mb-5 ${size}`}
      style={{ fontFamily: 'var(--ff-display)', fontWeight: 800 }}
    >
      <div style={{ overflow: 'hidden' }}>
        <WordSplit text={solid} baseDelay={delay} color="var(--text-primary)" />
      </div>
      <div style={{ overflow: 'hidden', WebkitTextStroke: '1px var(--heading-outline-stroke)' }}>
        <WordSplit
          text={outline}
          baseDelay={delay + solid.split(' ').length * 0.1}
          color="transparent"
        />
      </div>
    </motion.div>
  )
}
