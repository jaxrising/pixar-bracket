import { useState, useEffect } from 'react'
import { enableAudio } from '../lib/audio'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { usePlayerStore } from '../stores/usePlayerStore'
import { generateRoomCode, normalizeRoomCode, isValidRoomCode } from '../lib/roomCode'
import { createRoom } from '../firebase/room'
import { getRoomService, isLocalMode } from '../firebase'
import { getTheme, DEFAULT_THEME_ID, THEMES } from '../data/themes'
import AvatarPicker from '../components/ui/AvatarPicker'

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
    if (!name.trim()) { setError('Enter your name first'); return }
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
      setError('Could not create room.')
      setBusy(false)
    }
  }

  const handleJoin = async () => {
    if (!uid) return
    const code = normalizeRoomCode(joinCode)
    if (!isValidRoomCode(code)) { setError("That code doesn't look right"); return }
    if (!name.trim()) { setError('Enter your name first'); return }
    setBusy(true)
    setError(null)
    try {
      const exists = await getRoomService().roomExists(code)
      if (!exists) { setError(`Room ${code} not found`); setBusy(false); return }
      setIdentity(name.trim(), emoji)
      navigate(`/play/${code}`)
    } catch (err) {
      console.error(err)
      setError('Could not join room.')
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start px-4 py-10 sm:py-16" style={{ background: '#ffffff' }}>

      {/* Disney·Pixar logo lockup */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <img src={`${import.meta.env.BASE_URL}logo/disney-pixar-seeklogo.png`} alt="Disney · Pixar" style={{ height: 40, objectFit: 'contain' }} />
      </motion.div>

      {/* Hero title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.1 }}
        className="text-center mb-3"
      >
        <h1
          className="font-poster"
          style={{
            color: '#111111',
            fontSize: 'clamp(3.5rem, 12vw, 7rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.01em',
          }}
        >
          GOAT<br />BRACKET
        </h1>
        <p
          className="font-body mt-4 text-base font-semibold"
          style={{ color: 'rgba(17,17,17,0.5)', letterSpacing: '0.02em' }}
        >
          Crown the greatest Pixar franchise of all time
        </p>
      </motion.div>

      {/* Divider */}
      <div className="w-16 h-0.5 mb-10 mt-2" style={{ background: '#111111', borderRadius: 2 }} />

      {/* Practice mode notice */}
      {isLocalMode() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-body text-sm font-semibold mb-6 px-4 py-2"
          style={{ color: '#111111', background: 'rgba(17,17,17,0.08)', border: '1px solid rgba(17,17,17,0.25)', borderRadius: '6px' }}
        >
          Practice mode — add Firebase for multi-device play
        </motion.div>
      )}

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-3xl px-8 py-8"
        style={{
          background: '#ffffff',
          border: '1.5px solid rgba(17,17,17,0.12)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        {mode === 'menu' && (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => { enableAudio(); setMode('create') }}
              disabled={!ready}
              className="font-body font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: '#111111',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 48px',
                letterSpacing: '0.01em',
                boxShadow: '0 4px 14px rgba(17,17,17,0.25)',
              }}
            >
              Start a new bracket
            </button>
            <button
              onClick={() => { enableAudio(); setMode('join') }}
              disabled={!ready}
              className="font-body font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'transparent',
                color: '#111111',
                border: '1.5px solid rgba(17,17,17,0.2)',
                borderRadius: '12px',
                padding: '14px 48px',
                letterSpacing: '0.01em',
              }}
            >
              Join with a code
            </button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div className="flex flex-col gap-6">
            <button
              onClick={() => { setMode('menu'); setError(null) }}
              className="font-body text-sm font-bold self-start flex items-center gap-1"
              style={{ color: 'rgba(17,17,17,0.5)' }}
            >
              ← back
            </button>

            <div>
              <label className="block font-body text-sm font-bold mb-2 uppercase" style={{ color: 'rgba(17,17,17,0.45)', letterSpacing: '0.08em' }}>
                Your name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Victor"
                maxLength={20}
                className="w-full px-4 py-3 text-xl font-body font-bold outline-none"
                style={{
                  background: '#f8f8f8',
                  border: '1.5px solid rgba(17,17,17,0.12)',
                  borderRadius: '8px',
                  color: '#111111',
                }}
              />
            </div>

            <div>
              <label className="block font-body text-sm font-bold mb-3 uppercase" style={{ color: 'rgba(17,17,17,0.45)', letterSpacing: '0.08em' }}>
                Pixar your avatar
              </label>
              <AvatarPicker value={emoji} onChange={setEmoji} />
            </div>

            {mode === 'create' && (
              <div>
                <label className="block font-body text-sm font-bold mb-2 uppercase" style={{ color: 'rgba(17,17,17,0.45)', letterSpacing: '0.08em' }}>
                  Bracket
                </label>
                <select
                  value={themeId}
                  onChange={(e) => setThemeId(e.target.value)}
                  className="w-full px-4 py-3 font-body font-bold text-base outline-none"
                  style={{
                    background: '#f8f8f8',
                    border: '1.5px solid rgba(17,17,17,0.12)',
                    borderRadius: '8px',
                    color: '#111111',
                  }}
                >
                  {Object.values(THEMES).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} · {t.size} entries
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'join' && (
              <div>
                <label className="block font-body text-sm font-bold mb-2 uppercase" style={{ color: 'rgba(17,17,17,0.45)', letterSpacing: '0.08em' }}>
                  Room code
                </label>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="XXXX"
                  maxLength={6}
                  className="w-full px-4 py-3 text-4xl font-poster tracking-[0.3em] text-center outline-none"
                  style={{
                    background: '#f8f8f8',
                    border: '1.5px solid rgba(17,17,17,0.12)',
                    borderRadius: '8px',
                    color: '#111111',
                  }}
                />
              </div>
            )}

            {error && (
              <div className="font-body text-sm font-semibold px-4 py-3" style={{ color: '#111111', background: 'rgba(17,17,17,0.08)', border: '1px solid rgba(17,17,17,0.2)', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            <button
              onClick={mode === 'create' ? handleCreate : handleJoin}
              disabled={busy || !ready}
              className="font-body font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                background: '#111111',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 48px',
                letterSpacing: '0.01em',
                boxShadow: '0 4px 14px rgba(17,17,17,0.25)',
              }}
            >
              {busy ? '…' : mode === 'create' ? 'Create & host' : 'Join the game'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
