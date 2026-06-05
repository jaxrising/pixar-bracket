/**
 * Marker-style bracket connector lines drawn as SVG.
 * Each round's connectors collapse pairs of matchups into the next round's matchup.
 */

interface Coord {
  x: number
  y: number
}

interface Props {
  width: number
  height: number
  /** array of left-side pair connections (R1 → R2 → R3 → R4) */
  leftConnections?: Array<{ from1: Coord; from2: Coord; to: Coord }>
  /** array of right-side pair connections */
  rightConnections?: Array<{ from1: Coord; from2: Coord; to: Coord }>
  /** final convergence: two R3 winners → R4 */
  finalConnection?: { from1: Coord; from2: Coord; to: Coord }
  /** percentage of lines that should appear "drawn" (0..1). 1 = fully drawn. */
  progress?: number
  className?: string
  style?: React.CSSProperties
}

function jitter(amount = 1.5): number {
  return (Math.random() - 0.5) * amount
}

function makeBracketPath(from1: Coord, from2: Coord, to: Coord): string {
  // Two horizontal stubs from each "from" point, joining vertically, then a horizontal stub to "to"
  const midX = (from1.x + to.x) / 2 + jitter(2)
  const j1 = jitter()
  const j2 = jitter()
  return [
    `M ${from1.x} ${from1.y + j1}`,
    `L ${midX} ${from1.y + j1}`,
    `L ${midX} ${from2.y + j2}`,
    `M ${midX} ${(from1.y + from2.y) / 2}`,
    `L ${to.x} ${to.y + jitter()}`,
  ].join(' ')
}

export default function BracketLines({
  width,
  height,
  leftConnections = [],
  rightConnections = [],
  finalConnection,
  progress = 1,
  className,
  style,
}: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ pointerEvents: 'none', ...style }}
    >
      <defs>
        <filter id="marker-jitter" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="1.5" />
        </filter>
      </defs>
      <g
        stroke="#1b2845"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.78}
        filter="url(#marker-jitter)"
      >
        {leftConnections.map((c, i) => (
          <path
            key={`l-${i}`}
            d={makeBracketPath(c.from1, c.from2, c.to)}
            strokeDasharray={progress < 1 ? 600 : undefined}
            strokeDashoffset={progress < 1 ? 600 * (1 - progress) : undefined}
          />
        ))}
        {rightConnections.map((c, i) => (
          <path
            key={`r-${i}`}
            d={makeBracketPath(c.from1, c.from2, c.to)}
            strokeDasharray={progress < 1 ? 600 : undefined}
            strokeDashoffset={progress < 1 ? 600 * (1 - progress) : undefined}
          />
        ))}
        {finalConnection && (
          <path
            d={makeBracketPath(finalConnection.from1, finalConnection.from2, finalConnection.to)}
            strokeDasharray={progress < 1 ? 600 : undefined}
            strokeDashoffset={progress < 1 ? 600 * (1 - progress) : undefined}
          />
        )}
      </g>
    </svg>
  )
}
