import { resolveAvatarSrc } from './AvatarPicker'

interface Props {
  value: string
  size?: number
  className?: string
}

/**
 * Renders a Pixar avatar image if the value is "avatar:N", otherwise falls
 * back to a plain emoji span. Drop-in replacement for <span>{p.emoji}</span>.
 */
export default function PlayerAvatar({ value, size = 24, className }: Props) {
  const src = resolveAvatarSrc(value)
  if (src) {
    return (
      <img
        src={src}
        alt=""
        draggable={false}
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
        }}
      />
    )
  }
  return <span className={className}>{value}</span>
}
