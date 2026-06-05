import type { MatchupState, MatchupTally, Votes } from '../types/room'

export function tallyMatchup(
  matchupId: string,
  matchup: MatchupState,
  votes: Votes,
): MatchupTally {
  const voteMap = (votes ?? {})[matchupId] ?? {}
  let aVotes = 0
  let bVotes = 0
  for (const seedId of Object.values(voteMap)) {
    if (seedId === matchup.a) aVotes++
    else if (seedId === matchup.b) bVotes++
  }
  const total = aVotes + bVotes
  const aPct = total === 0 ? 0 : (aVotes / total) * 100
  const bPct = total === 0 ? 0 : (bVotes / total) * 100
  let leader: MatchupTally['leader'] = null
  if (total > 0) {
    if (aVotes > bVotes) leader = 'a'
    else if (bVotes > aVotes) leader = 'b'
    else leader = 'tie'
  }
  return {
    matchupId,
    aId: matchup.a,
    bId: matchup.b,
    aVotes,
    bVotes,
    total,
    aPct,
    bPct,
    leader,
  }
}

export function resolveTie(seedA: string, seedB: string, matchupId: string): string {
  let hash = 0
  const seed = `${matchupId}-${seedA}-${seedB}-${Math.floor(Date.now() / 1000)}`
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 2 === 0 ? seedA : seedB
}

export function determineWinner(
  matchupId: string,
  matchup: MatchupState,
  votes: Votes,
): { winner: string; tieBroken: boolean } | null {
  if (!matchup.a || !matchup.b) return null
  const t = tallyMatchup(matchupId, matchup, votes)
  if (t.total === 0) {
    return { winner: resolveTie(matchup.a, matchup.b, matchupId), tieBroken: true }
  }
  if (t.leader === 'tie') {
    return { winner: resolveTie(matchup.a, matchup.b, matchupId), tieBroken: true }
  }
  return {
    winner: t.leader === 'a' ? matchup.a : matchup.b,
    tieBroken: false,
  }
}

export function countVotesByPlayer(votes: Votes, uid: string): number {
  let n = 0
  for (const voteMap of Object.values(votes ?? {})) {
    if (voteMap[uid]) n++
  }
  return n
}
