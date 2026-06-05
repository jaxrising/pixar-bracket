import { useEffect, useState } from 'react'
import { useServerClock } from './useServerClock'

export function useCountdown(endsAt: number | null | undefined) {
  const { serverNow } = useServerClock()
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    if (!endsAt) return 0
    return Math.max(0, endsAt - serverNow())
  })

  useEffect(() => {
    if (!endsAt) {
      setRemainingMs(0)
      return
    }
    let raf = 0
    const tick = () => {
      const r = Math.max(0, endsAt - (Date.now() + (serverNow() - Date.now())))
      setRemainingMs(r)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [endsAt, serverNow])

  return {
    remainingMs,
    seconds: Math.ceil(remainingMs / 1000),
    expired: remainingMs <= 0,
  }
}
