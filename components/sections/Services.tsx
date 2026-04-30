'use client'
import { useState } from 'react'
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
// Replace `src` with your real Instagram photos once added to /public/assets/img/gram/
type PhotoCard = {
  id: number
  src?: string
  gradient: string
  w: number; h: number; rotate: number
  pos: React.CSSProperties
}

const PHOTOS: PhotoCard[] = [
  { id:1, gradient:'linear-gradient(145deg,#0d1b2a,#1b4f72)', w:185, h:225, rotate:-9,  pos:{top:'7%',  left:'3%'}  },
  { id:2, gradient:'linear-gradient(145deg,#1a0533,#6c3483)', w:162, h:200, rotate:7,   pos:{top:'58%', left:'4%'}  },
  { id:3, gradient:'linear-gradient(145deg,#1c1c1c,#3d3d3d)', w:196, h:240, rotate:8,   pos:{top:'5%',  right:'3%'} },
  { id:4, gradient:'linear-gradient(145deg,#0b2545,#1a5276)', w:170, h:212, rotate:-7,  pos:{top:'55%', right:'4%'} },
  { id:5, gradient:'linear-gradient(145deg,#0b3d0b,#1e8449)', w:155, h:192, rotate:-4,  pos:{bottom:'11%',left:'23%'} },
  { id:6, gradient:'linear-gradient(145deg,#4a1942,#c0392b)', w:148, h:182, rotate:5,   pos:{bottom:'9%', right:'18%'} },
]

// ── Shared drag config ─────────────────────────────────────────────────────────
const dragProps = {
  drag: true as const,
  dragMomentum: false as const,
  whileDrag: { scale: 1.07, zIndex: 200 },
}

// ── Photo card ─────────────────────────────────────────────────────────────────
function PhotoCard({ card, onFirstDrag }: { card: PhotoCard; onFirstDrag: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      {...dragProps}
      onDragStart={onFirstDrag}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: card.id * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute', ...card.pos,
        width: card.w, height: card.h,
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

// ── Music player card — real Spotify embed ─────────────────────────────────────
// To change the track: update SPOTIFY_TRACK_ID below.
// Grab the ID from a Spotify share link: open.spotify.com/track/TRACK_ID
const SPOTIFY_TRACK_ID = '0VjIjW4GlUZAMYd2vXMi3b' // Blinding Lights – The Weeknd

function MusicCard({ onFirstDrag }: { onFirstDrag: () => void }) {
  const controls = useDragControls()
  const [hovered, setHovered] = useState(false)

  return (
    // dragListener={false} → iframe stays interactive; only the handle starts drag
    <motion.div
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      whileDrag={{ scale: 1.07, zIndex: 200 }}
      onDragStart={onFirstDrag}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'absolute', top: '19%', left: '14%', rotate: '-3deg', zIndex: 22 }}
    >
      <div style={{
        width: 300, borderRadius: 16, overflow: 'visible',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        position: 'relative',
      }}>
        {/* ── Drag handle — touch here to move ── */}
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

        {/* ── Spotify iframe ── */}
        <div style={{ borderRadius: '0 0 16px 16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none' }}>
          <iframe
            src={`https://open.spotify.com/embed/track/${SPOTIFY_TRACK_ID}?utm_source=generator&theme=0`}
            width="300"
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
function VideoCard({ onFirstDrag }: { onFirstDrag: () => void }) {
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
      transition={{ delay: 0.7, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position:'absolute', top:'18%', right:'14%', rotate:'4deg', zIndex:22,
        cursor:'grab', width:155, height:200, borderRadius:14, overflow:'visible',
        boxShadow:'0 20px 55px rgba(0,0,0,0.6)',
        background:'#111',
      }}
    >
      <DragTooltip visible={hovered} />
      <div style={{ width:'100%', height:'100%', borderRadius:14, overflow:'hidden', border:'2px solid rgba(255,255,255,0.08)' }}>
      {/* Swap the gradient div for <video src="/assets/vid/clip.mp4" ref={...} /> when ready */}
      <div style={{ width:'100%', height:'100%', background:'linear-gradient(145deg,#1a1a2e,#e94560)', position:'relative' }}>
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
        {/* Progress scrubber */}
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

      {/* Scattered photo cards */}
      {PHOTOS.map(card => <PhotoCard key={card.id} card={card} onFirstDrag={onFirstDrag} />)}

      {/* Interactive cards */}
      <MusicCard onFirstDrag={onFirstDrag} />
      <VideoCard onFirstDrag={onFirstDrag} />

      {/* Centre — Instagram CTA */}
      <div style={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        textAlign:'center', zIndex:5, userSelect:'none',
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
