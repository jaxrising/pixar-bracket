import { motion } from 'framer-motion'

interface Props {
  onClick: () => void
  variant?: 'open' | 'back'
}

export default function BracketViewCard({ onClick, variant = 'open' }: Props) {
  const isOpen = variant === 'open'
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="font-body font-bold text-sm px-5 py-3 pointer-events-auto"
      style={{
        background: '#111111',
        color: '#ffffff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        letterSpacing: '0.01em',
      }}
    >
      {isOpen ? 'View Bracket →' : '← Back to voting'}
    </motion.button>
  )
}
