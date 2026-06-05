interface Props {
  width?: number
  height?: number
  rotate?: number
  color?: 'amber' | 'cream' | 'red'
  className?: string
  style?: React.CSSProperties
}

const COLORS: Record<NonNullable<Props['color']>, { fill: string; top: string; bottom: string }> = {
  amber: { fill: 'rgba(255, 220, 130, 0.55)', top: 'rgba(255, 255, 200, 0.6)', bottom: 'rgba(180, 130, 60, 0.35)' },
  cream: { fill: 'rgba(244, 232, 208, 0.65)', top: 'rgba(255, 255, 240, 0.7)', bottom: 'rgba(160, 130, 90, 0.4)' },
  red: { fill: 'rgba(17, 17, 17, 0.55)', top: 'rgba(255, 180, 160, 0.6)', bottom: 'rgba(140, 40, 24, 0.5)' },
}

export default function Tape({
  width = 120,
  height = 26,
  rotate = -6,
  color = 'amber',
  className,
  style,
}: Props) {
  const c = COLORS[color]
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: c.fill,
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.18)',
        borderTop: `1px solid ${c.top}`,
        borderBottom: `1px solid ${c.bottom}`,
        position: 'absolute',
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}
