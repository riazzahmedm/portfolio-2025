'use client'
import { motion } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionTag from '@/components/ui/SectionTag'
import SectionHeading from '@/components/ui/SectionHeading'
import SectionFooter from '@/components/layout/SectionFooter'
import { SKILLS_GRID, TECH_JOKES, TICKER_ITEMS_2 } from '@/lib/data'
import { useState } from 'react'

const COLOR_MAP: Record<string, string> = {
  lime: 'var(--lime)',
  lavender: 'var(--lavender)',
  red: 'var(--red)',
}

const CAT_BG: Record<string, string> = {
  lime: 'rgba(130,255,31,0.07)',
  lavender: 'rgba(184,160,255,0.07)',
  red: 'rgba(220,30,30,0.07)',
}

const CATEGORIES = ['All', 'Web', 'Mobile', 'Design']

function MarqueeJokes() {
  const doubled = [...TECH_JOKES, ...TECH_JOKES]
  return (
    <div className="overflow-hidden py-2.5 my-2" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="ticker-inner-fast">
        {doubled.map((j, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6">
            <span className="text-[11px] tracking-[0.2em] uppercase px-2 py-0.5 rounded" style={{ background: 'var(--surface-alt)', color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>{j.lang}</span>
            <span className="text-[12px] tracking-wide" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', whiteSpace: 'nowrap' }}>{j.text}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? SKILLS_GRID : SKILLS_GRID.filter(s => s.category === active)

  return (
    <SectionShell id="skills" orbPosition="top-left" watermark="03">
      <div className="flex-1 flex flex-col min-h-0 mt-14 overflow-hidden">

        {/* Header */}
        <div className="px-8 md:px-14 lg:px-20 pt-6 pb-4">
          <SectionTag num="03" label="Skill Set" />
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <SectionHeading solid="SKILL" outline="SET" size="text-[clamp(2.5rem,6vw,5rem)]" />

            {/* Category filter */}
            <div className="flex gap-2 pb-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className="text-[11px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border transition-all duration-200"
                  style={{
                    fontFamily: 'var(--ff-body)',
                    background: active === cat ? 'var(--lime)' : 'transparent',
                    color: active === cat ? '#050505' : 'var(--text-dim)',
                    borderColor: active === cat ? 'var(--lime)' : 'var(--border-card)',
                    fontWeight: active === cat ? 600 : 400,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jokes ticker */}
        <MarqueeJokes />

        {/* Skill grid */}
        <div className="flex-1 overflow-y-auto px-8 md:px-14 lg:px-20 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((skill, i) => (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="group flex flex-col items-center gap-2 p-4 rounded-lg border cursor-default transition-all duration-200"
                style={{
                  background: CAT_BG[skill.color],
                  borderColor: `${COLOR_MAP[skill.color]}22`,
                }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${COLOR_MAP[skill.color]}15` }}
                >
                  {skill.icon}
                </div>
                {/* Name */}
                <span className="text-[12px] font-semibold tracking-wide text-center leading-tight" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--ff-body)' }}>
                  {skill.name}
                </span>
                {/* Level bar */}
                <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.04, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: COLOR_MAP[skill.color] }}
                  />
                </div>
                <span className="text-[10px] tabular-nums" style={{ color: COLOR_MAP[skill.color], fontFamily: 'var(--ff-mono)' }}>{skill.level}%</span>
              </motion.div>
            ))}
          </div>
        </div>

        <SectionFooter current={3} />
      </div>
    </SectionShell>
  )
}
