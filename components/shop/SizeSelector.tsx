'use client'
import type { ShopVariant } from '@/lib/shop.types'

interface Props {
  variants: ShopVariant[]
  selected: string | null
  onSelect: (variantId: string) => void
}

export default function SizeSelector({ variants, selected, onSelect }: Props) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {variants.map(v => {
        const outOfStock = v.stock_qty === 0
        const isSelected = selected === v.id
        return (
          <button
            key={v.id}
            disabled={outOfStock}
            onClick={() => onSelect(v.id)}
            style={{
              padding: '8px 18px', borderRadius: '10px', cursor: outOfStock ? 'not-allowed' : 'pointer',
              border: '1px solid',
              borderColor: isSelected ? 'var(--lavender)' : 'var(--border-card)',
              background:  isSelected ? 'var(--lavender-dim)' : 'var(--surface)',
              color:       outOfStock ? 'var(--text-dim)' : isSelected ? 'var(--lavender)' : 'var(--text-primary)',
              opacity:     outOfStock ? 0.5 : 1,
              fontFamily:  'var(--ff-mono)', fontSize: '13px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            }}
          >
            <span style={{ fontWeight: 600 }}>{v.size}</span>
            <span style={{ fontSize: '12px', color: isSelected ? 'var(--lavender)' : 'var(--text-secondary)' }}>
              ₹{Number(v.price).toFixed(0)}
            </span>
            {outOfStock && <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Out of stock</span>}
          </button>
        )
      })}
    </div>
  )
}
