'use client'
import { useCursor } from '@/hooks/useCursor'

export default function CustomCursor() {
  useCursor()
  return (
    <>
      <div className="cursor" />
      <div className="cursor-ring" />
    </>
  )
}
