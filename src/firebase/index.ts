import { FirebaseRoomService, isFirebaseConfigured } from './firebase-service'
import { LocalRoomService } from './local-service'
import type { RoomService } from './service'

let _service: RoomService | null = null

export function getRoomService(): RoomService {
  if (_service) return _service
  if (isFirebaseConfigured()) {
    _service = new FirebaseRoomService()
  } else {
    _service = new LocalRoomService()
  }
  return _service
}

export function isLocalMode(): boolean {
  return getRoomService().mode === 'local'
}

export type { RoomService } from './service'
