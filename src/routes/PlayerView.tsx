import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  // Pending votes: local only until user hits Submit
  const [pendingVotes, setPendingVotes] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const submitLockRef = useRef(false)

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

  // Reset pending votes when a new round starts
  const currentRound = room?.phase.round
  useEffect(() => {
    setPendingVotes({})
    setSubmitted(false)
    submitLockRef.current = false
  }, [currentRound])

  // Auto-submit when phase leaves voting (timer expired or host advanced)
  const flushPendingVotes = useCallback(async () => {
    if (submitLockRef.current) return
    if (!uid || !code) return
    submitLockRef.current = true
    const entries = Object.entries(pendingVotes)
    if (entries.length === 0) return
    if (!audioEnabled) { enableAudio(); setAudioEnabled(true) }
    await Promise.all(entries.map(([mid, seedId]) => submitVote(code, mid, uid, seedId)))
    setSubmitted(true)
  }, [pendingVotes, uid, code, audioEnabled, setAudioEnabled])

  const phase = room?.phase
  const prevPhaseRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (prevPhaseRef.current === 'voting' && phase?.current !== 'voting') {
      void flushPendingVotes()
    }
    prevPhaseRef.current = phase?.current
  }, [phase?.current, flushPendingVotes])

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
    if (phase?.current !== 'voting') return
    if (submitted) return
    if (!audioEnabled) { enableAudio(); setAudioEnabled(true) }
    // Toggle off if same selection
    setPendingVotes((prev) => {
      if (prev[matchupId] === seedId) {
        const next = { ...prev }
        delete next[matchupId]
        return next
      }
      return { ...prev, [matchupId]: seedId }
    })
    playSfx('voteTap', 0.5)
    vibrate(15)
  }

  const handleSubmit = async () => {
    if (submitted || submitLockRef.current) return
    submitLockRef.current = true
    if (!uid || !code) return
    if (!audioEnabled) { enableAudio(); setAudioEnabled(true) }
    await Promise.all(
      Object.entries(pendingVotes).map(([mid, seedId]) => submitVote(code, mid, uid, seedId))
    )
    setSubmitted(true)
    playSfx('revealDramatic', 0.6)
    vibrate(30)
  }

  const myPicksCount = currentRoundMatchups.filter((m) => pendingVotes[m.id]).length
  const allPicked = myPicksCount === currentRoundMatchups.length
  const roundLabel = labelForRound(phase?.round ?? 1, totalRoundCount)
  const canToggleView =
    phase?.current === 'voting' ||
    phase?.current === 'revealing' ||
    phase?.current === 'round_complete'

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#ffffff' }}>
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
                  <RoundHeader
                    label={roundLabel}
                    subtitle={submitted ? 'picks locked in — waiting for results…' : 'tap a movie to vote. tap again to deselect.'}
                  />
                  <div className="mb-5 flex justify-end">
                    <PicksProgress count={myPicksCount} total={currentRoundMatchups.length} />
                  </div>

                  <BracketBoard
                    bracket={room.bracket}
                    votes={room.votes}
                    currentRound={phase.round}
                    myVotes={pendingVotes}
                    onPick={submitted ? () => {} : handlePick}
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
                    players={room.players}
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
          <div className="mt-6 mb-8 w-full px-4">
            <BracketMiniMap bracket={room.bracket} currentRound={phase?.round ?? 1} />
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

      {/* Sticky submit bar — only during voting and not yet submitted */}
      {phase?.current === 'voting' && (
        <div className="fixed bottom-0 left-0 right-0 z-20 px-5 py-4 flex items-center justify-between gap-3 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(27,40,69,0.08)', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}
        >
          <div
            className="font-body text-sm font-bold pointer-events-auto"
            style={{ color: submitted ? '#c8412b' : 'rgba(27,40,69,0.45)' }}
          >
            {submitted ? '✓ picks locked' : `${myPicksCount} of ${currentRoundMatchups.length} picked`}
          </div>
          <button
            onClick={() => { void handleSubmit() }}
            disabled={submitted || myPicksCount === 0}
            className="px-6 py-2.5 font-poster text-base transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed pointer-events-auto"
            style={{
              background: allPicked && !submitted ? '#c8412b' : '#1b2845',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              letterSpacing: '0.02em',
              boxShadow: allPicked && !submitted
                ? '0 4px 14px rgba(200,65,43,0.4)'
                : '0 4px 14px rgba(27,40,69,0.25)',
            }}
          >
            {submitted ? '✓ submitted' : allPicked ? 'Lock in picks →' : 'Submit picks →'}
          </button>
        </div>
      )}
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
      className="min-h-screen flex items-center justify-center font-body text-2xl"
      style={{ color: '#1b2845' }}
    >
      {children}
    </div>
  )
}

