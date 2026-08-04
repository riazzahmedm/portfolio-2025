'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import SizeSelector from '@/components/shop/SizeSelector'
import { useCart } from '@/hooks/useCart'
import { useShopSession } from '@/hooks/useShopSession'
import type { ShopProduct, ShopVariant } from '@/lib/shop.types'

export default function ProductPage() {
  const { id }             = useParams<{ id: string }>()
  const router             = useRouter()
  const { addItem }        = useCart()
  const { track }          = useShopSession()
  const [product, setProduct] = useState<ShopProduct | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [activeImg, setActiveImg] = useState(0)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    fetch(`/api/shop/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
        track('page_view', { path: `/shop/${id}`, product_id: id, name: data.name })
      })
  }, [id, track])

  useEffect(() => { setQty(1) }, [selected])

  const selectedVariant: ShopVariant | undefined = product?.variants?.find(v => v.id === selected)

  function handleAddToCart() {
    if (!product || !selectedVariant) {
      toast.error('Please select a size')
      return
    }
    addItem({
      variantId:   selectedVariant.id,
      productId:   product.id,
      name:        product.name,
      size:        selectedVariant.size,
      price:       Number(selectedVariant.price),
      qty,
      stock_qty:   selectedVariant.stock_qty,
      image:       product.images[0] ?? '',
      category_id: product.category_id ?? null,
    })
    track('add_to_cart', {
      product_id: product.id,
      variant_id: selectedVariant.id,
      name:       product.name,
      size:       selectedVariant.size,
      price:      selectedVariant.price,
      qty,
    })
  }

  if (loading) return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <style>{`
        @keyframes shimmer-d { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        .d-shimmer { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); animation: shimmer-d 1.4s infinite; }
        .d-bone { background: var(--surface-raised); border-radius: 8px; position: relative; overflow: hidden; }
      `}</style>
      {/* back placeholder */}
      <div className="d-bone" style={{ width: 60, height: 14, marginBottom: 28 }}><div className="d-shimmer" /></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'start' }}>
        {/* image */}
        <div className="d-bone" style={{ aspectRatio: '1', borderRadius: 16 }}><div className="d-shimmer" /></div>

        {/* info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="d-bone" style={{ height: 32, width: '80%' }}><div className="d-shimmer" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="d-bone" style={{ height: 13, width: '100%' }}><div className="d-shimmer" /></div>
            <div className="d-bone" style={{ height: 13, width: '75%' }}><div className="d-shimmer" /></div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[60, 60, 70].map((w, i) => (
              <div key={i} className="d-bone" style={{ height: 52, width: w, borderRadius: 10 }}><div className="d-shimmer" /></div>
            ))}
          </div>
          <div className="d-bone" style={{ height: 50, borderRadius: 12 }}><div className="d-shimmer" /></div>
        </div>
      </div>
    </main>
  )

  if (!product) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>
      Product not found.
    </div>
  )

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '28px', fontFamily: 'var(--ff-body)' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'start' }}>
        <div>
          <div style={{ position: 'relative', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', background: 'var(--surface-alt)', marginBottom: '12px' }}>
            {product.images[activeImg] ? (
              <Image src={product.images[activeImg]} alt={product.name} fill style={{ objectFit: product.image_fit ?? 'cover', objectPosition: product.image_position ?? 'center' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>No image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '2px solid',
                  borderColor: activeImg === i ? 'var(--lavender)' : 'var(--border-card)',
                  background: 'none', cursor: 'pointer', padding: 0, position: 'relative',
                }}>
                  <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '28px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 8px', color: 'var(--text-primary)' }}>
              {product.name}
            </h1>
            {product.tags && product.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {product.tags.map(tag => (
                  <span key={tag.id} style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px', background: 'var(--lavender-dim)', color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            {product.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {product.description}
              </p>
            )}
          </div>

          <div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>
              Select size
            </div>
            <SizeSelector
              variants={product.variants ?? []}
              selected={selected}
              onSelect={setSelected}
            />
          </div>

          {selectedVariant && (
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>
              ₹{Number(selectedVariant.price).toFixed(0)}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>Qty</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '4px 12px' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 4px' }}>−</button>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(q + 1, selectedVariant?.stock_qty ?? 1))}
                disabled={qty >= (selectedVariant?.stock_qty ?? 1)}
                style={{ background: 'none', border: 'none', color: qty >= (selectedVariant?.stock_qty ?? 1) ? 'var(--text-dim)' : 'var(--text-secondary)', cursor: qty >= (selectedVariant?.stock_qty ?? 1) ? 'not-allowed' : 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 4px' }}
              >+</button>
            </div>
          </div>

          {selectedVariant && selectedVariant.stock_qty <= 5 && (
            <div style={{ fontSize: '11px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em', color: '#e8ff00' }}>
              Only {selectedVariant.stock_qty} left in stock
            </div>
          )}

          <button
            onClick={handleAddToCart}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
              background: selected ? '#6b45d4' : 'var(--surface-alt)',
              color: selected ? '#fff' : 'var(--text-secondary)',
              border: 'none', cursor: selected ? 'pointer' : 'default',
              transition: 'background 0.2s ease', fontFamily: 'var(--ff-body)',
            }}
          >
            <ShoppingBag size={18} />
            Add to cart
          </button>
        </div>
      </div>
    </main>
  )
}
