'use client'
import { useState, useEffect } from 'react'
import { motion, useDragControls, AnimatePresence } from 'framer-motion'
import SectionFooter from '@/components/layout/SectionFooter'
import { Play, Pause, GripHorizontal } from 'lucide-react'

// ── Shared hover tooltip ───────────────────────────────────────────────────────
function DragTooltip({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.94 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'absolute', bottom: 'calc(100% + 10px)',
            left: '50%', transform: 'translateX(-50%)',
            whiteSpace: 'nowrap', zIndex: 300,
            padding: '5px 12px', borderRadius: 999,
            background: 'rgba(20,20,20,0.9)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 11,
            fontFamily: 'var(--ff-mono)',
            letterSpacing: '0.14em',
            pointerEvents: 'none',
          }}
        >
          ✦ drag to move
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Photo card configs ─────────────────────────────────────────────────────────
type PhotoCard = {
  id: number
  src?: string
  gradient: string
  w: number; h: number; rotate: number
  pos: React.CSSProperties
}

const PHOTOS: PhotoCard[] = [
  // Left edge — top & bottom corners
  { id:1, gradient:'linear-gradient(145deg,#0d1b2a,#1b4f72)', w:190, h:230, rotate:-10, pos:{top:'4%',    left:'-40px'}  },
  { id:2, gradient:'linear-gradient(145deg,#1a0533,#6c3483)', w:168, h:208, rotate:8,   pos:{bottom:'4%', left:'-35px'}  },
  // Right edge — top & bottom corners
  { id:3, gradient:'linear-gradient(145deg,#1c1c1c,#3d3d3d)', w:200, h:248, rotate:9,   pos:{top:'3%',    right:'-40px'} },
  { id:4, gradient:'linear-gradient(145deg,#0b2545,#1a5276)', w:175, h:218, rotate:-8,  pos:{bottom:'3%', right:'-38px'} },
  // Top edge — center spread
  { id:5, gradient:'linear-gradient(145deg,#2c1654,#8e44ad)', w:165, h:205, rotate:-6,  pos:{top:'-28px', left:'20%'} },
  { id:6, gradient:'linear-gradient(145deg,#1a3a1a,#27ae60)', w:158, h:195, rotate:7,   pos:{top:'-24px', right:'20%'} },
  // Bottom edge — wide apart so they don't overlap
  { id:7, gradient:'linear-gradient(145deg,#0b3d0b,#1e8449)', w:160, h:198, rotate:-5,  pos:{bottom:'-26px', left:'10%'} },
  { id:8, gradient:'linear-gradient(145deg,#4a1942,#c0392b)', w:152, h:188, rotate:6,   pos:{bottom:'-22px', right:'10%'} },
]

// ── Shared drag config ─────────────────────────────────────────────────────────
const dragProps = {
  drag: true as const,
  dragMomentum: false as const,
  whileDrag: { scale: 1.07, zIndex: 200 },
}

