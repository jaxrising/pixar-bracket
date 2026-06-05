import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface Props {
  count?: number
  colors?: string[]
  durationMs?: number
  spread?: number
  active?: boolean
}

const PAPER_COLORS = ['#f4e8d0', '#ffd166', '#ffb627', '#c8412b', '#1b2845', '#fff4d6']

export default function Confetti({
  count = 100,
  colors = PAPER_COLORS,
  durationMs = 5500,
  spread = 1,
  active = true,
}: Props) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 100 * spread,
      delay: Math.random() * 1.2,
      rotateStart: Math.random() * 360,
      rotateEnd: Math.random() * 1440 - 720,
      color: colors[i % colors.length],
      w: 6 + Math.random() * 12,
      h: 4 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 280,
      duration: 3 + Math.random() * 2.5,
      skew: (Math.random() - 0.5) * 25,
    }))
  }, [count, colors, spread])

  if (!active) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 50 }}
    >
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: `${50 + p.x}vw`,
            y: '-10vh',
            rotate: p.rotateStart,
            opacity: 1,
          }}
          animate={{
            x: `calc(${50 + p.x}vw + ${p.drift}px)`,
            y: '110vh',
            rotate: p.rotateEnd,
            opacity: [1, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.2, 0.4, 0.6, 1],
          }}
          style={{
            position: 'absolute',
            width: p.w,
            height: p.h,
            background: p.color,
            // soft paper edge — slightly irregular rectangles
            clipPath: 'polygon(2% 0%, 98% 3%, 100% 98%, 0% 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
            transform: `skewX(${p.skew}deg)`,
            transformOrigin: 'center',
          }}
        />
      ))}
      {/* Total duration not enforced — pieces fade out via opacity keyframes */}
      <div style={{ display: 'none' }} aria-hidden>{durationMs}</div>
    </div>
  )
}
