export const REACTIONS = {
  ME_TOO:   { label: '나도 그래', emoji: '🤝' },
  SAD:      { label: '너무 슬퍼', emoji: '😢' },
  ANGRY:    { label: '화가 나',   emoji: '😤' },
  CHEER_UP: { label: '힘내세요',  emoji: '💪' },
} as const

export type ReactionType = keyof typeof REACTIONS
