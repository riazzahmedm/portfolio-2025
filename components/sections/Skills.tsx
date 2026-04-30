'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionTag from '@/components/ui/SectionTag'
import SectionFooter from '@/components/layout/SectionFooter'

const COLOR = {
  lime:     { accent: 'var(--lime)',     bg: 'rgba(130,255,31,0.05)',  border: 'rgba(130,255,31,0.12)'  },
  lavender: { accent: 'var(--lavender)', bg: 'rgba(184,160,255,0.05)', border: 'rgba(184,160,255,0.12)' },
  red:      { accent: 'var(--red)',      bg: 'rgba(220,30,30,0.05)',   border: 'rgba(220,30,30,0.12)'   },
}

type SkillColor = keyof typeof COLOR

type Skill = {
  name: string
  logo: string
  invert?: boolean
  color: SkillColor
  category: 'Web' | 'Mobile' | 'Design'
  colSpan?: number
  rowSpan?: number
}

const SKILLS: Skill[] = [
  // Web
  { name: 'React',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',            color: 'lime',     category: 'Web',    colSpan: 2, rowSpan: 2 },
  { name: 'Next.js',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',           invert: true, color: 'lime', category: 'Web' },
  { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',  color: 'lime',     category: 'Web'  },
  { name: 'Tailwind',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',color: 'lime',     category: 'Web'  },
  { name: 'Redux',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redux/redux-original.svg',            color: 'lime',     category: 'Web'  },
  { name: '.NET Core',  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dotnetcore/dotnetcore-original.svg',  color: 'lime',     category: 'Web'  },
  // Mobile
  { name: 'React Native', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',         color: 'lavender', category: 'Mobile', colSpan: 2 },
  { name: 'Expo',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/expo/expo-original.svg',              invert: true, color: 'lavender', category: 'Mobile' },
  { name: 'iOS',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apple/apple-original.svg',            invert: true, color: 'lavender', category: 'Mobile' },
  { name: 'Android',    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/android/android-original.svg',       color: 'lavender', category: 'Mobile' },
  { name: 'Azure',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg',           color: 'lavender', category: 'Mobile' },
  { name: 'Ionic',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ionic/ionic-original.svg',           color: 'lavender', category: 'Mobile' },
  // Design
  { name: 'Figma',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',           color: 'red',      category: 'Design', rowSpan: 2 },
  { name: 'Adobe XD',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/xd/xd-original.svg',                 color: 'red',      category: 'Design' },
  { name: 'Photoshop',  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-original.svg',   color: 'red',      category: 'Design' },
  { name: 'HTML5',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',           color: 'red',      category: 'Design' },
  { name: 'CSS3',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',             color: 'red',      category: 'Design' },
  { name: 'Illustrator',logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/illustrator/illustrator-original.svg', color: 'red',   category: 'Design' },
]

const CATEGORIES = ['All', 'Web', 'Mobile', 'Design'] as const
type Category = typeof CATEGORIES[number]

export default function Skills() {
  const [active, setActive] = useState<Category>('All')
  const filtered = active === 'All' ? SKILLS : SKILLS.filter(s => s.category === active)
  const isBento = active === 'All'

  return (
    <SectionShell id="skills" orbPosition="top-left" watermark="03">
      <div className="flex-1 flex flex-col min-h-0 mt-14 overflow-hidden">

        {/* Header */}
        <div className="px-8 md:px-14 lg:px-20 pt-8 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <SectionTag num="03" label="What I Work With" />
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
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

        {/* Grid */}
        <div className="flex-1 min-h-0 px-8 md:px-14 lg:px-20 pb-4">
          <motion.div
            layout
            className="grid gap-2.5 h-full"
            style={{
              gridTemplateColumns: 'repeat(6, 1fr)',
              gridAutoRows: 'minmax(70px, 1fr)',
            }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map(skill => {
                const c = COLOR[skill.color]
                const isFeatured = isBento && skill.colSpan === 2 && skill.rowSpan === 2
                const logoSize = isFeatured ? 56 : isBento && (skill.colSpan === 2 || skill.rowSpan === 2) ? 40 : 32

                return (
                  <motion.div
                    key={skill.name}
                    layout
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.28 }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="relative flex flex-col items-center justify-center rounded-2xl border cursor-default p-4 gap-2.5"
                    style={{
                      gridColumn: isBento && skill.colSpan ? `span ${skill.colSpan}` : undefined,
                      gridRow:    isBento && skill.rowSpan ? `span ${skill.rowSpan}` : undefined,
                      background: c.bg,
                      borderColor: c.border,
                      minHeight: isFeatured ? '180px' : isBento && skill.rowSpan === 2 ? '180px' : '100px',
                      transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.boxShadow = `0 8px 28px ${c.accent}1a`
                      el.style.borderColor = `${c.accent}38`
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.boxShadow = 'none'
                      el.style.borderColor = c.border
                    }}
                  >
                    {/* Category dot */}
                    <div
                      className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full opacity-60"
                      style={{ background: c.accent }}
                    />

                    <img
                      src={skill.logo}
                      alt={skill.name}
                      style={{
                        width: logoSize,
                        height: logoSize,
                        objectFit: 'contain',
                        filter: skill.invert ? 'invert(1)' : undefined,
                        flexShrink: 0,
                      }}
                    />

                    <span
                      className="text-[12px] tracking-wide text-center leading-tight"
                      style={{ color: 'var(--text-secondary)', fontFamily: 'var(--ff-body)', fontWeight: 500 }}
                    >
                      {skill.name}
                    </span>

                    {isFeatured && (
                      <span
                        className="text-[9px] tracking-[0.24em] uppercase px-2 py-0.5 rounded-full mt-1"
                        style={{ background: `${c.accent}14`, color: c.accent, fontFamily: 'var(--ff-mono)' }}
                      >
                        {skill.category}
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        <SectionFooter current={3} />
      </div>
    </SectionShell>
  )
}
