'use client'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionFooter from '@/components/layout/SectionFooter'

const ROW_1 = '5+ YEARS OF ENGINEERING PRECISION · REACT · NEXT.JS · TYPESCRIPT · '
const ROW_2 = 'WEB & MOBILE · 40+ PROJECTS · REACT NATIVE · .NET CORE · AZURE · '
const ROW_3 = 'FIGMA TO CODE · OPEN TO WORK · CHENNAI, INDIA · SENIOR ENGINEER · '

export default function About() {
  const { scrollY } = useScroll()

  // Spring-smooth the raw scrollY before feeding it into transforms.
  // This removes jitter and gives the text a fluid, inertial feel.
  const smooth = useSpring(scrollY, { stiffness: 60, damping: 20, restDelta: 0.001 })

  const x1 = useTransform(smooth, [0, 3000], ['0%',   '-55%'])
  const x2 = useTransform(smooth, [0, 3000], ['-8%',  '-48%'])
  const x3 = useTransform(smooth, [0, 3000], ['4%',   '-58%'])

  return (
    <SectionShell id="about" orbPosition="bottom-left" watermark="02">
      {/* mt-14 clears the fixed nav — same pattern as every other section */}
      <div className="flex-1 flex flex-col min-h-0 mt-14">

        {/* Label */}
        <div className="px-8 md:px-14 lg:px-20 pt-8 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-px w-8" style={{ background: 'var(--lavender)' }} />
            <span
              className="text-[12px] tracking-[0.36em] uppercase"
              style={{ color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}
            >
              02 / Who I Am
            </span>
          </div>
        </div>

        {/* Scroll-driven text rows — fills remaining vertical space */}
        <div className="flex-1 flex flex-col justify-center overflow-hidden gap-1">

          <div className="overflow-hidden">
            <motion.div style={{ x: x1 }} className="whitespace-nowrap">
              <span style={{
                fontFamily: 'var(--ff-display)',
                fontSize: 'clamp(2.8rem, 6.5vw, 6rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}>
                {ROW_1 + ROW_1}
              </span>
            </motion.div>
          </div>

          <div className="overflow-hidden">
            <motion.div style={{ x: x2 }} className="whitespace-nowrap">
              <span style={{
                fontFamily: 'var(--ff-display)',
                fontSize: 'clamp(2.8rem, 6.5vw, 6rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'transparent',
                WebkitTextStroke: '1px var(--heading-outline-stroke)',
              }}>
                {ROW_2 + ROW_2}
              </span>
            </motion.div>
          </div>

          <div className="overflow-hidden">
            <motion.div style={{ x: x3 }} className="whitespace-nowrap">
              <span style={{
                fontFamily: 'var(--ff-display)',
                fontSize: 'clamp(2.8rem, 6.5vw, 6rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}>
                {ROW_3 + ROW_3}
              </span>
            </motion.div>
          </div>

        </div>

        {/* Supporting line */}
        <div className="px-8 md:px-14 lg:px-20 py-5 flex-shrink-0">
          <p className="text-[14px] leading-[1.9] max-w-lg" style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-body)' }}>
            I bridge design sensibility with technical depth — from React architectures to polished Figma prototypes.{' '}
            <span style={{ color: 'var(--lavender)' }}>Every pixel and every function matters.</span>
          </p>
        </div>

        <SectionFooter current={2} />
      </div>
    </SectionShell>
  )
}
