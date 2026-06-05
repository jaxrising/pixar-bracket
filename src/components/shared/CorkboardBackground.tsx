/**
 * Corkboard texture — pre-rendered once to a canvas so SVG feTurbulence
 * filters are not composited every frame (huge perf win in Safari).
 * The canvas is tiled as a CSS background-image on a fixed-size offscreen
 * element, keeping the visual identical but GPU-friendly.
 */
import { useEffect, useRef } from 'react'

// Singleton: render the cork tile once and reuse the data URL everywhere.
let _corkDataUrl: string | null = null

function getCorkDataUrl(): string {
  if (_corkDataUrl) return _corkDataUrl

  const SIZE = 512
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  // Base warm tan
  const base = ctx.createLinearGradient(0, 0, SIZE, SIZE)
  base.addColorStop(0, '#d8b386')
  base.addColorStop(0.45, '#cda673')
  base.addColorStop(1, '#c39a65')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Simulate cork flecks with random dots at varying opacity/size
  const rng = mulberry32(13)
  // Dark flecks (primary cork particles)
  for (let i = 0; i < 18000; i++) {
    const x = rng() * SIZE
    const y = rng() * SIZE
    const r = 0.4 + rng() * 1.2
    const alpha = 0.15 + rng() * 0.55
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(66,41,20,${alpha.toFixed(2)})`
    ctx.fill()
  }
  // Lighter cream highlights
  for (let i = 0; i < 5000; i++) {
    const x = rng() * SIZE
    const y = rng() * SIZE
    const r = 0.6 + rng() * 2.0
    const alpha = 0.08 + rng() * 0.22
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,244,214,${alpha.toFixed(2)})`
    ctx.fill()
  }
  // Fine dark grain
  for (let i = 0; i < 8000; i++) {
    const x = rng() * SIZE
    const y = rng() * SIZE
    ctx.fillStyle = `rgba(80,50,20,${(0.04 + rng() * 0.1).toFixed(2)})`
    ctx.fillRect(x, y, 1, 1)
  }

  _corkDataUrl = canvas.toDataURL('image/png')
  return _corkDataUrl
}

// Simple seedable PRNG (Mulberry32) so texture is deterministic
function mulberry32(seed: number) {
  let s = seed
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

export default function CorkboardBackground() {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const url = getCorkDataUrl()
    canvasRef.current.style.backgroundImage = `url(${url})`
  }, [])

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {/* Pre-rendered cork tile — no live SVG filters */}
      <div
        ref={canvasRef}
        className="absolute inset-0"
        style={{ backgroundSize: '512px 512px', backgroundRepeat: 'repeat' }}
      />

      {/* very light edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(80, 50, 20, 0.18) 100%)',
        }}
      />

      {/* a piece of masking tape in the top-left corner */}
      <div
        className="absolute"
        style={{
          top: '36px',
          left: '-26px',
          width: '160px',
          height: '30px',
          background:
            'linear-gradient(180deg, rgba(255, 250, 210, 0.55) 0%, rgba(255, 220, 140, 0.4) 100%)',
          transform: 'rotate(-8deg)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          borderTop: '1px solid rgba(255, 255, 255, 0.5)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      />

      {/* torn-paper calendar corner top-right */}
      <svg
        className="absolute"
        style={{
          top: '28px',
          right: '46px',
          transform: 'rotate(6deg)',
          filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))',
        }}
        width="130"
        height="90"
        viewBox="0 0 130 90"
      >
        <path
          d="M 4 4 L 126 6 L 128 64 Q 118 72 110 64 Q 100 78 86 68 Q 72 80 60 70 Q 46 78 32 70 Q 18 80 6 68 Z"
          fill="#f4e8d0"
          stroke="#8a6234"
          strokeWidth="0.6"
          opacity="0.88"
        />
        <line x1="14" y1="26" x2="116" y2="28" stroke="#1b2845" strokeWidth="0.8" opacity="0.42" />
        <line x1="14" y1="40" x2="110" y2="42" stroke="#1b2845" strokeWidth="0.8" opacity="0.38" />
        <text
          x="65"
          y="20"
          textAnchor="middle"
          fontSize="10"
          fill="#1b2845"
          opacity="0.6"
          fontFamily="'Caveat', cursive"
          fontWeight="700"
        >
          weekly notes
        </text>
      </svg>

      {/* tiny doodled star bottom-left */}
      <svg
        className="absolute"
        style={{ bottom: '50px', left: '38px', transform: 'rotate(-12deg)', opacity: 0.32 }}
        width="78"
        height="78"
        viewBox="0 0 80 80"
      >
        <path
          d="M 40 8 L 47 30 L 70 30 L 51 44 L 58 66 L 40 52 L 22 66 L 29 44 L 10 30 L 33 30 Z"
          fill="none"
          stroke="#1b2845"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: '4 2' }}
        />
      </svg>

      {/* stray pushpin (nothing pinned) bottom-right */}
      <svg
        className="absolute"
        style={{
          bottom: '68px',
          right: '92px',
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
          opacity: 0.55,
        }}
        width="22"
        height="22"
        viewBox="0 0 20 20"
      >
        <circle cx="10" cy="10" r="6" fill="#c8412b" />
        <circle cx="8" cy="8" r="2" fill="#ffb09e" />
      </svg>
    </div>
  )
}
