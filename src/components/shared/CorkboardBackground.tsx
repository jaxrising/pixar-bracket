/**
 * Clean white background — replaces the corkboard texture.
 * Keeps the decorative tape, pushpin, and ambient elements
 * but drops the cork texture entirely.
 */
export default function CorkboardBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {/* Pure white base */}
      <div className="absolute inset-0" style={{ background: '#ffffff' }} />

      {/* Very subtle edge vignette to ground the page */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 65%, rgba(27,40,69,0.06) 100%)',
        }}
      />

      {/* Masking tape strip top-left — kept as a decorative accent */}
      <div
        className="absolute"
        style={{
          top: '36px',
          left: '-26px',
          width: '160px',
          height: '28px',
          background: 'linear-gradient(180deg, rgba(255,250,210,0.7) 0%, rgba(255,220,140,0.55) 100%)',
          transform: 'rotate(-8deg)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          borderTop: '1px solid rgba(255,255,255,0.6)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      />

      {/* Stray pushpin bottom-right — ambient decoration */}
      <svg
        className="absolute"
        style={{ bottom: '68px', right: '92px', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))', opacity: 0.4 }}
        width="22" height="22" viewBox="0 0 20 20"
      >
        <circle cx="10" cy="10" r="6" fill="#c8412b" />
        <circle cx="8" cy="8" r="2" fill="#ffb09e" />
      </svg>
    </div>
  )
}
