import { motion } from 'framer-motion'
import type { Player, PresenceState } from '../../types/room'
import PlayerAvatar from '../ui/PlayerAvatar'

interface Props {
  players: Record<string, Player>
  presence: Record<string, PresenceState>
  votedUids: Set<string>
  totalToVote: number
}

const NOTE_COLORS = ['#ffd96b', '#ffb3c1', '#a3c4f3', '#c8e6c9', '#ffd1a3']

function hashRotate(uid: string, range = 6): number {
  let h = 0
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) | 0
  return ((Math.abs(h) % 1000) / 1000) * range * 2 - range
}

export default function PlayerRoster({ players, presence, votedUids, totalToVote }: Props) {
  const list = Object.entries(players ?? {}).sort(([, a], [, b]) => a.joinedAt - b.joinedAt)
  const onlineCount = list.filter(([uid]) => presence[uid]?.online).length
  const votedCount = list.filter(([uid]) => votedUids.has(uid)).length

  return (
    <div
      className="px-5 py-4"
      style={{
        background: 'rgba(244, 232, 208, 0.92)',
        border: '1.5px solid rgba(27, 40, 69, 0.4)',
        borderRadius: '4px',
        boxShadow: '0 8px 18px -4px rgba(0,0,0,0.4)',
        transform: 'rotate(0.5deg)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="font-hand text-lg"
          style={{ color: '#1b2845' }}
        >
          players ({onlineCount})
        </div>
        {totalToVote > 0 && (
          <div className="font-hand text-base" style={{ color: '#c8412b' }}>
            {votedCount}/{onlineCount} done
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {list.map(([uid, p], i) => {
          const online = presence[uid]?.online
          const voted = votedUids.has(uid)
          const noteColor = NOTE_COLORS[i % NOTE_COLORS.length]
          const rot = hashRotate(uid)
          return (
            <motion.div
              key={uid}
              initial={{ scale: 0.7, opacity: 0, rotate: rot - 8 }}
              animate={{ scale: 1, opacity: online ? 1 : 0.45, rotate: rot }}
              transition={{ type: 'spring', stiffness: 240, damping: 14, delay: i * 0.03 }}
              style={{
                background: voted ? noteColor : `${noteColor}cc`,
                padding: '5px 9px',
                border: voted ? '2px solid #c8412b' : '1px solid rgba(27,40,69,0.45)',
                boxShadow: '0 3px 6px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)',
                fontFamily: "'Caveat', cursive",
                fontWeight: 700,
                fontSize: '1rem',
                color: '#1b2845',
                lineHeight: 1.1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              title={online ? 'online' : 'offline'}
            >
              <PlayerAvatar value={p.emoji} size={22} />
              <span>{p.name}</span>
              {p.isHost && (
                <span style={{ color: '#c8412b', fontWeight: 700 }}>★</span>
              )}
              {voted && <span style={{ color: '#c8412b' }}>✓</span>}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
