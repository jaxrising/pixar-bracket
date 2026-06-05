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
        className="font-body text-xs font-black uppercase pointer-events-auto"
        style={{ color: 'rgba(27,40,69,0.35)', letterSpacing: '0.1em' }}
      >
        Host controls
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
            className="font-body text-sm font-bold px-4 py-2"
            style={{ color: 'rgba(27,40,69,0.45)' }}
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
      className="px-6 py-2.5 font-poster text-base transition-all hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed pointer-events-auto"
      style={{
        background: stamp ? '#c8412b' : '#1b2845',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: stamp ? '1.1rem' : '1rem',
        letterSpacing: stamp ? '0.06em' : '0.02em',
        boxShadow: stamp
          ? '0 4px 14px rgba(200,65,43,0.4)'
          : '0 4px 14px rgba(27,40,69,0.3)',
      }}
    >
      {children}
    </button>
  )
}
