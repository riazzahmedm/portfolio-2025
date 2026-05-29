'use client'
import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Film, Tv, Clock, RefreshCw, Share2, Flame, CalendarDays, BarChart2, Download } from 'lucide-react'
import type { MovieLog, FavoritePerson } from '@/lib/movies.types'
import { VIBES, PLATFORMS, DRAWS } from '@/lib/movies.types'

// ── Animation hooks ───────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref    = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useCountUp(target: number, duration = 1400, delay = 200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target) return
    const timer = setTimeout(() => {
      const start = Date.now()
      const tick = () => {
        const t    = Math.min((Date.now() - start) / duration, 1)
        const ease = 1 - Math.pow(1 - t, 3)        // cubic ease-out
        setValue(Math.round(ease * target))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, duration, delay])
  return value
}

// Fade + slide-up wrapper — fires once when section enters viewport.
// onVisible is called the moment inView becomes true, so callers can
// trigger bar-fill animations in sync with the section entrance.
function AnimSection({
  children, delay = 0, style, className, onVisible,
}: {
  children:   React.ReactNode
  delay?:     number
  style?:     React.CSSProperties
  className?: string
  onVisible?: () => void
}) {
  const { ref, inView } = useInView()
  const fired = useRef(false)
  useEffect(() => {
    if (inView && !fired.current) {
      fired.current = true
      onVisible?.()
    }
  }, [inView, onVisible])
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    inView ? 1 : 0,
        transform:  inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function count<T extends string>(items: T[]): [T, number][] {
  const map: Record<string, number> = {}
  items.forEach(k => { map[k] = (map[k] ?? 0) + 1 })
  return Object.entries(map).sort((a, b) => b[1] - a[1]) as [T, number][]
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const GENRE_COLORS: Record<string, string> = {
  Drama:      '#b8a0ff', Action:   '#f97316', Comedy:  '#fbbf24',
  Horror:     '#e02020', Thriller: '#ef4444', Romance: '#f472b6',
  'Sci-Fi':   '#38bdf8', Animation:'#82ff1f', Crime:   '#a3a3a3',
  Documentary:'#34d399', Fantasy:  '#c084fc', Mystery: '#818cf8',
  Adventure:  '#fb923c', Family:   '#facc15', Music:   '#e879f9',
  Western:    '#d97706', War:      '#9ca3af', History: '#ca8a04',
}

function genreColor(g: string) { return GENRE_COLORS[g] ?? '#b8a0ff' }

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children, color = 'rgba(255,255,255,0.3)' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.26em',
      textTransform: 'uppercase', color, marginBottom: '24px',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <span style={{ width: '18px', height: '1px', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
      {children}
    </div>
  )
}

function BigNumber({ value, label, sub }: { value: string | number; label?: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--ff-display)', fontWeight: 400, letterSpacing: '-0.02em',
        fontSize: 'clamp(4rem, 18vw, 9rem)', lineHeight: 1,
        background: 'linear-gradient(135deg, #fff 0%, rgba(184,160,255,0.9) 60%, rgba(130,255,31,0.7) 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      } as React.CSSProperties}>
        {value}
      </div>
      {label && (
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: '14px' }}>
          {label}
        </div>
      )}
      {sub && (
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.25)', marginTop: '6px' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function BarRow({ label, value, max, color = '#b8a0ff', emoji, rank, animate = false, staggerIndex = 0 }: {
  label:        string
  value:        number
  max:          number
  color?:       string
  emoji?:       string
  rank?:        number
  animate?:     boolean   // when true, bar fills from 0 → real width
  staggerIndex?: number   // adds per-item delay so bars fill sequentially
}) {
  const pct = (animate && max > 0) ? (value / max) * 100 : 0
  const barDelay = staggerIndex * 80
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      opacity: animate ? 1 : 0,
      transform: animate ? 'translateX(0)' : 'translateX(-8px)',
      transition: `opacity 0.4s ease ${barDelay}ms, transform 0.4s ease ${barDelay}ms`,
    }}>
      {rank != null && (
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.2)', width: '18px', textAlign: 'right', flexShrink: 0 }}>
          {rank}
        </div>
      )}
      {emoji && <span style={{ fontSize: '16px', flexShrink: 0 }}>{emoji}</span>}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--ff-body)', fontSize: '13px', color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </span>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
            {value}
          </span>
        </div>
        <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: '2px',
            background: color,
            transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${barDelay + 100}ms`,
          }} />
        </div>
      </div>
    </div>
  )
}

// ── Share Card Modal ─────────────────────────────────────────────────────────
// Renders a styled 9:16 card and offers canvas-based download
function ShareCardModal({
  stats, scopeLabel, yearScope, onClose,
}: {
  stats:      NonNullable<ReturnType<typeof computeStats>>
  scopeLabel: string
  yearScope:  string
  onClose:    () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const topGenreName = stats.topGenre?.[0] ?? null
  const topVibe      = VIBES.find(v => v.key === stats.vibeCounts[0]?.[0])
  const peakDow      = [...stats.dayOfWeekCounts].sort((a, b) => b.count - a.count)[0]

  function downloadCanvas() {
    const canvas  = document.createElement('canvas')
    const W = 1080, H = 1920
    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // Background
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, W, H)

    // Gradient overlay
    const grd = ctx.createLinearGradient(0, 0, W, H)
    grd.addColorStop(0, 'rgba(184,160,255,0.18)')
    grd.addColorStop(1, 'rgba(130,255,31,0.10)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, W, H)

    // Top label
    ctx.font = '32px monospace'
    ctx.fillStyle = 'rgba(184,160,255,0.6)'
    ctx.letterSpacing = '8px'
    ctx.textAlign = 'center'
    ctx.fillText(yearScope === 'all' ? 'YOUR ARCHIVE' : `${yearScope} WRAPPED`, W / 2, 140)

    // Big number
    ctx.font = 'bold 280px serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(String(stats.total), W / 2, 460)

    // Sub label
    ctx.font = '36px monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.letterSpacing = '4px'
    ctx.fillText('FILMS & SERIES WATCHED', W / 2, 540)

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(80, 620); ctx.lineTo(W - 80, 620); ctx.stroke()

    // Stats grid
    const statItems = [
      { val: String(stats.movies),           label: 'MOVIES' },
      { val: String(stats.series),           label: 'SERIES' },
      { val: `~${stats.totalHrs}h`,          label: 'WATCHED' },
      { val: topGenreName ?? '—',            label: 'TOP GENRE' },
      { val: topVibe ? `${topVibe.emoji} ${topVibe.label}` : '—', label: 'TOP VIBE' },
      { val: peakDow?.label ?? '—',          label: 'PEAK DAY' },
    ]
    statItems.forEach((s, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x   = col === 0 ? 180 : W - 180
      const y   = 760 + row * 220
      ctx.textAlign = col === 0 ? 'left' : 'right'
      ctx.font = 'bold 64px serif'
      ctx.fillStyle = '#ffffff'
      ctx.letterSpacing = '0px'
      ctx.fillText(s.val, x, y)
      ctx.font = '26px monospace'
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.letterSpacing = '4px'
      ctx.fillText(s.label, x, y + 42)
    })

    // Watermark
    ctx.textAlign = 'center'
    ctx.font = '28px monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.letterSpacing = '3px'
    ctx.fillText('riaz.xyz/movies', W / 2, H - 80)

    // Download
    const link = document.createElement('a')
    link.download = `wrapped-${scopeLabel.replace(/\s/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const topGenreColor = topGenreName ? (GENRE_COLORS[topGenreName] ?? '#b8a0ff') : '#b8a0ff'

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(24px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', gap: '20px',
    }}>
      {/* Card preview */}
      <div
        ref={cardRef}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '340px',
          aspectRatio: '9/16',
          borderRadius: '24px', overflow: 'hidden',
          background: '#050505',
          border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'space-between', padding: '32px 28px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        }}
      >
        {/* Gradient bg */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(135deg, rgba(184,160,255,0.12) 0%, ${topGenreColor}12 50%, rgba(130,255,31,0.08) 100%)`,
        }} />

        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.28em', color: '#b8a0ff', textTransform: 'uppercase' }}>
            {yearScope === 'all' ? 'Your Archive' : `${yearScope} Wrapped`}
          </div>
        </div>

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--ff-display)', fontWeight: 400,
            fontSize: 'clamp(4rem, 22vw, 8rem)', lineHeight: 0.9, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #fff 0%, rgba(184,160,255,0.9) 60%, rgba(130,255,31,0.7) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          } as React.CSSProperties}>
            {stats.total}
          </div>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: '10px' }}>
            films &amp; series
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ position: 'relative', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { val: stats.movies,                                            label: 'Movies' },
            { val: stats.series,                                            label: 'Series' },
            { val: `~${stats.totalHrs}h`,                                   label: 'Watched' },
            { val: topGenreName ?? '—',                                     label: 'Top genre' },
            ...(topVibe ? [{ val: `${topVibe.emoji} ${topVibe.label}`, label: 'Top vibe' }] : []),
            ...(peakDow ? [{ val: peakDow.label,                        label: 'Peak day' }]  : []),
          ].map((s, i) => (
            <div key={i} style={{
              padding: '10px 12px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', flexDirection: 'column', gap: '3px',
            }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', fontWeight: 400, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>
                {s.val}
              </div>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '8px', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', fontFamily: 'var(--ff-mono)', fontSize: '8px', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>
          riaz.xyz/movies
        </div>
      </div>

      {/* Actions */}
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '10px' }}>
        <button onClick={downloadCanvas} style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '11px 22px', borderRadius: '100px', cursor: 'pointer',
          border: '1px solid rgba(130,255,31,0.4)',
          background: 'rgba(130,255,31,0.1)', color: '#82ff1f',
          fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <Download size={12} /> Download
        </button>
        <button onClick={onClose} style={{
          padding: '11px 22px', borderRadius: '100px', cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'transparent', color: 'rgba(255,255,255,0.4)',
          fontSize: '12px', fontFamily: 'var(--ff-mono)',
        }}>
          Close
        </button>
      </div>
    </div>
  )
}

// helper so ShareCardModal can reference the return type
function computeStats(filteredLogs: import('@/lib/movies.types').MovieLog[], sectionFilter: 'all' | 'movie' | 'series') {
  if (!filteredLogs.length) return null
  // (mirrored shape — actual computation is in the useMemo above)
  return {} as {
    total: number; movies: number; series: number; rewatches: number; totalHrs: number
    topGenres: [string, number][]; topGenre: [string, number] | null
    vibeCounts: [string, number][]; vibeTotal: number
    topPeople: { person: import('@/lib/movies.types').FavoritePerson; count: number }[]
    monthEntries: [string, number][]; peakMonth: [string, number]
    platformCounts: [string, number][]; drawCounts: [string, number][]
    topActors: [string, number][]; topDirectors: [string, number][]
    dayOfWeekCounts: { label: string; count: number }[]
    decadeCounts: [string, number][]
    streak: { days: number; from: string; to: string }
    vibeVsRating: { vibe: string; avgRating: number; count: number }[]
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function WrappedPage() {
  const [logs,      setLogs]      = useState<MovieLog[]>([])
  const [loading,   setLoading]   = useState(true)
  const [yearScope,    setYearScope]    = useState<string>('all')
  const [sectionFilter, setSectionFilter] = useState<'all' | 'movie' | 'series'>('all')

  const [shareOpen, setShareOpen] = useState(false)

  // Per-section visibility — drives bar fill animations
  const [genreVisible,    setGenreVisible]    = useState(false)
  const [vibeVisible,     setVibeVisible]     = useState(false)
  const [timelineVisible, setTimelineVisible] = useState(false)
  const [platformVisible, setPlatformVisible] = useState(false)
  const [drawsVisible,    setDrawsVisible]    = useState(false)
  const [dowVisible,      setDowVisible]      = useState(false)
  const [decadeVisible,   setDecadeVisible]   = useState(false)
  const [ratingVisible,   setRatingVisible]   = useState(false)

  // Reset bar animations when section filter changes so they re-play.
  useEffect(() => {
    setGenreVisible(false)
    setVibeVisible(false)
    setTimelineVisible(false)
    setRatingVisible(false)
    const t = setTimeout(() => {
      setGenreVisible(true)
      setVibeVisible(true)
      setTimelineVisible(true)
      setRatingVisible(true)
    }, 80)
    return () => clearTimeout(t)
  }, [sectionFilter])

  useEffect(() => {
    fetch('/api/movies')
      .then(r => r.json())
      .then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Available years from logs
  const availableYears = useMemo(() => {
    return Array.from(new Set(logs.map(l => l.watched_on.slice(0, 4))))
      .sort((a, b) => Number(b) - Number(a))
  }, [logs])

  // Filter logs by scope
  const filteredLogs = useMemo(() => {
    if (yearScope === 'all') return logs
    return logs.filter(l => l.watched_on.startsWith(yearScope))
  }, [logs, yearScope])

  // ── Compute all stats from filtered logs ──────────────────────────────────
  const stats = useMemo(() => {
    if (!filteredLogs.length) return null

    const movies  = filteredLogs.filter(l => l.type === 'movie')
    const series  = filteredLogs.filter(l => l.type === 'series')
    // Deduplicate series by tmdb_id (multiple season/episode logs = one show)
    const uniqueSeriesCount = new Set(series.map(l => l.tmdb_id ?? l.title)).size
    const rewatches = filteredLogs.filter(l => l.rewatch).length

    // Runtime (in minutes → hours)
    const totalMins = filteredLogs.reduce((acc, l) => acc + (l.runtime ?? 0), 0)
    const totalHrs  = Math.round(totalMins / 60)

    // Subset used by Genre, Vibe, and Timeline sections
    const sectionLogs = sectionFilter === 'all'
      ? filteredLogs
      : filteredLogs.filter(l => l.type === sectionFilter)

    // Top genres
    const allGenres = sectionLogs.flatMap(l => l.genres ?? []).filter(Boolean)
    const topGenres = count(allGenres).slice(0, 8)

    // Vibes
    const allVibes = sectionLogs.map(l => l.vibe).filter(Boolean) as string[]
    const vibeCounts = count(allVibes)
    const vibeTotal  = allVibes.length

    // Favorite people
    const allPeople = filteredLogs.filter(l => l.type === 'movie').map(l => l.favorite_person).filter(Boolean) as FavoritePerson[]
    const personMap: Record<number, { person: FavoritePerson; count: number }> = {}
    allPeople.forEach(p => {
      if (!personMap[p.id]) personMap[p.id] = { person: p, count: 0 }
      personMap[p.id].count++
    })
    const topPeople = Object.values(personMap).sort((a, b) => b.count - a.count).slice(0, 3)

    // Monthly activity
    const monthMap: Record<string, number> = {}
    sectionLogs.forEach(l => {
      const ym = l.watched_on.slice(0, 7)
      monthMap[ym] = (monthMap[ym] ?? 0) + 1
    })
    const monthEntries = Object.entries(monthMap).sort((a, b) => a[0].localeCompare(b[0]))
    const peakMonth    = monthEntries.reduce((best, cur) => cur[1] > best[1] ? cur : best, ['', 0])

    // Platforms
    const allPlatforms = filteredLogs.map(l => l.platform).filter(Boolean) as string[]
    const platformCounts = count(allPlatforms).slice(0, 5)

    // Draws
    const allDraws = filteredLogs.flatMap(l => l.draws ?? []).filter(Boolean)
    const drawCounts = count(allDraws).slice(0, 6)

    // Loved/masterpiece movies, first-time watches only — shared base for actors + directors
    const trustedLogs  = filteredLogs.filter(l => l.type === 'movie')
    const allActors    = trustedLogs.flatMap(l => l.cast_names ?? []).filter(Boolean)
    const topActors    = count(allActors).slice(0, 5)
    const allDirectors = trustedLogs.map(l => l.director).filter(Boolean) as string[]
    const topDirectors = count(allDirectors).slice(0, 3)

    // ── Day-of-week heatmap ──
    const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayMap: Record<number, number> = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 }
    filteredLogs.forEach(l => {
      const d = new Date(l.watched_on + 'T12:00:00').getDay()
      dayMap[d] = (dayMap[d] ?? 0) + 1
    })
    const dayOfWeekCounts = DOW_LABELS.map((label, i) => ({ label, count: dayMap[i] }))

    // ── Decade breakdown (by release year) ──
    const decadeMap: Record<string, number> = {}
    filteredLogs.forEach(l => {
      if (!l.year) return
      const d = l.year < 1970 ? 'Pre‑70s' : `${Math.floor(l.year / 10) * 10}s`
      decadeMap[d] = (decadeMap[d] ?? 0) + 1
    })
    const decadeCounts = Object.entries(decadeMap).sort((a, b) => {
      if (a[0] === 'Pre‑70s') return -1
      if (b[0] === 'Pre‑70s') return 1
      return Number(a[0]) - Number(b[0])
    })

    // ── Longest consecutive watch streak ──
    const uniqueDates = [...new Set(filteredLogs.map(l => l.watched_on))].sort()
    let longestStreak = uniqueDates.length > 0 ? 1 : 0
    let currentStreak = 1
    let streakStart   = uniqueDates[0] ?? ''
    let bestStart     = uniqueDates[0] ?? ''
    let bestEnd       = uniqueDates[0] ?? ''
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1] + 'T12:00:00')
      const curr = new Date(uniqueDates[i]     + 'T12:00:00')
      const diff = (curr.getTime() - prev.getTime()) / 86_400_000
      if (diff === 1) {
        currentStreak++
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak
          bestStart     = streakStart
          bestEnd       = uniqueDates[i]
        }
      } else {
        currentStreak = 1
        streakStart   = uniqueDates[i]
      }
    }
    const streak = { days: longestStreak, from: bestStart, to: bestEnd }

    // ── TMDB rating vs vibe ──
    const vibeRatingMap: Record<string, number[]> = {}
    sectionLogs.forEach(l => {
      if (!l.vibe || !l.tmdb_rating) return
      if (!vibeRatingMap[l.vibe]) vibeRatingMap[l.vibe] = []
      vibeRatingMap[l.vibe].push(l.tmdb_rating)
    })
    const VIBE_ORDER = ['masterpiece', 'loved', 'liked', 'fine', 'meh', 'bad']
    const vibeVsRating = Object.entries(vibeRatingMap)
      .map(([vibe, ratings]) => ({
        vibe,
        avgRating: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
        count: ratings.length,
      }))
      .sort((a, b) => VIBE_ORDER.indexOf(a.vibe) - VIBE_ORDER.indexOf(b.vibe))

    return {
      total: filteredLogs.length,
      movies: movies.length,
      series: uniqueSeriesCount,
      rewatches,
      totalHrs,
      topGenres,
      topGenre: topGenres[0] ?? null,
      vibeCounts,
      vibeTotal,
      topPeople,
      monthEntries,
      peakMonth,
      platformCounts,
      drawCounts,
      topActors,
      topDirectors,
      dayOfWeekCounts,
      decadeCounts,
      streak,
      vibeVsRating,
    }
  }, [filteredLogs, sectionFilter])

  const scopeLabel  = yearScope === 'all' ? 'all time' : yearScope
  const heroCount   = useCountUp(stats?.total ?? 0, 1400, 300)

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>
          LOADING…
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.88); }
          60%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(18px)',
        padding: '14px 24px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <Link href="/movies" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'var(--text-dim)', textDecoration: 'none',
            fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
          }}>
            <ArrowLeft size={13} /> Watchlog
          </Link>

          {stats && (
            <button onClick={() => setShareOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '100px', cursor: 'pointer',
              border: '1px solid rgba(184,160,255,0.35)',
              background: 'rgba(184,160,255,0.08)',
              color: '#b8a0ff',
              fontSize: '11px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              <Share2 size={11} /> Share
            </button>
          )}

          {/* Year toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
            {['all', ...availableYears].map(y => {
              const on = yearScope === y
              return (
                <button key={y} onClick={() => setYearScope(y)} style={{
                  padding: '5px 13px', borderRadius: '100px', cursor: 'pointer',
                  border: `1px solid ${on ? 'rgba(184,160,255,0.45)' : 'rgba(255,255,255,0.08)'}`,
                  background: on ? 'rgba(184,160,255,0.12)' : 'transparent',
                  color: on ? '#b8a0ff' : 'rgba(255,255,255,0.4)',
                  fontSize: '11px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
                  textTransform: 'uppercase', flexShrink: 0, transition: 'all 0.18s',
                }}>
                  {y === 'all' ? 'All Time' : y}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 100px' }}>

        {/* ── Hero ── */}
        <section style={{ padding: '72px 0 64px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.32em',
            textTransform: 'uppercase', color: '#b8a0ff', marginBottom: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          }}>
            <span style={{ width: '28px', height: '1px', background: '#b8a0ff', display: 'inline-block' }} />
            {yearScope === 'all' ? 'Your Archive' : `Your ${yearScope} Wrapped`}
            <span style={{ width: '28px', height: '1px', background: '#b8a0ff', display: 'inline-block' }} />
          </div>

          {stats ? (
            <BigNumber
              value={heroCount}
              label={`film${stats.total === 1 ? '' : 's'} & series watched`}
              sub={scopeLabel}
            />
          ) : (
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
              Nothing logged {yearScope === 'all' ? 'yet' : `in ${yearScope}`}.
            </div>
          )}
        </section>

        {stats && (
          <>
            {/* ── Quick stats row ── */}
            <AnimSection delay={100} style={{ marginBottom: '80px' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px',
              }}>
                {[
                  { icon: <Film size={15} />, value: stats.movies, label: 'Movies' },
                  { icon: <Tv size={15} />,   value: stats.series,  label: 'Series' },
                  ...(stats.totalHrs > 0 ? [{ icon: <Clock size={15} />, value: `~${stats.totalHrs}h`, label: 'Watched' }] : []),
                  ...(stats.rewatches > 0 ? [{ icon: <RefreshCw size={15} />, value: stats.rewatches, label: 'Rewatches' }] : []),
                  ...(stats.streak.days > 1 ? [{ icon: <Flame size={15} />, value: `${stats.streak.days}d`, label: 'Best streak' }] : []),
                ].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '20px 12px',
                    background: 'var(--surface)', border: '1px solid var(--border-card)',
                    borderRadius: '16px',
                    animation: `popIn 0.5s ease ${200 + i * 80}ms both`,
                  }}>
                    <div style={{ color: '#b8a0ff' }}>{s.icon}</div>
                    <div style={{ fontFamily: 'var(--ff-display)', fontSize: '28px', fontWeight: 400, letterSpacing: '-0.02em', color: '#fff' }}>
                      {s.value}
                    </div>
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </AnimSection>

            {/* ── Hours trivia ── */}
            {stats.totalHrs > 0 && (() => {
              const walkingKm = Math.round(stats.totalHrs * 5)
              const WALK_ROUTES = [
                { label: 'Mumbai → Delhi',             km: 1400  },
                { label: 'London → Rome',              km: 1871  },
                { label: 'New York → Los Angeles',     km: 4488  },
                { label: 'London → New York',          km: 5570  },
                { label: 'Mumbai → London',            km: 7193  },
                { label: 'Tokyo → Sydney',             km: 7823  },
                { label: 'Cape Town → London',         km: 9671  },
                { label: 'New York → Sydney',          km: 16232 },
                { label: 'London → Sydney',            km: 16993 },
              ]
              const closestRoute = WALK_ROUTES.reduce((best, r) =>
                Math.abs(r.km - walkingKm) < Math.abs(best.km - walkingKm) ? r : best
              )
              const trivia = [
                { label: 'days of non-stop watching',                                     value: Math.round(stats.totalHrs / 24) },
                { label: 'full Marvel Cinematic Universe marathons',                      value: Math.floor(stats.totalHrs / 50) },
                { label: `km walked — roughly ${closestRoute.label}`,         value: walkingKm },
                { label: 'nights of sleep you could\'ve had instead',                 value: Math.round(stats.totalHrs / 8) },
              ].filter(t => t.value >= 1)
              if (!trivia.length) return null
              return (
                <AnimSection delay={0} style={{ marginBottom: '80px' }}>
                  <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border-card)',
                    borderRadius: '20px', padding: '28px 32px',
                    display: 'flex', flexDirection: 'column', gap: '16px',
                  }}>
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
                      ~{stats.totalHrs}h is also…
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {trivia.map((t, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'baseline', gap: '10px',
                          animation: `fadeUp 0.45s ease ${i * 70}ms both`,
                        }}>
                          <span style={{
                            fontFamily: 'var(--ff-display)', fontSize: '28px', fontWeight: 400,
                            letterSpacing: '-0.01em', color: i === 0 ? '#82ff1f' : '#b8a0ff',
                            lineHeight: 1, flexShrink: 0,
                          }}>
                            {t.value.toLocaleString()}
                          </span>
                          <span style={{
                            fontFamily: 'var(--ff-body)', fontSize: '13px',
                            color: 'rgba(255,255,255,0.4)', lineHeight: 1.3,
                          }}>
                            {t.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimSection>
              )
            })()}

            {/* ── Section filter toggle (Genre / Vibe / Timeline) ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '40px' }}>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginRight: '4px' }}>
                Filter
              </span>
              {(['all', 'movie', 'series'] as const).map(f => {
                const on = sectionFilter === f
                const labels = { all: 'All', movie: 'Movies', series: 'Series' }
                return (
                  <button key={f} onClick={() => setSectionFilter(f)} style={{
                    padding: '5px 14px', borderRadius: '100px', cursor: 'pointer',
                    border: `1px solid ${on ? 'rgba(130,255,31,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: on ? 'rgba(130,255,31,0.1)' : 'transparent',
                    color: on ? '#82ff1f' : 'rgba(255,255,255,0.35)',
                    fontSize: '11px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
                    textTransform: 'uppercase', transition: 'all 0.18s',
                  }}>
                    {labels[f]}
                  </button>
                )
              })}
            </div>

            {/* ── Top Genre ── */}
            {stats.topGenre && (
              <AnimSection delay={0} style={{ marginBottom: '80px' }} onVisible={() => setGenreVisible(true)}>
                <SectionLabel>Your Top Genre</SectionLabel>
                <div style={{
                  position: 'relative', borderRadius: '20px', overflow: 'hidden',
                  padding: '48px 36px',
                  background: `linear-gradient(135deg, rgba(5,5,5,0.95) 0%, ${genreColor(stats.topGenre[0])}18 100%)`,
                  border: `1px solid ${genreColor(stats.topGenre[0])}30`,
                }}>
                  {/* Big genre name background watermark */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontFamily: 'var(--ff-display)', fontWeight: 400,
                    fontSize: 'clamp(5rem, 20vw, 10rem)', letterSpacing: '0.04em', textTransform: 'uppercase',
                    color: genreColor(stats.topGenre[0]),
                    opacity: 0.06, whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
                  } as React.CSSProperties}>
                    {stats.topGenre[0]}
                  </div>

                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div>
                      <div style={{
                        fontFamily: 'var(--ff-display)', fontWeight: 400,
                        fontSize: 'clamp(2.5rem, 10vw, 5rem)', letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: genreColor(stats.topGenre[0]),
                        lineHeight: 1,
                      }}>
                        {stats.topGenre[0]}
                      </div>
                      <div style={{
                        fontFamily: 'var(--ff-mono)', fontSize: '12px', letterSpacing: '0.14em',
                        color: 'rgba(255,255,255,0.35)', marginTop: '10px',
                      }}>
                        {stats.topGenre[1]} {stats.topGenre[1] === 1 ? 'entry' : 'entries'} · your most-watched genre
                      </div>
                    </div>

                    {/* Rest of genres */}
                    {stats.topGenres.length > 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {stats.topGenres.slice(1).map(([genre, cnt], i) => (
                          <BarRow
                            key={genre}
                            rank={i + 2}
                            label={genre}
                            value={cnt}
                            max={stats.topGenre![1]}
                            color={genreColor(genre)}
                            animate={genreVisible}
                            staggerIndex={i}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </AnimSection>
            )}

            {/* ── How You Felt ── */}
            {stats.vibeCounts.length > 0 && (
              <AnimSection delay={0} style={{ marginBottom: '80px' }} onVisible={() => setVibeVisible(true)}>
                <SectionLabel>How You Felt</SectionLabel>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border-card)',
                  borderRadius: '20px', padding: '36px 32px',
                  display: 'flex', flexDirection: 'column', gap: '28px',
                }}>
                  {/* Big top vibe */}
                  {(() => {
                    const topVibeEntry = stats.vibeCounts[0]
                    const vibe         = VIBES.find(v => v.key === topVibeEntry[0])
                    if (!vibe) return null
                    const pct = Math.round((topVibeEntry[1] / (stats.vibeTotal || 1)) * 100)
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize: '40px', lineHeight: 1 }}>{vibe.emoji}</span>
                        <div>
                          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '28px', fontWeight: 400, color: vibe.color, letterSpacing: '0.02em' }}>
                            {vibe.label}
                          </div>
                          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', letterSpacing: '0.12em' }}>
                            Your most common feeling · {pct}% of rated entries
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* All vibes bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {VIBES.map((vibe, i) => {
                      const entry = stats.vibeCounts.find(([k]) => k === vibe.key)
                      if (!entry) return null
                      const maxVibeCount = stats.vibeCounts[0]?.[1] ?? 1
                      return (
                        <BarRow
                          key={vibe.key}
                          emoji={vibe.emoji}
                          label={vibe.label}
                          value={entry[1]}
                          max={maxVibeCount}
                          color={vibe.color}
                          animate={vibeVisible}
                          staggerIndex={i}
                        />
                      )
                    })}
                  </div>
                </div>
              </AnimSection>
            )}

            {/* ── TMDB Rating vs Your Vibe ── */}
            {stats.vibeVsRating.length > 1 && (
              <AnimSection delay={0} style={{ marginBottom: '80px' }} onVisible={() => setRatingVisible(true)}>
                <SectionLabel>Did Critics Agree With You?</SectionLabel>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border-card)',
                  borderRadius: '20px', padding: '36px 32px',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                }}>
                  <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em', marginBottom: '4px' }}>
                    Average TMDB score per feeling
                  </div>
                  {stats.vibeVsRating.map((row, i) => {
                    const vibe = VIBES.find(v => v.key === row.vibe)
                    if (!vibe) return null
                    const pct = ratingVisible ? (row.avgRating / 10) * 100 : 0
                    const barDelay = i * 80
                    return (
                      <div key={row.vibe} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        opacity: ratingVisible ? 1 : 0,
                        transform: ratingVisible ? 'translateX(0)' : 'translateX(-8px)',
                        transition: `opacity 0.4s ease ${barDelay}ms, transform 0.4s ease ${barDelay}ms`,
                      }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{vibe.emoji}</span>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ fontFamily: 'var(--ff-body)', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{vibe.label}</span>
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: '#fbbf24', flexShrink: 0 }}>★ {row.avgRating}</span>
                          </div>
                          <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${pct}%`, borderRadius: '2px',
                              background: `linear-gradient(90deg, ${vibe.color}80, ${vibe.color})`,
                              transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${barDelay + 100}ms`,
                            }} />
                          </div>
                        </div>
                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.2)', flexShrink: 0, width: '40px', textAlign: 'right' }}>
                          {row.count} rated
                        </span>
                      </div>
                    )
                  })}
                </div>
              </AnimSection>
            )}

            {/* ── Favourite Person ── */}
            {stats.topPeople.length > 0 && (
              <AnimSection delay={0} style={{ marginBottom: '80px' }}>
                <SectionLabel>A Face You Love</SectionLabel>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border-card)',
                  borderRadius: '20px', overflow: 'hidden',
                }}>
                  {/* Top person hero */}
                  {(() => {
                    const { person, count: cnt } = stats.topPeople[0]
                    return (
                      <div style={{
                        padding: '40px 32px',
                        background: 'linear-gradient(135deg, rgba(184,160,255,0.06) 0%, transparent 100%)',
                        display: 'flex', alignItems: 'center', gap: '24px',
                        borderBottom: stats.topPeople.length > 1 ? '1px solid rgba(255,255,255,0.06)' : undefined,
                      }}>
                        <div style={{
                          width: '80px', height: '80px', borderRadius: '50%',
                          overflow: 'hidden', flexShrink: 0,
                          border: '2px solid rgba(184,160,255,0.35)',
                          background: '#0a0a0a',
                        }}>
                          {person.profile_url
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={person.profile_url} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👤</div>
                          }
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontWeight: 400, letterSpacing: '0.02em', color: '#fff' }}>
                            {person.name}
                          </div>
                          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', letterSpacing: '0.1em' }}>
                            {person.role}
                          </div>
                          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: '#b8a0ff', marginTop: '8px', letterSpacing: '0.12em' }}>
                            appeared in {cnt} {cnt === 1 ? 'entry' : 'entries'}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                  {/* Runner-ups */}
                  {stats.topPeople.slice(1).map(({ person, count: cnt }, i) => (
                    <div key={person.id} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '16px 32px',
                      borderBottom: i < stats.topPeople.length - 2 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                    }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {person.profile_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={person.profile_url} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{person.name}</div>
                        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{person.role}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                        ×{cnt}
                      </div>
                    </div>
                  ))}
                </div>
              </AnimSection>
            )}

            {/* ── Monthly Timeline ── */}
            {stats.monthEntries.length > 1 && (
              <AnimSection delay={0} style={{ marginBottom: '80px' }} onVisible={() => setTimelineVisible(true)}>
                <SectionLabel>When You Watched</SectionLabel>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border-card)',
                  borderRadius: '20px', padding: '36px 32px',
                }}>
                  {/* Peak month callout */}
                  {stats.peakMonth[0] && (
                    <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                      <span style={{ fontFamily: 'var(--ff-display)', fontSize: '42px', fontWeight: 400, letterSpacing: '-0.01em', color: '#82ff1f', lineHeight: 1 }}>
                        {MONTHS[Number(stats.peakMonth[0].slice(5, 7)) - 1]}
                      </span>
                      <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                        Your most active month · {stats.peakMonth[1]} {stats.peakMonth[1] === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>
                  )}

                  {/* Bar chart */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {stats.monthEntries.map(([ym, cnt], i) => {
                      const [year, monthIdx] = [ym.slice(0, 4), Number(ym.slice(5, 7)) - 1]
                      const label = `${MONTHS[monthIdx]} ${yearScope === 'all' ? year : ''}`
                      const isPeak = ym === stats.peakMonth[0]
                      return (
                        <BarRow
                          key={ym}
                          label={label.trim()}
                          value={cnt}
                          max={stats.peakMonth[1]}
                          color={isPeak ? '#82ff1f' : 'rgba(184,160,255,0.5)'}
                          animate={timelineVisible}
                          staggerIndex={i}
                        />
                      )
                    })}
                  </div>
                </div>
              </AnimSection>
            )}

            {/* ── Day-of-Week Heatmap ── */}
            {stats.dayOfWeekCounts.some(d => d.count > 0) && (
              <AnimSection delay={0} style={{ marginBottom: '80px' }} onVisible={() => setDowVisible(true)}>
                <SectionLabel>Your Watching Rhythm</SectionLabel>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border-card)',
                  borderRadius: '20px', padding: '36px 32px',
                }}>
                  {/* Peak day callout */}
                  {(() => {
                    const peak = [...stats.dayOfWeekCounts].sort((a, b) => b.count - a.count)[0]
                    return (
                      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                        <span style={{ fontFamily: 'var(--ff-display)', fontSize: '42px', fontWeight: 400, letterSpacing: '-0.01em', color: '#82ff1f', lineHeight: 1 }}>
                          {peak.label}
                        </span>
                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                          Your most active day · {peak.count} {peak.count === 1 ? 'watch' : 'watches'}
                        </span>
                      </div>
                    )
                  })()}
                  {/* 7-bar chart */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
                    {stats.dayOfWeekCounts.map((day, i) => {
                      const maxCount = Math.max(...stats.dayOfWeekCounts.map(d => d.count))
                      const pct = dowVisible && maxCount > 0 ? (day.count / maxCount) * 100 : 0
                      const isPeak = day.count === maxCount
                      return (
                        <div key={day.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: isPeak ? '#82ff1f' : 'rgba(255,255,255,0.2)' }}>
                            {day.count}
                          </span>
                          <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: isPeak ? '#82ff1f' : 'rgba(184,160,255,0.35)', height: `${pct}%`, minHeight: day.count > 0 ? '4px' : '0', transition: `height 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 60}ms` }} />
                          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: isPeak ? '#82ff1f' : 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>
                            {day.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </AnimSection>
            )}

            {/* ── Decade Breakdown ── */}
            {stats.decadeCounts.length > 0 && (
              <AnimSection delay={0} style={{ marginBottom: '80px' }} onVisible={() => setDecadeVisible(true)}>
                <SectionLabel>Through The Decades</SectionLabel>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border-card)',
                  borderRadius: '20px', padding: '36px 32px',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                }}>
                  {stats.decadeCounts.map(([decade, cnt], i) => {
                    const maxCnt = stats.decadeCounts[0]?.[1] ?? 1
                    const current = new Date().getFullYear()
                    const isThisDecade = decade !== 'Pre‑70s' && Math.floor(current / 10) * 10 === Number(decade.replace('s', ''))
                    const color = isThisDecade ? '#82ff1f' : `hsl(${260 + i * 15}, 60%, 70%)`
                    return (
                      <BarRow
                        key={decade}
                        rank={i + 1}
                        label={decade + (isThisDecade ? ' ← now' : '')}
                        value={cnt}
                        max={maxCnt}
                        color={color}
                        animate={decadeVisible}
                        staggerIndex={i}
                      />
                    )
                  })}
                </div>
              </AnimSection>
            )}

            {/* ── Platform DNA ── */}
            {stats.platformCounts.length > 0 && (
              <AnimSection delay={0} style={{ marginBottom: '80px' }} onVisible={() => setPlatformVisible(true)}>
                <SectionLabel>Platform DNA</SectionLabel>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border-card)',
                  borderRadius: '20px', padding: '36px 32px',
                  display: 'flex', flexDirection: 'column', gap: '20px',
                }}>
                  {/* Top platform hero */}
                  {(() => {
                    const [key, cnt] = stats.platformCounts[0]
                    const platform   = PLATFORMS.find(p => p.key === key)
                    if (!platform) return null
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {platform.logo
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={platform.logo} alt={platform.label} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }} />
                            : <span style={{ fontSize: '24px' }}>{platform.emoji}</span>
                          }
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', fontWeight: 400, letterSpacing: '0.02em' }}>
                            {platform.label}
                          </div>
                          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', letterSpacing: '0.12em' }}>
                            Your go-to · {cnt} {cnt === 1 ? 'watch' : 'watches'}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Platform bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stats.platformCounts.map(([key, cnt], i) => {
                      const platform = PLATFORMS.find(p => p.key === key)
                      const maxCount = stats.platformCounts[0][1]
                      const pct      = maxCount > 0 ? (cnt / maxCount) * 100 : 0
                      return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Rank */}
                          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.2)', width: '16px', textAlign: 'right', flexShrink: 0 }}>
                            {i + 1}
                          </span>
                          {/* Icon — logo img or styled emoji box */}
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                            background: '#111', border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                          }}>
                            {platform?.logo
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={platform.logo} alt={platform.label} style={{ width: '16px', height: '16px', objectFit: 'contain', borderRadius: '3px' }} />
                              : <span style={{ fontSize: '13px', lineHeight: 1 }}>{platform?.emoji ?? '▶️'}</span>
                            }
                          </div>
                          {/* Label + bar */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <span style={{ fontFamily: 'var(--ff-body)', fontSize: '13px', color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {platform?.label ?? key}
                              </span>
                              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                                {cnt}
                              </span>
                            </div>
                            <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${platformVisible ? pct : 0}%`, borderRadius: '2px', background: 'rgba(184,160,255,0.7)', transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${i * 80 + 100}ms` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </AnimSection>
            )}

            {/* ── What Draws You ── */}
            {stats.drawCounts.length > 0 && (
              <AnimSection delay={0} style={{ marginBottom: '80px' }} onVisible={() => setDrawsVisible(true)}>
                <SectionLabel>What Makes You Hit Play</SectionLabel>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border-card)',
                  borderRadius: '20px', padding: '36px 32px',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                }}>
                  {stats.drawCounts.map(([key, cnt], i) => {
                    const draw = DRAWS.find(d => d.key === key)
                    return (
                      <BarRow
                        key={key}
                        rank={i + 1}
                        emoji={draw?.emoji}
                        label={draw?.label ?? key}
                        value={cnt}
                        max={stats.drawCounts[0][1]}
                        color={i === 0 ? '#82ff1f' : 'rgba(130,255,31,0.45)'}
                        animate={drawsVisible}
                        staggerIndex={i}
                      />
                    )
                  })}
                </div>
              </AnimSection>
            )}

            {/* ── Actors You Loved — loved/masterpiece movies, no rewatches ── */}
            {stats.topActors.length > 0 && (
              <AnimSection delay={0} style={{ marginBottom: '80px' }}>
                <SectionLabel>Actors You Loved</SectionLabel>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '1px',
                  border: '1px solid var(--border-card)', borderRadius: '20px', overflow: 'hidden',
                }}>
                  {stats.topActors.map(([name, cnt], i) => (
                    <div key={name} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 28px',
                      background: i === 0 ? 'rgba(130,255,31,0.05)' : 'var(--surface)',
                      borderBottom: i < stats.topActors.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                      animation: `fadeUp 0.45s ease ${i * 70}ms both`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.2)', width: '16px', flexShrink: 0 }}>
                          {i + 1}
                        </span>
                        {/* Initials avatar */}
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          background: i === 0 ? 'rgba(130,255,31,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${i === 0 ? 'rgba(130,255,31,0.3)' : 'rgba(255,255,255,0.08)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.05em',
                          color: i === 0 ? '#82ff1f' : 'rgba(255,255,255,0.3)',
                          fontWeight: 600,
                        }}>
                          {name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                        <div style={{
                          fontFamily: 'var(--ff-body)', fontSize: '14px',
                          fontWeight: i === 0 ? 600 : 400,
                          color: i === 0 ? '#fff' : 'rgba(255,255,255,0.65)',
                        }}>
                          {name}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: i === 0 ? '#82ff1f' : 'rgba(255,255,255,0.25)' }}>
                        {cnt} {cnt === 1 ? 'film' : 'films'}
                      </div>
                    </div>
                  ))}
                </div>
              </AnimSection>
            )}

            {/* ── Top Directors — loved/masterpiece movies, no rewatches ── */}
            {stats.topDirectors.length > 0 && (
              <AnimSection delay={0} style={{ marginBottom: '80px' }}>
                <SectionLabel>Directors You Trust</SectionLabel>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '1px',
                  border: '1px solid var(--border-card)', borderRadius: '20px', overflow: 'hidden',
                }}>
                  {stats.topDirectors.map(([name, cnt], i) => (
                    <div key={name} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 28px',
                      background: i === 0 ? 'rgba(184,160,255,0.06)' : 'var(--surface)',
                      borderBottom: i < stats.topDirectors.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                      animation: `fadeUp 0.45s ease ${i * 70}ms both`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.2)', width: '16px' }}>
                          {i + 1}
                        </span>
                        <div style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.65)' }}>
                          {name}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: i === 0 ? '#b8a0ff' : 'rgba(255,255,255,0.25)' }}>
                        {cnt} {cnt === 1 ? 'film' : 'films'}
                      </div>
                    </div>
                  ))}
                </div>
              </AnimSection>
            )}

            {/* ── Share card modal ── */}
            {shareOpen && stats && (
              <ShareCardModal
                stats={stats}
                scopeLabel={scopeLabel}
                yearScope={yearScope}
                onClose={() => setShareOpen(false)}
              />
            )}

            {/* ── Footer signature ── */}
            <AnimSection delay={0} style={{ textAlign: 'center', paddingTop: '20px' }}>
              <div style={{
                fontFamily: 'var(--ff-display)', fontWeight: 400,
                fontSize: 'clamp(2.5rem, 10vw, 5rem)', letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'linear-gradient(135deg, rgba(184,160,255,0.4) 0%, rgba(130,255,31,0.3) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                lineHeight: 1,
              } as React.CSSProperties}>
                Wrapped
              </div>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.15)', marginTop: '10px', textTransform: 'uppercase' }}>
                {scopeLabel} · {stats.total} entries
              </div>
            </AnimSection>
          </>
        )}
      </div>
    </div>
  )
}
