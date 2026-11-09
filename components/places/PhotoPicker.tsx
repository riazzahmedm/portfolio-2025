'use client'
import { useEffect, useMemo, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { field } from './form-styles'

export const MAX_PHOTOS = 8

/** Photos already saved (URLs) plus new ones picked on this device (uploaded when the visit is saved). */
export default function PhotoPicker({ saved, files, onAdd, onRemoveSaved, onRemoveFile }: {
  saved: string[]; files: File[]
  onAdd: (picked: File[]) => void; onRemoveSaved: (index: number) => void; onRemoveFile: (index: number) => void
}) {
  const input    = useRef<HTMLInputElement>(null)
  const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

  const total = saved.length + files.length
  const tile: React.CSSProperties = { position: 'relative', width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', flex: 'none', background: '#1a1a1a' }
  const x: React.CSSProperties = { position: 'absolute', top: '3px', right: '3px', width: '20px', height: '20px', borderRadius: '50%', border: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {saved.map((u, i) => (
        <div key={u} style={tile}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button type="button" style={x} aria-label="Remove photo" onClick={() => onRemoveSaved(i)}><X size={12} /></button>
        </div>
      ))}
      {previews.map((u, i) => (
        <div key={u} style={tile}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button type="button" style={x} aria-label="Remove photo" onClick={() => onRemoveFile(i)}><X size={12} /></button>
        </div>
      ))}
      {total < MAX_PHOTOS && (
        <button type="button" onClick={() => input.current?.click()} aria-label="Add photos" style={{ ...field, width: '64px', height: '64px', padding: 0, borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', flex: 'none' }}>
          <Plus size={20} />
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
        onChange={e => { onAdd(Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - total)); e.target.value = '' }} />
    </div>
  )
}
