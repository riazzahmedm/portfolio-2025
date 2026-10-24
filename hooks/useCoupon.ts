'use client'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

const COUPON_KEY   = 'shop-coupon'
const COUPON_EVENT = 'shop-coupon-updated'

function readStoredCoupon(): string {
  try { return localStorage.getItem(COUPON_KEY) ?? '' } catch { return '' }
}

function subscribeToCoupon(onChange: () => void) {
  window.addEventListener(COUPON_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(COUPON_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

const getServerSnapshot = () => ''

function writeStoredCoupon(code: string) {
  try {
    if (code) localStorage.setItem(COUPON_KEY, code)
    else localStorage.removeItem(COUPON_KEY)
  } catch { /* storage unavailable — the coupon just won't persist */ }
  window.dispatchEvent(new Event(COUPON_EVENT))
}

/** Forgets any stored coupon — used once an order is placed. */
export function clearStoredCoupon() {
  writeStoredCoupon('')
}

type Result = { key: string; discount: number; error: string }
const EMPTY: Result = { key: '', discount: 0, error: '' }

async function requestDiscount(code: string, subtotal: number) {
  try {
    const res = await fetch('/api/shop/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false as const, error: data.error ?? 'Invalid coupon code' }
    return { ok: true as const, discount: data.discount as number }
  } catch {
    return { ok: false as const, error: 'Could not verify coupon' }
  }
}

/**
 * A coupon applied to the cart. The code lives in localStorage (so it survives
 * the hand-off from cart → checkout) and the discount is always re-derived from
 * the API against the current, post bundle-deal subtotal — it can never go stale.
 */
export function useCoupon(subtotal: number) {
  const code = useSyncExternalStore(subscribeToCoupon, readStoredCoupon, getServerSnapshot)
  const [result, setResult] = useState<Result>(EMPTY)
  const [attempt, setAttempt] = useState(0)

  const key = `${code}:${subtotal}`

  // Validate whenever the code, the discounted subtotal, or a re-apply changes.
  useEffect(() => {
    if (!code || subtotal <= 0) return
    let cancelled = false

    requestDiscount(code, subtotal).then(res => {
      if (cancelled) return
      setResult(res.ok
        ? { key, discount: res.discount, error: '' }
        : { key, discount: 0, error: res.error })
    })

    return () => { cancelled = true }
  }, [code, subtotal, key, attempt])

  const settled    = result.key === key
  const validating = Boolean(code) && subtotal > 0 && !settled

  const apply = useCallback((raw: string) => {
    const next = raw.trim().toUpperCase()
    if (!next) return
    writeStoredCoupon(next)
    setAttempt(n => n + 1)
  }, [])

  const remove = useCallback(() => {
    writeStoredCoupon('')
    setResult(EMPTY)
  }, [])

  return {
    code,
    discount: settled ? result.discount : 0,
    error:    settled ? result.error : '',
    validating,
    apply,
    remove,
  }
}
