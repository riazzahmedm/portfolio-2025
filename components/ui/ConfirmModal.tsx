'use client'
import { useEffect } from 'react'
import { Trash2, X } from 'lucide-react'

interface Props {
  title:       string
  description?: string
  confirmLabel?: string
  onConfirm:   () => void
  onCancel:    () => void
  danger?:     boolean
}

export default function ConfirmModal({
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  danger = true,
}: Props) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 201,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        pointerEvents: 'none',
      }}>
        <div style={{
          pointerEvents: 'auto',
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '18px',
          padding: '28px 28px 24px',
          width: '100%', maxWidth: '360px',
          display: 'flex', flexDirection: 'column', gap: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {danger && (
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(224,32,32,0.1)', border: '1px solid rgba(224,32,32,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#e02020',
                }}>
                  <Trash2 size={16} />
                </div>
              )}
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
                  {title}
                </div>
                {description && (
                  <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'var(--ff-body)', marginTop: '4px', lineHeight: 1.4 }}>
                    {description}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '50%', width: '28px', height: '28px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.35)',
              }}>
              <X size={12} />
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1, padding: '11px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '100px', cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)', fontSize: '13px',
                fontFamily: 'var(--ff-body)', fontWeight: 500,
                transition: 'all 0.15s',
              }}>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1, padding: '11px',
                background: danger ? 'rgba(224,32,32,0.12)' : 'rgba(130,255,31,0.1)',
                border: `1px solid ${danger ? 'rgba(224,32,32,0.35)' : 'rgba(130,255,31,0.35)'}`,
                borderRadius: '100px', cursor: 'pointer',
                color: danger ? '#e06060' : '#82ff1f',
                fontSize: '13px', fontFamily: 'var(--ff-body)', fontWeight: 600,
                transition: 'all 0.15s',
              }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
