'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { ShopProduct } from '@/lib/shop.types'

export default function ProductCard({ product }: { product: ShopProduct }) {
  const image    = product.images[0]
  const minPrice = product.variants?.length
    ? Math.min(...product.variants.map(v => Number(v.price)))
    : null
  const inStock  = product.variants?.some(v => v.stock_qty > 0) ?? false

  return (
    <Link href={`/shop/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-card)',
        borderRadius: '16px', overflow: 'hidden',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--lavender-dim)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card)'
        }}
      >
        <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--surface-alt)' }}>
          {image ? (
            <Image src={image} alt={product.name} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              No image
            </div>
          )}
          {!inStock && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--ff-mono)' }}>
                Out of stock
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {product.name}
          </div>
          {product.tags && product.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {product.tags.map(tag => (
                <span key={tag.id} style={{
                  fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '2px 8px', borderRadius: '999px',
                  background: 'var(--lavender-dim)', color: 'var(--lavender)',
                  fontFamily: 'var(--ff-mono)',
                }}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          {minPrice !== null && (
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>
              From ₹{minPrice}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
