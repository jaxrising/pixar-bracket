import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useRoomSubscription } from '../hooks/useRoomSubscription'
import { usePresence } from '../hooks/usePresence'
import { useRoomStore, selectAmHost } from '../stores/useRoomStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { getMatchupsForRound, totalRounds } from '../lib/bracket'
import { submitVote, joinRoom } from '../firebase/room'
import { playSfx, vibrate, enableAudio, setMuted } from '../lib/audio'
import PlayerAvatar from '../components/ui/PlayerAvatar'
import BracketBoard from '../components/bracket/BracketBoard'
import BracketMiniMap from '../components/bracket/BracketMiniMap'
import BracketViewCard from '../components/bracket/BracketViewCard'
import SeedCard from '../components/bracket/SeedCard'
import TimerRing from '../components/player/TimerRing'
import RoomCodeBadge from '../components/shared/RoomCodeBadge'
import Confetti from '../components/shared/Confetti'
import { StampInkFilter } from '../components/shared/RubberStamp'
import LuxoLamp from '../components/shared/LuxoLamp'
import MarkerScribble from '../components/shared/MarkerScribble'
import CorkboardBackground from '../components/shared/CorkboardBackground'

export default function PlayerView() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { uid, ready } = useAuth()
  useRoomSubscription(code ?? null)
  const room = useRoomStore((s) => s.room)
  const amHost = useRoomStore(selectAmHost)
  const { myName, myEmoji, muted, setMuted: setStoreMuted, audioEnabled, setAudioEnabled } =
    usePlayerStore()

  const [view, setView] = useState<'matchups' | 'bracket'>('matchups')

  usePresence(code ?? null, uid)

  useEffect(() => {
    if (!room || !uid || !code) return
    if (room.players[uid]) return
    if (amHost) return
    if (!myName.trim()) {
      navigate('/')
      return
    }
    void joinRoom(code, uid, myName.trim(), myEmoji)
  }, [room, uid, code, amHost, myName, myEmoji, navigate])

  const phase = room?.phase
  const size = (room?.bracket && Object.keys(room.bracket.seeds).length === 32 ? 32 : 16) as 16 | 32

  const currentRoundMatchups = useMemo(() => {
    if (!room) return []
    return getMatchupsForRound(room.bracket, room?.phase.round ?? 1)
  }, [room])

  const totalRoundCount = useMemo(() => totalRounds(size), [size])

  const myVotes = useMemo(() => {
    if (!uid || !room) return {}
    const out: Record<string, string> = {}
    for (const [mid, voteMap] of Object.entries(room.votes ?? {})) {
      if (voteMap[uid]) out[mid] = voteMap[uid]
    }
    return out
  }, [uid, room])

  if (!ready) return <Centered>connecting…</Centered>
  if (!room) return <Centered>loading room {code}…</Centered>

  const handlePick = (matchupId: string, seedId: string) => {
    if (!uid || !code) return
    if (phase?.current !== 'voting') return
    if (Date.now() > (phase.endsAt ?? Infinity)) return

    if (!audioEnabled) {
      enableAudio()
      setAudioEnabled(true)
    }
    void submitVote(code, matchupId, uid, seedId)
    playSfx('voteTap', 0.5)
    vibrate(15)
  }

  const myPicksCount = currentRoundMatchups.filter((m) => myVotes[m.id]).length
  const roundLabel = labelForRound(phase?.round ?? 1, totalRoundCount)
  const canToggleView =
    phase?.current === 'voting' ||
    phase?.current === 'revealing' ||
    phase?.current === 'round_complete'

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#cda673' }}>
      <StampInkFilter />
      <Header
        code={code ?? ''}
        title={room.meta.title}
        roundLabel={roundLabel}
        round={phase?.round ?? 1}
        totalRounds={totalRoundCount}
        endsAt={phase?.endsAt}
        roundTimerSeconds={room.config.roundTimerSeconds[String(phase?.round ?? 1)] ?? 60}
        muted={muted}
        onMuteToggle={() => {
          const v = !muted
          setStoreMuted(v)
          setMuted(v)
        }}
        showTimer={phase?.current === 'voting'}
      />

      <motion.div
        className="flex min-h-screen relative"
        animate={{ x: view === 'bracket' && canToggleView ? '-50%' : '0%' }}
        transition={{ type: 'spring', stiffness: 55, damping: 24, mass: 1.1 }}
        style={{ width: '200vw', flexShrink: 0, zIndex: 0 }}
      >
        <CorkboardBackground />

        {/* MATCHUPS REGION */}
        <main
          className="px-4 pt-16 pb-6 flex flex-col"
          style={{ width: '50%', flexShrink: 0 }}
        >
          <div className="max-w-7xl w-full mx-auto flex-1">
            <AnimatePresence mode="popLayout">
              {phase?.current === 'lobby' && (
                <LobbyView key="lobby" room={room} amHost={amHost} />
              )}

              {phase?.current === 'voting' && (
                <motion.div
                  key={`vote-r${phase.round}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <RoundHeader label={roundLabel} subtitle="tap a side to vote. change your mind anytime." />
                  <div className="mb-5 flex justify-end">
                    <PicksProgress count={myPicksCount} total={currentRoundMatchups.length} />
                  </div>

                  <BracketBoard
                    bracket={room.bracket}
                    votes={room.votes}
                    currentRound={phase.round}
                    myVotes={myVotes}
                    onPick={handlePick}
                  />
                </motion.div>
              )}

              {(phase?.current === 'revealing' || phase?.current === 'round_complete') && (
                <motion.div
                  key={`reveal-r${phase.round}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RoundHeader
                    label={
                      phase.current === 'round_complete'
                        ? `${roundLabel.toLowerCase()} done`
                        : `revealing the ${roundLabel.toLowerCase()}`
                    }
                    subtitle={
                      phase.current === 'round_complete'
                        ? 'waiting for host to kick off the next round…'
                        : 'eyes on the big screen 📺'
                    }
                  />

                  <BracketBoard
                    bracket={room.bracket}
                    votes={room.votes}
                    currentRound={phase.round}
                    myVotes={myVotes}
                    onPick={() => {}}
                    showVoteBars
                    revealed
                    revealCursor={phase.revealCursor}
                  />
                </motion.div>
              )}

              {phase?.current === 'done' && (
                <DoneView key="done" room={room} totalRoundCount={totalRoundCount} />
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

        {/* BRACKET OVERVIEW REGION */}
        <main
          className="px-4 pt-16 pb-10 flex flex-col items-center"
          style={{ width: '50%', flexShrink: 0 }}
        >
          <RoundHeader
            label="the whole bracket"
            subtitle="every matchup, pinned to the board"
          />
          <div className="mt-6 mb-8 overflow-x-auto max-w-full">
            <div style={{ padding: '20px' }}>
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

function Header({
  code,
  title,
  roundLabel,
  round,
  totalRounds,
  endsAt,
  roundTimerSeconds,
  muted,
  onMuteToggle,
  showTimer,
}: {
  code: string
  title: string
  roundLabel: string
  round: number
  totalRounds: number
  endsAt: number | null | undefined
  roundTimerSeconds: number
  muted: boolean
  onMuteToggle: () => void
  showTimer: boolean
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 px-4 py-3 flex items-start justify-between gap-3 pointer-events-none">
      <div className="flex items-start gap-3 min-w-0 pointer-events-auto">
        <RoomCodeBadge code={code} size="sm" />
        <div
          className="hidden sm:block min-w-0 px-3 py-1"
          style={{
            background: 'rgba(244, 232, 208, 0.92)',
            border: '1px solid rgba(27, 40, 69, 0.35)',
            boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
            transform: 'rotate(-0.6deg)',
          }}
        >
          <div className="font-poster text-base truncate" style={{ color: '#1b2845' }}>
            {title}
          </div>
          <div className="font-hand text-sm" style={{ color: 'rgba(27, 40, 69, 0.7)' }}>
            {roundLabel} · round {round}/{totalRounds}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 pointer-events-auto">
        {showTimer && endsAt && (
          <div
            className="p-1"
            style={{
              background: 'rgba(244, 232, 208, 0.9)',
              border: '1px solid rgba(27, 40, 69, 0.3)',
              borderRadius: '50%',
              boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
            }}
          >
            <TimerRing endsAt={endsAt} size={48} totalSeconds={roundTimerSeconds} />
          </div>
        )}
        <button
          onClick={onMuteToggle}
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
  )
}

function RoundHeader({ label, subtitle }: { label: string; subtitle?: string }) {
  return (
    <div className="mb-5 text-center">
      <div className="inline-block relative" style={{ transform: 'rotate(-1deg)' }}>
        <h2 className="font-poster text-3xl sm:text-4xl" style={{ color: '#1b2845' }}>
          {label}
        </h2>
        <div className="mt-1 flex justify-center">
          <MarkerScribble variant="underline" size={180} color="#c8412b" animate={false} />
        </div>
      </div>
      {subtitle && (
        <p className="font-hand text-lg mt-2" style={{ color: 'rgba(27, 40, 69, 0.8)' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function PicksProgress({ count, total }: { count: number; total: number }) {
  const pct = total === 0 ? 0 : (count / total) * 100
  return (
    <div
      className="px-4 py-2"
      style={{
        background: '#f4e8d0',
        border: '1.5px solid #1b2845',
        borderRadius: 4,
        boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
        transform: 'rotate(1deg)',
      }}
    >
      <div className="font-hand text-base" style={{ color: '#1b2845' }}>
        {count} <span style={{ color: 'rgba(27,40,69,0.6)' }}>of {total} picked</span>
      </div>
      <div className="w-28 h-1.5 mt-1 overflow-hidden" style={{ background: 'rgba(27,40,69,0.15)' }}>
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, background: '#c8412b' }}
        />
      </div>
    </div>
  )
}

function LobbyView({
  room,
  amHost,
}: {
  room: NonNullable<ReturnType<typeof useRoomStore.getState>['room']>
  amHost: boolean
}) {
  const players = Object.entries(room.players ?? {}).sort(([, a], [, b]) => a.joinedAt - b.joinedAt)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 px-4 py-10 max-w-2xl mx-auto w-full text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [-1, 1.5, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-block mb-4"
      >
        <LuxoLamp size={120} />
      </motion.div>
      <h2 className="font-poster text-4xl mb-2" style={{ color: '#1b2845' }}>
        {room.meta.title}
      </h2>
      <p className="font-hand text-xl mb-8" style={{ color: 'rgba(27, 40, 69, 0.8)' }}>
        waiting for the host to start…
      </p>
      <div
        className="inline-block px-5 py-4 mb-4"
        style={{
          background: 'rgba(244, 232, 208, 0.92)',
          border: '1.5px solid rgba(27,40,69,0.4)',
          borderRadius: 4,
          boxShadow: '0 8px 18px -4px rgba(0,0,0,0.4)',
          transform: 'rotate(-0.5deg)',
        }}
      >
        <div className="font-hand text-base mb-3" style={{ color: '#1b2845' }}>
          {players.length} in the room
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {players.map(([uid, p]) => (
            <div
              key={uid}
              className="flex items-center gap-1.5 px-2.5 py-1"
              style={{
                background: p.isHost ? '#ffd96b' : '#fff4d6',
                border: '1px solid rgba(27,40,69,0.4)',
                fontFamily: "'Caveat', cursive",
                fontWeight: 700,
                fontSize: '1rem',
                color: '#1b2845',
                transform: `rotate(${((uid.charCodeAt(0) % 6) - 3) * 0.7}deg)`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <PlayerAvatar value={p.emoji} size={22} />
              <span>{p.name}</span>
              {p.isHost && <span style={{ color: '#c8412b' }}>★</span>}
            </div>
          ))}
        </div>
      </div>
      {amHost && (
        <p className="font-hand text-lg mt-2" style={{ color: 'rgba(27, 40, 69, 0.75)' }}>
          you're the host — switch to the host view to start the game
        </p>
      )}
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center"
    >
      <Confetti count={120} colors={winnerColors} spread={1.2} />

      <motion.div
        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-5"
      >
        <LuxoLamp size={120} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-hand text-xl mb-3"
        style={{ color: 'rgba(27, 40, 69, 0.85)' }}
      >
        and the goat is…
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 18 }}
        className="font-poster text-5xl sm:text-7xl mb-6"
        style={{ color: '#1b2845' }}
      >
        {winnerSeed?.name ?? '???'}
      </motion.h1>

      {winnerSeed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.6, ease: [0.2, 0.7, 0.25, 1] }}
          className="max-w-xs w-full mx-auto"
        >
          <SeedCard seed={winnerSeed} size="xl" winner stampText="GOAT" />
        </motion.div>
      )}
    </motion.div>
  )
}
