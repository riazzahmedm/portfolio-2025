interface Props {
  num: string
  label: string
}

export default function SectionTag({ num, label }: Props) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px w-8 flex-shrink-0" style={{ background: 'var(--lavender)' }} />
      <span
        className="text-[12px] tracking-[0.28em] uppercase"
        style={{ color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}
      >
        {num} / {label}
      </span>
    </div>
  )
}
