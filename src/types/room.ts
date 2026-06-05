export type Phase =
  | 'lobby'
  | 'voting'
  | 'revealing'
  | 'round_complete'
  | 'done'

export type RevealStyle = 'rapid' | 'pairs' | 'dramatic' | 'cinematic'

export interface RoomMeta {
  code: string
  hostUid: string
  createdAt: number
  themeId: string
  title: string
  status: 'active' | 'ended'
}

export interface RoomConfig {
  roundTimerSeconds: Record<string, number>
  revealStyle: Record<string, RevealStyle>
  allowRevote: boolean
}

export interface MatchupState {
  a: string | null
  b: string | null
  winner: string | null
  tieBroken: boolean
}

export interface BracketSeedEntry {
  id: string
  name: string
  shortName: string
  emoji: string
  gradient: [string, string]
  poster?: string
  films?: string
  year?: string
}

export interface BracketState {
  seeds: Record<string, BracketSeedEntry>
  rounds: Record<string, { matchups: Record<string, MatchupState> }>
}

export interface PhaseState {
  current: Phase
  round: number
  startedAt: number | null
  endsAt: number | null
  revealCursor: number
}

export interface Player {
  name: string
  emoji: string
  joinedAt: number
  isHost: boolean
}

export interface PresenceState {
  online: boolean
  lastSeen: number
}

export interface Room {
  meta: RoomMeta
  config: RoomConfig
  bracket: BracketState
  phase: PhaseState
  votes: Record<string, Record<string, string>>
  players: Record<string, Player>
  presence: Record<string, PresenceState>
}

export type Votes = Room['votes']

export interface MatchupTally {
  matchupId: string
  aId: string | null
  bId: string | null
  aVotes: number
  bVotes: number
  total: number
  aPct: number
  bPct: number
  leader: 'a' | 'b' | 'tie' | null
}
