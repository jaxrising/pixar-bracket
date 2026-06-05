import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useRoomSubscription } from '../hooks/useRoomSubscription'
import { usePresence } from '../hooks/usePresence'
import { useRoomStore, selectAmHost } from '../stores/useRoomStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { totalRounds, getMatchupsForRound } from '../lib/bracket'
import {
  startRound,
  beginReveal,
  revealMatchup,
  completeRound,
  advanceToNextRound,
  crownChampion,
  submitVote,
} from '../firebase/room'
import { enableAudio, playSfx, setMuted } from '../lib/audio'
import BracketBoard from '../components/bracket/BracketBoard'
import BracketMiniMap from '../components/bracket/BracketMiniMap'
import BracketViewCard from '../components/bracket/BracketViewCard'
import SeedCard from '../components/bracket/SeedCard'
import TimerRing from '../components/player/TimerRing'
import HostControlBar from '../components/host/HostControlBar'
import PlayerRoster from '../components/host/PlayerRoster'
import RoomCodeBadge from '../components/shared/RoomCodeBadge'
import Confetti from '../components/shared/Confetti'
import { StampInkFilter } from '../components/shared/RubberStamp'
import LuxoLamp from '../components/shared/LuxoLamp'
import MarkerScribble from '../components/shared/MarkerScribble'
import CorkboardBackground from '../components/shared/CorkboardBackground'

