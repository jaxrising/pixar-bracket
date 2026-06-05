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
      className="font-body font-black text-sm pointer-events-auto whitespace-nowrap transition-all hover:scale-[1.03] active:scale-[0.97]"
      style={{
        background: '#111111',
        color: '#ffffff',
        border: 'none',
        borderRadius: '999px',
        padding: '14px 28px',
        minHeight: '52px',
        cursor: 'pointer',
        letterSpacing: '0.01em',
        boxShadow: '0 4px 14px rgba(17,17,17,0.2)',
      }}
    >
      {isOpen ? 'View Bracket →' : '← Back to voting'}
    </motion.button>
  )
}
