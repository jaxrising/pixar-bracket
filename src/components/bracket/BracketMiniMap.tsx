import { motion } from 'framer-motion'
import type { BracketState } from '../../types/room'
import { matchupId, getSeedById, totalRounds } from '../../lib/bracket'

interface Props {
  bracket: BracketState
  currentRound: number
}

/**
 * Compact full-tournament tree showing all 15 matchups (for a 16-bracket).
 * Tiny "ticket stub" cards arranged in the classic bracket tree, connected by marker lines.
 * The active round is highlighted; future rounds show "?" placeholders.
 */
export default function BracketMiniMap({ bracket, currentRound }: Props) {
  const size = (Object.keys(bracket.seeds ?? {}).length === 32 ? 32 : 16) as 16 | 32
  if (size !== 16) {
    // 32-team tree is a bigger render — not implemented yet
    return null
  }

  const rounds = totalRounds(size) // 4

  // Stub dimensions and vertical spacing
  const stubW = 110
  const stubH = 36
  const gap = 12
  const r1Pitch = stubH + gap
  const colGap = 26

  // Y centers for R1 LEFT (4 stubs, top->bottom)
  const r1Top = 8
  const r1Ys = [0, 1, 2, 3].map((i) => r1Top + i * r1Pitch + stubH / 2)
  // R2 LEFT: centered between pairs
  const r2Ys = [(r1Ys[0] + r1Ys[1]) / 2, (r1Ys[2] + r1Ys[3]) / 2]
  // R3 LEFT: centered between R2
  const r3Ys = [(r2Ys[0] + r2Ys[1]) / 2]
  // Final: centered between two R3 (mirrored), same as r3Ys[0]
  const finalY = r3Ys[0]

  // X positions for columns
  const colXs = [0, stubW + colGap, (stubW + colGap) * 2, (stubW + colGap) * 3]
  const totalLeftWidth = colXs[3] + stubW

  // Mirror for right side (offset by left width + a gap between halves)
  const halfGap = 40
  const rightOffset = totalLeftWidth + halfGap

  const fullW = rightOffset + totalLeftWidth + stubW + halfGap // approx
  const fullH = r1Ys[r1Ys.length - 1] + stubH / 2 + 24

  // Build stubs
  type Stub = { x: number; y: number; aId: string | null; bId: string | null; winnerId: string | null; round: number; mid: string }

  const stubs: Stub[] = []

  // R1 LEFT (m1-1..m1-4)
  for (let i = 0; i < 4; i++) {
    const mid = matchupId(1, i)
    const m = bracket.rounds['1']?.matchups[mid]
    stubs.push({
      x: colXs[0],
      y: r1Ys[i] - stubH / 2,
      aId: m?.a ?? null,
      bId: m?.b ?? null,
      winnerId: m?.winner ?? null,
      round: 1,
      mid,
    })
  }
  // R1 RIGHT (m1-5..m1-8) — mirrored
  for (let i = 0; i < 4; i++) {
    const mid = matchupId(1, 4 + i)
    const m = bracket.rounds['1']?.matchups[mid]
    stubs.push({
      x: rightOffset + colXs[3],
      y: r1Ys[i] - stubH / 2,
      aId: m?.a ?? null,
      bId: m?.b ?? null,
      winnerId: m?.winner ?? null,
      round: 1,
      mid,
    })
  }
  // R2 LEFT (m2-1, m2-2)
  for (let i = 0; i < 2; i++) {
    const mid = matchupId(2, i)
    const m = bracket.rounds['2']?.matchups[mid]
    stubs.push({
      x: colXs[1],
      y: r2Ys[i] - stubH / 2,
      aId: m?.a ?? null,
      bId: m?.b ?? null,
      winnerId: m?.winner ?? null,
      round: 2,
      mid,
    })
  }
  // R2 RIGHT (m2-3, m2-4)
  for (let i = 0; i < 2; i++) {
    const mid = matchupId(2, 2 + i)
    const m = bracket.rounds['2']?.matchups[mid]
    stubs.push({
      x: rightOffset + colXs[2],
      y: r2Ys[i] - stubH / 2,
      aId: m?.a ?? null,
      bId: m?.b ?? null,
      winnerId: m?.winner ?? null,
      round: 2,
      mid,
    })
  }
  // R3 LEFT (m3-1)
  {
    const mid = matchupId(3, 0)
    const m = bracket.rounds['3']?.matchups[mid]
    stubs.push({
      x: colXs[2],
      y: r3Ys[0] - stubH / 2,
      aId: m?.a ?? null,
      bId: m?.b ?? null,
      winnerId: m?.winner ?? null,
      round: 3,
      mid,
    })
  }
  // R3 RIGHT (m3-2)
  {
    const mid = matchupId(3, 1)
    const m = bracket.rounds['3']?.matchups[mid]
    stubs.push({
      x: rightOffset + colXs[1],
      y: r3Ys[0] - stubH / 2,
      aId: m?.a ?? null,
      bId: m?.b ?? null,
      winnerId: m?.winner ?? null,
      round: 3,
      mid,
    })
  }
  // Final (m4-1) — centered between two halves
  {
    const mid = matchupId(4, 0)
    const m = bracket.rounds['4']?.matchups[mid]
    stubs.push({
      x: (totalLeftWidth + halfGap) - stubW / 2 - 20, // placement
      y: finalY - stubH / 2 - stubH - 8, // sit slightly above the centerline so connectors look right
      aId: m?.a ?? null,
      bId: m?.b ?? null,
      winnerId: m?.winner ?? null,
      round: rounds,
      mid,
    })
  }

  // Connectors
  const lines: string[] = []
  const addBracketPath = (from1: { x: number; y: number }, from2: { x: number; y: number }, to: { x: number; y: number }) => {
    const midX = (from1.x + to.x) / 2
    lines.push(
      `M ${from1.x} ${from1.y} L ${midX} ${from1.y} L ${midX} ${from2.y} M ${midX} ${(from1.y + from2.y) / 2} L ${to.x} ${to.y}`,
    )
  }

  // LEFT connectors R1→R2
  for (let i = 0; i < 2; i++) {
    const top = stubs[i * 2]
    const bot = stubs[i * 2 + 1]
    const r2 = stubs[8 + i]
    addBracketPath(
      { x: top.x + stubW, y: top.y + stubH / 2 },
      { x: bot.x + stubW, y: bot.y + stubH / 2 },
      { x: r2.x, y: r2.y + stubH / 2 },
    )
  }
  // RIGHT connectors R1→R2 (mirrored)
  for (let i = 0; i < 2; i++) {
    const top = stubs[4 + i * 2]
    const bot = stubs[4 + i * 2 + 1]
    const r2 = stubs[10 + i]
    addBracketPath(
      { x: top.x, y: top.y + stubH / 2 },
      { x: bot.x, y: bot.y + stubH / 2 },
      { x: r2.x + stubW, y: r2.y + stubH / 2 },
    )
  }
  // LEFT R2→R3
  {
    const top = stubs[8]
    const bot = stubs[9]
    const r3 = stubs[12]
    addBracketPath(
      { x: top.x + stubW, y: top.y + stubH / 2 },
      { x: bot.x + stubW, y: bot.y + stubH / 2 },
      { x: r3.x, y: r3.y + stubH / 2 },
    )
  }
  // RIGHT R2→R3
  {
    const top = stubs[10]
    const bot = stubs[11]
    const r3 = stubs[13]
    addBracketPath(
      { x: top.x, y: top.y + stubH / 2 },
      { x: bot.x, y: bot.y + stubH / 2 },
      { x: r3.x + stubW, y: r3.y + stubH / 2 },
    )
  }
  // R3 LEFT + R3 RIGHT → Final
  {
    const left = stubs[12]
    const right = stubs[13]
    const final = stubs[14]
    addBracketPath(
      { x: left.x + stubW, y: left.y + stubH / 2 },
      { x: right.x, y: right.y + stubH / 2 },
      { x: final.x + stubW / 2, y: final.y + stubH / 2 },
    )
  }

  return (
    <div
      className="relative mx-auto"
      style={{
        width: fullW,
        height: fullH + 12,
        maxWidth: '100%',
      }}
    >
      <svg
        width={fullW}
        height={fullH + 12}
        viewBox={`0 0 ${fullW} ${fullH + 12}`}
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        <g
          stroke="#1b2845"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.6}
        >
          {lines.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>

      {stubs.map((s) => {
        const aSeed = getSeedById(bracket, s.aId)
        const bSeed = getSeedById(bracket, s.bId)
        const winnerSeed = getSeedById(bracket, s.winnerId)
        const isActive = s.round === currentRound
        const isFinal = s.round === rounds
        return (
          <motion.div
            key={s.mid}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: isActive ? 1 : 0.7, y: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute"
            style={{
              left: s.x,
              top: s.y,
              width: stubW,
              height: stubH,
              background: '#f4e8d0',
              border: `${isActive ? 1.8 : 1.2}px solid ${isActive ? '#c8412b' : '#1b2845'}`,
              borderRadius: 2,
              padding: '3px 6px',
              fontFamily: "'Alfa Slab One', serif",
              fontSize: isFinal ? 11 : 9,
              color: '#1b2845',
              lineHeight: 1.1,
              boxShadow: '0 3px 6px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
              transform: `rotate(${(((s.mid.charCodeAt(s.mid.length - 1) % 5) - 2) * 0.6).toFixed(2)}deg)`,
            }}
          >
            {winnerSeed ? (
              <div className="flex items-center justify-center h-full text-center">
                <span style={{ color: '#c8412b' }}>{winnerSeed.shortName}</span>
              </div>
            ) : (
              <div className="flex flex-col justify-center h-full">
                <div className="truncate">{aSeed?.shortName ?? '?'}</div>
                <div
                  className="truncate"
                  style={{ borderTop: '1px dotted rgba(27,40,69,0.4)', paddingTop: 1, marginTop: 1 }}
                >
                  {bSeed?.shortName ?? '?'}
                </div>
              </div>
            )}
            {isActive && (
              <div
                className="absolute font-hand"
                style={{
                  top: -16,
                  right: -8,
                  fontSize: 12,
                  color: '#c8412b',
                  transform: 'rotate(-8deg)',
                }}
              >
                now!
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
