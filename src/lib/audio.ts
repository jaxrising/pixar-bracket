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

const SFX_URLS: Record<SfxKey, string> = {
  voteTap: '/audio/vote-tap.mp3',
  voteSwap: '/audio/vote-swap.mp3',
  timerTick: '/audio/timer-tick.mp3',
  timerPulse: '/audio/timer-pulse.mp3',
  revealBatch: '/audio/reveal-batch.mp3',
  revealPair: '/audio/reveal-pair.mp3',
  revealDramatic: '/audio/reveal-dramatic.mp3',
  revealCinematic: '/audio/reveal-cinematic.mp3',
  coinFlip: '/audio/coin-flip.mp3',
  crown: '/audio/crown.mp3',
  join: '/audio/join.mp3',
}

const cache = new Map<SfxKey, HTMLAudioElement>()
let enabled = false
let muted = (() => {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem('pixar-bracket:muted') === '1'
})()

export function setMuted(value: boolean) {
  muted = value
  try {
    localStorage.setItem('pixar-bracket:muted', value ? '1' : '0')
  } catch {
    // ignore
  }
}

export function isMuted() {
  return muted
}

export function enableAudio() {
  enabled = true
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
