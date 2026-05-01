'use client'
import { motion } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionTag from '@/components/ui/SectionTag'
import SectionFooter from '@/components/layout/SectionFooter'
import { FAKE_MESSAGES } from '@/lib/data'

export default function Testimonials() {
  return (
    <SectionShell id="testimonials" orbPosition="top-right" watermark="07" noFade>
      {/* Centre glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(184,160,255,0.08) 0%, transparent 70%)',
        }}
      />
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-14 lg:px-20 xl:px-32 2xl:px-48 mt-14 min-h-0 relative z-10">

        {/* Section label */}
        <div className="self-start mb-10">
          <SectionTag num="07" label="Testimonials" />
        </div>

        {/* Main message */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl"
        >
          <div
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(2rem, 5.5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: '1.25rem',
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            This was supposed to be<br />
            <span style={{ color: 'var(--lavender)' }}>
              the feedback section.
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, fontFamily: 'var(--ff-body)', lineHeight: 1.8 }}>
            But… people are busy right now.
          </p>
        </motion.div>

        {/* Fake unread messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 w-full max-w-md flex flex-col gap-3"
        >
          {FAKE_MESSAGES.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 + i * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{
                background: 'var(--surface-raised)',
                borderColor: 'rgba(184,160,255,0.14)',
              }}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
                style={{ background: 'rgba(184,160,255,0.14)', color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}
              >
                {msg.from[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[12px] font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--ff-mono)' }}>
                    {msg.from}
                  </span>
                  <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-mono)' }}>
                    {msg.time}
                  </span>
                </div>
                <div className="text-[12px] truncate" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--ff-body)' }}>
                  {msg.text}
                </div>
              </div>
              <div className="flex-shrink-0 text-[10px] tracking-wide" style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-mono)' }}>
                seen
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.75 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ background: 'var(--surface-raised)', borderColor: 'rgba(184,160,255,0.18)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[11px]"
              style={{ background: 'rgba(184,160,255,0.1)', color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}
            >
              ?
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 0.18, 0.36].map((delay, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay, ease: 'easeInOut' }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--lavender)' }}
                />
              ))}
            </div>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-mono)' }}>
              someone is typing…
            </span>
          </motion.div>
        </motion.div>

        {/* Footnote */}
        {/* <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-8 text-center text-[11px] tracking-[0.14em] uppercase"
          style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}
        >
          // real ones incoming · check back soon
        </motion.p> */}

      </div>

      <SectionFooter current={7} />
    </SectionShell>
  )
}
