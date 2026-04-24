'use client'
import { motion } from 'framer-motion'

interface Line {
  type: 'cmd' | 'out' | 'success' | 'dim'
  text: string
}

interface Props {
  title?: string
  lines: Line[]
}

const colors: Record<string, string> = {
  cmd: 'var(--text-secondary)',
  out: 'var(--text-muted)',
  success: '#22cc44',
  dim: 'var(--text-faint)',
}

export default function TerminalBlock({ title = 'riaz@portfolio ~ zsh', lines }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-sm overflow-hidden border transition-colors duration-300"
      style={{ background: '#0d0d0d', borderColor: 'var(--border-card)' }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ background: '#111', borderColor: 'var(--border)' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#e02020]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffaa00]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#22cc44]" />
        <span className="ml-3 text-[13px] tracking-[0.1em]" style={{ color: '#444', fontFamily: 'var(--ff-mono)' }}>{title}</span>
      </div>
      {/* Body */}
      <div className="p-5 flex flex-col gap-1.5" style={{ fontFamily: 'var(--ff-mono)' }}>
        {lines.map((line, i) => (
          <div key={i} className="text-[14px] leading-relaxed tracking-wide flex gap-2">
            {line.type === 'cmd' && <span style={{ color: 'var(--red)' }}>❯</span>}
            {line.type !== 'cmd' && <span className="opacity-0 select-none">❯</span>}
            <span style={{ color: colors[line.type] ?? colors.out }}>{line.text}</span>
          </div>
        ))}
        <div className="text-[14px] flex gap-2 mt-1">
          <span style={{ color: 'var(--red)' }}>❯</span>
          <span className="blink inline-block w-2 h-3 align-middle" style={{ background: 'var(--red)' }} />
        </div>
      </div>
    </motion.div>
  )
}
