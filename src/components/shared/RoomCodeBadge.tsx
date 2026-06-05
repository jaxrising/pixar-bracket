interface Props {
  code: string
  size?: 'sm' | 'md' | 'lg'
}

export default function RoomCodeBadge({ code, size = 'md' }: Props) {
  const dims =
    size === 'lg'
      ? { card: 'px-6 py-3', code: 'text-5xl', label: 'text-xs' }
      : size === 'sm'
        ? { card: 'px-3 py-1.5', code: 'text-base', label: 'text-[10px]' }
        : { card: 'px-4 py-2', code: 'text-2xl', label: 'text-xs' }

  return (
    <div
      className={`inline-flex flex-col ${dims.card}`}
      style={{
        background: '#ffffff',
        border: '1.5px solid #111111',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <div
        className={`${dims.label} font-body font-bold uppercase`}
        style={{ color: 'rgba(17,17,17,0.45)', letterSpacing: '0.12em' }}
      >
        room
      </div>
      <div
        className={`font-poster ${dims.code} leading-none mt-0.5`}
        style={{ color: '#111111', letterSpacing: size === 'lg' ? '0.18em' : '0.12em' }}
      >
        {code}
      </div>
    </div>
  )
}