// ── Photo card ─────────────────────────────────────────────────────────────────
function PhotoCard({ card, scale, onFirstDrag }: { card: PhotoCard; scale: number; onFirstDrag: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      {...dragProps}
      onDragStart={onFirstDrag}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: card.id * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute', ...card.pos,
        width: card.w * scale, height: card.h * scale,
        rotate: `${card.rotate}deg`,
        cursor: 'grab', zIndex: 10 + card.id,
        borderRadius: 14,
        background: card.gradient,
        border: '2px solid rgba(255,255,255,0.07)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
        overflow: 'visible',
      }}
    >
      <DragTooltip visible={hovered} />
      <div style={{ width: '100%', height: '100%', borderRadius: 14, overflow: 'hidden' }}>
        {card.src ? (
          <img src={card.src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none', userSelect:'none' }} />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize: 28, opacity: 0.18 }}>📸</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Music player card ──────────────────────────────────────────────────────────
const SPOTIFY_TRACKS = [
  '0VjIjW4GlUZAMYd2vXMi3b', // Blinding Lights – The Weeknd
  '7qiZfU4dY1lWllzX7mPBI3', // Shape of You – Ed Sheeran
]

function MusicCard({ trackId, pos, rotate, delay, scale, onFirstDrag }: {
  trackId: string
  pos: React.CSSProperties
  rotate: string
  delay: number
  scale: number
  onFirstDrag: () => void
}) {
  const controls = useDragControls()
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      whileDrag={{ scale: 1.07, zIndex: 200 }}
      onDragStart={onFirstDrag}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', ...pos, rotate, zIndex: 22 }}
    >
      <div style={{ width: 280 * scale, borderRadius: 16, overflow: 'visible', boxShadow: '0 24px 64px rgba(0,0,0,0.7)', position: 'relative' }}>
        <div
          onPointerDown={e => { controls.start(e); onFirstDrag() }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            cursor: 'grab',
            background: '#1a1a1a',
            borderRadius: '16px 16px 0 0',
            border: '1px solid rgba(255,255,255,0.07)',
            borderBottom: 'none',
            padding: '8px 0 6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            userSelect: 'none',
            position: 'relative',
          }}
        >
          <DragTooltip visible={hovered} />
          <GripHorizontal size={14} color="rgba(255,255,255,0.25)" />
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'var(--ff-mono)', letterSpacing: '0.16em' }}>
            DRAG
          </span>
        </div>
        <div style={{ borderRadius: '0 0 16px 16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none' }}>
          <iframe
            src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
            width={280 * scale}
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ display: 'block' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ── Video card ─────────────────────────────────────────────────────────────────
function VideoCard({ pos, rotate, delay, gradient, scale, onFirstDrag }: {
  pos: React.CSSProperties
  rotate: string
  delay: number
  gradient: string
  scale: number
  onFirstDrag: () => void
}) {
  const [playing, setPlaying] = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      {...dragProps}
      onDragStart={onFirstDrag}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position:'absolute', ...pos, rotate, zIndex:22,
        cursor:'grab', width:148 * scale, height:192 * scale, borderRadius:14, overflow:'visible',
        boxShadow:'0 20px 55px rgba(0,0,0,0.6)',
        background:'#111',
      }}
    >
      <DragTooltip visible={hovered} />
      <div style={{ width:'100%', height:'100%', borderRadius:14, overflow:'hidden', border:'2px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width:'100%', height:'100%', background: gradient, position:'relative' }}>
          <button
            onClick={e => { e.stopPropagation(); setPlaying(p => !p) }}
            style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer' }}
          >
            <div style={{
              width:44, height:44, borderRadius:'50%',
              background:'rgba(255,255,255,0.15)', backdropFilter:'blur(4px)',
              display:'flex', alignItems:'center', justifyContent:'center',
              border:'1px solid rgba(255,255,255,0.2)',
            }}>
              {playing ? <Pause size={18} color="#fff" /> : <Play size={18} color="#fff" />}
            </div>
          </button>
          <div style={{ position:'absolute', bottom:8, left:8, right:8 }}>
            <div style={{ height:2, background:'rgba(255,255,255,0.15)', borderRadius:2 }}>
              {playing && (
                <motion.div
                  animate={{ width:'100%' }} initial={{ width:'0%' }}
                  transition={{ duration:30, ease:'linear' }}
                  style={{ height:'100%', background:'#fff', borderRadius:2 }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function Connect() {
  const [dragged, setDragged] = useState(false)
  const onFirstDrag = () => setDragged(true)

  const [scale, setScale] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setScale(mobile ? 0.85 : 1)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div
      id="connect"
      className="snap-section"
      style={{ '--section-bg': '#060508', '--section-orb': 'rgba(200,20,20,0.14)' } as React.CSSProperties}
    >
      {/* Background */}
      <div className="dot-grid absolute inset-0 z-0" />
      <div className="vignette absolute inset-0 z-0" />
      <div className="red-orb absolute z-0" style={{ top: '-120px', right: '-120px' }} />
      <div className="section-watermark select-none" style={{ bottom: '-2rem', right: '-1rem' }}>06</div>

      {/* ── Photo cards ── */}
      {PHOTOS.map(card => <PhotoCard key={card.id} card={card} scale={scale} onFirstDrag={onFirstDrag} />)}

      {/* ── Music cards — desktop only ── */}
      {!isMobile && (
        <>
          <MusicCard
            trackId={SPOTIFY_TRACKS[0]}
            pos={{ top: '18%', left: '-20px' }}
            rotate="-3deg"
            delay={0.5}
            scale={scale}
            onFirstDrag={onFirstDrag}
          />
          <MusicCard
            trackId={SPOTIFY_TRACKS[1]}
            pos={{ bottom: '12%', right: '-20px' }}
            rotate="4deg"
            delay={0.65}
            scale={scale}
            onFirstDrag={onFirstDrag}
          />
        </>
      )}

      {/* ── Video cards ── */}
      <VideoCard
        pos={{ top: '38%', left: '-22px' }}
        rotate="-5deg"
        delay={0.7}
        gradient="linear-gradient(145deg,#1a1a2e,#e94560)"
        scale={scale}
        onFirstDrag={onFirstDrag}
      />
      <VideoCard
        pos={{ top: '35%', right: '-22px' }}
        rotate="6deg"
        delay={0.8}
        gradient="linear-gradient(145deg,#0f2027,#2c5364)"
        scale={scale}
        onFirstDrag={onFirstDrag}
      />
      <VideoCard
        pos={{ top: '-24px', left: '44%' }}
        rotate="4deg"
        delay={0.9}
        gradient="linear-gradient(145deg,#3d0c02,#c0392b)"
        scale={scale}
        onFirstDrag={onFirstDrag}
      />

      {/* ── Centre CTA ── */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        textAlign:'center', zIndex:50, userSelect:'none',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <div style={{
            fontFamily: 'var(--ff-mono)',
            fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: 6,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
          }}>
            Connect on
          </div>
          <div style={{
            fontFamily: 'var(--ff-display)',
            fontSize: 'clamp(2.8rem, 8vw, 6rem)',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            textTransform: 'uppercase'
          }}>
            Instagram
          </div>
          <p style={{
            color: 'rgba(255,255,255,0.28)',
            fontSize: 13,
            fontFamily: 'var(--ff-body)',
            marginTop: 10,
            lineHeight: 1.65,
          }}>
            Art — digital &amp; traditional. Travel. The in-between moments.<br />
            Life through a maker's eye.
          </p>
          <a
            href="https://www.instagram.com/riaz.hooman"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: 22 }}
          >
            <motion.div
              whileHover={{ background: 'rgba(255,255,255,0.1)', scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '11px 30px', borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff', fontSize: 13,
                fontFamily: 'var(--ff-body)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                letterSpacing: '0.04em',
              }}
            >
              Follow me →
            </motion.div>
          </a>
        </motion.div>
      </div>

      <SectionFooter current={6} />
    </div>
  )
}
