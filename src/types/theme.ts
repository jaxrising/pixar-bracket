export interface Seed {
  id: string
  name: string
  shortName: string
  emoji: string
  gradient: [string, string]
  poster?: string
  films?: string
  year?: string
}

export type BracketSize = 16 | 32

export interface BracketTheme {
  id: string
  title: string
  tagline: string
  size: BracketSize
  accentColor: string
  seeds: Seed[]
  audio?: {
    join?: string
    voteTick?: string
    reveal?: string
    final?: string
  }
}
