import { motion } from 'framer-motion'

interface Props {
  text: string
  rotate?: number
  color?: 'red' | 'navy' | 'gold'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  style?: React.CSSProperties
  animate?: boolean
  delay?: number
}

const COLORS: Record<NonNullable<Props['color']>, string> = {
  red: '#c8412b',
  navy: '#1b2845',
  gold: '#b8860b',
}

const SIZE: Record<NonNullable<Props['size']>, { font: string; padding: string; border: string }> = {
  sm: { font: '0.85rem', padding: '4px 10px', border: '2px' },
  md: { font: '1.4rem', padding: '8px 18px', border: '3px' },
  lg: { font: '2rem', padding: '10px 22px', border: '4px' },
  xl: { font: '4.5rem', padding: '14px 32px', border: '6px' },
}

export default function RubberStamp({
  text,
  rotate = -8,
  color = 'red',
  size = 'md',
  className,
  style,
  animate = true,
  delay = 0,
}: Props) {
  const c = COLORS[color]
  const s = SIZE[size]

  const inner = (
    <span
      style={{
        fontFamily: "'Lato', system-ui, sans-serif",
        fontWeight: 900,
        letterSpacing: '0.04em',
        fontSize: s.font,
        color: c,
        padding: s.padding,
        border: `${s.border} solid ${c}`,
        borderRadius: '4px',
        display: 'inline-block',
        // ink-bleed feel
        textShadow: `0 0 1px ${c}, 0 0 2px ${c}33`,
        filter: 'url(#stamp-ink)',
        opacity: 0.88,
      }}
    >
      {text}
    </span>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ y: -160, rotate: rotate - 6, scale: 1.8, opacity: 0 }}
        animate={{
          y: [-160, 4, -4, 0],
          rotate: [rotate - 6, rotate, rotate, rotate],
          scale: [1.8, 1.05, 1.02, 1],
          opacity: [0, 1, 1, 1],
        }}
        transition={{ duration: 0.5, delay, times: [0, 0.55, 0.8, 1], ease: 'easeOut' }}
        className={className}
        style={{ display: 'inline-block', transformOrigin: 'center', ...style }}
      >
        {inner}
      </motion.div>
    )
  }
  return (
    <div className={className} style={{ display: 'inline-block', transform: `rotate(${rotate}deg)`, ...style }}>
      {inner}
    </div>
  )
}

/**
 * Add this SVG filter once at the app root for the ink-bleed effect.
 */
export function StampInkFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="stamp-ink" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="1.4" />
        </filter>
      </defs>
    </svg>
  )
}
