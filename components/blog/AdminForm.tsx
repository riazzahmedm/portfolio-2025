'use client'
import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, ChevronUp, ChevronDown, Type, Image, Video, Code, Eye, EyeOff, Loader2, Upload } from 'lucide-react'
import type { BlogPost, ContentBlock } from '@/lib/blog.types'
import { compressImage } from '@/lib/compress-image'

// ── Upload button ─────────────────────────────────────────────────────────────
function UploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const form = new FormData()
      form.append('file', compressed)
      const res  = await fetch('/api/blog/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Upload failed'); return }
      onUploaded(data.url)
      toast.success('Image uploaded')
    } finally {
      setUploading(false)
      if (ref.current) ref.current.value = ''
    }
  }

  return (
    <>
      <input ref={ref} type="file" accept="image/*,.heic,.heif" style={{ display: 'none' }} onChange={handleFile} />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', borderRadius: '8px', cursor: uploading ? 'wait' : 'pointer',
          border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontFamily: 'var(--ff-mono)',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        {uploading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={13} />}
        {uploading ? 'Uploading…' : 'Upload'}
      </button>
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── Shared input style ────────────────────────────────────────────────────────
const INPUT: React.CSSProperties = {
  width:       '100%',
  padding:     '10px 14px',
  background:  'rgba(255,255,255,0.04)',
  border:      '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color:       '#fff',
  fontSize:    '14px',
  fontFamily:  'var(--ff-body)',
  outline:     'none',
  boxSizing:   'border-box',
}

const LABEL: React.CSSProperties = {
  display:       'block',
  fontSize:      '11px',
  fontFamily:    'var(--ff-mono)',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color:         'var(--text-dim)',
  marginBottom:  '6px',
}

// ── Block editor row ──────────────────────────────────────────────────────────
function BlockEditor({
  block, index, total,
  onChange, onDelete, onMoveUp, onMoveDown,
}: {
  block: ContentBlock
  index: number
  total: number
  onChange:  (b: ContentBlock) => void
  onDelete:  () => void
  onMoveUp:  () => void
  onMoveDown:() => void
}) {
  const TYPE_COLORS: Record<string, string> = {
    text:  '#82ff1f',
    image: '#b8a0ff',
    video: '#82ff1f',
    html:  '#f59e0b',
  }
  const color = TYPE_COLORS[block.type] ?? '#fff'
  const borderRgb = block.type === 'text' ? '100,210,255' : block.type === 'image' ? '184,160,255' : block.type === 'html' ? '245,158,11' : '130,255,31'

  return (
    <div style={{
      background:   'rgba(255,255,255,0.03)',
      border:       `1px solid rgba(${borderRgb},0.15)`,
      borderRadius: '12px',
      padding:      '14px',
      display:      'flex',
      flexDirection:'column',
      gap:          '10px',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.16em', textTransform: 'uppercase', color }}>
          {block.type === 'text' ? '// text' : block.type === 'image' ? '// image' : block.type === 'video' ? '// video' : '// html'}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button type="button" onClick={onMoveUp}   disabled={index === 0}         title="Move up"   style={iconBtn}><ChevronUp   size={13} /></button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1} title="Move down" style={iconBtn}><ChevronDown  size={13} /></button>
          <button type="button" onClick={onDelete}   title="Remove"                                   style={{ ...iconBtn, color: '#e06060', borderColor: 'rgba(224,96,96,0.25)' }}><Trash2 size={13} /></button>
        </div>
      </div>

      {block.type === 'text' && (
        <textarea
          value={block.content}
          onChange={e => onChange({ ...block, content: e.target.value })}
          placeholder="Write in Markdown…"
          rows={6}
          style={{ ...INPUT, resize: 'vertical', lineHeight: 1.6 }}
        />
      )}

      {block.type === 'image' && (
        <>
          <div>
            <label style={LABEL}>Image URL</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input value={block.url} onChange={e => onChange({ ...block, url: e.target.value })} placeholder="https://… or upload →" style={{ ...INPUT, flex: 1 }} />
              <UploadButton onUploaded={url => onChange({ ...block, url })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={LABEL}>Alt text</label>
              <input value={block.alt ?? ''} onChange={e => onChange({ ...block, alt: e.target.value })} placeholder="Describe the image" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Caption</label>
              <input value={block.caption ?? ''} onChange={e => onChange({ ...block, caption: e.target.value })} placeholder="Optional caption" style={INPUT} />
            </div>
          </div>
          {block.url && (
            <img src={block.url} alt={block.alt ?? ''} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }} />
          )}
        </>
      )}

      {block.type === 'video' && (
        <>
          <div>
            <label style={LABEL}>Video URL</label>
            <input value={block.url} onChange={e => onChange({ ...block, url: e.target.value })} placeholder="YouTube, Vimeo, or .mp4 URL" style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>Caption</label>
            <input value={block.caption ?? ''} onChange={e => onChange({ ...block, caption: e.target.value })} placeholder="Optional caption" style={INPUT} />
          </div>
        </>
      )}

      {block.type === 'html' && (
        <textarea
          value={block.content}
          onChange={e => onChange({ ...block, content: e.target.value })}
          placeholder="Paste raw HTML here…"
          rows={10}
          style={{ ...INPUT, resize: 'vertical', lineHeight: 1.5, fontFamily: 'var(--ff-mono)', fontSize: '12px' }}
        />
      )}
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  background:   'none',
  border:       '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color:        'rgba(255,255,255,0.4)',
  cursor:       'pointer',
  padding:      '4px 6px',
  display:      'flex',
  alignItems:   'center',
}

// ── Main form ─────────────────────────────────────────────────────────────────
interface Props {
  initial?:  BlogPost
  onSuccess: (post: BlogPost) => void
}

export default function AdminForm({ initial, onSuccess }: Props) {
  const isEdit = !!initial

  const [title,      setTitle]      = useState(initial?.title ?? '')
  const [slug,       setSlug]       = useState(initial?.slug ?? '')
  const [slugManual, setSlugManual] = useState(isEdit)
  const [excerpt,    setExcerpt]    = useState(initial?.excerpt ?? '')
  const [coverImage, setCoverImage] = useState(initial?.cover_image ?? '')
  const [tags,       setTags]       = useState((initial?.tags ?? []).join(', '))
  const [published,  setPublished]  = useState(initial?.published ?? false)
  const [blocks,     setBlocks]     = useState<ContentBlock[]>(initial?.content ?? [])
  const [saving,     setSaving]     = useState(false)

  function handleTitleChange(v: string) {
    setTitle(v)
    if (!slugManual) setSlug(toSlug(v))
  }

  const addBlock = useCallback((type: ContentBlock['type']) => {
    setBlocks(prev => [
      ...prev,
      type === 'text'  ? { type: 'text',  content: '' } :
      type === 'image' ? { type: 'image', url: '', alt: '', caption: '' } :
      type === 'video' ? { type: 'video', url: '', caption: '' } :
                         { type: 'html',  content: '' },
    ])
  }, [])

  function updateBlock(i: number, b: ContentBlock) {
    setBlocks(prev => prev.map((x, idx) => idx === i ? b : x))
  }

  function deleteBlock(i: number) {
    setBlocks(prev => prev.filter((_, idx) => idx !== i))
  }

  function moveBlock(i: number, dir: -1 | 1) {
    setBlocks(prev => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return toast.error('Title is required')
    if (!slug.trim())  return toast.error('Slug is required')

    setSaving(true)
    try {
      const body = {
        title:       title.trim(),
        slug:        slug.trim(),
        excerpt:     excerpt.trim() || null,
        cover_image: coverImage.trim() || null,
        tags:        tags.split(',').map(t => t.trim()).filter(Boolean),
        published,
        content:     blocks,
      }

      const url    = isEdit ? `/api/blog/${initial!.slug}` : '/api/blog'
      const method = isEdit ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data   = await res.json()

      if (!res.ok) { toast.error(data.error ?? 'Failed to save'); return }
      toast.success(isEdit ? 'Post updated' : 'Post published')
      onSuccess(data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Title */}
      <div>
        <label style={LABEL}>Title *</label>
        <input value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Post title" style={INPUT} />
      </div>

      {/* Slug */}
      <div>
        <label style={LABEL}>Slug *</label>
        <input
          value={slug}
          onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
          placeholder="url-friendly-slug"
          style={{ ...INPUT, fontFamily: 'var(--ff-mono)', fontSize: '13px' }}
        />
        <div style={{ marginTop: '5px', fontSize: '11px', fontFamily: 'var(--ff-mono)', color: 'var(--text-dim)' }}>
          /blog/{slug || '…'}
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label style={LABEL}>Excerpt</label>
        <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short description shown in the listing…" rows={3} style={{ ...INPUT, resize: 'vertical' }} />
      </div>

      {/* Cover image */}
      <div>
        <label style={LABEL}>Cover image</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://… or upload →" style={{ ...INPUT, flex: 1 }} />
          <UploadButton onUploaded={url => setCoverImage(url)} />
        </div>
        {coverImage && (
          <img src={coverImage} alt="Cover preview" style={{ marginTop: '10px', width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }} />
        )}
      </div>

      {/* Tags */}
      <div>
        <label style={LABEL}>Tags (comma-separated)</label>
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="tech, design, life" style={INPUT} />
      </div>

      {/* Published toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>Published</div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginTop: '2px' }}>
            {published ? 'Visible to everyone' : 'Draft — only you can see this'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPublished(p => !p)}
          style={{
            display:      'flex', alignItems: 'center', gap: '6px',
            padding:      '8px 14px', borderRadius: '100px', cursor: 'pointer',
            border:       `1px solid ${published ? 'rgba(130,255,31,0.35)' : 'rgba(255,255,255,0.12)'}`,
            background:   published ? 'rgba(130,255,31,0.1)' : 'transparent',
            color:        published ? '#82ff1f' : 'rgba(255,255,255,0.4)',
            fontSize:     '12px', fontFamily: 'var(--ff-mono)',
            transition:   'all 0.18s',
          }}
        >
          {published ? <Eye size={13} /> : <EyeOff size={13} />}
          {published ? 'Live' : 'Draft'}
        </button>
      </div>

      {/* Content blocks */}
      <div>
        <div style={{ ...LABEL, marginBottom: '14px' }}>Content blocks</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {blocks.map((block, i) => (
            <BlockEditor
              key={i}
              block={block}
              index={i}
              total={blocks.length}
              onChange={b => updateBlock(i, b)}
              onDelete={() => deleteBlock(i)}
              onMoveUp={() => moveBlock(i, -1)}
              onMoveDown={() => moveBlock(i, 1)}
            />
          ))}
        </div>

        {/* Add block buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          {([
            { type: 'text'  as const, icon: <Type  size={13} />, label: 'Text',  color: '#82ff1f' },
            { type: 'image' as const, icon: <Image size={13} />, label: 'Image', color: '#b8a0ff' },
            { type: 'video' as const, icon: <Video size={13} />, label: 'Video', color: '#82ff1f' },
            { type: 'html'  as const, icon: <Code  size={13} />, label: 'HTML',  color: '#f59e0b' },
          ]).map(({ type, icon, label, color }) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              style={{
                display:       'flex', alignItems: 'center', gap: '6px',
                padding:       '8px 14px', borderRadius: '100px', cursor: 'pointer',
                border:        `1px solid rgba(255,255,255,0.1)`,
                background:    'transparent',
                color:         'rgba(255,255,255,0.45)',
                fontSize:      '12px', fontFamily: 'var(--ff-mono)',
                letterSpacing: '0.1em', transition: 'all 0.18s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}66`
                ;(e.currentTarget as HTMLButtonElement).style.color = color
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'
              }}
            >
              {icon}
              <Plus size={11} style={{ marginLeft: '-2px' }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        style={{
          padding:      '12px 24px',
          borderRadius: '100px',
          border:       '1px solid rgba(130,255,31,0.35)',
          background:   'rgba(130,255,31,0.1)',
          color:        '#82ff1f',
          fontSize:     '13px',
          fontFamily:   'var(--ff-mono)',
          letterSpacing: '0.12em',
          cursor:       saving ? 'not-allowed' : 'pointer',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          gap:          '8px',
          opacity:      saving ? 0.6 : 1,
          transition:   'all 0.18s',
        }}
      >
        {saving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
        {saving ? 'Saving…' : isEdit ? 'Update post' : 'Publish post'}
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </form>
  )
}
