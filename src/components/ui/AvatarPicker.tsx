/**
 * Pixar avatar picker — replaces the emoji picker on the join/create screen.
 * Avatars are stored as "avatar:N" in the emoji field so existing emoji
 * fallbacks still work for any legacy values.
 */

// Vite glob import — pulls in all PNGs from the avatars folder at build time
const avatarModules = import.meta.glob('../../assets/avatars/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

// Sort numerically by filename
export const AVATARS: { id: string; src: string }[] = Object.entries(avatarModules)
  .map(([path, src]) => {
    const num = parseInt(path.match(/(\d+)\.png$/)?.[1] ?? '0', 10)
    return { id: `avatar:${num}`, src }
  })
  .sort((a, b) => {
    const na = parseInt(a.id.split(':')[1], 10)
    const nb = parseInt(b.id.split(':')[1], 10)
    return na - nb
  })

// Preload all avatar images immediately when module loads
if (typeof window !== 'undefined') {
  AVATARS.forEach(({ src }) => {
    const img = new Image()
    img.src = src
  })
}

/** Returns the img src for an "avatar:N" value, or null for plain emoji */
export function resolveAvatarSrc(value: string): string | null {
  if (!value.startsWith('avatar:')) return null
  return AVATARS.find((a) => a.id === value)?.src ?? null
}

interface Props {
  value: string
  onChange: (id: string) => void
}

export default function AvatarPicker({ value, onChange }: Props) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
    >
      {AVATARS.map((avatar) => {
        const selected = value === avatar.id
        return (
          <button
            key={avatar.id}
            type="button"
            className="flex items-center justify-center"
            onClick={() => onChange(selected ? '' : avatar.id)}
            style={{
              width: '100%',
              aspectRatio: '1',
              border: 'none',
              background: 'transparent',
              padding: 0,
              transform: selected ? 'scale(1.15)' : 'scale(1)',
              filter: selected ? 'drop-shadow(0 4px 10px rgba(17,17,17,0.8))' : 'none',
              opacity: value && !selected ? 0.5 : 1,
              transition: 'transform 0.15s ease, filter 0.15s ease, opacity 0.15s ease',
            }}
            aria-label={avatar.id}
          >
            <img
              src={avatar.src}
              alt=""
              draggable={false}
              loading="eager"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
