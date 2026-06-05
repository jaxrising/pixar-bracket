import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { BracketState, Player, Votes } from '../../types/room'
import { getMatchupsForRound, getSeedById } from '../../lib/bracket'
import { tallyMatchup } from '../../lib/tally'
import MatchupTile from './MatchupTile'

interface Props {
  bracket: BracketState
  votes: Votes
  currentRound: number
  myVotes: Record<string, string>
  onPick: (matchupId: string, seedId: string) => void
  players?: Record<string, Player>
  showVoteBars?: boolean
  revealed?: boolean
  revealCursor?: number
  hideEmpty?: boolean
}

export default function BracketBoard({
  bracket,
  votes,
  currentRound,
  myVotes,
  onPick,
  players,
  showVoteBars = false,
  revealed = false,
  revealCursor = 0,
  hideEmpty = false,
}: Props) {
  const matchups = useMemo(
    () => getMatchupsForRound(bracket, currentRound),
    [bracket, currentRound],
  )

  // Determine card size based on matchup count
  const cardSize =
    matchups.length >= 8 ? 'sm' : matchups.length >= 4 ? 'md' : matchups.length >= 2 ? 'lg' : 'xl'

  // Layout depends on round
  const cols = matchups.length >= 4 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'

  return (
    <div className="relative">
      <motion.div layout className={`grid ${cols} gap-x-8 gap-y-10`}>
        {matchups.map((m, i) => {
          const aSeed = getSeedById(bracket, m.matchup.a)
          const bSeed = getSeedById(bracket, m.matchup.b)
          if (hideEmpty && (!aSeed || !bSeed)) return null
          const tally = tallyMatchup(m.id, m.matchup, votes)
          const matchupRevealed = revealed && i < revealCursor
          const matchupVotes = (votes ?? {})[m.id] ?? {}
          return (
            <MatchupTile
              key={m.id}
              index={i}
              matchup={m.matchup}
              aSeed={aSeed}
              bSeed={bSeed}
              tally={tally}
              mySelectedSeedId={myVotes[m.id] ?? null}
              size={cardSize}
              onPickA={aSeed ? () => onPick(m.id, aSeed.id) : undefined}
              onPickB={bSeed ? () => onPick(m.id, bSeed.id) : undefined}
              showVoteBars={showVoteBars || matchupRevealed}
              revealed={matchupRevealed}
              matchupVotes={matchupVotes}
              players={players}
            />
          )
        })}
      </motion.div>
    </div>
  )
}
