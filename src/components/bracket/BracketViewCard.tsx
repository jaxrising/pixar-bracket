import { motion } from 'framer-motion'
import Pushpin from '../shared/Pushpin'
import Tape from '../shared/Tape'

interface Props {
  onClick: () => void
  variant?: 'open' | 'back'
}

/**
 * A small clickable card pinned to the cork. Clicking it pans the scene to
 * a different region of the board.
 *   - 'open' variant: takes you to the full bracket overview
 *   - 'back' variant: takes you back to the active matchups
 */
export default function BracketViewCard({ onClick, variant = 'open' }: Props) {
  const isOpen = variant === 'open'
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, rotate: -2 }}
      whileTap={{ scale: 0.96, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      className="relative inline-block"
      style={{
        background: '#f4e8d0',
        backgroundImage:
          'radial-gradient(ellipse at 30% 20%, #fff4d6 0%, #f4e8d0 60%, #e6d4a8 100%)',
        border: '1.5px solid #1b2845',
        borderRadius: '4px',
        boxShadow: '0 10px 22px -4px rgba(0,0,0,0.45), 0 4px 8px rgba(0,0,0,0.25)',
        padding: '14px 18px 12px',
        minWidth: 200,
        transform: isOpen ? 'rotate(-2.5deg)' : 'rotate(1.5deg)',
        cursor: 'pointer',
      }}
    >
      <Tape width={70} height={18} rotate={isOpen ? -18 : 14} color="amber" style={{ top: -8, [isOpen ? 'left' : 'right']: -10 }} />
      <div className="absolute z-10" style={{ top: -8, [isOpen ? 'right' : 'left']: '20%', transform: 'translate(50%, 0)' }}>
        <Pushpin color={isOpen ? 'navy' : 'red'} size={14} />
      </div>

      <div
        className="font-hand text-sm"
        style={{ color: 'rgba(27,40,69,0.65)', lineHeight: 1 }}
      >
        {isOpen ? 'tap to view' : 'tap to go back'}
      </div>
      <div
        className="font-poster mt-1"
        style={{ color: '#1b2845', fontSize: '1.4rem', lineHeight: 1.05 }}
      >
        {isOpen ? 'the whole bracket →' : '← back to voting'}
      </div>

      {/* mini bracket icon */}
      {isOpen && (
        <svg
          className="absolute"
          width="48"
          height="32"
          viewBox="0 0 48 32"
          style={{ right: 10, bottom: 8, opacity: 0.5 }}
        >
          <g stroke="#1b2845" strokeWidth="1.4" fill="none" strokeLinecap="round">
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
