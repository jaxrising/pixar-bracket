import { useEffect, useState } from 'react'
import { getRoomService } from '../firebase'
import { useRoomStore } from '../stores/useRoomStore'

export function useAuth() {
  const [uid, setUid] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const setMyUid = useRoomStore((s) => s.setMyUid)

  useEffect(() => {
    let cancelled = false
    const svc = getRoomService()
    svc
      .signIn()
      .then(({ uid }) => {
        if (cancelled) return
        setUid(uid)
        setMyUid(uid)
        setReady(true)
      })
      .catch((err) => {
        console.error('Auth failed:', err)
        setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [setMyUid])

  return { uid, ready }
}
