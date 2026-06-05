/**
 * A wooden picture frame around the viewport — four strips of stained
 * wood with grain texture, inner bevel, mitered corner joints.
 * Sits above everything else (high z-index) but is pointer-events: none so
 * content underneath remains interactive.
 */

const FRAME_W = 22

export default function WoodenFrame() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 100, isolation: 'isolate' }}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {/* horizontal wood grain — parallel streaks running left to right */}
          <filter id="woodGrainH" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.06 1.5"
              numOctaves="3"
              seed="9"
              stitchTiles="stitch"
            />
            <feColorMatrix
              values="
                0 0 0 0 0.18
                0 0 0 0 0.10
                0 0 0 0 0.04
                0 0 0 1.4 -0.5
              "
            />
          </filter>
          {/* vertical wood grain — parallel streaks running top to bottom */}
          <filter id="woodGrainV" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.5 0.06"
              numOctaves="3"
              seed="9"
              stitchTiles="stitch"
            />
            <feColorMatrix
              values="
                0 0 0 0 0.18
                0 0 0 0 0.10
                0 0 0 0 0.04
                0 0 0 1.4 -0.5
              "
            />
          </filter>
        </defs>
      </svg>

      {/* TOP strip */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: FRAME_W,
          background:
            'linear-gradient(180deg, #3d2310 0%, #5c3818 28%, #7a4d22 55%, #5c3818 80%, #2e1a08 100%)',
          boxShadow:
            'inset 0 -2px 4px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.45)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.6)',
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: 'multiply', opacity: 0.65 }}
        >
          <rect width="100%" height="100%" filter="url(#woodGrainH)" />
        </svg>
        {/* inner highlight */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: 1,
            height: 2,
            background:
              'linear-gradient(180deg, rgba(255, 200, 140, 0.35), transparent)',
          }}
        />
      </div>

      {/* BOTTOM strip */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: FRAME_W,
          background:
            'linear-gradient(180deg, #2e1a08 0%, #5c3818 22%, #7a4d22 50%, #5c3818 78%, #2a1608 100%)',
          boxShadow:
            'inset 0 2px 4px rgba(0, 0, 0, 0.55), 0 -4px 12px rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid rgba(0, 0, 0, 0.6)',
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: 'multiply', opacity: 0.65 }}
        >
          <rect width="100%" height="100%" filter="url(#woodGrainH)" />
        </svg>
        <div
          className="absolute left-0 right-0"
          style={{
            bottom: 1,
            height: 2,
            background:
              'linear-gradient(0deg, rgba(255, 200, 140, 0.3), transparent)',
          }}
        />
      </div>

      {/* LEFT strip */}
      <div
        className="absolute top-0 bottom-0 left-0"
        style={{
          width: FRAME_W,
          background:
            'linear-gradient(90deg, #3d2310 0%, #5c3818 30%, #7a4d22 55%, #5c3818 80%, #2e1a08 100%)',
          boxShadow:
            'inset -2px 0 4px rgba(0, 0, 0, 0.5), 4px 0 12px rgba(0, 0, 0, 0.4)',
          borderRight: '1px solid rgba(0, 0, 0, 0.6)',
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: 'multiply', opacity: 0.65 }}
        >
          <rect width="100%" height="100%" filter="url(#woodGrainV)" />
        </svg>
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: 1,
            width: 2,
            background:
              'linear-gradient(90deg, rgba(255, 200, 140, 0.3), transparent)',
          }}
        />
      </div>

      {/* RIGHT strip */}
      <div
        className="absolute top-0 bottom-0 right-0"
        style={{
          width: FRAME_W,
          background:
            'linear-gradient(90deg, #2e1a08 0%, #5c3818 22%, #7a4d22 50%, #5c3818 78%, #2a1608 100%)',
          boxShadow:
            'inset 2px 0 4px rgba(0, 0, 0, 0.55), -4px 0 12px rgba(0, 0, 0, 0.4)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.6)',
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: 'multiply', opacity: 0.65 }}
        >
          <rect width="100%" height="100%" filter="url(#woodGrainV)" />
        </svg>
        <div
          className="absolute top-0 bottom-0"
          style={{
            right: 1,
            width: 2,
            background:
              'linear-gradient(-90deg, rgba(255, 200, 140, 0.3), transparent)',
          }}
        />
      </div>

      {/* Mitered corner joints — diagonal seams from corner inward */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => {
        const isTop = c.startsWith('t')
        const isLeft = c.endsWith('l')
        return (
          <svg
            key={c}
            className="absolute"
            style={{
              [isTop ? 'top' : 'bottom']: 0,
              [isLeft ? 'left' : 'right']: 0,
              width: FRAME_W,
              height: FRAME_W,
            }}
            viewBox={`0 0 ${FRAME_W} ${FRAME_W}`}
          >
            <line
              x1={isLeft ? 0 : FRAME_W}
              y1={isTop ? 0 : FRAME_W}
              x2={isLeft ? FRAME_W : 0}
              y2={isTop ? FRAME_W : 0}
              stroke="rgba(0, 0, 0, 0.55)"
              strokeWidth="0.9"
            />
            <line
              x1={isLeft ? 0 : FRAME_W}
              y1={isTop ? 0 : FRAME_W}
              x2={isLeft ? FRAME_W : 0}
              y2={isTop ? FRAME_W : 0}
              stroke="rgba(255, 200, 140, 0.25)"
              strokeWidth="0.5"
              transform={`translate(${isLeft ? 0.5 : -0.5}, ${isTop ? 0.5 : -0.5})`}
            />
          </svg>
        )
      })}

      {/* small screw/peg at each inside corner of the frame */}
      {(
        [
          { top: FRAME_W - 6, left: FRAME_W - 6 },
          { top: FRAME_W - 6, right: FRAME_W - 6 },
          { bottom: FRAME_W - 6, left: FRAME_W - 6 },
          { bottom: FRAME_W - 6, right: FRAME_W - 6 },
        ] as const
      ).map((pos, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            ...pos,
            width: 5,
            height: 5,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, #2a1810 0%, #1a0e06 60%, #000 100%)',
            boxShadow:
              '0 1px 1px rgba(255, 230, 180, 0.35), inset 0 0 1px rgba(0,0,0,0.6)',
          }}
        />
      ))}

    </div>
  )
}
