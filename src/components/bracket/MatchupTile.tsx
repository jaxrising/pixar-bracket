import { motion } from 'framer-motion'
import SeedCard from './SeedCard'
import type { BracketSeedEntry, MatchupState, MatchupTally } from '../../types/room'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  matchup: MatchupState
  aSeed: BracketSeedEntry | null
  bSeed: BracketSeedEntry | null
  tally?: MatchupTally
  mySelectedSeedId?: string | null
  size?: Size
  onPickA?: () => void
  onPickB?: () => void
  disabled?: boolean
  showVoteBars?: boolean
  revealed?: boolean
  index?: number
}

export default function MatchupTile({
  matchup,
  aSeed,
  bSeed,
  tally,
  mySelectedSeedId,
  size = 'md',
  onPickA,
  onPickB,
  disabled,
  showVoteBars = false,
  revealed = false,
  index = 0,
}: Props) {
  const aSelected = mySelectedSeedId === aSeed?.id
  const bSelected = mySelectedSeedId === bSeed?.id

  const winnerId = matchup.winner
  const aWinner = revealed && winnerId === aSeed?.id
  const bWinner = revealed && winnerId === bSeed?.id
  const aLoser = revealed && winnerId && winnerId !== aSeed?.id
  const bLoser = revealed && winnerId && winnerId !== bSeed?.id

  return (
    <motion.div
      initial={{ opacity: 0, y: -240, rotate: -12, scale: 1.18 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 130,
        damping: 14,
        mass: 0.75,
        delay: Math.min(0.08 * index, 0.6),
      }}
      className="relative"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <SeedCard
          seed={aSeed}
          size={size}
          selected={aSelected}
          dimmed={mySelectedSeedId !== null && mySelectedSeedId !== undefined && !aSelected && !revealed}
          winner={!!aWinner}
          loser={!!aLoser}
          showPercentage={showVoteBars && tally ? tally.aPct : null}
          onClick={onPickA}
          disabled={disabled || revealed}
        />
        {/* marker "vs" between cards */}
        <div className="flex items-center justify-center min-w-[48px]">
          <span
            className="font-hand"
            style={{
              fontSize: size === 'xl' ? '4rem' : size === 'lg' ? '2.5rem' : size === 'md' ? '1.75rem' : '1.25rem',
              color: '#1b2845',
              transform: 'rotate(-6deg)',
              display: 'inline-block',
            }}
          >
            vs
          </span>
        </div>
        <SeedCard
          seed={bSeed}
          size={size}
          selected={bSelected}
          dimmed={mySelectedSeedId !== null && mySelectedSeedId !== undefined && !bSelected && !revealed}
          winner={!!bWinner}
          loser={!!bLoser}
          showPercentage={showVoteBars && tally ? tally.bPct : null}
          onClick={onPickB}
          disabled={disabled || revealed}
        />
      </div>
      {matchup.tieBroken && revealed && (
        <div
          className="absolute -top-3 right-2 px-2 py-0.5 font-hand text-sm"
          style={{
            background: '#ffd96b',
            color: '#1b2845',
            transform: 'rotate(4deg)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          coin flip!
        </div>
      )}
    </motion.div>
  )
}
