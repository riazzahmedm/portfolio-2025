'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { compressImage } from '@/lib/compress-image'
import type { ArtPiece } from '@/lib/art.types'

type Product = { id: string; name: string }

const field: React.CSSProperties = {
  padding: '8px 11px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '9px',
  color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-body)', outline: 'none', width: '100%', boxSizing: 'border-box',
}
const iconBtn: React.CSSProperties = {
  width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent',
  color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
}

async function readSize(file: File) {
  const bmp = await createImageBitmap(file)
  const size = { width: bmp.width, height: bmp.height }
  bmp.close()
  return size
}

export default function ArtAdmin() {
  const [pieces,   setPieces]   = useState<ArtPiece[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [busy,     setBusy]     = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/art').then(r => r.json()).then(d => setPieces(Array.isArray(d) ? d : []))
      .catch(() => toast.error('Failed to load art')).finally(() => setLoading(false))
    fetch('/api/shop/products').then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d.map((p: Product) => ({ id: p.id, name: p.name })) : []))
      .catch(() => {})
  }, [])

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setBusy('upload')
    let added = 0
    // One at a time: each new piece is placed above the previous one
    for (const original of Array.from(files)) {
      try {
        const file = await compressImage(original, 2000, 0.85)
        const { width, height } = await readSize(file)
        const form = new FormData()
        form.append('file', file)
        const up = await fetch('/api/shop/upload', { method: 'POST', body: form })
        const upData = await up.json()
        if (!up.ok) { toast.error(upData.error ?? `Upload failed: ${original.name}`); continue }
        const res = await fetch('/api/art', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: original.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), image_url: upData.url, width, height }),
        })
        const piece = await res.json()
        if (!res.ok) { toast.error(piece.error ?? 'Could not save'); continue }
        setPieces(prev => [piece, ...prev])
        added++
      } catch { toast.error(`Could not process ${original.name}`) }
    }
    if (added) toast.success(added === 1 ? 'Piece added' : `${added} pieces added`)
    setBusy(null)
  }

  async function patch(id: string, body: Record<string, unknown>, quiet = false) {
    const res = await fetch(`/api/art/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Save failed'); return false }
    setPieces(prev => prev.map(p => (p.id === id ? data : p)))
    if (!quiet) toast.success('Saved')
    return true
  }

  async function move(index: number, dir: -1 | 1) {
    const a = pieces[index], b = pieces[index + dir]
    if (!a || !b) return
    // Renumber the whole list so ties and old gaps can never make a move do nothing
    const next = [...pieces]
    next[index] = b; next[index + dir] = a
    const ordered = next.map((p, i) => ({ ...p, sort_order: i }))
    setPieces(ordered)
    const before  = new Map(pieces.map(p => [p.id, p.sort_order]))
    const changed = ordered.filter(p => p.sort_order !== before.get(p.id))
    const results = await Promise.all(changed.map(p =>
      fetch(`/api/art/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: p.sort_order }) })))
    if (results.some(r => !r.ok)) toast.error('Could not save the new order')
  }

  async function remove(id: string) {
    setBusy(id)
    const res = await fetch(`/api/art/${id}`, { method: 'DELETE' })
    if (res.ok) { setPieces(prev => prev.filter(p => p.id !== id)); toast.success('Deleted') }
    else toast.error('Delete failed')
    setConfirmId(null); setBusy(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
          {pieces.length} {pieces.length === 1 ? 'piece' : 'pieces'} · new uploads go to the top
        </p>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 16px', borderRadius: '10px', cursor: busy === 'upload' ? 'wait' : 'pointer',
          background: 'rgba(184,160,255,0.1)', color: 'var(--lavender)', border: '1px solid rgba(184,160,255,0.25)', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
          <Plus size={15} /> {busy === 'upload' ? 'Uploading…' : 'Add images'}
          <input type="file" accept="image/*" multiple disabled={busy === 'upload'} style={{ display: 'none' }}
            onChange={e => { upload(e.target.files); e.target.value = '' }} />
        </label>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Loading…</p>
      ) : pieces.length === 0 ? (
        <p style={{ padding: '50px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>No art yet. Add images to start the gallery.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pieces.map((p, i) => (
            <PieceRow key={p.id} piece={p} products={products} first={i === 0} last={i === pieces.length - 1}
              confirming={confirmId === p.id} busy={busy === p.id}
              onSave={body => patch(p.id, body)} onMove={dir => move(i, dir)}
              onAskDelete={() => setConfirmId(p.id)} onCancelDelete={() => setConfirmId(null)} onDelete={() => remove(p.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function PieceRow({ piece, products, first, last, confirming, busy, onSave, onMove, onAskDelete, onCancelDelete, onDelete }: {
  piece: ArtPiece; products: Product[]; first: boolean; last: boolean; confirming: boolean; busy: boolean
  onSave: (body: Record<string, unknown>) => Promise<boolean>
  onMove: (dir: -1 | 1) => void
  onAskDelete: () => void; onCancelDelete: () => void; onDelete: () => void
}) {
  const [title,   setTitle]   = useState(piece.title)
  const [caption, setCaption] = useState(piece.caption ?? '')
  const [tags,    setTags]    = useState(piece.tags.join(', '))
  const [product, setProduct] = useState(piece.product_id ?? '')

  const parsedTags = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
  const dirty = title !== piece.title || caption !== (piece.caption ?? '') || parsedTags.join(',') !== piece.tags.join(',') || product !== (piece.product_id ?? '')

  return (
    <div style={{ display: 'flex', gap: '14px', padding: '12px', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '14px', opacity: piece.is_published ? 1 : 0.6 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={piece.image_url} alt={piece.title} loading="lazy" style={{ width: '88px', height: '110px', objectFit: 'cover', borderRadius: '9px', flexShrink: 0, background: 'var(--surface)' }} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" aria-label="Title" maxLength={120} style={field} />
        <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (optional)" aria-label="Caption" rows={2} maxLength={600} style={{ ...field, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Themes, comma separated" aria-label="Themes" style={{ ...field, flex: '1 1 160px', width: 'auto' }} />
          <select value={product} onChange={e => setProduct(e.target.value)} aria-label="Shop product" style={{ ...field, flex: '1 1 160px', width: 'auto', color: product ? 'var(--text-primary)' : 'var(--text-dim)' }}>
            <option value="">No shop link</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button type="button" style={iconBtn} onClick={() => onMove(-1)} disabled={first} aria-label="Move up"><ArrowUp size={14} /></button>
          <button type="button" style={iconBtn} onClick={() => onMove(1)} disabled={last} aria-label="Move down"><ArrowDown size={14} /></button>
          <button type="button" style={{ ...iconBtn, width: 'auto', padding: '0 10px', gap: '6px', fontSize: '12px', fontFamily: 'var(--ff-body)' }}
            onClick={() => onSave({ is_published: !piece.is_published })} aria-pressed={piece.is_published}>
            {piece.is_published ? <><Eye size={13} /> Published</> : <><EyeOff size={13} /> Hidden</>}
          </button>
          <span style={{ flex: 1 }} />
          {dirty && (
            <button type="button" onClick={() => onSave({ title, caption, tags: parsedTags, product_id: product || null })}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(184,160,255,0.3)', background: 'rgba(184,160,255,0.12)', color: 'var(--lavender)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
              Save
            </button>
          )}
          {confirming ? (
            <>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Delete this piece?</span>
              <button type="button" onClick={onDelete} disabled={busy} style={{ padding: '6px 12px', borderRadius: '8px', border: 0, background: 'var(--red)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>{busy ? '…' : 'Delete'}</button>
              <button type="button" onClick={onCancelDelete} style={{ ...iconBtn, width: 'auto', padding: '0 10px', fontSize: '12px' }}>Cancel</button>
            </>
          ) : (
            <button type="button" style={iconBtn} onClick={onAskDelete} aria-label="Delete piece"><Trash2 size={14} /></button>
          )}
        </div>
      </div>
    </div>
  )
}
