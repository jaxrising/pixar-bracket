import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { usePlayerStore } from '../stores/usePlayerStore'
import { generateRoomCode, normalizeRoomCode, isValidRoomCode } from '../lib/roomCode'
import { createRoom } from '../firebase/room'
import { getRoomService, isLocalMode } from '../firebase'
import { getTheme, DEFAULT_THEME_ID, THEMES } from '../data/themes'
import AvatarPicker from '../components/ui/AvatarPicker'
import LuxoLamp from '../components/shared/LuxoLamp'
import Pushpin from '../components/shared/Pushpin'
import Tape from '../components/shared/Tape'
import MarkerScribble from '../components/shared/MarkerScribble'
import CorkboardBackground from '../components/shared/CorkboardBackground'

type Mode = 'menu' | 'create' | 'join'

export default function Landing() {
  const navigate = useNavigate()
  const { uid, ready } = useAuth()
  const { myName, myEmoji, setIdentity } = usePlayerStore()

  const [mode, setMode] = useState<Mode>('menu')
  const [name, setName] = useState(myName)
  const [emoji, setEmoji] = useState(myEmoji)
  const [joinCode, setJoinCode] = useState('')
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(myName)
    setEmoji(myEmoji)
  }, [myName, myEmoji])

  const handleCreate = async () => {
    if (!uid) return
    if (!name.trim()) {
      setError('Pop your name in first')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const theme = getTheme(themeId)
      let code = generateRoomCode()
      for (let tries = 0; tries < 5; tries++) {
        const exists = await getRoomService().roomExists(code)
        if (!exists) break
        code = generateRoomCode()
      }
      setIdentity(name.trim(), emoji)
      await createRoom(code, uid, name.trim(), emoji, theme)
      navigate(`/host/${code}`)
    } catch (err) {
      console.error(err)
      setError('Could not create room. Check console.')
      setBusy(false)
    }
  }

  const handleJoin = async () => {
    if (!uid) return
    const code = normalizeRoomCode(joinCode)
    if (!isValidRoomCode(code)) {
      setError("That code doesn't look quite right")
      return
    }
    if (!name.trim()) {
      setError('Pop your name in first')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const exists = await getRoomService().roomExists(code)
      if (!exists) {
        setError(`We can't find room ${code}`)
        setBusy(false)
        return
      }
      setIdentity(name.trim(), emoji)
      navigate(`/play/${code}`)
    } catch (err) {
      console.error(err)
      setError('Could not join room.')
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start px-4 py-10 sm:py-16">
      <CorkboardBackground />
      {/* Hero: pinned title poster */}
      <motion.div
        initial={{ opacity: 0, y: -20, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -2.2 }}
        transition={{ type: 'spring', stiffness: 180, damping: 16 }}
        className="relative mb-12"
        style={{ maxWidth: 640, width: '100%' }}
      >
        {/* tape strips */}
        <Tape width={120} height={26} rotate={-12} color="amber" style={{ top: -14, left: 30 }} />
        <Tape width={100} height={24} rotate={14} color="amber" style={{ top: -12, right: 30 }} />

        {/* pinned poster */}
        <div
          className="relative px-8 py-10 sm:px-12 sm:py-14"
          style={{
            background: '#f4e8d0',
            backgroundImage: 'radial-gradient(ellipse at 30% 20%, #fff4d6 0%, #f4e8d0 60%, #e6d4a8 100%)',
            border: '2px solid #1b2845',
            borderRadius: '4px',
            boxShadow: '0 24px 48px -10px rgba(0,0,0,0.55), 0 8px 18px rgba(0,0,0,0.35)',
            color: '#1b2845',
          }}
        >
          {/* paper grain */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ mixBlendMode: 'multiply', opacity: 0.16 }}
          >
            <filter id="hero-paper-noise">
              <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="2" seed="5" />
              <feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.45  0 0 0 0 0.25  0 0 0 0.5 0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#hero-paper-noise)" />
          </svg>

          <div
            className="font-hand text-center mb-1"
            style={{ color: 'rgba(27,40,69,0.65)', fontSize: '1.5rem', transform: 'rotate(-1deg)' }}
          >
            a pixar
          </div>
          <h1
            className="font-poster text-center"
            style={{
              color: '#1b2845',
              fontSize: 'clamp(3rem, 10vw, 5.5rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.005em',
            }}
          >
            GOAT
            <br />
            BRACKET
          </h1>
          <div className="flex justify-center mt-3">
            <MarkerScribble variant="underline" size={220} color="#c8412b" animate={false} />
          </div>
        </div>

        {/* pushpins */}
        <div className="absolute z-10" style={{ top: -10, left: '20%' }}>
          <Pushpin color="red" size={22} />
        </div>
        <div className="absolute z-10" style={{ top: -10, right: '20%' }}>
          <Pushpin color="navy" size={22} />
        </div>
      </motion.div>

      {/* Luxo lamp + handwritten annotation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative mb-8 flex items-center gap-4"
      >
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <LuxoLamp size={110} />
        </motion.div>
        <div className="relative">
          <div
            className="font-hand"
            style={{
              color: '#1b2845',
              fontSize: '1.6rem',
              transform: 'rotate(-2deg)',
              lineHeight: 1.1,
            }}
          >
            crown the greatest
            <br />
            pixar franchise of all time
          </div>
          <div className="absolute" style={{ top: -8, left: -32 }}>
            <MarkerScribble variant="arrow" size={64} color="#1b2845" animate={false} />
          </div>
        </div>
      </motion.div>

      {/* Practice mode notice */}
      {isLocalMode() && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
          className="font-hand mb-6 px-3 py-1"
          style={{
            color: '#c8412b',
            background: '#f4e8d0',
            transform: 'rotate(-1deg)',
            border: '1.5px dashed #c8412b',
            fontSize: '1.1rem',
            boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
          }}
        >
          practice mode — add Firebase for multi-device play
        </motion.div>
      )}

      {/* Form card — index card style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0.5 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="relative w-full max-w-3xl px-8 py-8"
        style={{
          background: '#f4e8d0',
          backgroundImage: 'radial-gradient(ellipse at 30% 20%, #fff4d6 0%, #f4e8d0 60%, #e6d4a8 100%)',
          border: '1.5px solid #1b2845',
          boxShadow: '0 24px 48px -10px rgba(0,0,0,0.55), 0 8px 18px rgba(0,0,0,0.35)',
          color: '#1b2845',
        }}
      >
        <Tape width={90} height={22} rotate={-18} color="amber" style={{ top: -10, left: -20 }} />
        <Tape width={80} height={20} rotate={20} color="amber" style={{ top: -8, right: -16 }} />

        {/* ruled paper lines */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(180deg, transparent 0, transparent 31px, rgba(27,40,69,0.08) 32px, transparent 33px)',
            backgroundSize: '100% 32px',
            opacity: 0.7,
          }}
        />

        {mode === 'menu' && (
          <div className="flex flex-col gap-4 relative">
            <button
              onClick={() => setMode('create')}
              disabled={!ready}
              className="font-poster text-2xl py-5 transition-all hover:scale-[1.03] hover:-rotate-1 active:scale-[0.97]"
              style={{
                background: '#1b2845',
                color: '#f4e8d0',
                border: '2px solid #1b2845',
                letterSpacing: '0.02em',
                boxShadow: '0 6px 14px -3px rgba(0,0,0,0.45)',
              }}
            >
              start a new bracket
            </button>
            <button
              onClick={() => setMode('join')}
              disabled={!ready}
              className="font-poster text-2xl py-5 transition-all hover:scale-[1.03] hover:rotate-1 active:scale-[0.97]"
              style={{
                background: 'transparent',
                color: '#1b2845',
                border: '2px solid #1b2845',
                letterSpacing: '0.02em',
                boxShadow: '0 6px 14px -3px rgba(0,0,0,0.3)',
              }}
            >
              join with a code
            </button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div className="flex flex-col gap-5 relative">
            <button
              onClick={() => {
                setMode('menu')
                setError(null)
              }}
              className="font-hand text-lg self-start"
              style={{ color: 'rgba(27,40,69,0.7)' }}
            >
              ← back
            </button>

            <div>
              <label
                className="block font-hand text-lg mb-1"
                style={{ color: 'rgba(27,40,69,0.7)' }}
              >
                your name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Victor"
                maxLength={20}
                className="w-full px-4 py-3 text-2xl font-hand outline-none"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid #1b2845',
                  color: '#1b2845',
                }}
              />
            </div>

            <div>
              <label
                className="block font-hand text-lg mb-1"
                style={{ color: 'rgba(27,40,69,0.7)' }}
              >
                pixar your avatar
              </label>
              <AvatarPicker value={emoji} onChange={setEmoji} />
            </div>

            {mode === 'create' && (
              <div>
                <label
                  className="block font-hand text-lg mb-1"
                  style={{ color: 'rgba(27,40,69,0.7)' }}
                >
                  bracket
                </label>
                <select
                  value={themeId}
                  onChange={(e) => setThemeId(e.target.value)}
                  className="w-full px-4 py-3 font-poster text-lg outline-none"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid #1b2845',
                    color: '#1b2845',
                  }}
                >
                  {Object.values(THEMES).map((t) => (
                    <option key={t.id} value={t.id} style={{ background: '#f4e8d0' }}>
                      {t.title} · {t.size} entries
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'join' && (
              <div>
                <label
                  className="block font-hand text-lg mb-1"
                  style={{ color: 'rgba(27,40,69,0.7)' }}
                >
                  room code
                </label>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="XXXX"
                  maxLength={6}
                  className="w-full px-4 py-3 text-4xl font-poster tracking-[0.3em] text-center outline-none"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid #1b2845',
                    color: '#1b2845',
                  }}
                />
              </div>
            )}

            {error && (
              <div
                className="font-hand text-base px-3 py-2"
                style={{
                  color: '#c8412b',
                  border: '1.5px dashed #c8412b',
                  background: 'rgba(200, 65, 43, 0.08)',
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={mode === 'create' ? handleCreate : handleJoin}
              disabled={busy || !ready}
              className="font-poster text-2xl py-4 transition-all hover:scale-[1.03] hover:-rotate-1 active:scale-[0.97] disabled:opacity-50"
              style={{
                background: '#1b2845',
                color: '#f4e8d0',
                border: '2px solid #1b2845',
                letterSpacing: '0.02em',
                boxShadow: '0 6px 14px -3px rgba(0,0,0,0.45)',
              }}
            >
              {busy ? '…' : mode === 'create' ? 'create & host' : 'join the game'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
