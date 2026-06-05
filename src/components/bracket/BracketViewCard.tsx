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
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="inline-flex items-center gap-3 px-6 py-3"
      style={{
        background: '#1b2845',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        boxShadow: '0 4px 14px rgba(27,40,69,0.25)',
        cursor: 'pointer',
        minWidth: 200,
      }}
    >
      <div className="text-left flex-1">
        <div className="font-body text-xs font-bold uppercase" style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em' }}>
          {isOpen ? 'view' : 'back'}
        </div>
        <div className="font-poster mt-0.5" style={{ fontSize: '1.1rem', lineHeight: 1.1 }}>
          {isOpen ? 'the whole bracket →' : '← back to voting'}
        </div>
      </div>
      {isOpen && (
        <svg width="36" height="24" viewBox="0 0 48 32" style={{ opacity: 0.6, flexShrink: 0 }}>
          <g stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round">
            <line x1="2" y1="6" x2="14" y2="6" />
            <line x1="2" y1="14" x2="14" y2="14" />
            <line x1="14" y1="6" x2="14" y2="14" />
            <line x1="14" y1="10" x2="22" y2="10" />
            <line x1="2" y1="20" x2="14" y2="20" />
            <line x1="2" y1="28" x2="14" y2="28" />
            <line x1="14" y1="20" x2="14" y2="28" />
            <line x1="14" y1="24" x2="22" y2="24" />
            <line x1="22" y1="10" x2="22" y2="24" />
            <line x1="22" y1="17" x2="46" y2="17" />
          </g>
        </svg>
      )}
    </motion.button>
  )
}
