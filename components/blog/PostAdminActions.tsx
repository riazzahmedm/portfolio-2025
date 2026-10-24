'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function PostAdminActions({ slug, title }: { slug: string; title: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [confirm,  setConfirm]  = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Post deleted')
      router.push('/blog')
      router.refresh()
    } else {
      toast.error('Failed to delete')
      setDeleting(false)
      setConfirm(false)
    }
  }

  return (
    <>
      {confirm && (
        <ConfirmModal
          title="Delete post"
          description={`"${title}" will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(false)}
          danger
        />
      )}
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <Link href={`/blog/admin?edit=${slug}`} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 12px', borderRadius: '100px',
          border: '1px solid rgba(130,255,31,0.25)', background: 'rgba(130,255,31,0.06)',
          color: '#82ff1f', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)',
        }}>
          <Pencil size={12} />
        </Link>
        <button
          onClick={() => setConfirm(true)}
          disabled={deleting}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px', borderRadius: '100px',
            border: '1px solid rgba(224,96,96,0.25)', background: 'rgba(224,96,96,0.06)',
            color: '#e06060', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--ff-mono)',
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </>
  )
}
