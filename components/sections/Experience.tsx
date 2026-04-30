'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionTag from '@/components/ui/SectionTag'
import SectionFooter from '@/components/layout/SectionFooter'
import { EXPERIENCE } from '@/lib/data'
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'

export default function Experience() {
  const [selected, setSelected] = useState(0)
  const job = EXPERIENCE[selected]

  return (
    <SectionShell id="experience" orbPosition="top-left" watermark="04">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0 mt-14">

        {/* LEFT — Timeline */}
        <div className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-8 md:py-0 border-b md:border-b-0 md:border-r transition-colors duration-300" style={{ borderColor: 'var(--border)' }}>
          <SectionTag num="04" label="Companies That Trusted Me" />

          <div className="flex flex-col gap-1">
            {EXPERIENCE.map((job, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => setSelected(i)}
                className="flex items-start gap-4 py-3 px-4 rounded-lg text-left transition-all duration-200 group relative"
                style={{
                  background: selected === i ? 'rgba(184,160,255,0.08)' : 'transparent',
                  borderLeft: `2px solid ${selected === i ? 'var(--lavender)' : 'transparent'}`,
                }}
              >
                <div className="flex flex-col items-center gap-1 pt-1">
                  {selected === i || job.current
                    ? <CheckCircle2 size={14} style={{ color: job.current ? 'var(--lime)' : 'var(--lavender)' }} />
                    : <Circle size={14} style={{ color: 'var(--text-dim)' }} />
                  }
                  {i < EXPERIENCE.length - 1 && (
                    <div className="w-px h-8" style={{ background: 'var(--border)' }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="text-[11px] tracking-[0.16em] uppercase" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
                      {job.year}
                    </div>
                    {job.current && (
                      <span className="text-[9px] tracking-[0.16em] uppercase px-2 py-0.5 rounded-full" style={{ background: 'rgba(130,255,31,0.12)', color: 'var(--lime)', fontFamily: 'var(--ff-mono)' }}>
                        current
                      </span>
                    )}
                  </div>
                  <div className="text-[15px] font-semibold transition-colors duration-200" style={{ color: selected === i ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: 'var(--ff-body)' }}>
                    {job.role}
                  </div>
                  <div className="text-[12px] tracking-[0.12em] uppercase mt-0.5" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
                    {job.company}
                  </div>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity mt-1" style={{ color: 'var(--lavender)' }} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* RIGHT — Detail */}
        <div className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-8 md:py-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px w-6" style={{ background: 'var(--lavender)' }} />
                <div className="text-[12px] tracking-[0.22em] uppercase" style={{ color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>
                  {job.current ? 'Currently here' : `Since ${job.year}`}
                </div>
              </div>
              <div className="text-[40px] font-bold tracking-tight mb-1 uppercase" style={{ fontFamily: 'var(--ff-display)', color: 'var(--text-primary)' }}>
                {job.role}
              </div>
              <div className="text-[13px] tracking-[0.16em] uppercase mb-5" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
                {job.company}
              </div>

              <ul className="flex flex-col gap-3 mb-6">
                {job.points.map((pt, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-3 text-[14px] leading-relaxed"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-body)' }}
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--lavender)' }} />
                    {pt}
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="text-[11px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-full border transition-colors duration-300" style={{ color: 'var(--lavender)', borderColor: 'rgba(184,160,255,0.25)', background: 'rgba(184,160,255,0.06)', fontFamily: 'var(--ff-body)', fontWeight: 500 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <SectionFooter current={4} />
    </SectionShell>
  )
}
