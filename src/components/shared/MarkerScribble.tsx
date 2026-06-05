import { motion } from 'framer-motion'

type Variant = 'x' | 'circle' | 'underline' | 'vs' | 'arrow'

interface Props {
  variant?: Variant
  size?: number
  color?: string
  delay?: number
  className?: string
  style?: React.CSSProperties
  animate?: boolean
}

const PATHS: Record<Variant, { d: string; viewBox: string; width: number; height: number }> = {
  x: {
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 12 18 Q 50 50 88 84 M 88 16 Q 50 50 14 86',
  },
  circle: {
    viewBox: '0 0 100 100',
    width: 100,
    height: 100,
    d: 'M 50 8 Q 92 18 90 50 Q 88 88 48 92 Q 12 90 10 50 Q 14 14 52 10',
  },
  underline: {
    viewBox: '0 0 200 30',
    width: 200,
    height: 30,
    d: 'M 6 18 Q 50 8 100 16 T 195 14',
  },
  vs: {
    viewBox: '0 0 80 60',
    width: 80,
    height: 60,
    d: 'M 8 12 L 28 50 L 50 14 M 60 50 Q 76 36 60 28 Q 50 22 64 14',
  },
  arrow: {
    viewBox: '0 0 120 60',
    width: 120,
    height: 60,
    d: 'M 8 30 Q 40 8 90 30 M 78 16 L 92 30 L 78 42',
  },
}

export default function MarkerScribble({
  variant = 'x',
  size = 100,
  color = '#111111',
  delay = 0,
  className,
  style,
  animate = true,
}: Props) {
  const p = PATHS[variant]
  const aspect = p.height / p.width
  return (
    <svg
      width={size}
      height={size * aspect}
      viewBox={p.viewBox}
      className={className}
      style={style}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {animate ? (
        <motion.path
          d={p.d}
          stroke={color}
          strokeWidth={5}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.92 }}
          transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        />
      ) : (
        <path d={p.d} stroke={color} strokeWidth={5} opacity="0.92" />
      )}
    </svg>
  )
}
