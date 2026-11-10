'use client'
import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { copyLink, storyUrl } from '@/lib/copy-link'

/** The facts about a story, beside the text on wide screens and above it on phones, with a share button that copies the link. */
export default function PostRail({ slug, written, minutes }: { slug: string; written: string; minutes: number }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    if (await copyLink(storyUrl(slug))) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <aside className="fn-rail" aria-label="About this story">
      <div><small>Written by</small><b>Riaz Ahmed</b></div>
      <div><small>Written</small><b>{written}</b></div>
      <div><small>Read time</small><b>{minutes} min</b></div>
      <div className="fn-railshare">
        <button type="button" onClick={share} aria-label="Copy link to share this story" title="Copy link">{copied ? <Check size={16} /> : <Share2 size={16} />}</button>
      </div>
    </aside>
  )
}