export default function HostView() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { uid, ready } = useAuth()
  useRoomSubscription(code ?? null)
  const room = useRoomStore((s) => s.room)
  const amHost = useRoomStore(selectAmHost)
  const { muted, setMuted: setStoreMuted, audioEnabled, setAudioEnabled } = usePlayerStore()

  usePresence(code ?? null, uid)

  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'matchups' | 'bracket'>('matchups')
  const revealingRef = useRef(false)

  useEffect(() => {
    if (!ready) return
    if (room && uid && !amHost) {
      navigate(`/play/${code}`, { replace: true })
    }
  }, [ready, room, uid, amHost, code, navigate])

  const phase = room?.phase
  const size = useMemo(() => {
    if (!room) return 16 as 16 | 32
    return (Object.keys(room.bracket.seeds).length === 32 ? 32 : 16) as 16 | 32
  }, [room])
  const totalRoundCount = useMemo(() => totalRounds(size), [size])
  const isLastRound = (phase?.round ?? 1) >= totalRoundCount

  const currentRoundMatchups = useMemo(() => {
    if (!room) return []
    return getMatchupsForRound(room.bracket, phase?.round ?? 1)
  }, [room, phase?.round])

  const allRevealed = currentRoundMatchups.every((m) => m.matchup.winner)
  const revealCursor = phase?.revealCursor ?? 0

  const myVotes = useMemo<Record<string, string>>(() => {
    if (!uid || !room) return {}
    const out: Record<string, string> = {}
    for (const [mid, voteMap] of Object.entries(room.votes ?? {})) {
      if (voteMap[uid]) out[mid] = voteMap[uid]
    }
    return out
  }, [uid, room])

  const votedUids = useMemo(() => {
    if (!room) return new Set<string>()
    const counts: Record<string, number> = {}
    for (const m of currentRoundMatchups) {
      const voteMap = (room.votes ?? {})[m.id] ?? {}
      for (const u of Object.keys(voteMap)) {
        counts[u] = (counts[u] ?? 0) + 1
      }
    }
    const set = new Set<string>()
    for (const [u, c] of Object.entries(counts)) {
      if (c === currentRoundMatchups.length) set.add(u)
    }
    return set
  }, [room, currentRoundMatchups])

  const handleStart = async () => {
    if (!code || !phase) return
    setLoading(true)
    if (!audioEnabled) {
      enableAudio()
      setAudioEnabled(true)
    }
    try {
      const duration = room?.config.roundTimerSeconds[String(phase.round)] ?? 60
      await startRound(code, phase.round, duration)
    } finally {
      setLoading(false)
    }
  }

  const handleBeginReveal = async () => {
    if (!code) return
    setLoading(true)
    try {
      await beginReveal(code)
      const style = room?.config.revealStyle[String(phase?.round ?? 1)] ?? 'dramatic'
      if (style === 'rapid' || style === 'pairs') {
        void runAutoReveal(style)
      }
    } finally {
      setLoading(false)
    }
  }

  const runAutoReveal = async (style: 'rapid' | 'pairs') => {
    if (!room || !code || !phase) return
    if (revealingRef.current) return
    revealingRef.current = true
    try {
      const batchSize = style === 'rapid' ? 4 : 2
      const gapMs = style === 'rapid' ? 700 : 1400

      const matchups = currentRoundMatchups
      let cursor = phase.revealCursor ?? 0
      while (cursor < matchups.length) {
        const batch = matchups.slice(cursor, cursor + batchSize)
        for (const m of batch) {
          const fresh = useRoomStore.getState().room
          if (!fresh) break
          await revealMatchup(code, phase.round, m.id, m.matchup, fresh.votes, cursor)
          cursor++
        }
        playSfx('revealBatch', 0.7)
        await new Promise((r) => setTimeout(r, gapMs))
      }
      const r = useRoomStore.getState().room
      if (r) {
        await completeRound(code, phase.round, size, r.bracket.rounds[String(phase.round)]?.matchups ?? {})
      }
    } finally {
      revealingRef.current = false
    }
  }

  const handleRevealNext = async () => {
    if (!code || !room || !phase) return
    const next = currentRoundMatchups[revealCursor]
    if (!next) return
    setLoading(true)
    try {
      await revealMatchup(code, phase.round, next.id, next.matchup, room.votes, revealCursor)
      playSfx('revealDramatic', 0.8)
      const willBeDone = revealCursor + 1 >= currentRoundMatchups.length
      if (willBeDone) {
        const updated = useRoomStore.getState().room
        if (updated) {
          const matchups = updated.bracket.rounds[String(phase.round)]?.matchups ?? {}
          await completeRound(code, phase.round, size, matchups)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAdvance = async () => {
    if (!code || !phase) return
    setLoading(true)
    try {
      const duration = room?.config.roundTimerSeconds[String(phase.round + 1)] ?? 60
      await advanceToNextRound(code, size, phase.round, duration)
    } finally {
      setLoading(false)
    }
  }

  const handleCrown = async () => {
    if (!code) return
    setLoading(true)
    try {
      playSfx('crown', 0.8)
      await crownChampion(code)
    } finally {
      setLoading(false)
    }
  }

  const handleHostVote = (matchupId: string, seedId: string) => {
    if (!uid || !code || phase?.current !== 'voting') return
    void submitVote(code, matchupId, uid, seedId)
    playSfx('voteTap', 0.5)
  }

  if (!ready) return <Centered>Connecting…</Centered>
  if (!room) return <Centered>Loading room {code}…</Centered>
  if (uid && !amHost) return <Centered>Redirecting…</Centered>

  const roundLabel = labelForRound(phase?.round ?? 1, totalRoundCount)
  const phaseLabel = phase?.current ?? 'lobby'

  const canToggleView =
    phase?.current === 'voting' ||
    phase?.current === 'revealing' ||
    phase?.current === 'round_complete'

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#cda673' }}>
      <StampInkFilter />
      <header className="fixed top-0 left-0 right-0 z-10 px-4 py-3 flex items-start justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto">
          <RoomCodeBadge code={code ?? ''} size="md" />
        </div>
        <div
          className="text-center pointer-events-auto px-4 py-1.5"
          style={{
            background: 'rgba(244, 232, 208, 0.92)',
            border: '1px solid rgba(27, 40, 69, 0.35)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            transform: 'rotate(-0.6deg)',
          }}
        >
          <div className="font-poster text-lg" style={{ color: '#1b2845' }}>
            {room.meta.title}
          </div>
          <div className="font-hand text-sm" style={{ color: 'rgba(27, 40, 69, 0.7)' }}>
            {roundLabel} · round {phase?.round ?? 1}/{totalRoundCount} ·{' '}
            <span style={{ color: '#c8412b' }}>{phaseLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          {phase?.current === 'voting' && phase.endsAt && (
            <div
              className="p-1"
              style={{
                background: 'rgba(244, 232, 208, 0.9)',
                border: '1px solid rgba(27, 40, 69, 0.3)',
                borderRadius: '50%',
                boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
              }}
            >
              <TimerRing
                endsAt={phase.endsAt}
                size={48}
                totalSeconds={room.config.roundTimerSeconds[String(phase.round)] ?? 60}
              />
            </div>
          )}
          <button
            onClick={() => {
              const v = !muted
              setStoreMuted(v)
              setMuted(v)
            }}
            className="text-2xl px-2 py-1"
            style={{
              background: 'rgba(244, 232, 208, 0.9)',
              border: '1px solid rgba(27, 40, 69, 0.3)',
              boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
              transform: 'rotate(2deg)',
            }}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      <motion.div
        className="flex min-h-screen relative"
        animate={{ x: view === 'bracket' && canToggleView ? '-50%' : '0%' }}
        transition={{ type: 'spring', stiffness: 55, damping: 24, mass: 1.1 }}
        style={{ width: '200vw', flexShrink: 0, zIndex: 0 }}
      >
        <CorkboardBackground />

        {/* MATCHUPS REGION (left half of the scene) */}
        <main
          className="px-4 pt-16 pb-24 mx-auto flex flex-col"
          style={{ width: '50%', flexShrink: 0, maxWidth: 'none' }}
        >
          <div className="max-w-7xl w-full mx-auto flex-1">
            <AnimatePresence mode="popLayout">
              {phase?.current === 'lobby' && (
                <LobbyView key="lobby" code={code ?? ''} room={room} />
              )}

              {phase?.current === 'voting' && (
                <motion.div
                  key={`vote-r${phase.round}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <RoundHeader label={roundLabel} subtitle="voting open — votes rolling in live" />
                  <div className="mb-6 flex justify-end">
                    <PlayerRoster
                      players={room.players}
                      presence={room.presence}
                      votedUids={votedUids}
                      totalToVote={currentRoundMatchups.length}
                    />
                  </div>

                  <BracketBoard
                    bracket={room.bracket}
                    votes={room.votes}
                    currentRound={phase.round}
                    myVotes={myVotes}
                    onPick={handleHostVote}
                    showVoteBars
                  />
                </motion.div>
              )}

              {phase?.current === 'revealing' && (
                <motion.div
                  key={`reveal-r${phase.round}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RoundHeader
                    label={`revealing the ${roundLabel.toLowerCase()}`}
                    subtitle={`${revealCursor} of ${currentRoundMatchups.length} revealed`}
                  />
                  <BracketBoard
                    bracket={room.bracket}
                    votes={room.votes}
                    currentRound={phase.round}
                    myVotes={myVotes}
                    onPick={() => {}}
                    showVoteBars
                    revealed
                    revealCursor={revealCursor}
                  />
                </motion.div>
              )}

              {phase?.current === 'round_complete' && (
                <motion.div
                  key="round-complete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6"
                >
                  <RoundHeader
                    label={`${roundLabel.toLowerCase()} — in the books`}
                    subtitle={!isLastRound ? 'next up' : 'ready to crown the goat?'}
                  />
                  {!isLastRound && (
                    <BracketBoard
                      bracket={room.bracket}
                      votes={room.votes}
                      currentRound={phase.round + 1}
                      myVotes={{}}
                      onPick={() => {}}
                      hideEmpty
                    />
                  )}
                </motion.div>
              )}

              {phase?.current === 'done' && (
                <DoneView room={room} totalRoundCount={totalRoundCount} />
              )}
            </AnimatePresence>

            {canToggleView && (
              <div className="mt-12 flex justify-center">
                <BracketViewCard
                  onClick={() => {
                    setView('bracket')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  variant="open"
                />
              </div>
            )}
          </div>
        </main>

        {/* BRACKET OVERVIEW REGION (right half of the scene) */}
        <main
          className="px-4 pt-16 pb-10 flex flex-col items-center"
          style={{ width: '50%', flexShrink: 0 }}
        >
          <RoundHeader
            label="the whole bracket"
            subtitle="every matchup, pinned to the board"
          />
          <div className="mt-6 mb-8 overflow-x-auto max-w-full">
            <div style={{ transform: 'scale(1.5)', transformOrigin: 'center top', padding: '40px' }}>
              <BracketMiniMap bracket={room.bracket} currentRound={phase?.round ?? 1} />
            </div>
          </div>
          <div className="mt-6">
            <BracketViewCard
              onClick={() => {
                setView('matchups')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              variant="back"
            />
          </div>
        </main>
      </motion.div>

      <HostControlBar
        phase={phase?.current ?? 'lobby'}
        round={phase?.round ?? 1}
        totalRounds={totalRoundCount}
        canStart={phase?.current === 'lobby'}
        canReveal={phase?.current === 'voting'}
        canRevealNext={phase?.current === 'revealing' && revealCursor < currentRoundMatchups.length}
        canAdvance={phase?.current === 'round_complete' && !isLastRound}
        isLastRound={isLastRound && allRevealed}
        onStart={handleStart}
        onBeginReveal={handleBeginReveal}
        onRevealNext={handleRevealNext}
        onAdvance={handleAdvance}
        onCrown={handleCrown}
        loading={loading}
      />
    </div>
  )
}

function labelForRound(round: number, totalRounds: number): string {
  const remaining = totalRounds - round
  if (remaining === 0) return 'Championship'
  if (remaining === 1) return 'Final Four'
  if (remaining === 2) return 'Elite 8'
  if (remaining === 3) return 'Sweet 16'
  if (remaining === 4) return 'Round of 32'
  return `Round ${round}`
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center font-hand text-2xl"
      style={{ color: '#1b2845' }}
    >
      {children}
    </div>
  )
}

function RoundHeader({ label, subtitle }: { label: string; subtitle?: string }) {
  return (
    <div className="mb-6 text-center">
      <div className="inline-block relative" style={{ transform: 'rotate(-1deg)' }}>
        <h2
          className="font-poster text-4xl sm:text-5xl"
          style={{ color: '#1b2845' }}
        >
          {label}
        </h2>
        <div className="mt-1 flex justify-center">
          <MarkerScribble variant="underline" size={200} color="#c8412b" animate={false} />
        </div>
      </div>
      {subtitle && (
        <p
          className="font-hand text-xl mt-2"
          style={{ color: 'rgba(27, 40, 69, 0.75)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

function LobbyView({
  code,
  room,
}: {
  code: string
  room: NonNullable<ReturnType<typeof useRoomStore.getState>['room']>
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-8"
    >
      <div className="flex justify-center items-center gap-6 mb-8">
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [-1, 2, -1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <LuxoLamp size={140} />
        </motion.div>
        <div className="text-left">
          <div
            className="font-hand text-xl"
            style={{ color: 'rgba(27, 40, 69, 0.75)' }}
          >
            you're hosting!
          </div>
          <h2
            className="font-poster text-4xl sm:text-5xl"
            style={{ color: '#1b2845' }}
          >
            {room.meta.title}
          </h2>
        </div>
      </div>

      <p
        className="font-hand text-xl mb-4"
        style={{ color: 'rgba(27, 40, 69, 0.8)' }}
      >
        share this code so friends can hop in:
      </p>
      <div className="flex justify-center mb-10">
        <RoomCodeBadge code={code} size="lg" />
      </div>

      <div className="max-w-md mx-auto">
        <PlayerRoster
          players={room.players}
          presence={room.presence}
          votedUids={new Set()}
          totalToVote={0}
        />
      </div>
    </motion.div>
  )
}

function DoneView({
  room,
  totalRoundCount,
}: {
  room: NonNullable<ReturnType<typeof useRoomStore.getState>['room']>
  totalRoundCount: number
}) {
  const finalMatchup = Object.values(
    room.bracket.rounds[String(totalRoundCount)]?.matchups ?? {},
  )[0]
  const winnerSeed = finalMatchup?.winner
    ? Object.values(room.bracket.seeds).find((s) => s.id === finalMatchup.winner)
    : null
  const winnerColors = winnerSeed
    ? [winnerSeed.gradient[0], winnerSeed.gradient[1], '#ffb627', '#f4e8d0', '#c8412b']
    : undefined

  return (
    <motion.div
      key="done"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center px-4 py-10 text-center"
    >
      <Confetti count={160} colors={winnerColors} spread={1.3} />

      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6"
      >
        <LuxoLamp size={160} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-hand text-2xl mb-3"
        style={{ color: 'rgba(27, 40, 69, 0.85)' }}
      >
        and the goat is…
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 18 }}
        className="font-poster text-6xl sm:text-8xl mb-8"
        style={{ color: '#1b2845' }}
      >
        {winnerSeed?.name ?? '???'}
      </motion.h1>

      {winnerSeed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.6, ease: [0.2, 0.7, 0.25, 1] }}
          className="max-w-sm w-full mx-auto"
        >
          <SeedCard seed={winnerSeed} size="xl" winner stampText="GOAT" />
        </motion.div>
      )}
    </motion.div>
  )
}
