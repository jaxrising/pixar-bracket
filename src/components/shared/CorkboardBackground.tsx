/** Clean white background — all cork decorations removed. */
export default function CorkboardBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: -1, background: '#ffffff' }}
    />
  )
}
