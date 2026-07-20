'use client'
import { useCallback, useEffect, useRef } from 'react'
import type { ShopEventType } from '@/lib/shop.types'

const SESSION_KEY = 'shop-session-id'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function useShopSession() {
  const sessionId = useRef<string>('')

  useEffect(() => {
    sessionId.current = getSessionId()
  }, [])

  const track = useCallback((type: ShopEventType, metadata: Record<string, unknown> = {}) => {
    if (!sessionId.current) return
    fetch('/api/shop/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, session_id: sessionId.current, metadata }),
    }).catch(() => {})
  }, [])

  return { track, sessionId: sessionId.current }
}
