import Link from 'next/link'
import { Mountain, ArrowRight } from 'lucide-react'
import type { Flythrough } from '@/lib/blog-extras'

/** A card that opens a story's interactive flythrough full-screen. `compact` is the shorter closing version. */
export default function FlythroughCard({ fly, compact = false }: { fly: Flythrough; compact?: boolean }) {
  return (
    <Link href={fly.href} className={`fn-fly${compact ? ' fn-fly--end' : ''}`} prefetch={false}>
      <span className="fn-fly-ico" aria-hidden="true"><Mountain size={22} /></span>
      <span className="fn-fly-txt">
        <small>Interactive</small>
        <b>{fly.title}</b>
        {!compact && <span>{fly.blurb}</span>}
      </span>
      <span className="fn-fly-cta">{fly.cta} <ArrowRight size={15} aria-hidden="true" /></span>
    </Link>
  )
}
