import { motion } from 'framer-motion'
import { useState } from 'react'
import type { BracketSeedEntry } from '../../types/room'
import RubberStamp from '../shared/RubberStamp'
import MarkerScribble from '../shared/MarkerScribble'

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

const SIZE_MAP: Record<
  Size,
  { width: string; aspect: string; title: string; pct: string; stamp: 'sm' | 'md' | 'lg' }
> = {
  sm:  { width: 'w-full max-w-[150px]', aspect: 'aspect-[3/4.4]', title: 'text-xs',   pct: '1.5rem', stamp: 'sm' },
  md:  { width: 'w-full max-w-[200px]', aspect: 'aspect-[3/4.4]', title: 'text-base', pct: '2rem',   stamp: 'sm' },
  lg:  { width: 'w-full max-w-[260px]', aspect: 'aspect-[3/4.4]', title: 'text-xl',   pct: '2.5rem', stamp: 'md' },
  xl:  { width: 'w-full max-w-[360px]', aspect: 'aspect-[3/4.4]', title: 'text-2xl',  pct: '3.5rem', stamp: 'lg' },
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

  const sizing = SIZE_MAP[size]

  if (!seed) {
    return (
      <div
        className={`${sizing.width} ${sizing.aspect} relative flex flex-col items-center justify-center mx-auto`}
        style={{
          background: '#f4f4f4',
          border: '2px dashed rgba(17,17,17,0.15)',
          borderRadius: '8px',
        }}
      >
        <span className="font-poster text-4xl" style={{ color: 'rgba(17,17,17,0.2)' }}>?</span>
        <span className="font-body text-sm mt-1 font-bold" style={{ color: 'rgba(17,17,17,0.25)' }}>tbd</span>
      </div>
    )
  }

  const hasPoster = seed.poster && posterLoaded && !posterFailed

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      animate={{
        y: loser ? 40 : 0,
        rotate: 0,
        scale: selected ? 1.04 : winner ? 1.06 : loser ? 0.88 : 1,
        opacity: dimmed ? 0.35 : loser ? 0.4 : 1,
      }}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={
        loser
          ? { type: 'spring', stiffness: 80, damping: 14, mass: 1.2, delay: 0.6 }
          : { type: 'spring', stiffness: 220, damping: 20 }
      }
      className={`${sizing.width} ${sizing.aspect} relative text-left flex flex-col disabled:cursor-default mx-auto`}
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        boxShadow: 'none',
        color: '#111111',
        transformOrigin: 'center top',
        padding: 0,
        overflow: 'hidden',  // clip blur inside card bounds
      }}
    >
      {/* Selected indicator — top bar */}
      {selected && !winner && !loser && (
        <div
          className="absolute top-0 left-0 right-0 z-40 pointer-events-none flex items-center justify-center py-1"
          style={{ background: '#111111' }}
        >
          <span className="font-body text-xs font-black text-white uppercase" style={{ letterSpacing: '0.12em' }}>
            my pick
          </span>
        </div>
      )}

      {/* Blurred backdrop — clipped inside card via overflow:hidden on parent */}
      {seed.poster && posterLoaded && !posterFailed && (
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            inset: '-12px',
            backgroundImage: `url(${seed.poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            filter: 'blur(8px) brightness(0.6) saturate(1.3)',
            zIndex: 0,
          }}
        />
      )}

      {/* Poster */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          zIndex: 1,
          background: seed.poster
            ? '#111111'
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

        {/* Title overlay — only when no poster */}
        {!hasPoster && (
          <div
            className="absolute left-0 right-0 bottom-0 px-3 pt-8 pb-2"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.92) 100%)' }}
          >
            <div className={`font-poster ${sizing.title} leading-tight`} style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.85)' }}>
              {size === 'sm' ? seed.shortName : seed.name}
            </div>
          </div>
        )}

        {/* Vote percentage badge */}
        {showPercentage !== null && (
          <div
            className="absolute font-stamp"
            style={{
              top: '8px', right: '8px',
              fontSize: sizing.pct, lineHeight: 1,
              color: '#ffb627',
              padding: '2px 8px',
              background: 'rgba(17,17,17,0.82)',
              borderRadius: '4px',
            }}
          >
            {Math.round(showPercentage)}%
          </div>
        )}

        {/* Loser X */}
        {loser && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <MarkerScribble
              variant="x"
              size={size === 'xl' ? 280 : size === 'lg' ? 200 : size === 'md' ? 150 : 110}
              color="#111111"
            />
          </div>
        )}

        {/* Winner stamp */}
        {winner && (
          <div className="absolute z-30 pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <RubberStamp text={stampText ?? 'ADVANCING'} rotate={-12} color="gold" size={sizing.stamp} />
          </div>
        )}
      </div>
    </motion.button>
  )
}
