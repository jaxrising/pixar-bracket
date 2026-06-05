import { motion } from 'framer-motion'
import type { Player, PresenceState } from '../../types/room'
import PlayerAvatar from '../ui/PlayerAvatar'

interface Props {
  players: Record<string, Player>
  presence: Record<string, PresenceState>
  votedUids: Set<string>
  totalToVote: number
}

export default function PlayerRoster({ players, presence, votedUids, totalToVote }: Props) {
  const list = Object.entries(players ?? {}).sort(([, a], [, b]) => a.joinedAt - b.joinedAt)
  const onlineCount = list.filter(([uid]) => presence[uid]?.online).length
  const votedCount = list.filter(([uid]) => votedUids.has(uid)).length

  return (
    <div
      className="px-5 py-4"
      style={{
        background: '#ffffff',
        border: '1.5px solid rgba(17,17,17,0.12)',
        borderRadius: '12px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="font-body text-sm font-bold uppercase" style={{ color: 'rgba(17,17,17,0.45)', letterSpacing: '0.08em' }}>
          Players ({onlineCount})
        </div>
        {totalToVote > 0 && (
          <div className="font-body text-sm font-bold" style={{ color: '#111111' }}>
            {votedCount}/{onlineCount} done
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
        {list.map(([uid, p], i) => {
          const online = presence[uid]?.online
          const voted = votedUids.has(uid)
          return (
            <motion.div
              key={uid}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: online ? 1 : 0.4 }}
              transition={{ type: 'spring', stiffness: 240, damping: 14, delay: i * 0.03 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5"
              style={{
                background: voted ? 'rgba(17,17,17,0.08)' : '#f8f8f8',
                border: voted ? '1.5px solid #111111' : '1px solid rgba(17,17,17,0.1)',
                borderRadius: '20px',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#111111',
              }}
              title={online ? 'online' : 'offline'}
            >
              <PlayerAvatar value={p.emoji} size={20} />
              <span>{p.name}</span>
              {p.isHost && <span style={{ color: '#111111' }}>★</span>}
              {voted && <span style={{ color: '#111111', fontSize: '0.75rem' }}>✓</span>}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
