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
  appliedDeal: ShopBundleDeal | null
} {
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  const activeDeals = deals
    .filter(d => d.is_active && totalQty >= d.min_qty)
    .sort((a, b) => b.min_qty - a.min_qty)

  const deal = activeDeals[0] ?? null
  if (deal) {
    return { subtotal, discount: Math.max(0, subtotal - deal.price), total: deal.price, appliedDeal: deal }
  }
  return { subtotal, discount: 0, total: subtotal, appliedDeal: null }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => { setItems(readCart()) }, [])

  const sync = useCallback((next: CartItem[]) => {
    setItems(next)
    writeCart(next)
  }, [])

  const addItem = useCallback((item: CartItem) => {
    const current = readCart()
    const existing = current.findIndex(i => i.variantId === item.variantId)
    if (existing >= 0) {
      current[existing].qty += item.qty
    } else {
      current.push(item)
    }
    sync(current)
  }, [sync])

  const updateQty = useCallback((variantId: string, qty: number) => {
    const current = readCart()
    if (qty <= 0) {
      sync(current.filter(i => i.variantId !== variantId))
    } else {
      sync(current.map(i => i.variantId === variantId ? { ...i, qty } : i))
    }
  }, [sync])

  const removeItem = useCallback((variantId: string) => {
    sync(readCart().filter(i => i.variantId !== variantId))
  }, [sync])

  const clearCart = useCallback(() => sync([]), [sync])

  const count = items.reduce((s, i) => s + i.qty, 0)

  return { items, count, addItem, updateQty, removeItem, clearCart }
}
