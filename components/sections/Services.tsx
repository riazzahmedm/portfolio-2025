'use client'
import { motion } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionTag from '@/components/ui/SectionTag'
import SectionHeading from '@/components/ui/SectionHeading'
import SectionFooter from '@/components/layout/SectionFooter'
import ScrollFade from '@/components/ui/ScrollFade'
import { SERVICES } from '@/lib/data'
import { Terminal, ArrowUpRight } from 'lucide-react'

const METHOD_COLORS: Record<string, string> = {
  POST: '#22cc44',
  GET: 'rgba(130,255,31,0.9)',
  PUT: 'rgba(184,160,255,0.9)',
}

export default function Services() {
  return (
    <SectionShell id="services" orbPosition="bottom-right" watermark="06">
      <div className="flex-1 flex flex-col justify-center px-8 md:px-14 lg:px-20 py-4 mt-14 min-h-0 gap-6">
        <ScrollFade yOffset={20} keepVisible>
          <SectionTag num="06" label="Services" />
          <SectionHeading solid="SER" outline="VICES" size="text-[clamp(2.5rem,6vw,5rem)]" />
        </ScrollFade>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SERVICES.map((svc, i) => (
            <motion.div
              key={svc.endpoint}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="border rounded-xl overflow-hidden group relative transition-all duration-300"
              style={{ borderColor: 'var(--border-card)', background: 'var(--surface)' }}
            >
              {/* Colored top accent */}
              <div className="h-1 w-full" style={{ background: svc.accentColor }} />

              {/* Endpoint header */}
              <div className="px-5 py-4 border-b flex items-center gap-3 transition-colors duration-300" style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>
                <Terminal size={13} style={{ color: METHOD_COLORS[svc.method] }} />
                <span className="text-[13px] font-bold tracking-[0.1em]" style={{ color: METHOD_COLORS[svc.method], fontFamily: 'var(--ff-mono)' }}>
                  {svc.method}
                </span>
                <span className="text-[13px] tracking-[0.04em] truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-mono)' }}>
                  {svc.endpoint}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-[22px]">{svc.icon}</div>
                  <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: svc.accentColor }} />
                </div>
                <div className="text-[16px] font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--ff-display)' }}>
                  {svc.title}
                </div>
                <p className="text-[13px] leading-[1.8] mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-body)' }}>
                  {svc.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {svc.tech.map((t) => (
                    <span key={t} className="text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full border transition-colors duration-300"
                      style={{ color: 'var(--text-dim)', borderColor: 'var(--border-card)', fontFamily: 'var(--ff-body)', fontWeight: 500 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          <div className="h-px flex-1 max-w-24" style={{ background: 'var(--border)' }} />
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-[13px] tracking-[0.2em] uppercase border px-6 py-3 rounded-full transition-all duration-200 hover:border-lime-400 hover:text-white font-medium"
            style={{ borderColor: 'var(--border-card)', color: 'var(--text-muted)', fontFamily: 'var(--ff-body)' }}
          >
            ping riaz --hire
          </button>
          <div className="h-px flex-1 max-w-24" style={{ background: 'var(--border)' }} />
        </motion.div>
      </div>

      <SectionFooter current={6} />
    </SectionShell>
  )
}
