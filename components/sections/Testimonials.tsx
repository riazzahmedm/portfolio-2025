'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionTag from '@/components/ui/SectionTag'
import SectionHeading from '@/components/ui/SectionHeading'
import SectionFooter from '@/components/layout/SectionFooter'
import ScrollFade from '@/components/ui/ScrollFade'
import { TESTIMONIALS } from '@/lib/data'
import { Quote } from 'lucide-react'

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const t = TESTIMONIALS[current]

  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length)

  return (
    <SectionShell id="testimonials" orbPosition="top-right" watermark="07">
      <div className="flex-1 flex flex-col justify-center px-8 md:px-14 lg:px-20 py-4 mt-14 min-h-0 max-w-5xl mx-auto w-full">
        <ScrollFade yOffset={24} keepVisible>
          <SectionTag num="07" label="Testimonials" />
          <SectionHeading solid="FEED" outline="BACK" size="text-[clamp(2.5rem,6vw,5rem)]" />
        </ScrollFade>

        <ScrollFade yOffset={32} delay={0.06} keepVisible>
          <div className="relative mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {/* Quote card */}
                <div
                  className="p-8 md:p-10 rounded-2xl border relative overflow-hidden"
                  style={{
                    borderColor: 'rgba(184,160,255,0.15)',
                    background: 'linear-gradient(135deg, rgba(184,160,255,0.04) 0%, var(--surface) 100%)',
                  }}
                >
                  {/* Big quote icon */}
                  <Quote size={40} className="absolute top-6 right-6 opacity-10" style={{ color: 'var(--lavender)' }} />

                  <p
                    className="text-[17px] md:text-[19px] leading-[1.85] mb-8 italic"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--ff-body)', fontWeight: 400 }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-4">
                    {/* Real avatar photo */}
                    <div
                      className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                      style={{ border: '1.5px solid rgba(184,160,255,0.4)' }}
                    >
                      {t.avatar ? (
                        <Image
                          src={t.avatar}
                          alt={t.author}
                          fill
                          className="object-cover object-top"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-sm font-bold"
                          style={{ background: 'rgba(184,160,255,0.15)', color: 'var(--lavender)', fontFamily: 'var(--ff-display)' }}
                        >
                          {t.author[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
                        {t.author}
                      </div>
                      <div className="text-[12px] tracking-[0.16em] uppercase mt-0.5" style={{ color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>
                        {t.role}
                      </div>
                    </div>
                  </div>

                  {/* Peer review tag */}
                  <div
                    className="absolute bottom-4 right-6 text-[11px] tracking-[0.12em]"
                    style={{ color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)', fontStyle: 'italic' }}
                  >
                    // peer review · verified by humans, not tokens
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-3">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:bg-white/5"
                  style={{ borderColor: 'var(--border-card)', color: 'var(--text-muted)' }}
                >
                  ←
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:bg-white/5"
                  style={{ borderColor: 'var(--border-card)', color: 'var(--text-muted)' }}
                >
                  →
                </button>
              </div>

              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === current ? '24px' : '8px',
                      height: '8px',
                      background: i === current ? 'var(--lavender)' : 'var(--text-dim)',
                    }}
                  />
                ))}
              </div>

              <div className="text-[12px] tracking-[0.12em]" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
                {String(current + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}
              </div>
            </div>
          </div>
        </ScrollFade>
      </div>

      <SectionFooter current={7} />
    </SectionShell>
  )
}
