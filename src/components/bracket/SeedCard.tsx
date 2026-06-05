import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { BracketSeedEntry } from '../../types/room'
import Pushpin from '../shared/Pushpin'
import RubberStamp from '../shared/RubberStamp'
import MarkerScribble from '../shared/MarkerScribble'
import StickyNote from '../shared/StickyNote'
import Tape from '../shared/Tape'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  seed: BracketSeedEntry | null
  size?: Size
  selected?: boolean
  dimmed?: boolean
  winner?: boolean
  loser?: boolean
  stampText?: string
  showPercentage?: number | null
  onClick?: () => void
  disabled?: boolean
}

/**
 * Cards are portrait (3:4 to 2:3) so the movie posters fill them properly,
 * like real pinned promotional posters.
 */
const SIZE_MAP: Record<
  Size,
  { width: string; aspect: string; title: string; meta: string; pin: number; pct: string; stamp: 'sm' | 'md' | 'lg' }
> = {
  sm: {
    width: 'w-full max-w-[150px]',
    aspect: 'aspect-[3/4.4]',
    title: 'text-xs',
    meta: 'text-[10px]',
    pin: 12,
    pct: '1.5rem',
    stamp: 'sm',
  },
  md: {
    width: 'w-full max-w-[200px]',
    aspect: 'aspect-[3/4.4]',
    title: 'text-base',
    meta: 'text-xs',
    pin: 16,
    pct: '2rem',
    stamp: 'sm',
  },
  lg: {
    width: 'w-full max-w-[260px]',
    aspect: 'aspect-[3/4.4]',
    title: 'text-xl',
    meta: 'text-sm',
    pin: 20,
    pct: '2.5rem',
    stamp: 'md',
  },
  xl: {
    width: 'w-full max-w-[360px]',
    aspect: 'aspect-[3/4.4]',
    title: 'text-2xl',
    meta: 'text-base',
    pin: 24,
    pct: '3.5rem',
    stamp: 'lg',
  },
}

function hashTilt(seedId: string | undefined, range = 2.5): number {
  if (!seedId) return 0
  let h = 0
  for (let i = 0; i < seedId.length; i++) h = (h * 31 + seedId.charCodeAt(i)) | 0
  return ((Math.abs(h) % 1000) / 1000) * range * 2 - range
}

