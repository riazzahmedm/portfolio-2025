'use client'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/** An edit form in a bottom sheet: Escape closes it, focus moves in and stays inside until it closes. */
export default function EditSheet({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  const sheet = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose })   // always the latest, without re-running the focus setup below

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    sheet.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { closeRef.current(); return }
      if (e.key !== 'Tab' || !sheet.current) return
      const items = [...sheet.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      if (items.length === 0) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === sheet.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); before?.focus() }
  }, [])

  return (
    <div role="dialog" aria-modal="true" aria-label={label} onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div ref={sheet} tabIndex={-1} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', maxHeight: '92dvh', overflowY: 'auto', background: '#0d0d0d', border: '1px solid var(--border-card)', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', position: 'relative', outline: 'none' }}>
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 0, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><X size={18} /></button>
        {children}
      </div>
    </div>
  )
}
