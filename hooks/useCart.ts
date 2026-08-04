'use client'
import { useState, useEffect, useCallback } from 'react'
import type { CartItem, ShopBundleDeal } from '@/lib/shop.types'

const CART_KEY = 'shop-cart'

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') } catch { return [] }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function applyBundleDeal(items: CartItem[], deals: ShopBundleDeal[]): {
  subtotal: number
  discount: number
  total: number
  appliedDeals: ShopBundleDeal[]
} {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  // Group items by category_id (null = uncategorised)
  const byCategory = new Map<string | null, CartItem[]>()
  for (const item of items) {
    const key = item.category_id ?? null
    if (!byCategory.has(key)) byCategory.set(key, [])
    byCategory.get(key)!.push(item)
  }

  let totalDiscount = 0
  const appliedDeals: ShopBundleDeal[] = []

  for (const [catId, catItems] of byCategory) {
    const catQty = catItems.reduce((s, i) => s + i.qty, 0)
    // Deals for this category (or global deals with null category_id)
    const candidates = deals
      .filter(d => d.is_active && d.category_id === catId && catQty >= d.min_qty)
      .sort((a, b) => b.min_qty - a.min_qty)
    const deal = candidates[0]
    if (deal) {
      const catSubtotal = catItems.reduce((s, i) => s + i.price * i.qty, 0)
      // Apply deal to exactly min_qty items; remaining qty stays at normal price
      const applicableSubtotal = catSubtotal * (deal.min_qty / catQty)
      totalDiscount += Math.max(0, applicableSubtotal - deal.price)
      appliedDeals.push(deal)
    }
  }

  return {
    subtotal,
    discount: totalDiscount,
    total: subtotal - totalDiscount,
    appliedDeals,
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(readCart())
    const handler = () => setItems(readCart())
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [])

  const sync = useCallback((next: CartItem[]) => {
    setItems(next)
    writeCart(next)
    window.dispatchEvent(new Event('cart-updated'))
  }, [])

  const addItem = useCallback((item: CartItem) => {
    const current = readCart()
    const existing = current.findIndex(i => i.variantId === item.variantId)
    if (existing >= 0) {
      current[existing].qty = Math.min(current[existing].qty + item.qty, item.stock_qty)
    } else {
      current.push({ ...item, qty: Math.min(item.qty, item.stock_qty) })
    }
    sync(current)
  }, [sync])

  const updateQty = useCallback((variantId: string, qty: number) => {
    const current = readCart()
    if (qty <= 0) {
      sync(current.filter(i => i.variantId !== variantId))
    } else {
      sync(current.map(i => i.variantId === variantId ? { ...i, qty: Math.min(qty, i.stock_qty) } : i))
    }
  }, [sync])

  const removeItem = useCallback((variantId: string) => {
    sync(readCart().filter(i => i.variantId !== variantId))
  }, [sync])

  const clearCart = useCallback(() => sync([]), [sync])

  const count = items.reduce((s, i) => s + i.qty, 0)

  return { items, count, addItem, updateQty, removeItem, clearCart }
}
