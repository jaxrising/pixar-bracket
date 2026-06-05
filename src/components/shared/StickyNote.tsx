import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  color?: 'yellow' | 'pink' | 'blue' | 'cream'
  rotate?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: React.CSSProperties
  animateIn?: boolean
}

const COLORS: Record<NonNullable<Props['color']>, { bg: string; edge: string }> = {
  yellow: { bg: '#ffd96b', edge: '#d49f1a' },
  pink: { bg: '#ffb3c1', edge: '#c87489' },
  blue: { bg: '#a3c4f3', edge: '#5b87cf' },
  cream: { bg: '#f4e8d0', edge: '#a88d5a' },
}

const SIZE: Record<NonNullable<Props['size']>, { w: string; p: string; font: string }> = {
  sm: { w: '80px', p: '8px 10px', font: '0.85rem' },
  md: { w: '120px', p: '14px 16px', font: '1.15rem' },
  lg: { w: '160px', p: '20px 22px', font: '1.5rem' },
}

export default function StickyNote({
  children,
  color = 'yellow',
  rotate = -3,
  size = 'md',
  className,
  style,
  animateIn = false,
}: Props) {
  const c = COLORS[color]
  const s = SIZE[size]

  const content = (
    <div
      className={className}
      style={{
        width: s.w,
        padding: s.p,
        background: `linear-gradient(135deg, ${c.bg} 0%, ${c.edge} 220%)`,
        boxShadow: '0 6px 14px -3px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.2)',
        transform: `rotate(${rotate}deg)`,
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        fontSize: s.font,
        color: '#1b2845',
        lineHeight: 1.15,
        textAlign: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  )

  if (animateIn) {
    return (
      <motion.div
        initial={{ scale: 0.6, rotate: rotate - 12, opacity: 0 }}
        animate={{ scale: 1, rotate, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
      >
        {content}
      </motion.div>
    )
  }
  return content
}
