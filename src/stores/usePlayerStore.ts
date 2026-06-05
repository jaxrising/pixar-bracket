import { create } from 'zustand'

interface PlayerStoreState {
  myName: string
  myEmoji: string
  audioEnabled: boolean
  muted: boolean
  setIdentity: (name: string, emoji: string) => void
  setAudioEnabled: (v: boolean) => void
  setMuted: (v: boolean) => void
}

function loadIdentity() {
  if (typeof localStorage === 'undefined') return { name: '', emoji: '' }
  return {
    name: localStorage.getItem('pixar-bracket:name') ?? '',
    emoji: localStorage.getItem('pixar-bracket:emoji') ?? '',
  }
}

function loadMuted(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem('pixar-bracket:muted') === '1'
}

const initial = loadIdentity()

export const usePlayerStore = create<PlayerStoreState>((set) => ({
  myName: initial.name,
  myEmoji: initial.emoji,
  audioEnabled: false,
  muted: loadMuted(),
  setIdentity: (name, emoji) => {
    try {
      localStorage.setItem('pixar-bracket:name', name)
      localStorage.setItem('pixar-bracket:emoji', emoji)
    } catch {
      // ignore
    }
    set({ myName: name, myEmoji: emoji })
  },
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  setMuted: (muted) => {
    try {
      localStorage.setItem('pixar-bracket:muted', muted ? '1' : '0')
    } catch {
      // ignore
    }
    set({ muted })
  },
}))
