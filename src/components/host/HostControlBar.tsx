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
      className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-4"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(17,17,17,0.08)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        padding: '12px 20px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
      }}
    >
      {/* Left — bracket toggle or label */}
      {canToggleView ? (
        <Btn onClick={onToggleView}>
          {view === 'bracket' ? '← Back to voting' : 'View Bracket →'}
        </Btn>
      ) : (
        <div
          className="font-body text-xs font-black uppercase"
          style={{ color: 'rgba(17,17,17,0.35)', letterSpacing: '0.1em' }}
        >
          Host controls
        </div>
      )}

      {/* Right — action */}
      <div className="flex gap-3">
        {phase === 'lobby' && (
          <Btn disabled={!canStart || loading} onClick={onStart}>▶ Start Round 1</Btn>
        )}
        {phase === 'voting' && (
          <Btn disabled={!canReveal || loading} onClick={onBeginReveal}>Reveal winners</Btn>
        )}
        {phase === 'revealing' && (
          <Btn disabled={!canRevealNext || loading} onClick={onRevealNext}>Reveal next →</Btn>
        )}
        {phase === 'round_complete' && !isLastRound && (
          <Btn disabled={!canAdvance || loading} onClick={onAdvance}>▶ Start Round {round + 1}</Btn>
        )}
        {phase === 'round_complete' && isLastRound && (
          <Btn disabled={loading} onClick={onCrown}>Crown the GOAT</Btn>
        )}
        {phase === 'done' && (
          <span className="font-body text-sm font-bold" style={{ color: 'rgba(17,17,17,0.45)' }}>
            game over · round {round}/{totalRounds}
          </span>
        )}
      </div>
    </div>
  )
}

function Btn({
  children, onClick, disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="font-body font-black text-sm transition-all hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      style={{
        background: '#111111',
        color: '#ffffff',
        border: 'none',
        borderRadius: '999px',
        padding: '14px 28px',
        minHeight: '52px',
        letterSpacing: '0.01em',
        boxShadow: '0 4px 14px rgba(17,17,17,0.2)',
      }}
    >
      {children}
    </button>
  )
}
