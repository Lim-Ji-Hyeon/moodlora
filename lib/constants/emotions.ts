export const EMOTIONS = {
  JOY:        { label: '기쁨',   emoji: '😊', color: 'amber'  },
  EXCITEMENT: { label: '설렘',   emoji: '✨', color: 'pink'   },
  CALM:       { label: '평온',   emoji: '😌', color: 'sky'    },
  SADNESS:    { label: '슬픔',   emoji: '😢', color: 'blue'   },
  ANGER:      { label: '분노',   emoji: '😤', color: 'red'    },
  LETHARGY:   { label: '무기력', emoji: '😶', color: 'slate'  },
  ANXIETY:    { label: '불안',   emoji: '😰', color: 'purple' },
  LONELINESS: { label: '외로움', emoji: '😔', color: 'indigo' },
} as const

// ─── 감정별 Tailwind 정적 클래스 맵 ──────────────────────────────────────────
// Tailwind v4 purge 방지: 동적 클래스(`bg-${color}-100`) 대신 정적 문자열로 정의
export const EMOTION_STYLES = {
  amber: {
    bg:         'bg-amber-50',
    selectedBg: 'bg-amber-100',
    border:     'border-amber-400',
    ring:       'ring-amber-400',
    text:       'text-amber-700',
    badge:      'bg-amber-100 text-amber-700',
    dot:        'bg-amber-400',
  },
  pink: {
    bg:         'bg-pink-50',
    selectedBg: 'bg-pink-100',
    border:     'border-pink-400',
    ring:       'ring-pink-400',
    text:       'text-pink-700',
    badge:      'bg-pink-100 text-pink-700',
    dot:        'bg-pink-400',
  },
  sky: {
    bg:         'bg-sky-50',
    selectedBg: 'bg-sky-100',
    border:     'border-sky-400',
    ring:       'ring-sky-400',
    text:       'text-sky-700',
    badge:      'bg-sky-100 text-sky-700',
    dot:        'bg-sky-400',
  },
  blue: {
    bg:         'bg-blue-50',
    selectedBg: 'bg-blue-100',
    border:     'border-blue-400',
    ring:       'ring-blue-400',
    text:       'text-blue-700',
    badge:      'bg-blue-100 text-blue-700',
    dot:        'bg-blue-400',
  },
  red: {
    bg:         'bg-red-50',
    selectedBg: 'bg-red-100',
    border:     'border-red-400',
    ring:       'ring-red-400',
    text:       'text-red-700',
    badge:      'bg-red-100 text-red-700',
    dot:        'bg-red-400',
  },
  slate: {
    bg:         'bg-slate-50',
    selectedBg: 'bg-slate-100',
    border:     'border-slate-400',
    ring:       'ring-slate-400',
    text:       'text-slate-600',
    badge:      'bg-slate-100 text-slate-600',
    dot:        'bg-slate-400',
  },
  purple: {
    bg:         'bg-purple-50',
    selectedBg: 'bg-purple-100',
    border:     'border-purple-400',
    ring:       'ring-purple-400',
    text:       'text-purple-700',
    badge:      'bg-purple-100 text-purple-700',
    dot:        'bg-purple-400',
  },
  indigo: {
    bg:         'bg-indigo-50',
    selectedBg: 'bg-indigo-100',
    border:     'border-indigo-400',
    ring:       'ring-indigo-400',
    text:       'text-indigo-700',
    badge:      'bg-indigo-100 text-indigo-700',
    dot:        'bg-indigo-400',
  },
} as const satisfies Record<string, Record<string, string>>

export type EmotionType = keyof typeof EMOTIONS

export const COMPLEMENTARY_EMOTIONS: Partial<Record<EmotionType, EmotionType[]>> = {
  ANXIETY:    ['CALM'],
  SADNESS:    ['JOY', 'EXCITEMENT'],
  ANGER:      ['CALM'],
  LONELINESS: ['JOY', 'EXCITEMENT'],
}
