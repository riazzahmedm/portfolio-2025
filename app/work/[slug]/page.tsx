import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CASE_STUDIES, getCaseStudy, getNextCaseStudy } from '@/lib/work'
import { SITE_NAME, SITE_URL } from '@/lib/site'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return CASE_STUDIES.map(study => ({ slug: study.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const study = getCaseStudy(slug)
  if (!study) return { title: 'Case study not found' }

  const url = `/work/${study.slug}`
  const description = study.summary

  return {
    title:       `${study.name} — case study`,
    description,
    alternates:  { canonical: url },
    openGraph: {
      type:        'article',
      url,
      title:       `${study.name} — case study`,
      description,
      siteName:    SITE_NAME,
      images:      [{ url: `${SITE_URL}${study.image}`, alt: `${study.name}` }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${study.name} — case study`,
      description,
    },
  }
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params
  const study = getCaseStudy(slug)
  if (!study) notFound()

  const next = getNextCaseStudy(study.slug)
  const mono: React.CSSProperties = { fontFamily: 'var(--ff-mono)', letterSpacing: '0.2em', textTransform: 'uppercase' }

  return (
    <main style={{ background: '#050505', minHeight: '100dvh', color: 'var(--text-primary)' }}>
      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-10 py-4"
        style={{ background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/#projects" className="text-[11px] hover:opacity-100 opacity-60 transition-opacity" style={{ ...mono, color: 'var(--text-primary)' }}>
          ← All work
        </Link>
        <span className="text-[10px] opacity-35" style={mono}>
          {String(CASE_STUDIES.findIndex(c => c.slug === study.slug) + 1).padStart(2, '0')} / {String(CASE_STUDIES.length).padStart(2, '0')}
        </span>
      </div>

      {/* ── Hero ── */}
      <header className="relative overflow-hidden px-5 md:px-10 pt-16 pb-10 md:pt-24 md:pb-14">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 20% 0%, ${study.accent}22 0%, transparent 60%)` }}
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-[10px] mb-5" style={{ ...mono, color: study.accent }}>
            Case study · {study.year} · {study.type}
          </div>
          <h1
            className="uppercase"
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(2.4rem, 7vw, 5.2rem)',
              fontWeight: 800,
              lineHeight: 0.92,
              letterSpacing: '-0.02em',
              textWrap: 'balance',
            }}
          >
            {study.name}
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] md:text-[17px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {study.summary}
          </p>
        </div>
      </header>

      {/* ── Image ── */}
      {study.image && (
        <div className="px-5 md:px-10">
          <div
            className="relative max-w-5xl mx-auto overflow-hidden rounded-xl"
            style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: `0 24px 80px -32px ${study.accent}55` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={study.image}
              alt={`${study.name} interface`}
              className="block w-full"
              style={{ aspectRatio: '16 / 10', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="px-5 md:px-10 py-14 md:py-20">
        <div className="max-w-5xl mx-auto grid gap-12 md:grid-cols-[200px_1fr] md:gap-16">
          {/* Meta rail */}
          <aside className="flex flex-col gap-7 md:sticky md:top-24 md:self-start">
            <div>
              <div className="text-[9px] mb-2 opacity-40" style={mono}>Year</div>
              <div className="text-[14px]">{study.year}</div>
            </div>
            <div>
              <div className="text-[9px] mb-2 opacity-40" style={mono}>Type</div>
              <div className="text-[14px]">{study.type}</div>
            </div>
            <div>
              <div className="text-[9px] mb-2 opacity-40" style={mono}>Stack</div>
              <div className="flex flex-wrap gap-1.5">
                {study.stack.map(tech => (
                  <span
                    key={tech}
                    className="text-[10px] px-2 py-1 rounded-full"
                    style={{ ...mono, letterSpacing: '0.12em', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.04)' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            {study.link && (
              <a
                href={study.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] w-fit px-3 py-2 rounded-full transition-opacity hover:opacity-80"
                style={{ ...mono, color: '#000', background: study.accent, textDecoration: 'none' }}
              >
                View live
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </aside>

          {/* Narrative */}
          <article className="flex flex-col gap-12 max-w-2xl">
            <section>
              <h2 className="text-[10px] mb-4" style={{ ...mono, color: study.accent }}>The brief</h2>
              <p className="text-[15px] md:text-[16px] leading-[1.75]" style={{ color: 'var(--text-secondary)' }}>
                {study.brief}
              </p>
            </section>

            <section>
              <h2 className="text-[10px] mb-4" style={{ ...mono, color: study.accent }}>What I built</h2>
              <ul className="flex flex-col gap-3">
                {study.built.map(line => (
                  <li key={line} className="flex gap-3 text-[15px] leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>
                    <span aria-hidden="true" className="mt-[9px] size-[5px] rounded-full flex-none" style={{ background: study.accent }} />
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </div>
      </div>

      {/* ── Next ── */}
      {next && (
        <div className="px-5 md:px-10 pb-20">
          <Link
            href={`/work/${next.slug}`}
            className="group block max-w-5xl mx-auto rounded-xl px-6 py-7 md:px-8 md:py-9 transition-colors"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', textDecoration: 'none' }}
          >
            <div className="text-[9px] mb-3 opacity-40" style={mono}>Next case study</div>
            <div className="flex items-baseline justify-between gap-4">
              <span
                className="uppercase"
                style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(1.4rem, 3.4vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}
              >
                {next.name}
              </span>
              <span className="text-[18px] flex-none opacity-40 group-hover:opacity-100 transition-opacity" aria-hidden="true">→</span>
            </div>
            <div className="mt-2 text-[12px]" style={{ ...mono, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
              {next.year} · {next.type}
            </div>
          </Link>
        </div>
      )}
    </main>
  )
}