export default function SeedCard({
  seed,
  size = 'md',
  selected = false,
  dimmed = false,
  winner = false,
  loser = false,
  stampText,
  showPercentage = null,
  onClick,
  disabled = false,
}: Props) {
  const [posterFailed, setPosterFailed] = useState(false)
  const [posterLoaded, setPosterLoaded] = useState(false)

  const tilt = useMemo(() => hashTilt(seed?.id), [seed?.id])
  const showTape = useMemo(() => {
    if (!seed) return false
    let h = 0
    for (let i = 0; i < seed.id.length; i++) h = (h * 17 + seed.id.charCodeAt(i)) | 0
    return Math.abs(h) % 3 === 0
  }, [seed])

  const sizing = SIZE_MAP[size]

  if (!seed) {
    return (
      <div
        className={`${sizing.width} ${sizing.aspect} relative flex flex-col items-center justify-center mx-auto`}
        style={{
          background:
            'repeating-linear-gradient(135deg, rgba(244, 232, 208, 0.08) 0 6px, transparent 6px 12px)',
          border: '2px dashed rgba(244, 232, 208, 0.35)',
          borderRadius: '6px',
          transform: `rotate(${tilt}deg)`,
        }}
      >
        <span className="font-poster text-4xl" style={{ color: 'rgba(244, 232, 208, 0.45)' }}>
          ?
        </span>
        <span className="font-hand text-base mt-1" style={{ color: 'rgba(244, 232, 208, 0.45)' }}>
          tbd
        </span>
      </div>
    )
  }

  const hasPoster = seed.poster && posterLoaded && !posterFailed

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      animate={{
        y: loser ? 70 : 0,
        rotate: loser ? tilt + 22 : tilt + (selected ? -1 : 0),
        scale: selected ? 1.03 : winner ? 1.06 : loser ? 0.86 : 1,
        opacity: dimmed ? 0.4 : loser ? 0.38 : 1,
      }}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={
        loser
          ? { type: 'spring', stiffness: 80, damping: 14, mass: 1.2, delay: 0.6 }
          : { type: 'spring', stiffness: 220, damping: 20 }
      }
      className={`${sizing.width} ${sizing.aspect} relative text-left flex flex-col disabled:cursor-default mx-auto`}
      style={{
        background: '#f4e8d0',
        border: '1.5px solid rgba(27, 40, 69, 0.2)',
        borderRadius: '4px',
        boxShadow:
          '0 8px 20px -4px rgba(0,0,0,0.18), 0 3px 8px rgba(0,0,0,0.1)',
        color: '#1b2845',
        transformOrigin: 'center top',
        padding: '4px',
      }}
    >
      {/* pushpins */}
      <div
        className="absolute z-30"
        style={{ top: -sizing.pin / 2, left: '14%', transform: 'translate(-50%, 0)' }}
      >
        <Pushpin color="red" size={sizing.pin} />
      </div>
      <div
        className="absolute z-30"
        style={{ top: -sizing.pin / 2, right: '14%', transform: 'translate(50%, 0)' }}
      >
        <Pushpin color="navy" size={sizing.pin} />
      </div>

      {/* optional tape on top corner for some cards */}
      {showTape && (
        <Tape
          width={size === 'sm' ? 50 : 80}
          height={size === 'sm' ? 14 : 18}
          rotate={-22}
          color="amber"
          style={{ top: -6, right: -8 }}
        />
      )}

      {/* selected → sticky note "my pick" lands on outer corner so it can extend past the card */}
      {selected && !winner && !loser && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{ top: '38%', right: '-32px' }}
        >
          <StickyNote color="yellow" rotate={10} size="sm" animateIn>
            my pick!
          </StickyNote>
        </div>
      )}

      {/* poster fills the card — the dominant visual */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          border: '1px solid rgba(27, 40, 69, 0.4)',
          borderRadius: '2px',
          background: seed.poster
            ? '#1b2845'
            : `linear-gradient(135deg, ${seed.gradient[0]} 0%, ${seed.gradient[1]} 100%)`,
        }}
      >
        {seed.poster && !posterFailed && (
          <img
            src={seed.poster}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: posterLoaded ? 1 : 0,
              transition: 'opacity 240ms ease',
              filter: loser ? 'grayscale(60%) brightness(0.6)' : 'none',
              objectPosition: 'center top',
            }}
            onLoad={() => setPosterLoaded(true)}
            onError={() => setPosterFailed(true)}
          />
        )}
        {(!seed.poster || posterFailed) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: size === 'xl' ? '7rem' : size === 'lg' ? '5rem' : size === 'md' ? '3.5rem' : '2.5rem' }}>
              {seed.emoji}
            </span>
          </div>
        )}

        {/* title overlay — only shown when poster failed/missing (posters have titles baked in) */}
        {!hasPoster && (
          <div
            className="absolute left-0 right-0 bottom-0 px-3 pt-8 pb-2"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.92) 100%)',
            }}
          >
            <div
              className={`font-poster ${sizing.title} leading-tight`}
              style={{
                color: '#fff5e1',
                textShadow: '0 2px 8px rgba(0,0,0,0.85)',
              }}
            >
              {size === 'sm' ? seed.shortName : seed.name}
            </div>
          </div>
        )}

        {/* vote percentage badge — top-right corner of the poster */}
        {showPercentage !== null && (
          <div
            className="absolute font-stamp"
            style={{
              top: '8px',
              right: '8px',
              fontSize: sizing.pct,
              lineHeight: 1,
              color: '#ffb627',
              padding: '2px 8px',
              background: 'rgba(27, 40, 69, 0.78)',
              border: '1.5px solid #ffb627',
              borderRadius: '2px',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}
          >
            {Math.round(showPercentage)}%
          </div>
        )}

        {/* loser → marker X scribbled across the poster */}
        {loser && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <MarkerScribble
              variant="x"
              size={size === 'xl' ? 280 : size === 'lg' ? 200 : size === 'md' ? 150 : 110}
              color="#c8412b"
            />
          </div>
        )}

        {/* winner → red rubber stamp slams diagonally */}
        {winner && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <RubberStamp text={stampText ?? "ADVANCING"} rotate={-12} color="red" size={sizing.stamp} />
          </div>
        )}
      </div>
    </motion.button>
  )
}
