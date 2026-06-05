import type { Room, RoomConfig, MatchupState } from '../types/room'
import type { BracketTheme } from '../types/theme'
import { buildInitialBracket, computeAdvancementUpdates, totalRounds } from '../lib/bracket'
import { determineWinner } from '../lib/tally'
import { getRoomService } from './index'

const DEFAULT_TIMERS: Record<string, number> = {
  '1': 60,
  '2': 60,
  '3': 75,
  '4': 90,
}

const DEFAULT_REVEALS: Record<string, RoomConfig['revealStyle'][string]> = {
  '1': 'rapid',
  '2': 'pairs',
  '3': 'dramatic',
  '4': 'cinematic',
}

export async function createRoom(
  code: string,
  hostUid: string,
  hostName: string,
  hostEmoji: string,
  theme: BracketTheme,
): Promise<void> {
  const svc = getRoomService()
  const now = svc.serverNow()
  const bracket = buildInitialBracket(theme.seeds)

  const config: RoomConfig = {
    roundTimerSeconds: { ...DEFAULT_TIMERS },
    revealStyle: { ...DEFAULT_REVEALS },
    allowRevote: true,
  }

  const room: Room = {
    meta: {
      code,
      hostUid,
      createdAt: now,
      themeId: theme.id,
      title: theme.title,
      status: 'active',
    },
    config,
    bracket,
    phase: {
      current: 'lobby',
      round: 1,
      startedAt: null,
      endsAt: null,
      revealCursor: 0,
    },
    votes: {},
    players: {
      [hostUid]: {
        name: hostName,
        emoji: hostEmoji,
        joinedAt: now,
        isHost: true,
      },
    },
    presence: {
      [hostUid]: {
        online: true,
        lastSeen: now,
      },
    },
  }

  await svc.createRoom(code, room)
  svc.setOnDisconnect(code, hostUid)
}

export async function joinRoom(
  code: string,
  uid: string,
  name: string,
  emoji: string,
): Promise<void> {
  const svc = getRoomService()
  const now = svc.serverNow()
  await svc.update(code, {
    [`players/${uid}`]: {
      name,
      emoji,
      joinedAt: now,
      isHost: false,
    },
    [`presence/${uid}`]: {
      online: true,
      lastSeen: now,
    },
  })
  svc.setOnDisconnect(code, uid)
}

export async function submitVote(
  code: string,
  matchupId: string,
  uid: string,
  seedId: string,
): Promise<void> {
  const svc = getRoomService()
  await svc.setPath(code, `votes/${matchupId}/${uid}`, seedId)
}

export async function clearVote(
  code: string,
  matchupId: string,
  uid: string,
): Promise<void> {
  const svc = getRoomService()
  await svc.setPath(code, `votes/${matchupId}/${uid}`, null)
}

export async function startRound(
  code: string,
  round: number,
  durationSeconds: number,
): Promise<void> {
  const svc = getRoomService()
  const startedAt = svc.serverNow()
  const endsAt = startedAt + durationSeconds * 1000
  await svc.update(code, {
    'phase/current': 'voting',
    'phase/round': round,
    'phase/startedAt': startedAt,
    'phase/endsAt': endsAt,
    'phase/revealCursor': 0,
  })
}

export async function beginReveal(code: string): Promise<void> {
  const svc = getRoomService()
  await svc.update(code, {
    'phase/current': 'revealing',
    'phase/revealCursor': 0,
  })
}

export async function revealMatchup(
  code: string,
  round: number,
  matchupId: string,
  matchup: MatchupState,
  votes: Room['votes'],
  cursor: number,
): Promise<{ winner: string; tieBroken: boolean } | null> {
  const svc = getRoomService()
  const result = determineWinner(matchupId, matchup, votes)
  if (!result) return null
  await svc.update(code, {
    [`bracket/rounds/${round}/matchups/${matchupId}/winner`]: result.winner,
    [`bracket/rounds/${round}/matchups/${matchupId}/tieBroken`]: result.tieBroken,
    'phase/revealCursor': cursor + 1,
  })
  return result
}

export async function completeRound(
  code: string,
  round: number,
  size: 16 | 32,
  matchups: Record<string, MatchupState>,
): Promise<void> {
  const svc = getRoomService()
  const advances = computeAdvancementUpdates(size, round, matchups)
  const updates: Record<string, unknown> = {
    'phase/current': 'round_complete',
  }
  for (const a of advances) {
    updates[a.path] = a.value
  }
  await svc.update(code, updates)
}

export async function advanceToNextRound(
  code: string,
  size: 16 | 32,
  currentRound: number,
  durationSeconds: number,
): Promise<void> {
  const svc = getRoomService()
  const nextRound = currentRound + 1
  if (nextRound > totalRounds(size)) {
    await svc.update(code, {
      'phase/current': 'done',
    })
    return
  }
  const startedAt = svc.serverNow()
  const endsAt = startedAt + durationSeconds * 1000
  await svc.update(code, {
    'phase/current': 'voting',
    'phase/round': nextRound,
    'phase/startedAt': startedAt,
    'phase/endsAt': endsAt,
    'phase/revealCursor': 0,
  })
}

export async function crownChampion(code: string): Promise<void> {
  const svc = getRoomService()
  await svc.update(code, {
    'phase/current': 'done',
  })
}
