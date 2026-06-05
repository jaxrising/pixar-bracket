import type { BracketTheme } from '../../types/theme'
import { pixarV1 } from './pixar-v1'

export const THEMES: Record<string, BracketTheme> = {
  'pixar-v1': pixarV1,
}

export const DEFAULT_THEME_ID = 'pixar-v1'

export function getTheme(id: string): BracketTheme {
  return THEMES[id] ?? pixarV1
}
