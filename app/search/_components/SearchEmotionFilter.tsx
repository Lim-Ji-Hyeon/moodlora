'use client'

import { EMOTIONS, EMOTION_STYLES, type EmotionType } from '@/lib/constants/emotions'
import { cn } from '@/lib/utils'

type Props = {
  value:    EmotionType | null
  onChange: (emotion: EmotionType | null) => void
  scrollable?: boolean
}

const EMOTION_KEYS = Object.keys(EMOTIONS) as EmotionType[]

export default function SearchEmotionFilter({ value, onChange, scrollable = false }: Props) {
  return (
    <div className={cn('flex gap-2', scrollable ? 'overflow-x-auto pb-1 scrollbar-none' : 'flex-wrap')}>
      {/* 전체 */}
      <button
        onClick={() => onChange(null)}
        className={cn(
          'flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
          value === null
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-background text-muted-foreground hover:bg-muted'
        )}
      >
        전체
      </button>

      {EMOTION_KEYS.map((key) => {
        const emotion  = EMOTIONS[key]
        const styles   = EMOTION_STYLES[emotion.color]
        const selected = value === key
        return (
          <button
            key={key}
            onClick={() => onChange(selected ? null : key)}
            className={cn(
              'flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              selected
                ? `${styles.border} ${styles.selectedBg} ${styles.text}`
                : 'border-border bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            {emotion.emoji} {emotion.label}
          </button>
        )
      })}
    </div>
  )
}
