import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getDatabase,
  ref,
  onValue,
  set,
  update as rtdbUpdate,
  serverTimestamp,
  onDisconnect,
  type Database,
} from 'firebase/database'
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth'
import type { Room } from '../types/room'
import type { RoomService, RoomUpdate } from './service'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.databaseURL &&
      firebaseConfig.projectId,
  )
}

export class FirebaseRoomService implements RoomService {
  readonly mode = 'firebase' as const

  private app: FirebaseApp
  private db: Database
  private auth: Auth
  private uid: string | null = null
  private serverOffset = 0

  constructor() {
    this.app = initializeApp(firebaseConfig)
    this.db = getDatabase(this.app)
    this.auth = getAuth(this.app)
  }

  async signIn() {
    if (this.uid) return { uid: this.uid }
    const result = await signInAnonymously(this.auth)
    this.uid = result.user.uid
    return { uid: result.user.uid }
  }

  getUid() {
    return this.uid
  }

  serverNow() {
    return Date.now() + this.serverOffset
  }

  getServerOffset() {
    return this.serverOffset
  }

  subscribeRoom(code: string, onSnapshot: (room: Room | null) => void): () => void {
    const r = ref(this.db, `rooms/${code}`)
    return onValue(r, (snap) => {
      onSnapshot((snap.val() as Room | null) ?? null)
    })
  }

  subscribeServerOffset(onChange: (offsetMs: number) => void): () => void {
    const r = ref(this.db, '.info/serverTimeOffset')
    return onValue(r, (snap) => {
      const offset = (snap.val() as number) ?? 0
      this.serverOffset = offset
      onChange(offset)
    })
  }

  async createRoom(code: string, initial: Room): Promise<void> {
    await set(ref(this.db, `rooms/${code}`), initial)
  }

  async roomExists(code: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      onValue(
        ref(this.db, `rooms/${code}/meta/code`),
        (snap) => resolve(snap.exists()),
        (err) => reject(err),
        { onlyOnce: true },
      )
    })
  }

  async update(code: string, updates: RoomUpdate): Promise<void> {
    await rtdbUpdate(ref(this.db, `rooms/${code}`), updates)
  }

  async setPath(code: string, path: string, value: unknown): Promise<void> {
    await set(ref(this.db, `rooms/${code}/${path}`), value)
  }

  setOnDisconnect(code: string, uid: string): void {
    const presenceRef = ref(this.db, `rooms/${code}/presence/${uid}`)
    onDisconnect(presenceRef).set({
      online: false,
      lastSeen: serverTimestamp(),
    })
  }
}
