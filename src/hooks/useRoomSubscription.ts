import { useEffect } from 'react'
import { getRoomService } from '../firebase'
import { useRoomStore } from '../stores/useRoomStore'

export function useRoomSubscription(code: string | null) {
  const setRoom = useRoomStore((s) => s.setRoom)
  const setCode = useRoomStore((s) => s.setCode)
  const setLoading = useRoomStore((s) => s.setLoading)

  useEffect(() => {
    if (!code) {
      setRoom(null)
      setCode(null)
      setLoading(false)
      return
    }
    setCode(code)
    setLoading(true)
    const svc = getRoomService()
    const unsub = svc.subscribeRoom(code, (room) => {
      setRoom(room)
    })
    return () => {
      unsub()
    }
  }, [code, setCode, setRoom, setLoading])
}
