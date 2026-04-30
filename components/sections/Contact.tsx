'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import SectionShell from '@/components/ui/SectionShell'
import SectionTag from '@/components/ui/SectionTag'
import SectionFooter from '@/components/layout/SectionFooter'
import TerminalBlock from '@/components/ui/TerminalBlock'
import { Send, MapPin, Mail, ExternalLink, Link } from 'lucide-react'

const TERMINAL_LINES = [
  { type: 'cmd' as const, text: 'whoami' },
  { type: 'success' as const, text: 'Riaz Ahmed — Senior Software Engineer' },
  { type: 'cmd' as const, text: 'ping riaz --hire' },
  { type: 'dim' as const, text: 'Connecting to riazzahmedm@gmail.com...' },
  { type: 'success' as const, text: '✓ Available for new opportunities' },
  { type: 'cmd' as const, text: 'cat contact.json' },
  { type: 'out' as const, text: '{ "email": "riazzahmedm@gmail.com",' },
  { type: 'out' as const, text: '  "location": "Chennai, India",' },
  { type: 'out' as const, text: '  "status": "open to work" }' },
]

const SOCIALS = [
  { icon: Mail, label: 'Email', value: 'riazzahmedm@gmail.com', color: 'var(--lime)' },
  { icon: MapPin, label: 'Location', value: 'Chennai, India', color: 'var(--lavender)' },
  { icon: ExternalLink, label: 'GitHub', value: 'github.com/riaz', color: 'var(--text-muted)' },
  { icon: Link, label: 'LinkedIn', value: 'linkedin.com/in/riaz', color: 'var(--text-muted)' },
]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <SectionShell id="contact" orbPosition="top-right" watermark="08">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0 mt-14">

        {/* LEFT — Terminal + Socials */}
        <div className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-8 md:py-0 border-b md:border-b-0 md:border-r transition-colors duration-300 gap-5" style={{ borderColor: 'var(--border)' }}>
          <SectionTag num="08" label="Don't Be A Stranger" />

          <TerminalBlock lines={TERMINAL_LINES} />

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
              <div className="text-[20px] font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--ff-display)' }}>Message delivered.</div>
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
              <div className="text-[24px] font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--ff-display)' }}>
                Start a conversation
              </div>
              <p className="text-[13px] -mt-3" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-body)' }}>
                No cold calls. Just real talk about your project.
              </p>

              {[
                { key: 'name', label: 'Your name', type: 'text', placeholder: 'John Doe' },
                { key: 'email', label: 'Email address', type: 'email', placeholder: 'john@company.com' },
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
                  placeholder="Tell me about your project..."
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border text-[14px] outline-none transition-all duration-200 focus:border-lime-400 resize-none"
                  style={{ background: 'var(--surface-alt)', borderColor: 'var(--border-card)', color: 'var(--text-secondary)', fontFamily: 'var(--ff-body)' }}
                />
              </div>

              <button
                type="submit"
                className="text-[13px] tracking-[0.18em] uppercase py-3.5 px-6 rounded-lg font-bold transition-all duration-200 hover:brightness-110 hover:scale-[1.02] flex items-center justify-center gap-3"
                style={{ background: 'var(--lime)', color: '#050505', fontFamily: 'var(--ff-body)' }}
              >
                <Send size={14} />
                git commit -m &ldquo;Let&apos;s work together&rdquo;
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
