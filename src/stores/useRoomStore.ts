import { create } from 'zustand'
import type { Room } from '../types/room'

interface RoomStoreState {
  code: string | null
  room: Room | null
  myUid: string | null
  loading: boolean
  setCode: (code: string | null) => void
  setRoom: (room: Room | null) => void
  setMyUid: (uid: string | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useRoomStore = create<RoomStoreState>((set) => ({
  code: null,
  room: null,
  myUid: null,
  loading: true,
  setCode: (code) => set({ code }),
  setRoom: (room) => set({ room, loading: false }),
  setMyUid: (myUid) => set({ myUid }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ code: null, room: null, loading: true }),
}))

export function selectAmHost(state: RoomStoreState): boolean {
  if (!state.room || !state.myUid) return false
  return state.room.meta.hostUid === state.myUid
}

export function selectCurrentRound(state: RoomStoreState): number {
  return state.room?.phase.round ?? 1
}

export function selectPhase(state: RoomStoreState) {
  return state.room?.phase ?? null
}
