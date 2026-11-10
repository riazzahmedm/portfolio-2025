'use client'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import ScrollNav from '@/components/ui/ScrollNav'
import { PenSquare, Search, X } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import type { BlogPostSummary } from '@/lib/blog.types'
import StoryCard from '@/components/blog/StoryCard'
import { ThemeToggle } from '@/components/blog/BlogTheme'
import { navIcon, NAV_ICON_SIZE } from '@/components/ui/nav-icon'
import Loader from '@/components/ui/Loader'
import NavBack from '@/components/ui/NavBack'

// The active tag lives in the URL so tag links are shareable and survive a reload.
// Reading it through useSyncExternalStore keeps the server render unfiltered
// (crawlable, cached) and applies the filter right after hydration.
const TAG_EVENT = 'blog-tag'

function subscribeToTag(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(TAG_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(TAG_EVENT, onChange)
  }
}

const readTag = () => new URLSearchParams(window.location.search).get('tag')?.trim().toLowerCase() ?? ''
const getServerTag = () => ''

export default function BlogIndex({ posts }: { posts: BlogPostSummary[] }) {
  const [loaded,  setLoaded]  = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search,  setSearch]  = useState('')
  const tag = useSyncExternalStore(subscribeToTag, readTag, getServerTag)

  const setTag = useCallback((next: string) => {
    const url = new URL(window.location.href)
    if (next) url.searchParams.set('tag', next)
    else url.searchParams.delete('tag')
    window.history.replaceState(null, '', url)
    window.dispatchEvent(new Event(TAG_EVENT))
  }, [])

  // Drafts never reach this page, so the only admin affordance is the "new post" link.
  useEffect(() => {
    fetch('/api/auth/admin').then(r => r.json()).then(d => setIsAdmin(Boolean(d.authed))).catch(() => {})
  }, [])

  const allTags = Array.from(
    new Set(posts.flatMap(p => p.tags).map(t => t.trim().toLowerCase()))
  ).sort()

  const filtered = posts
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.excerpt ?? '').toLowerCase().includes(search.toLowerCase()))
    .filter(p => !tag    || p.tags.map(t => t.trim().toLowerCase()).includes(tag))

  const [featured, ...rest] = filtered
  // The volume year is the newest post's year; the page is built from the posts, so no clock is read while rendering
  const year = posts[0]?.created_at ? new Date(posts[0].created_at).getFullYear() : null

  return (
    <>
      <AnimatePresence mode="wait">
        {!loaded && <Loader key="loader" onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {/* ── Top bar: the theme switch, plus a new-post link for the admin ── */}
      <ScrollNav>
        <div className="fn-navin">
          <span style={{ marginRight: 'auto' }}><NavBack /></span>
          {/* On phones the issue line moves up here, to the top right beside the theme switch */}
          <span className="fn-issue fn-issue--bar">Vol. 01 · {posts.length} {posts.length === 1 ? 'story' : 'stories'} · {year}</span>
          {isAdmin && (
            <Link href="/blog/admin" style={{ ...navIcon, color: 'var(--fn-lime)' }} title="Write a story" aria-label="Write a story">
              <PenSquare size={NAV_ICON_SIZE} />
            </Link>
          )}
          <ThemeToggle />
        </div>
      </ScrollNav>

      <div className="fn-wrap">
        {/* ── Masthead ── */}
        <header className="fn-mast">
          <div className="fn-brand">
            {/* The same tilted stamp as Art, Watchlog and the Shop */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="fn-stamp" src="/shop-logo.png" alt="Riaz" />
            <div>
              <div className="fn-eyebrow">Travel stories</div>
              <h1 className="fn-title">Field <span>Notes</span></h1>
            </div>
          </div>
          <div className="fn-issue fn-issue--mast">Vol. 01<br />{posts.length} {posts.length === 1 ? 'story' : 'stories'} · {year}</div>
        </header>

        {/* ── Search and topics ── */}
        <div className="fn-controls">
          <div className="fn-search">
            <Search size={14} aria-hidden="true" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stories…" aria-label="Search stories" />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={13} /></button>
            )}
          </div>
          <div className="fn-pills" role="group" aria-label="Filter by topic">
            <button type="button" className="fn-pill" aria-pressed={!tag} onClick={() => setTag('')}>All</button>
            {allTags.map(t => (
              <button key={t} type="button" className="fn-pill" aria-pressed={tag === t} onClick={() => setTag(tag === t ? '' : t)}>{t}</button>
            ))}
          </div>
        </div>

        {/* ── Stories ── */}
        {!featured ? (
          <div className="fn-empty">{search || tag ? 'No stories match your filters.' : 'No stories yet.'}</div>
        ) : (
          <>
            <StoryCard post={featured} variant="feature" number={1} />
            {rest.length > 0 && (
              <>
                <div className="fn-sec">More stories<i /></div>
                <div className="fn-grid">
                  {rest.map((post, i) => (
                    <StoryCard key={post.id} post={post} variant={i === 0 ? 'wide' : 'card'} number={i + 2} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
