type PlatformDef = { key: string; label: string; emoji: string; logo: string | null }

/** Full-colour popcorn bucket, drawn to sit beside the streaming logos (red and white stripes, buttery popcorn). */
function PopcornMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: 'none' }}>
      {/* popcorn */}
      <g fill="#ffe7a1" stroke="#e0a93a" strokeWidth="0.9">
        <circle cx="9.5"  cy="10.5" r="3.6" />
        <circle cx="16"   cy="8"    r="4.2" />
        <circle cx="22.5" cy="10.5" r="3.6" />
        <circle cx="12.8" cy="12.5" r="3.3" />
        <circle cx="19.3" cy="12.5" r="3.3" />
      </g>
      {/* bucket */}
      <path d="M6.5 13.5h19l-2.4 15a1.6 1.6 0 0 1-1.6 1.3h-11a1.6 1.6 0 0 1-1.6-1.3z" fill="#fff" />
      <path d="M8 13.5h3.1l1 16.3H10.1zM14.2 13.5h3.6l-.5 16.3h-2.6zM20.9 13.5H24l-1.7 16.3h-2.4z" fill="#e5322d" />
      <path d="M6.5 13.5h19l-.4 2.6H6.9z" fill="#c9231f" />
    </svg>
  )
}

/** Unofficial sources: a small Jolly Roger flag on a pole, in the same flat full-colour style as the other marks. */
function JollyRogerMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: 'none' }}>
      <rect x="5" y="3" width="2" height="27" rx="1" fill="#b98a4e" />
      <circle cx="6" cy="3" r="1.8" fill="#e8b24a" />
      <path d="M7 6c4-2 8 2 12 0s6-1.5 8 0v14c-2-1.5-4-2-8 0s-8-2-12 0z" fill="#1d1d24" stroke="#4a4a58" strokeWidth="0.8" />
      {/* skull */}
      <path d="M17 9.2c-2.3 0-4 1.6-4 3.7 0 1.2.6 2.1 1.4 2.7v1.1h5.2v-1.1c.8-.6 1.4-1.5 1.4-2.7 0-2.1-1.7-3.7-4-3.7z" fill="#fff" />
      <circle cx="15.4" cy="12.8" r="1" fill="#1d1d24" />
      <circle cx="18.6" cy="12.8" r="1" fill="#1d1d24" />
      {/* crossbones */}
      <path d="M13 17.8l8 3M21 17.8l-8 3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/** A platform's mark: its logo, a popcorn bucket for the theatre, or its emoji. */
export default function PlatformIcon({ platform, size = 16 }: { platform: PlatformDef; size?: number }) {
  if (platform.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={platform.logo} alt="" style={{ width: size, height: size, borderRadius: Math.max(3, size / 5), objectFit: 'contain', flex: 'none' }} />
  }
  if (platform.key === 'theatre') return <PopcornMark size={size} />
  if (platform.key === 'unofficial') return <JollyRogerMark size={size} />
  return <span aria-hidden="true" style={{ fontSize: size, lineHeight: 1, flex: 'none' }}>{platform.emoji}</span>
}
