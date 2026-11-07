import type { CSSProperties } from 'react'
import type { PostAccent } from './blog.types'

/** Inline custom properties for an element carrying class `fn-accent`; with no accent it keeps the blog's green. */
export function accentStyle(accent: PostAccent | null | undefined): CSSProperties | undefined {
  if (!accent) return undefined
  return { '--pa-dark-rgb': accent.dark, '--pa-light-rgb': accent.light } as CSSProperties
}
