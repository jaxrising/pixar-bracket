import { useCountdown } from '../../hooks/useCountdown'

interface Props {
  endsAt: number | null | undefined
  size?: number
  totalSeconds?: number
}

export default function TimerRing({ endsAt, size = 80, totalSeconds = 60 }: Props) {
  const { seconds, remainingMs } = useCountdown(endsAt)
  const totalMs = totalSeconds * 1000
  const pct = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = c * pct
  const lowTime = seconds <= 10 && seconds > 0

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className={lowTime ? 'animate-pulse' : ''}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={lowTime ? 'var(--danger)' : 'var(--accent)'}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 200ms linear, stroke 200ms ease' }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-display"
        style={{
          fontSize: size * 0.32,
          color: lowTime ? 'var(--danger)' : 'var(--text)',
        }}
      >
        {seconds}
      </div>
    </div>
  )
}
