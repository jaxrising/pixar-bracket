import type { BracketSeedEntry, BracketState, MatchupState } from '../types/room'
import type { BracketSize, Seed } from '../types/theme'

const SEEDING_16 = [
  [1, 16],
  [8, 9],
  [5, 12],
  [4, 13],
  [6, 11],
  [3, 14],
  [7, 10],
  [2, 15],
]

const SEEDING_32 = [
  [1, 32],
  [16, 17],
  [8, 25],
  [9, 24],
  [5, 28],
  [12, 21],
  [4, 29],
  [13, 20],
  [6, 27],
  [11, 22],
  [3, 30],
  [14, 19],
  [7, 26],
  [10, 23],
  [2, 31],
  [15, 18],
]

export function getSeedingForSize(size: BracketSize): number[][] {
  return size === 32 ? SEEDING_32 : SEEDING_16
}

export function totalRounds(size: BracketSize): number {
  return size === 32 ? 5 : 4
}

export function matchupsInRound(size: BracketSize, round: number): number {
  return size / Math.pow(2, round)
}

export function matchupId(round: number, index: number): string {
  return `m${round}-${index + 1}`
}

export function buildInitialBracket(seeds: Seed[]): BracketState {
  const size = seeds.length as BracketSize
  if (size !== 16 && size !== 32) {
    throw new Error(`Unsupported bracket size: ${size}`)
  }
  const pairings = getSeedingForSize(size)
  const seedsBySeedNumber: Record<string, BracketSeedEntry> = {}
  seeds.forEach((s, i) => {
    seedsBySeedNumber[String(i + 1)] = {
      id: s.id,
      name: s.name,
      shortName: s.shortName,
      emoji: s.emoji,
      gradient: s.gradient,
      poster: s.poster,
      films: s.films,
      year: s.year,
    }
  })

  const rounds: BracketState['rounds'] = {}

  pairings.forEach((pair, idx) => {
    const id = matchupId(1, idx)
    const aSeedNum = String(pair[0])
    const bSeedNum = String(pair[1])
    if (!rounds['1']) rounds['1'] = { matchups: {} }
    rounds['1'].matchups[id] = {
      a: seedsBySeedNumber[aSeedNum].id,
      b: seedsBySeedNumber[bSeedNum].id,
      winner: null,
      tieBroken: false,
    }
  })

  const total = totalRounds(size)
  for (let r = 2; r <= total; r++) {
    rounds[String(r)] = { matchups: {} }
    const count = matchupsInRound(size, r)
    for (let i = 0; i < count; i++) {
      rounds[String(r)].matchups[matchupId(r, i)] = {
        a: null,
        b: null,
        winner: null,
        tieBroken: false,
      }
    }
  }

  return {
    seeds: seedsBySeedNumber,
    rounds,
  }
}

export interface AdvancementUpdate {
  path: string
  value: string
}

export function computeAdvancementUpdates(
  size: BracketSize,
  completedRound: number,
  matchups: Record<string, MatchupState>,
): AdvancementUpdate[] {
  const updates: AdvancementUpdate[] = []
  const total = totalRounds(size)
  if (completedRound >= total) return updates

  const count = matchupsInRound(size, completedRound)
  for (let i = 0; i < count; i++) {
    const id = matchupId(completedRound, i)
    const winner = matchups[id]?.winner
    if (!winner) continue
    const nextRound = completedRound + 1
    const nextIdx = Math.floor(i / 2)
    const slot = i % 2 === 0 ? 'a' : 'b'
    const nextId = matchupId(nextRound, nextIdx)
    updates.push({
      path: `bracket/rounds/${nextRound}/matchups/${nextId}/${slot}`,
      value: winner,
    })
  }
  return updates
}

export function getMatchupsForRound(
  bracket: BracketState,
  round: number,
): Array<{ id: string; matchup: MatchupState }> {
  const r = bracket.rounds[String(round)]
  if (!r) return []
  return Object.entries(r.matchups)
    .sort(([a], [b]) => {
      const ai = parseInt(a.split('-')[1] ?? '0', 10)
      const bi = parseInt(b.split('-')[1] ?? '0', 10)
      return ai - bi
    })
    .map(([id, matchup]) => ({ id, matchup }))
}

export function getSeedById(bracket: BracketState, seedId: string | null) {
  if (!seedId) return null
  return Object.values(bracket.seeds).find((s) => s.id === seedId) ?? null
}
