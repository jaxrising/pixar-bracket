import Pushpin from './Pushpin'

interface Props {
  code: string
  size?: 'sm' | 'md' | 'lg'
}

export default function RoomCodeBadge({ code, size = 'md' }: Props) {
  const dims =
    size === 'lg'
      ? { card: 'px-7 py-4', code: 'text-5xl', label: 'text-sm', pin: 16 }
      : size === 'sm'
        ? { card: 'px-3 py-1.5', code: 'text-base', label: 'text-[10px]', pin: 10 }
        : { card: 'px-5 py-2.5', code: 'text-2xl', label: 'text-xs', pin: 14 }

  return (
    <div className="relative inline-block" style={{ transform: 'rotate(-1.5deg)' }}>
      <div
        className={`${dims.card} relative`}
        style={{
          background: '#f4e8d0',
          backgroundImage:
            'radial-gradient(ellipse at 40% 30%, #fff4d6 0%, #f4e8d0 60%, #e6d4a8 100%)',
          border: '1.5px solid #1b2845',
          boxShadow: '0 6px 14px -3px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.25)',
        }}
      >
        <div
          className={`font-hand ${dims.label} leading-none`}
          style={{ color: 'rgba(27,40,69,0.55)' }}
        >
          room
        </div>
        <div
          className={`font-poster ${dims.code} leading-none mt-0.5`}
          style={{
            color: '#1b2845',
            letterSpacing: size === 'lg' ? '0.18em' : '0.12em',
          }}
        >
          {code}
        </div>
      </div>
      {/* a single pushpin in the top-left */}
      <div
        className="absolute z-10"
        style={{ top: -dims.pin / 2, left: '50%', transform: 'translate(-50%, 0)' }}
      >
        <Pushpin color="red" size={dims.pin} />
      </div>
    </div>
  )
}
