'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function ShopSections() {
  const aboutRef    = useRef<HTMLDivElement>(null)
  const [photo, setPhoto] = useState<string>('')

  useEffect(() => {
    fetch('/api/shop/settings').then(r => r.json()).then(s => {
      if (s.artist_photo_url) setPhoto(s.artist_photo_url)
    })
  }, [])

  useEffect(() => {
    const el = aboutRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('shop-visible') },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <style>{`
        .shop-fade { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .shop-visible .shop-fade { opacity: 1; transform: translateY(0); }
        .shop-visible .shop-fade:nth-child(2) { transition-delay: 0.12s; }
        .shop-visible .shop-fade:nth-child(3) { transition-delay: 0.24s; }

        .step-card { border-top: 1px solid var(--border); transition: background 0.2s; }
        .step-card:last-child { border-bottom: 1px solid var(--border); }
        .step-card:hover { background: var(--surface-alt); }
        .shop-follow-btn { transition: background 0.2s, border-color 0.2s, transform 0.2s; }
        .shop-follow-btn:hover { background: rgba(255,255,255,0.12) !important; border-color: rgba(255,255,255,0.4) !important; transform: translateY(-2px); }

        .shop-marquee-track {
          display: flex; white-space: nowrap;
          animation: marquee 18s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      {/* ── Marquee divider ── */}
      <div style={{
        overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        padding: '10px 0', background: 'var(--surface)',
      }}>
        <div className="shop-marquee-track" style={{ alignItems: 'center' }}>
          {Array.from({ length: 2 }).map((_, repeat) =>
            ['Hand-crafted drops', '✦', 'Art that hits different', '◈', 'Limited runs', '★', 'Merch with soul', '✦', 'For the culture', '◈', 'Built for walls & laps & mobiles & many things', '★'].map((item, i) => (
              <span key={`${repeat}-${i}`} style={{
                fontFamily: item.length <= 2 ? 'var(--ff-body)' : 'var(--ff-display)',
                fontSize: item.length <= 2 ? '14px' : '11px',
                letterSpacing: item.length <= 2 ? '0' : '0.2em',
                textTransform: 'uppercase',
                lineHeight: 1,
                color: ['✦', '◈', '★'].includes(item) ? 'var(--lavender)' : i % 3 === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                paddingRight: item.length <= 2 ? '28px' : '36px',
                fontWeight: item.length <= 2 ? 400 : 500,
              }}>
                {item}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── About the Artist ── */}
      <section ref={aboutRef} style={{ padding: '64px 16px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="shop-fade" style={{ marginBottom: '8px' }}>
          <span style={{
            fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--lime)',
          }}>
            ◈ About the artist
          </span>
        </div>

        <div className="shop-fade" style={{
          display: 'grid',
          gridTemplateColumns: photo ? '1fr auto' : '1fr',
          gap: '32px', marginTop: '20px', alignItems: 'end',
        }}>
          <div>
            {/* Big name */}
            <div style={{
              fontFamily: 'var(--ff-display)', fontSize: 'clamp(52px, 16vw, 120px)',
              letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 0.88,
              color: 'var(--text-primary)', userSelect: 'none', marginBottom: '28px',
            }}>
              RIAZ<br />
              <span style={{ color: 'var(--lavender)' }}>
                AHMED
              </span>
            </div>

            {/* Statement */}
            <p style={{
              fontSize: '15px', lineHeight: 1.75, color: 'var(--text-secondary)',
              margin: '0 0 20px', fontStyle: 'italic',
              borderLeft: '2px solid var(--lavender)', paddingLeft: '16px',
              maxWidth: '480px',
            }}>
              "Started drawing because I couldn't find the art I wanted to own. Now I make it — and ship it to you."
            </p>
            <div style={{
              display: 'flex', gap: '8px', flexWrap: 'wrap',
              fontFamily: 'var(--ff-mono)', fontSize: '11px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {['Indie artist', 'Digital to physical', 'Printed on demand'].map((tag, i) => (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: '999px',
                  border: '1px solid rgba(232,255,0,0.3)', color: '#e8ff00',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Artist photo — full cutout */}
          {photo && (
            <div style={{ flexShrink: 0, alignSelf: 'flex-end' }}>
              <img
                src={photo}
                alt="Riaz Ahmed"
                style={{
                  width: 'clamp(100px, 16vw, 180px)',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                  mixBlendMode: 'screen',
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '56px 16px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '36px' }}>
            <span style={{
              fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'var(--lavender)',
            }}>
              ◈ How it works
            </span>
            <h2 style={{
              fontFamily: 'var(--ff-display)', fontSize: 'clamp(22px, 5vw, 36px)',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              margin: '10px 0 0', color: 'var(--text-primary)',
            }}>
              From screen to door
            </h2>
          </div>

          <div>
            {[
              {
                n: '01',
                title: 'Pick your print',
                desc: 'Browse the collection and choose your size. Stickers in 2.5" or 3", posters in A5 or A4.',
                accent: 'var(--lavender)',
              },
              {
                n: '02',
                title: 'Pay via UPI',
                desc: 'Scan the QR code or use the UPI ID. No gateway, no fees — just a direct transfer.',
                accent: 'var(--lime)',
              },
              {
                n: '03',
                title: 'We pack & ship',
                desc: 'Once payment is verified, your order is carefully packed and shipped to your address.',
                accent: 'var(--lavender)',
              },
            ].map(step => (
              <div key={step.n} className="step-card" style={{
                display: 'grid', gridTemplateColumns: '48px 1fr', gap: '20px',
                padding: '20px 12px', cursor: 'default',
              }}>
                <div style={{
                  fontFamily: 'var(--ff-display)', fontSize: '32px', letterSpacing: '-0.03em',
                  color: step.accent, opacity: 0.5, lineHeight: 1, paddingTop: '2px',
                }}>
                  {step.n}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--ff-display)', fontSize: '16px', letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '6px',
                  }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instagram ── */}
      <section style={{
        borderTop: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
        height: '520px',
        background: 'var(--bg)',
      }}>
        {/* glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(130,80,255,0.10) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Draggable photo cards */}
        {[
          { id:1, src:'/insta-1.jpg',  w:140, h:172, rotate:-10, pos:{ top:'6%',    left:'-20px'  } },
          { id:2, src:'/insta-2.jpg',  w:124, h:154, rotate:8,   pos:{ bottom:'6%', left:'-15px'  } },
          { id:3, src:'/insta-3.jpg',  w:148, h:184, rotate:9,   pos:{ top:'4%',    right:'-20px' } },
          { id:4, src:'/insta-4.jpg',  w:130, h:162, rotate:-8,  pos:{ bottom:'5%', right:'-18px' } },
          { id:5, src:'/insta-5.jpg',  w:122, h:152, rotate:-6,  pos:{ top:'-20px', left:'18%'    } },
          { id:6, src:'/insta-6.jpg',  w:116, h:144, rotate:7,   pos:{ top:'-16px', right:'18%'   } },
          { id:7, src:'/insta-7.png',  w:118, h:146, rotate:-5,  pos:{ bottom:'-18px', left:'10%' } },
          { id:8, src:'/insta-10.jpg', w:112, h:140, rotate:6,   pos:{ bottom:'-14px', right:'10%'} },
        ].map(card => (
          <motion.div
            key={card.id}
            drag dragMomentum={false}
            whileDrag={{ scale: 1.07, zIndex: 200 }}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: card.id * 0.06, duration: 0.5, ease: [0.22,1,0.36,1] }}
            style={{
              position: 'absolute', ...card.pos,
              width: card.w, height: card.h,
              rotate: `${card.rotate}deg`,
              cursor: 'grab', zIndex: 10 + card.id,
              borderRadius: 12, overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.07)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            <img src={card.src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none', userSelect:'none' }} />
          </motion.div>
        ))}

        {/* Centre CTA */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          textAlign: 'center', zIndex: 50, userSelect: 'none', width: '100%',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Connect on
            </div>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(40px, 10vw, 96px)', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 0.95, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Instagram
            </div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '28px', letterSpacing: '0.04em' }}>
              art, drops and behind the scenes
            </div>
            <a
              href="https://www.instagram.com/riaz.hooman"
              target="_blank"
              rel="noopener noreferrer"
              className="shop-follow-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '12px 28px', borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                  color: '#fff', textDecoration: 'none',
                fontFamily: 'var(--ff-body)', fontSize: '14px',
                letterSpacing: '0.04em',
              }}
            >
              Follow me
            </a>
          </motion.div>
        </div>
      </section>
    </>
  )
}
