import { useEffect, useState } from 'react'
import { getRoomService } from '../firebase'

export function useServerClock() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const svc = getRoomService()
    const unsub = svc.subscribeServerOffset((o) => {
      setOffset(o)
    })
    return () => {
      unsub()
    }
  }, [])

  return {
    offset,
    serverNow: () => Date.now() + offset,
  }
}
