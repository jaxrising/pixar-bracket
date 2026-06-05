import { motion } from 'framer-motion'
import SeedCard from './SeedCard'
import PlayerAvatar from '../ui/PlayerAvatar'
import type { BracketSeedEntry, MatchupState, MatchupTally, Player } from '../../types/room'

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
  matchupVotes?: Record<string, string>
  players?: Record<string, Player>
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
  matchupVotes = {},
  players = {},
}: Props) {
  // Split voters by which side they voted for
  const aVoters = Object.entries(matchupVotes)
    .filter(([, seedId]) => seedId === aSeed?.id)
    .map(([uid]) => players[uid])
    .filter(Boolean) as Player[]
  const bVoters = Object.entries(matchupVotes)
    .filter(([, seedId]) => seedId === bSeed?.id)
    .map(([uid]) => players[uid])
    .filter(Boolean) as Player[]
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
      <div className="flex items-center justify-center gap-2">
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
        <div className="flex flex-col items-center justify-center min-w-[44px] gap-1">
          <span
            className="font-poster"
            style={{
              fontSize: size === 'xl' ? '5rem' : size === 'lg' ? '3.5rem' : size === 'md' ? '2.5rem' : '1.75rem',
              color: '#111111',
              display: 'inline-block',
              lineHeight: 1,
              letterSpacing: '-0.02em',
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
            color: '#111111',
            transform: 'rotate(4deg)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          coin flip!
        </div>
      )}

      {/* Voter avatars shown when revealed */}
      {revealed && (aVoters.length > 0 || bVoters.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex items-start justify-center gap-3 mt-2"
        >
          {/* A-side voters */}
          <div className="flex flex-wrap gap-1 justify-end" style={{ width: 150 }}>
            {aVoters.map((p, i) => (
              <div key={i} title={p.name} style={{ filter: aWinner ? 'none' : 'grayscale(1) opacity(0.5)' }}>
                <PlayerAvatar value={p.emoji} size={28} />
              </div>
            ))}
          </div>
          <div style={{ minWidth: 44 }} />
          {/* B-side voters */}
          <div className="flex flex-wrap gap-1 justify-start" style={{ width: 150 }}>
            {bVoters.map((p, i) => (
              <div key={i} title={p.name} style={{ filter: bWinner ? 'none' : 'grayscale(1) opacity(0.5)' }}>
                <PlayerAvatar value={p.emoji} size={28} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
