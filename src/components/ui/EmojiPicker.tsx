const EMOJIS = ['🎬', '🍿', '⭐', '🚀', '🌟', '🎯', '🔥', '💫', '🦊', '🐯', '🐼', '🦄', '🐙', '🦖', '🤠', '🤖', '👽', '🧙', '🧜', '🦸']

interface Props {
  value: string
  onChange: (emoji: string) => void
}

export default function EmojiPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onChange(e)}
          className="text-2xl w-11 h-11 rounded-full flex items-center justify-center transition-all"
          style={{
            background: value === e ? 'var(--accent)' : 'var(--panel)',
            border: `1px solid ${value === e ? 'var(--accent)' : 'var(--border)'}`,
            transform: value === e ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {e}
        </button>
      ))}
    </div>
  )
}
