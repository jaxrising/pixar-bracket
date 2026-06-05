import { motion } from 'framer-motion'
import type { BracketState } from '../../types/room'
import { matchupId, getSeedById, totalRounds } from '../../lib/bracket'

interface Props {
  bracket: BracketState
  currentRound: number
}

/**
 * Full-width bracket tree — scales to fit the browser with no horizontal scroll.
 * Each stub shows a poster thumbnail + short name. Winner highlighted in red.
 */
export default function BracketMiniMap({ bracket, currentRound }: Props) {
  const size = (Object.keys(bracket.seeds ?? {}).length === 32 ? 32 : 16) as 16 | 32
  if (size !== 16) return null

  const rounds = totalRounds(size) // 4

  // Stub dimensions
  const stubW = 140
  const stubH = 52
  const imgSize = 40
  const gap = 10
  const colGap = 32
  const r1Pitch = stubH + gap

  const r1Top = 8
  const r1Ys = [0, 1, 2, 3].map((i) => r1Top + i * r1Pitch + stubH / 2)
  const r2Ys = [(r1Ys[0] + r1Ys[1]) / 2, (r1Ys[2] + r1Ys[3]) / 2]
  const r3Ys = [(r2Ys[0] + r2Ys[1]) / 2]

  const colXs = [0, stubW + colGap, (stubW + colGap) * 2, (stubW + colGap) * 3]
  const totalLeftWidth = colXs[3] + stubW
  const halfGap = 48
  const rightOffset = totalLeftWidth + halfGap

  const fullW = rightOffset + totalLeftWidth + stubW
  const fullH = r1Ys[r1Ys.length - 1] + stubH / 2 + 24

  type Stub = {
    x: number; y: number
    aId: string | null; bId: string | null; winnerId: string | null
    round: number; mid: string
  }

  const stubs: Stub[] = []

  // R1 LEFT
  for (let i = 0; i < 4; i++) {
    const mid = matchupId(1, i)
    const m = bracket.rounds['1']?.matchups[mid]
    stubs.push({ x: colXs[0], y: r1Ys[i] - stubH / 2, aId: m?.a ?? null, bId: m?.b ?? null, winnerId: m?.winner ?? null, round: 1, mid })
  }
  // R1 RIGHT
  for (let i = 0; i < 4; i++) {
    const mid = matchupId(1, 4 + i)
    const m = bracket.rounds['1']?.matchups[mid]
    stubs.push({ x: rightOffset + colXs[3], y: r1Ys[i] - stubH / 2, aId: m?.a ?? null, bId: m?.b ?? null, winnerId: m?.winner ?? null, round: 1, mid })
  }
  // R2 LEFT
  for (let i = 0; i < 2; i++) {
    const mid = matchupId(2, i)
    const m = bracket.rounds['2']?.matchups[mid]
    stubs.push({ x: colXs[1], y: r2Ys[i] - stubH / 2, aId: m?.a ?? null, bId: m?.b ?? null, winnerId: m?.winner ?? null, round: 2, mid })
  }
  // R2 RIGHT
  for (let i = 0; i < 2; i++) {
    const mid = matchupId(2, 2 + i)
    const m = bracket.rounds['2']?.matchups[mid]
    stubs.push({ x: rightOffset + colXs[2], y: r2Ys[i] - stubH / 2, aId: m?.a ?? null, bId: m?.b ?? null, winnerId: m?.winner ?? null, round: 2, mid })
  }
  // R3 LEFT
  {
    const mid = matchupId(3, 0)
    const m = bracket.rounds['3']?.matchups[mid]
    stubs.push({ x: colXs[2], y: r3Ys[0] - stubH / 2, aId: m?.a ?? null, bId: m?.b ?? null, winnerId: m?.winner ?? null, round: 3, mid })
  }
  // R3 RIGHT
  {
    const mid = matchupId(3, 1)
    const m = bracket.rounds['3']?.matchups[mid]
    stubs.push({ x: rightOffset + colXs[1], y: r3Ys[0] - stubH / 2, aId: m?.a ?? null, bId: m?.b ?? null, winnerId: m?.winner ?? null, round: 3, mid })
  }
  // Final
  {
    const mid = matchupId(4, 0)
    const m = bracket.rounds['4']?.matchups[mid]
    const finalX = (totalLeftWidth + halfGap / 2) - stubW / 2
    stubs.push({ x: finalX, y: r3Ys[0] - stubH / 2, aId: m?.a ?? null, bId: m?.b ?? null, winnerId: m?.winner ?? null, round: rounds, mid })
  }

  // Connector paths
  const lines: string[] = []
  const addPath = (from1: {x:number,y:number}, from2: {x:number,y:number}, to: {x:number,y:number}) => {
    const midX = (from1.x + to.x) / 2
    lines.push(`M ${from1.x} ${from1.y} L ${midX} ${from1.y} L ${midX} ${from2.y} M ${midX} ${(from1.y+from2.y)/2} L ${to.x} ${to.y}`)
  }

  for (let i = 0; i < 2; i++) {
    addPath({ x: stubs[i*2].x+stubW, y: stubs[i*2].y+stubH/2 }, { x: stubs[i*2+1].x+stubW, y: stubs[i*2+1].y+stubH/2 }, { x: stubs[8+i].x, y: stubs[8+i].y+stubH/2 })
  }
  for (let i = 0; i < 2; i++) {
    addPath({ x: stubs[4+i*2].x, y: stubs[4+i*2].y+stubH/2 }, { x: stubs[4+i*2+1].x, y: stubs[4+i*2+1].y+stubH/2 }, { x: stubs[10+i].x+stubW, y: stubs[10+i].y+stubH/2 })
  }
  addPath({ x: stubs[8].x+stubW, y: stubs[8].y+stubH/2 }, { x: stubs[9].x+stubW, y: stubs[9].y+stubH/2 }, { x: stubs[12].x, y: stubs[12].y+stubH/2 })
  addPath({ x: stubs[10].x, y: stubs[10].y+stubH/2 }, { x: stubs[11].x, y: stubs[11].y+stubH/2 }, { x: stubs[13].x+stubW, y: stubs[13].y+stubH/2 })
  addPath({ x: stubs[12].x+stubW, y: stubs[12].y+stubH/2 }, { x: stubs[13].x, y: stubs[13].y+stubH/2 }, { x: stubs[14].x+stubW/2, y: stubs[14].y+stubH/2 })

  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      <svg
        viewBox={`-8 -8 ${fullW + 16} ${fullH + 16}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* connector lines */}
        <g stroke="#1b2845" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.5}>
          {lines.map((d, i) => <path key={i} d={d} />)}
        </g>

        {stubs.map((s) => {
          const aSeed = getSeedById(bracket, s.aId)
          const bSeed = getSeedById(bracket, s.bId)
          const winnerSeed = getSeedById(bracket, s.winnerId)
          const isActive = s.round === currentRound
          const isFinal = s.round === rounds
          const tilt = ((s.mid.charCodeAt(s.mid.length - 1) % 5) - 2) * 0.5

          // What to show: if there's a winner, show winner only. Otherwise show a vs b.
          const displaySeed = winnerSeed ?? null
          const seedA = aSeed
          const seedB = bSeed

          return (
            <motion.g
              key={s.mid}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              transform={`translate(${s.x + stubW/2}, ${s.y + stubH/2}) rotate(${tilt}) translate(${-stubW/2}, ${-stubH/2})`}
            >
              {/* card background */}
              <rect
                width={stubW} height={stubH} rx={3}
                fill="#f4e8d0"
                stroke={isActive ? '#c8412b' : '#1b2845'}
                strokeWidth={isActive ? 2 : 1}
                filter={isActive ? 'drop-shadow(0 3px 6px rgba(200,65,43,0.4))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))'}
              />

              {displaySeed ? (
                // Winner view: poster + name centered
                <>
                  {displaySeed.poster && (
                    <image
                      href={displaySeed.poster}
                      x={4} y={6} width={imgSize - 8} height={stubH - 12}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`inset(0 round 2px)`}
                    />
                  )}
                  <text
                    x={displaySeed.poster ? imgSize : stubW / 2}
                    y={stubH / 2 + 4}
                    textAnchor={displaySeed.poster ? 'start' : 'middle'}
                    fontSize={isFinal ? 12 : 10}
                    fontFamily="'Alfa Slab One', serif"
                    fill="#c8412b"
                  >
                    {displaySeed.shortName}
                  </text>
                </>
              ) : (
                // Matchup view: side-by-side with divider
                <>
                  {/* Side A */}
                  {seedA?.poster && (
                    <image href={seedA.poster} x={2} y={2} width={imgSize - 4} height={stubH - 4}
                      preserveAspectRatio="xMidYMid slice" />
                  )}
                  <text x={imgSize + 4} y={stubH / 2 - 2}
                    textAnchor="start" fontSize={9} fontFamily="'Alfa Slab One', serif" fill="#1b2845">
                    {seedA?.shortName ?? '?'}
                  </text>
                  {/* Divider */}
                  <line x1={4} y1={stubH/2} x2={stubW - 4} y2={stubH/2} stroke="rgba(27,40,69,0.25)" strokeWidth={0.8} strokeDasharray="3 2" />
                  {/* Side B */}
                  {seedB?.poster && (
                    <image href={seedB.poster} x={2} y={2} width={imgSize - 4} height={stubH - 4}
                      preserveAspectRatio="xMidYMid slice" opacity={0.4} />
                  )}
                  <text x={imgSize + 4} y={stubH / 2 + 12}
                    textAnchor="start" fontSize={9} fontFamily="'Alfa Slab One', serif" fill="#1b2845">
                    {seedB?.shortName ?? '?'}
                  </text>
                </>
              )}

              {/* "now!" tag for active round */}
              {isActive && (
                <text x={stubW - 2} y={-4} textAnchor="end" fontSize={10}
                  fontFamily="'Nunito', sans-serif" fontWeight={700} fill="#c8412b"
                  transform="rotate(-8, ${stubW}, 0)">
                  now!
                </text>
              )}
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}
