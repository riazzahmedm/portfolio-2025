'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const idRef = useRef<string>('')
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const id = getSessionId()
    idRef.current = id
    setSessionId(id)   // eslint-disable-line react-hooks/set-state-in-effect -- reads the id from localStorage, which only exists in the browser
  }, [])

  const track = useCallback((type: ShopEventType, metadata: Record<string, unknown> = {}) => {
    if (!idRef.current) return
    fetch('/api/shop/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, session_id: idRef.current, metadata }),
    }).catch(() => {})
  }, [])

  return { track, sessionId }
}