function Header({
  code,
  title: _title,
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
    <header className="fixed top-0 left-0 right-0 z-10 px-4 py-3 flex items-start justify-between gap-3 pointer-events-none"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(27,40,69,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-3 min-w-0 pointer-events-auto">
        <RoomCodeBadge code={code} size="sm" />
      </div>
      <div className="flex flex-col items-center gap-0.5 pointer-events-auto">
        <img src={`${import.meta.env.BASE_URL}logo/disney-pixar-seeklogo.png`} alt="Disney · Pixar" style={{ height: 20, objectFit: 'contain', opacity: 0.7 }} />
        <div className="font-body text-xs font-bold hidden sm:block" style={{ color: 'rgba(27,40,69,0.45)' }}>
          {roundLabel} · round {round}/{totalRounds}
        </div>
      </div>
      <div className="flex items-center gap-3 pointer-events-auto">
        {showTimer && endsAt && (
          <div
            className="p-1"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(27, 40, 69, 0.2)',
              borderRadius: '50%',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <TimerRing endsAt={endsAt} size={48} totalSeconds={roundTimerSeconds} />
          </div>
        )}
        <button
          onClick={onMuteToggle}
          className="text-xl px-2.5 py-1.5"
          style={{
            background: '#f8f8f8',
            border: '1px solid rgba(27,40,69,0.1)',
            borderRadius: '8px',
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
        <p className="font-body text-lg mt-2" style={{ color: 'rgba(27, 40, 69, 0.8)' }}>
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
        background: '#ffffff',
        border: '1.5px solid #1b2845',
        borderRadius: 4,
        boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
        transform: 'rotate(1deg)',
      }}
    >
      <div className="font-body text-base" style={{ color: '#1b2845' }}>
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
      <h2 className="font-poster text-4xl mb-2" style={{ color: '#1b2845' }}>
        {room.meta.title}
      </h2>
      <p className="font-body text-xl mb-8" style={{ color: 'rgba(27, 40, 69, 0.8)' }}>
        waiting for the host to start…
      </p>
      <div
        className="inline-block px-5 py-4 mb-4"
        style={{
          background: '#ffffff',
          border: '1.5px solid rgba(27,40,69,0.4)',
          borderRadius: 4,
          boxShadow: '0 8px 18px -4px rgba(0,0,0,0.4)',
          transform: 'rotate(-0.5deg)',
        }}
      >
        <div className="font-body text-base mb-3" style={{ color: '#1b2845' }}>
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
                fontFamily: 'var(--font-body)',
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
        <p className="font-body text-lg mt-2" style={{ color: 'rgba(27, 40, 69, 0.75)' }}>
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
    ? Object.values(room.bracket.seeds ?? {}).find((s) => s.id === finalMatchup.winner)
    : null
  const winnerColors = winnerSeed
    ? [winnerSeed.gradient[0], winnerSeed.gradient[1], '#ffb627', '#f4e8d0', '#c8412b']
    : undefined

  // Find all players who voted for the winner in the final
  const winnerVoters = finalMatchup?.winner
    ? Object.entries((room.votes ?? {})[Object.keys(room.bracket.rounds[String(totalRoundCount)]?.matchups ?? {})[0]] ?? {})
        .filter(([, seedId]) => seedId === finalMatchup.winner)
        .map(([uid]) => room.players?.[uid])
        .filter(Boolean)
    : []

  // Scatter stickers at deterministic positions around the screen
  const stickers = winnerVoters.map((p, i) => {
    const angle = (i / Math.max(winnerVoters.length, 1)) * 360
    const rad = (angle * Math.PI) / 180
    const rx = 38 + (i % 3) * 8
    const ry = 28 + (i % 2) * 10
    const x = 50 + rx * Math.cos(rad)
    const y = 50 + ry * Math.sin(rad)
    const rot = ((i * 47) % 30) - 15
    return { player: p!, x, y, rot, delay: 1.2 + i * 0.12 }
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center relative"
    >
      <Confetti count={120} colors={winnerColors} spread={1.2} />

      {/* Voter stickers scattered on the corkboard */}
      {stickers.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.2, rotate: s.rot - 20 }}
          animate={{ opacity: 1, scale: 1, rotate: s.rot }}
          transition={{ delay: s.delay, type: 'spring', stiffness: 280, damping: 18 }}
          className="fixed pointer-events-none"
          style={{ left: `${s.x}vw`, top: `${s.y}vh`, transform: `translate(-50%,-50%) rotate(${s.rot}deg)`, zIndex: 5 }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(27,40,69,0.3)',
              borderRadius: 4,
              padding: '6px 8px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <PlayerAvatar value={s.player.emoji} size={40} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#1b2845', fontWeight: 700 }}>
              {s.player.name}
            </span>
          </div>
          {/* pushpin */}
          <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c8412b', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-body text-xl mb-3"
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
