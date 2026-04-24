// Shared global reference to the Lenis smooth scroll instance.
// Set by SmoothScroll provider once it initialises; used by Nav/SideNav for programmatic scrollTo.
type LenisLike = { scrollTo: (target: HTMLElement | string | number, opts?: Record<string, unknown>) => void }

let _lenis: LenisLike | null = null

export function setLenisInstance(l: LenisLike | null) {
  _lenis = l
}

export function getLenisInstance(): LenisLike | null {
  return _lenis
}
