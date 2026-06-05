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
  view: 'matchups' | 'bracket'
  onToggleView: () => void
  canToggleView: boolean
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
  view,
  onToggleView,
  canToggleView,
}: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 px-5 py-4 flex items-center justify-between gap-3"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(17,17,17,0.08)', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}
    >
      {/* Bracket toggle — left side */}
      {canToggleView ? (
        <button
          onClick={onToggleView}
          className="font-body font-bold text-sm px-5 py-3 transition-all hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: '#111111',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
          }}
        >
          {view === 'bracket' ? '← Back to voting' : 'View Bracket →'}
        </button>
      ) : (
        <div
          className="font-body text-xs font-black uppercase"
          style={{ color: 'rgba(17,17,17,0.35)', letterSpacing: '0.1em' }}
        >
          Host controls
        </div>
      )}

      <div className="flex gap-3">
        {phase === 'lobby' && (
          <PaperTag disabled={!canStart || loading} onClick={onStart}>
            ▶ Start Round 1
          </PaperTag>
        )}
        {phase === 'voting' && (
          <PaperTag disabled={!canReveal || loading} onClick={onBeginReveal}>
            Reveal winners
          </PaperTag>
        )}
        {phase === 'revealing' && (
          <PaperTag disabled={!canRevealNext || loading} onClick={onRevealNext}>
            Reveal next →
          </PaperTag>
        )}
        {phase === 'round_complete' && !isLastRound && (
          <PaperTag disabled={!canAdvance || loading} onClick={onAdvance}>
            ▶ Start Round {round + 1}
          </PaperTag>
        )}
        {phase === 'round_complete' && isLastRound && (
          <PaperTag disabled={loading} onClick={onCrown} stamp>
            Crown the GOAT
          </PaperTag>
        )}
        {phase === 'done' && (
          <span className="font-body text-sm font-bold px-4 py-2" style={{ color: 'rgba(17,17,17,0.45)' }}>
            game over · round {round}/{totalRounds}
          </span>
        )}
      </div>
    </div>
  )
}

function PaperTag({
  children, onClick, disabled, stamp,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  stamp?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 font-body font-bold text-sm transition-all hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: '#111111',
        color: '#ffffff',
        border: 'none',
        borderRadius: '10px',
        letterSpacing: stamp ? '0.06em' : '0.01em',
        boxShadow: '0 4px 14px rgba(17,17,17,0.25)',
      }}
    >
      {children}
    </button>
  )
}
