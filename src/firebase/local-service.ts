import type { Room } from '../types/room'
import type { RoomService, RoomUpdate } from './service'

const STORAGE_PREFIX = 'pixar-bracket:room:'
const CHANNEL_NAME = 'pixar-bracket:rooms'
const UID_KEY = 'pixar-bracket:uid'

function setByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('/').filter(Boolean)
  let cur: Record<string, unknown> = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    if (typeof cur[k] !== 'object' || cur[k] === null) {
      cur[k] = {}
    }
    cur = cur[k] as Record<string, unknown>
  }
  if (value === null) {
    delete cur[parts[parts.length - 1]]
  } else {
    cur[parts[parts.length - 1]] = value
  }
}

function loadRoom(code: string): Room | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + code)
    if (!raw) return null
    return JSON.parse(raw) as Room
  } catch {
    return null
  }
}

function saveRoom(code: string, room: Room): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + code, JSON.stringify(room))
  } catch {
    // ignore quota errors
  }
}

export class LocalRoomService implements RoomService {
  readonly mode = 'local' as const

  private uid: string | null = null
  private channel: BroadcastChannel | null = null
  private subscribers = new Map<string, Set<(room: Room | null) => void>>()

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL_NAME)
      this.channel.addEventListener('message', (e) => {
        const { code } = e.data ?? {}
        if (!code) return
        this.notify(code)
      })
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (!e.key || !e.key.startsWith(STORAGE_PREFIX)) return
        const code = e.key.slice(STORAGE_PREFIX.length)
        this.notify(code)
      })
    }
  }

  async signIn() {
    if (this.uid) return { uid: this.uid }
    let uid = localStorage.getItem(UID_KEY)
    if (!uid) {
      uid = 'local-' + Math.random().toString(36).slice(2, 10)
      localStorage.setItem(UID_KEY, uid)
    }
    this.uid = uid
    return { uid }
  }

  getUid() {
    return this.uid
  }

  serverNow() {
    return Date.now()
  }

  getServerOffset() {
    return 0
  }

  subscribeRoom(code: string, onSnapshot: (room: Room | null) => void): () => void {
    if (!this.subscribers.has(code)) {
      this.subscribers.set(code, new Set())
    }
    this.subscribers.get(code)!.add(onSnapshot)
    queueMicrotask(() => onSnapshot(loadRoom(code)))
    return () => {
      const set = this.subscribers.get(code)
      if (!set) return
      set.delete(onSnapshot)
      if (set.size === 0) this.subscribers.delete(code)
    }
  }

  subscribeServerOffset(onChange: (offsetMs: number) => void): () => void {
    onChange(0)
    return () => {}
  }

  async createRoom(code: string, initial: Room): Promise<void> {
    saveRoom(code, initial)
    this.broadcast(code)
  }

  async roomExists(code: string): Promise<boolean> {
    return loadRoom(code) !== null
  }

  async update(code: string, updates: RoomUpdate): Promise<void> {
    const room = loadRoom(code)
    if (!room) throw new Error(`Room ${code} not found`)
    const obj = room as unknown as Record<string, unknown>
    for (const [path, value] of Object.entries(updates)) {
      setByPath(obj, path, value)
    }
    saveRoom(code, obj as unknown as Room)
    this.broadcast(code)
  }

  async setPath(code: string, path: string, value: unknown): Promise<void> {
    const room = loadRoom(code)
    if (!room) throw new Error(`Room ${code} not found`)
    const obj = room as unknown as Record<string, unknown>
    setByPath(obj, path, value)
    saveRoom(code, obj as unknown as Room)
    this.broadcast(code)
  }

  setOnDisconnect(_code: string, _uid: string): void {
    // No real disconnect in local mode; presence stays "online" while tab is open.
  }

  private broadcast(code: string) {
    if (this.channel) {
      try {
        this.channel.postMessage({ code })
      } catch {
        // ignore
      }
    }
    this.notify(code)
  }

  private notify(code: string) {
    const set = this.subscribers.get(code)
    if (!set || set.size === 0) return
    const room = loadRoom(code)
    for (const cb of set) cb(room)
  }
}
