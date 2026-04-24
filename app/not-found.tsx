import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ background: '#050505' }}>
      <div className="dot-grid absolute inset-0" />
      <div className="vignette absolute inset-0" />
      <div className="red-orb absolute -top-32 -right-20" />

      <div className="relative z-10 text-center px-6">
        <div style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(6rem,20vw,16rem)', lineHeight: 1, color: 'rgba(255,255,255,0.03)', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap' }}>
          404
        </div>

        <div className="relative">
          <div className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--red)', fontFamily: 'var(--ff-mono)' }}>
            Error: 404
          </div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(2rem,6vw,4rem)', color: 'white', marginBottom: '1rem', lineHeight: 1 }}>
            PAGE NOT FOUND
          </h1>
          <p className="text-[11px] leading-relaxed mb-2 italic" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-mono)' }}>
            talent.js not found in other candidates
          </p>
          <p className="text-[9px] tracking-[0.1em] mb-8" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--ff-mono)' }}>
            {`// but you're in the right place`}
          </p>
          <Link
            href="/"
            className="inline-block text-[10px] tracking-[0.2em] uppercase px-6 py-3 rounded-sm transition-all duration-200 hover:opacity-90"
            style={{ background: 'var(--red)', color: 'white', fontFamily: 'var(--ff-mono)' }}
          >
            git checkout main
          </Link>
        </div>
      </div>
    </div>
  )
}
