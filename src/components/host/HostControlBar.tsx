import type { Phase } from '../../types/room'

interface Props {
  phase: Phase
  round: number
  totalRounds: number
  canStart: boolean
  canReveal: boolean
  canRevealNext: boolean
  canAdvance: boolean
  isLastRound: boolean
  onStart: () => void
  onBeginReveal: () => void
  onRevealNext: () => void
  onAdvance: () => void
  onCrown: () => void
  loading?: boolean
}

export default function HostControlBar({
  phase,
  round,
  totalRounds,
  canStart,
  canReveal,
  canRevealNext,
  canAdvance,
  isLastRound,
  onStart,
  onBeginReveal,
  onRevealNext,
  onAdvance,
  onCrown,
  loading,
}: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 px-5 py-4 flex items-center justify-between gap-3 pointer-events-none"
    style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(27,40,69,0.08)', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}
    >
      <div
        className="font-hand text-lg px-3 py-1 pointer-events-auto"
        style={{
          color: '#1b2845',
          background: 'rgba(244, 232, 208, 0.92)',
          border: '1px solid rgba(27, 40, 69, 0.35)',
          transform: 'rotate(-1.5deg)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
        }}
      >
        host controls
      </div>

      <div className="flex gap-3 pointer-events-auto">
        {phase === 'lobby' && (
          <PaperTag disabled={!canStart || loading} onClick={onStart} primary>
            ▶ Start Round 1
          </PaperTag>
        )}

        {phase === 'voting' && (
          <PaperTag disabled={!canReveal || loading} onClick={onBeginReveal} primary>
            Reveal winners
          </PaperTag>
        )}

        {phase === 'revealing' && (
          <PaperTag disabled={!canRevealNext || loading} onClick={onRevealNext} primary>
            Reveal next →
          </PaperTag>
        )}

        {phase === 'round_complete' && !isLastRound && (
          <PaperTag disabled={!canAdvance || loading} onClick={onAdvance} primary>
            ▶ Start Round {round + 1}
          </PaperTag>
        )}

        {phase === 'round_complete' && isLastRound && (
          <PaperTag disabled={loading} onClick={onCrown} primary stamp>
            Crown the GOAT
          </PaperTag>
        )}

        {phase === 'done' && (
          <span
            className="font-hand text-lg px-4 py-2"
            style={{ color: 'var(--cream)' }}
          >
            game over · round {round}/{totalRounds}
          </span>
        )}
      </div>
    </div>
  )
}

function PaperTag({
  children,
  onClick,
  disabled,
  primary,
  stamp,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  stamp?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative px-6 py-2.5 transition-all hover:scale-[1.04] hover:-rotate-1 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: primary ? '#f4e8d0' : 'rgba(244,232,208,0.85)',
        border: `2px solid ${primary ? '#1b2845' : 'rgba(27,40,69,0.6)'}`,
        color: stamp ? '#c8412b' : '#1b2845',
        fontFamily: stamp
          ? "'Big Shoulders Stencil Display', Impact, sans-serif"
          : "'Alfa Slab One', serif",
        fontSize: stamp ? '1.25rem' : '1rem',
        letterSpacing: stamp ? '0.08em' : '0.01em',
        fontWeight: stamp ? 900 : 400,
        boxShadow: '0 6px 14px -3px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.25)',
        transform: 'rotate(-1deg)',
      }}
    >
      {/* string at top — small hole */}
      <span
        aria-hidden
        className="absolute"
        style={{
          top: -3,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)',
        }}
      />
      {children}
    </button>
  )
}
