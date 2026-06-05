export type SfxKey =
  | 'voteTap'
  | 'voteSwap'
  | 'timerTick'
  | 'timerPulse'
  | 'revealBatch'
  | 'revealPair'
  | 'revealDramatic'
  | 'revealCinematic'
  | 'coinFlip'
  | 'crown'
  | 'join'

const BASE = import.meta.env.BASE_URL

const SFX_URLS: Record<SfxKey, string> = {
  voteTap: `${BASE}audio/vote-tap.mp3`,
  voteSwap: `${BASE}audio/vote-swap.mp3`,
  timerTick: `${BASE}audio/timer-tick.mp3`,
  timerPulse: `${BASE}audio/timer-pulse.mp3`,
  revealBatch: `${BASE}audio/reveal-batch.mp3`,
  revealPair: `${BASE}audio/reveal-pair.mp3`,
  revealDramatic: `${BASE}audio/reveal-dramatic.mp3`,
  revealCinematic: `${BASE}audio/reveal-cinematic.mp3`,
  coinFlip: `${BASE}audio/coin-flip.mp3`,
  crown: `${BASE}audio/crown.mp3`,
  join: `${BASE}audio/join.mp3`,
}

const cache = new Map<SfxKey, HTMLAudioElement>()
let enabled = false
let muted = (() => {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem('pixar-bracket:muted') === '1'
})()

// Background music
let _music: HTMLAudioElement | null = null
let _musicStarted = false

function getMusic(): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  if (!_music) {
    _music = new Audio(`${BASE}audio/pixar-bracket-theme.mp3`)
    _music.loop = true
    _music.volume = 0.35
  }
  return _music
}

export function playMusic() {
  const m = getMusic()
  if (!m || muted || _musicStarted) return
  _musicStarted = true
  m.currentTime = 0
  void m.play().catch(() => {})
}

export function stopMusic() {
  if (!_music) return
  _music.pause()
  _music.currentTime = 0
  _musicStarted = false
}

export function setMuted(value: boolean) {
  muted = value
  try {
    localStorage.setItem('pixar-bracket:muted', value ? '1' : '0')
  } catch {
    // ignore
  }
  const m = getMusic()
  if (!m) return
  if (value) {
    m.pause()
  } else if (enabled && _musicStarted) {
    void m.play().catch(() => {})
  }
}

export function isMuted() {
  return muted
}

export function enableAudio() {
  enabled = true
  playMusic()
}

export function isAudioEnabled() {
  return enabled
}

function load(key: SfxKey): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  const existing = cache.get(key)
  if (existing) return existing
  try {
    const audio = new Audio(SFX_URLS[key])
    audio.preload = 'auto'
    audio.volume = 0.6
    audio.onerror = () => {} // silence 404s for missing SFX
    cache.set(key, audio)
    return audio
  } catch {
    return null
  }
}

export function playSfx(key: SfxKey, volume = 0.6) {
  if (!enabled || muted) return
  const base = load(key)
  if (!base) return
  try {
    const clone = base.cloneNode() as HTMLAudioElement
    clone.volume = volume
    void clone.play().catch(() => {
      // autoplay blocked - silently ignore
    })
  } catch {
    // ignore
  }
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // ignore
  }
}

export function preloadAll() {
  for (const key of Object.keys(SFX_URLS) as SfxKey[]) {
    load(key)
  }
}
