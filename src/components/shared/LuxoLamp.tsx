interface Props {
  size?: number
  glow?: boolean
}

export default function LuxoLamp({ size = 88, glow = true }: Props) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: glow ? 'drop-shadow(0 0 28px rgba(255, 182, 39, 0.55))' : undefined,
      }}
    >
      <defs>
        <radialGradient id="lampLight" cx="0.5" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#fff5e1" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#ffd166" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffb627" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lampShade" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#ffe28a" />
          <stop offset="50%" stopColor="#ffb627" />
          <stop offset="100%" stopColor="#cc6f00" />
        </linearGradient>
        <linearGradient id="lampArm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b5fb8" />
          <stop offset="100%" stopColor="#3a2d6b" />
        </linearGradient>
      </defs>

      {/* warm puddle of light on the floor */}
      <ellipse cx="50" cy="100" rx="42" ry="9" fill="url(#lampLight)" />

      {/* base shadow */}
      <ellipse cx="50" cy="100" rx="20" ry="3" fill="#1a1430" opacity="0.6" />

      {/* base */}
      <ellipse cx="50" cy="97" rx="18" ry="3.5" fill="url(#lampArm)" />
      <ellipse cx="50" cy="96" rx="18" ry="2.5" fill="#5a4a9a" opacity="0.6" />

      {/* lower arm */}
      <path
        d="M 50 95 L 55 60"
        stroke="url(#lampArm)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* knee joint */}
      <circle cx="55" cy="60" r="4.5" fill="#5a4a9a" stroke="#3a2d6b" strokeWidth="0.8" />
      <circle cx="55" cy="60" r="1.8" fill="#1a1430" />

      {/* upper arm */}
      <path
        d="M 55 60 L 38 38"
        stroke="url(#lampArm)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* neck joint */}
      <circle cx="38" cy="38" r="4" fill="#5a4a9a" stroke="#3a2d6b" strokeWidth="0.8" />

      {/* lamp shade — trapezoidal, tilted */}
      <g transform="translate(0, 0)">
        <path
          d="M 30 38 Q 26 38 26 42 L 16 22 Q 16 16 22 14 L 56 6 Q 62 5 62 11 L 56 30 Q 56 36 50 36 Z"
          fill="url(#lampShade)"
          stroke="#a85800"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* shade highlight */}
        <path
          d="M 22 14 L 56 6"
          stroke="#fff5e1"
          strokeWidth="1.5"
          opacity="0.6"
        />
        {/* inner shade dark side */}
        <path
          d="M 30 38 Q 28 38 26 42 L 24 35"
          stroke="#7a3500"
          strokeWidth="1"
          opacity="0.7"
        />
        {/* bulb glow inside */}
        <ellipse cx="34" cy="32" rx="7" ry="4" fill="#fff5e1" opacity="0.85" />
        <ellipse cx="34" cy="32" rx="3" ry="2" fill="#ffffff" />
      </g>
    </svg>
  )
}
