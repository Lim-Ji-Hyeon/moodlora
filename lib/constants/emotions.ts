export const EMOTIONS = {
  JOY:        { label: '기쁨',   emoji: '😊', color: 'amber' },
  EXCITEMENT: { label: '설렘',   emoji: '✨', color: 'pink' },
  CALM:       { label: '평온',   emoji: '😌', color: 'sky' },
  SADNESS:    { label: '슬픔',   emoji: '😢', color: 'blue' },
  ANGER:      { label: '분노',   emoji: '😤', color: 'red' },
  LETHARGY:   { label: '무기력', emoji: '😶', color: 'slate' },
  ANXIETY:    { label: '불안',   emoji: '😰', color: 'purple' },
} as const

export type EmotionType = keyof typeof EMOTIONS

export const COMPLEMENTARY_EMOTIONS: Partial<Record<EmotionType, EmotionType[]>> = {
  ANXIETY: ['CALM'],
  SADNESS: ['JOY', 'EXCITEMENT'],
  ANGER:   ['CALM'],
}
