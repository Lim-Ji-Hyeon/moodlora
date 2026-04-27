'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { EMOTIONS, EMOTION_STYLES } from '@/lib/constants/emotions'

const EMOTION_KEYS = Object.keys(EMOTIONS) as (keyof typeof EMOTIONS)[]

export default function EmotionFilterBar() {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const current     = searchParams.get('emotion')

  function select(emotionKey: string | null) {
    const sp = new URLSearchParams(searchParams.toString())
    if (emotionKey) sp.set('emotion', emotionKey)
    else            sp.delete('emotion')
    sp.delete('cursor')
    router.push(`${pathname}?${sp.toString()}`)
  }

  const allSelected = !current

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {/* 전체 칩 */}
      <button
        onClick={() => select(null)}
        className={[
          'flex-shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
          allSelected
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-background text-muted-foreground hover:bg-muted',
        ].join(' ')}
      >
        전체
      </button>

      {EMOTION_KEYS.map((key) => {
        const emotion  = EMOTIONS[key]
        const styles   = EMOTION_STYLES[emotion.color]
        const selected = current === key

        return (
          <button
            key={key}
            onClick={() => select(key)}
            className={[
              'flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              selected
                ? `${styles.selectedBg} ${styles.border} ${styles.text}`
                : `bg-background border-border text-muted-foreground hover:${styles.bg}`,
            ].join(' ')}
          >
            <span>{emotion.emoji}</span>
            <span>{emotion.label}</span>
          </button>
        )
      })}
    </div>
  )
}
