interface Props {
  num: string
  label: string
}

export default function SectionTag({ num, label }: Props) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[12px] font-mono tracking-[0.2em]" style={{ color: 'var(--text-faint)', fontFamily: 'var(--ff-mono)' }}>{num}</span>
      <div className="h-px w-5" style={{ background: 'var(--lime)' }} />
      <span className="text-[12px] font-semibold tracking-[0.28em] uppercase" style={{ color: 'var(--lime)', fontFamily: 'var(--ff-body)' }}>{label}</span>
    </div>
  )
}
