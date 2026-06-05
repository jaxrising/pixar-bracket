import type { Room } from '../types/room'

export interface RoomUpdate {
  [path: string]: unknown
}

export interface RoomService {
  readonly mode: 'firebase' | 'local'

  signIn(): Promise<{ uid: string }>
  getUid(): string | null

  serverNow(): number
  getServerOffset(): number

  subscribeRoom(code: string, onSnapshot: (room: Room | null) => void): () => void
  subscribeServerOffset(onChange: (offsetMs: number) => void): () => void

  createRoom(code: string, initial: Room): Promise<void>
  roomExists(code: string): Promise<boolean>

  update(code: string, updates: RoomUpdate): Promise<void>
  setPath(code: string, path: string, value: unknown): Promise<void>

  setOnDisconnect(code: string, uid: string): void
}
