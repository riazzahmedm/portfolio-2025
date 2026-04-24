interface Props {
  current: number
  total?: number
}

export default function SectionFooter({ current, total = 8 }: Props) {
  const num = String(current).padStart(2, '0')
  const tot = String(total).padStart(2, '0')

  return (
    <div
      className="flex items-center justify-between px-6 md:px-10 py-3 flex-shrink-0 transition-colors duration-300"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-px overflow-hidden" style={{ background: 'var(--border-card)' }}>
          <div className="absolute top-0 bottom-0 w-full" style={{ background: 'var(--red)', animation: 'scanline 2s ease-in-out infinite' }} />
        </div>
        <span className="text-[12px] tracking-[0.18em] uppercase" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
          Scroll to explore
        </span>
      </div>
      <span className="text-[12px] tracking-[0.16em]" style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
        <span style={{ color: 'var(--red)' }}>{num}</span> / {tot}
      </span>
    </div>
  )
}
