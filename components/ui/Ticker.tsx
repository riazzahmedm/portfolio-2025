'use client'
import { TICKER_ITEMS } from '@/lib/data'

export default function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="overflow-hidden transition-colors duration-300" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
      <div className="ticker-inner py-2">
        {items.map((item, i) => (
          <span key={i} className="flex items-center text-[13px] tracking-[0.18em] uppercase px-5" style={{ color: i % 2 === 0 ? 'var(--text-dim)' : 'var(--red-dim)' }}>
            {i % 2 === 0 ? item : '●'}
          </span>
        ))}
      </div>
    </div>
  )
}
