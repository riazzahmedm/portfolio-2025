'use client'
import { useState } from 'react'
import { Check, Link2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import BlogStoryModal from './BlogStoryModal'

/** The facts about a story, beside the text on wide screens and above it on phones, with the share actions. */
export default function PostRail({ slug, title, written, minutes }: { slug: string; title: string; written: string; minutes: number }) {
  const [story, setStory] = useState(false)
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied')
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Could not copy the link')
    }
  }

  return (
    <>
      {story && <BlogStoryModal slug={slug} title={title} onClose={() => setStory(false)} />}
      <aside className="fn-rail" aria-label="About this story">
        <div><small>Written by</small><b>Riaz Ahmed</b></div>
        <div><small>Written</small><b>{written}</b></div>
        <div><small>Read time</small><b>{minutes} min</b></div>
        <div className="fn-railshare">
          <button type="button" onClick={() => setStory(true)} aria-label="Share as a story card" title="Share as a story card"><Share2 size={16} /></button>
          <button type="button" onClick={copy} aria-label="Copy link" title="Copy link">{copied ? <Check size={16} /> : <Link2 size={16} />}</button>
        </div>
      </aside>
    </>
  )
}
