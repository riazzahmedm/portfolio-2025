'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 850)
    const t2 = setTimeout(() => setPhase('exit'), 1650)
    const t3 = setTimeout(onComplete, 2150)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  const nameStyle: React.CSSProperties = {
    fontFamily: 'var(--ff-display)',
    fontSize: 'clamp(4rem, 12vw, 11rem)',
    fontWeight: 800,
    lineHeight: 0.86,
    letterSpacing: '-0.025em',
    whiteSpace: 'nowrap',
  }

  const entering = phase !== 'exit'

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#050505',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', gap: '2.5rem',
      }}
    >
      {/* Names */}
      <div style={{ display: 'flex', gap: '0.18em', alignItems: 'baseline' }}>
        <motion.span
          initial={{ x: '-80vw', opacity: 0 }}
          animate={entering ? { x: 0, opacity: 1 } : { x: '-80vw', opacity: 0 }}
          transition={entering
            ? { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          style={{ ...nameStyle, color: '#ffffff' }}
        >
          RIAZ
        </motion.span>
        <motion.span
          initial={{ x: '80vw', opacity: 0 }}
          animate={entering ? { x: 0, opacity: 1 } : { x: '80vw', opacity: 0 }}
          transition={entering
            ? { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          style={{ ...nameStyle, color: 'rgba(255,255,255,0.25)' }}
        >
          AHMED
        </motion.span>
      </div>

      {/* Progress line */}
      <div style={{ width: '180px', height: '1px', background: 'rgba(255,255,255,0.07)', position: 'relative' }}>
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: entering ? 1 : 0, originX: entering ? 0 : 1 }}
          transition={{ duration: 1.55, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, var(--lime), var(--lavender))',
            transformOrigin: entering ? 'left' : 'right',
          }}
        />
      </div>
    </motion.div>
  )
}
