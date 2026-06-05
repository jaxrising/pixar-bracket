import { create } from 'zustand'

interface HostStoreState {
  revealAnimating: boolean
  pendingRevealMatchup: string | null
  setRevealAnimating: (v: boolean) => void
  setPendingReveal: (matchupId: string | null) => void
}

export const useHostStore = create<HostStoreState>((set) => ({
  revealAnimating: false,
  pendingRevealMatchup: null,
  setRevealAnimating: (revealAnimating) => set({ revealAnimating }),
  setPendingReveal: (pendingRevealMatchup) => set({ pendingRevealMatchup }),
}))
