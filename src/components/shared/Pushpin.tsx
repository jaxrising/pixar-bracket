interface Props {
  color?: 'red' | 'navy' | 'cream' | 'yellow'
  size?: number
}

const COLORS: Record<NonNullable<Props['color']>, { head: string; highlight: string; shadow: string }> = {
  red: { head: '#c8412b', highlight: '#ffb09e', shadow: '#8b2818' },
  navy: { head: '#2a3760', highlight: '#7e8cb5', shadow: '#0e1530' },
  cream: { head: '#f4e8d0', highlight: '#fff4d6', shadow: '#a88d5a' },
  yellow: { head: '#ffb627', highlight: '#fff0b0', shadow: '#9a6300' },
}

export default function Pushpin({ color = 'red', size = 18 }: Props) {
  const c = COLORS[color]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}
    >
      <circle cx="10" cy="10" r="7" fill={c.head} />
      <circle cx="10" cy="10" r="7" fill="none" stroke={c.shadow} strokeWidth="0.6" />
      <ellipse cx="7.5" cy="7.5" rx="2.6" ry="1.8" fill={c.highlight} opacity="0.9" />
      <circle cx="10" cy="10" r="1.2" fill={c.shadow} opacity="0.55" />
    </svg>
  )
}
