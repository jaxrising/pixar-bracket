import { useEffect } from 'react'
import { getRoomService } from '../firebase'

export function usePresence(code: string | null, uid: string | null) {
  useEffect(() => {
    if (!code || !uid) return
    const svc = getRoomService()
    void svc.setPath(code, `presence/${uid}`, {
      online: true,
      lastSeen: svc.serverNow(),
    })
    svc.setOnDisconnect(code, uid)
    const interval = setInterval(() => {
      void svc.setPath(code, `presence/${uid}/lastSeen`, svc.serverNow())
    }, 25_000)
    return () => {
      clearInterval(interval)
    }
  }, [code, uid])
}
