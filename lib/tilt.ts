import { useSyncExternalStore } from 'react'
import type { PointerEvent } from 'react'

/* ── Mouse: pointer position → CSS variables ─────────────────────────────── */

export function tiltMove(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget
  const r  = el.getBoundingClientRect()
  const x  = (e.clientX - r.left) / r.width
  const y  = (e.clientY - r.top) / r.height
  setVars(el, x - 0.5, y - 0.5)
}

export function tiltLeave(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget
  el.classList.remove('is-tilting')
  el.style.setProperty('--mx', '0')
  el.style.setProperty('--my', '0')
}

export const tiltProps = { onPointerMove: tiltMove, onPointerLeave: tiltLeave }

function setVars(el: HTMLElement, mx: number, my: number) {
  el.classList.add('is-tilting')
  el.style.setProperty('--mx', mx.toFixed(3))
  el.style.setProperty('--my', my.toFixed(3))
  el.style.setProperty('--gx', `${((mx + 0.5) * 100).toFixed(1)}%`)
  el.style.setProperty('--gy', `${((my + 0.5) * 100).toFixed(1)}%`)
}

/* ── Phone: device tilt (gyro) → the same CSS variables ──────────────────── */

export type GyroStatus = 'idle' | 'needs-permission' | 'on' | 'unavailable'

type OrientationCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

const RANGE_DEG   = 44   // degrees of phone tilt that map to a full card tilt
const SMOOTHING   = 0.18 // per frame
const RECENTER    = 0.002 // per event: slowly treats the way you hold the phone as neutral
const PROBE_MS    = 1200

let status: GyroStatus = 'idle'
const listeners = new Set<() => void>()

function setStatus(next: GyroStatus) {
  if (next === status) return
  status = next
  document.documentElement.classList.toggle('gyro-on', next === 'on')
  listeners.forEach(l => l())
}

export function useGyroStatus(): GyroStatus {
  return useSyncExternalStore(
    cb => { listeners.add(cb); return () => { listeners.delete(cb) } },
    () => status,
    () => 'idle' as GyroStatus,
  )
}

// Only cards currently on screen are updated, so a long grid costs almost nothing
const visible = new Set<HTMLElement>()
let io: IntersectionObserver | null = null

function observer() {
  if (!io) {
    io = new IntersectionObserver(entries => {
      for (const e of entries) {
        const el = e.target as HTMLElement
        if (e.isIntersecting) visible.add(el)
        else { visible.delete(el); if (!el.isConnected) io?.unobserve(el) }
      }
    }, { rootMargin: '120px' })
  }
  return io
}

/** Callback ref: opt an element into gyro tilt. */
export function gyroRef(el: HTMLElement | null) {
  if (el) observer().observe(el)
}

let want   = { b: 0, g: 0 }
let smooth = { b: 0, g: 0 }
let base   = { b: 0, g: 0 }
let seeded = false
let raf    = 0

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

function adjustForScreen(beta: number, gamma: number) {
  const angle = ((screen.orientation?.angle ?? 0) + 360) % 360
  if (angle === 90)  return { b: -gamma, g: beta }
  if (angle === 180) return { b: -beta,  g: -gamma }
  if (angle === 270) return { b: gamma,  g: -beta }
  return { b: beta, g: gamma }
}

function frame() {
  raf = 0
  smooth.b += (want.b - smooth.b) * SMOOTHING
  smooth.g += (want.g - smooth.g) * SMOOTHING
  const my = clamp((smooth.b - base.b) / RANGE_DEG, -0.5, 0.5)
  const mx = clamp((smooth.g - base.g) / RANGE_DEG, -0.5, 0.5)
  visible.forEach(el => setVars(el, mx, my))
  if (Math.abs(want.b - smooth.b) > 0.05 || Math.abs(want.g - smooth.g) > 0.05) raf = requestAnimationFrame(frame)
}

function onOrientation(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return
  const a = adjustForScreen(e.beta, e.gamma)
  want = a
  if (!seeded) { seeded = true; smooth = { ...a }; base = { ...a } }
  base.b += (a.b - base.b) * RECENTER
  base.g += (a.g - base.g) * RECENTER
  setStatus('on')
  if (!raf) raf = requestAnimationFrame(frame)
}

function listen()   { window.addEventListener('deviceorientation', onOrientation) }
function unlisten() { window.removeEventListener('deviceorientation', onOrientation) }

let started = false

/** Call once on a page that uses tilt cards. Starts silently where no permission is needed (Android). */
export function initGyro() {
  if (typeof window === 'undefined' || started) return
  started = true

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!coarse || reduce || !('DeviceOrientationEvent' in window)) { setStatus('unavailable'); return }

  const needsPermission = typeof (DeviceOrientationEvent as OrientationCtor).requestPermission === 'function'

  // Works straight away on Android, and on iOS if the site was already allowed this session
  listen()
  setTimeout(() => {
    if (status === 'on') return
    unlisten()
    setStatus(needsPermission ? 'needs-permission' : 'unavailable')
  }, PROBE_MS)
}

/** iOS only: must be called from a tap. */
export async function enableGyro() {
  try {
    const result = await (DeviceOrientationEvent as OrientationCtor).requestPermission?.()
    if (result !== 'granted') { setStatus('unavailable'); return }
    listen()
    setTimeout(() => { if (status !== 'on') { unlisten(); setStatus('unavailable') } }, PROBE_MS * 2)
  } catch {
    setStatus('unavailable')
  }
}
