'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionTag from '@/components/ui/SectionTag'
import SectionFooter from '@/components/layout/SectionFooter'
import TerminalBlock from '@/components/ui/TerminalBlock'
import { Send, ExternalLink, Link, Loader2 } from 'lucide-react'
import { TERMINAL_LINES } from '@/lib/data'

// Sign up at formspree.io → New Form → copy the form ID here
const FORMSPREE_ID = 'mjglvlpn'

const SOCIALS = [
  { icon: ExternalLink, label: 'GitHub', value: 'github.com/riaz', color: 'var(--lavender)' },
  { icon: Link, label: 'LinkedIn', value: 'linkedin.com/in/riaz', color: 'var(--lavender)' },
]

function SpiderIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="2.5" />
      <ellipse cx="12" cy="15" rx="3" ry="4" />
      <line x1="9" y1="12.5" x2="3" y2="9"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="14.5" x2="2" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="16.5" x2="3" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="12.5" x2="21" y2="9"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="14.5" x2="22" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="16.5" x2="21" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const TERMINAL_WITH_ICON = TERMINAL_LINES.map((line, i) =>
  i === 1
    ? { ...line, text: <span className="flex items-center gap-1.5">{line.text as string} <SpiderIcon size={14} /></span> }
    : line
)

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSent(true)
      } else {
        setError('Something went wrong. Try emailing me directly.')
      }
    } catch {
      setError('Network error. Try emailing me directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionShell id="contact" orbPosition="top-right" watermark="08">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0 mt-14">

        {/* LEFT — Terminal + Socials */}
        <div className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-8 md:py-0 border-b md:border-b-0 md:border-r transition-colors duration-300 gap-5" style={{ borderColor: 'var(--border)' }}>
          <SectionTag num="08" label="Don't Be A Stranger" />

          <TerminalBlock lines={TERMINAL_WITH_ICON} />

          {/* Social links */}
          <div className="grid grid-cols-2 gap-2">
            {SOCIALS.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors duration-200"
                style={{ borderColor: 'var(--border-card)', background: 'var(--surface)' }}>
                <Icon size={14} style={{ color, flexShrink: 0 }} />
                <div>
                  <div className="text-[10px] tracking-[0.14em] uppercase" style={{ color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)' }}>{label}</div>
                  <div className="text-[11px] truncate" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-8 md:py-0">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(130,255,31,0.12)', border: '1px solid var(--lime)' }}>
                <Send size={22} style={{ color: 'var(--lime)' }} />
              </div>
              <div className="text-[20px] font-bold mb-2 flex items-center justify-center gap-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--ff-display)' }}>
                Message delivered <SpiderIcon size={22} />
              </div>
              <div className="text-[13px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--ff-mono)' }}>Response ETA: &lt; 24h</div>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-5"
            >
              <div className="text-[24px] font-bold mb-1 uppercase" style={{ color: 'var(--text-primary)', fontFamily: 'var(--ff-display)' }}>
                Shoot your shot. Not webs.
              </div>
              <p className="text-[13px] -mt-3" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-body)' }}>
                With great projects comes great responsibility.
              </p>

              {[
                { key: 'name', label: 'Your name', type: 'text', placeholder: 'Peter Parker' },
                { key: 'email', label: 'Email address', type: 'email', placeholder: 'peter@dailybugle.com' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] tracking-[0.16em] uppercase mb-2" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>{label}</label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border text-[14px] outline-none transition-all duration-200 focus:border-lime-400"
                    style={{ background: 'var(--surface-alt)', borderColor: 'var(--border-card)', color: 'var(--text-secondary)', fontFamily: 'var(--ff-body)' }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-[11px] tracking-[0.16em] uppercase mb-2" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell me about your project… I'll swing by."
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border text-[14px] outline-none transition-all duration-200 focus:border-lime-400 resize-none"
                  style={{ background: 'var(--surface-alt)', borderColor: 'var(--border-card)', color: 'var(--text-secondary)', fontFamily: 'var(--ff-body)' }}
                />
              </div>

              {error && (
                <p className="text-[12px]" style={{ color: 'var(--red)', fontFamily: 'var(--ff-mono)' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="text-[13px] tracking-[0.18em] uppercase py-3.5 px-6 rounded-lg font-bold transition-all duration-200 hover:brightness-110 hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                style={{ background: 'var(--lime)', color: '#050505', fontFamily: 'var(--ff-body)' }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {loading ? 'Firing web…' : 'thwip(); // send message'}
              </button>
            </motion.form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center px-8 py-2 border-t transition-colors duration-300" style={{ borderColor: 'var(--border)' }}>
          <span className="text-[12px] tracking-[0.16em] uppercase transition-colors duration-300" style={{ color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)' }}>
            © Riaz Ahmed · built with Next.js, caffeine &amp; too many tokens
          </span>
        </div>
        <SectionFooter current={8} hideLabel />
      </div>
    </SectionShell>
  )
}
