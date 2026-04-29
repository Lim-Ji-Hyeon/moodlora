'use client'

import { useRouter } from 'next/navigation'
import { EMOTIONS, EMOTION_STYLES, type EmotionType } from '@/lib/constants/emotions'
import { useEmotionStore } from '@/stores/emotionStore'
import { cn } from '@/lib/utils'

// ─── 감정 키 배열 (상수 순서 보장) ────────────────────────────────────────────
const EMOTION_KEYS = Object.keys(EMOTIONS) as EmotionType[]

// ─── Props ────────────────────────────────────────────────────────────────────
// onChange 미전달: 기존 동작 (Zustand 업데이트 + /feed 이동)
// onChange 전달: controlled 컴포넌트 (폼 내 재사용)
// compact: true → 헤더/푸터 텍스트 없이 그리드만 렌더링 (폼 Step 1용)
interface EmotionPickerProps {
  value?:    EmotionType
  onChange?: (emotion: EmotionType) => void
  compact?:  boolean
}

export default function EmotionPicker({ value, onChange, compact = false }: EmotionPickerProps = {}) {
  const router = useRouter()
  const { currentEmotion, setCurrentEmotion } = useEmotionStore()

  function handleSelect(key: EmotionType) {
    if (onChange) {
      onChange(key)
    } else {
      setCurrentEmotion(key)
      router.push('/feed')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, key: EmotionType) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(key)
    }
  }

  function isSelected(key: EmotionType) {
    return onChange ? value === key : currentEmotion === key
  }

  // ─── 감정 카드 그리드 (compact/full 공통) ─────────────────────────────────
  const grid = (
    <div
      className={cn(
        'grid gap-3 w-full',
        compact
          ? 'grid-cols-2 sm:grid-cols-4'
          : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 max-w-4xl'
      )}
      role="group"
      aria-label="감정 선택"
    >
      {EMOTION_KEYS.map((key) => {
        const emotion  = EMOTIONS[key]
        const styles   = EMOTION_STYLES[emotion.color]
        const selected = isSelected(key)

        return (
          <div
            key={key}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={`${emotion.label} ${emotion.emoji} 감정 선택`}
            onClick={() => handleSelect(key)}
            onKeyDown={(e) => handleKeyDown(e, key)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-2',
              compact ? 'py-4 px-2' : 'py-5 px-3',
              'rounded-xl cursor-pointer select-none',
              'transition-all duration-200 ease-out border-2',
              selected
                ? [styles.selectedBg, styles.border, 'ring-2', styles.ring, 'shadow-md', '-translate-y-0.5']
                : ['bg-white dark:bg-card', 'border-border', 'hover:-translate-y-1', 'hover:shadow-md']
            )}
          >
            <span className={cn('leading-none', compact ? 'text-2xl' : 'text-3xl md:text-4xl')} aria-hidden="true">
              {emotion.emoji}
            </span>
            <span className={cn('font-semibold tracking-tight', compact ? 'text-xs' : 'text-sm', selected ? styles.text : 'text-foreground')}>
              {emotion.label}
            </span>
            {selected && (
              <span className={cn('absolute top-1.5 right-1.5 w-2 h-2 rounded-full', styles.dot)} aria-hidden="true" />
            )}
          </div>
        )
      })}
    </div>
  )

  // ─── compact 모드: 그리드만 반환 ──────────────────────────────────────────
  if (compact) return grid

  // ─── full 모드: 헤더 + 그리드 + 푸터 ─────────────────────────────────────
  return (
    <section className="flex flex-col items-center justify-center flex-1 px-4 py-10 md:py-16">
      <div className="text-center mb-10 md:mb-12 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          Moodlora
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          지금 어떤 감정이세요?
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
          감정을 선택하면 같은 마음의 글을 모아드려요
        </p>
      </div>

      {grid}

      <p className="mt-8 text-xs text-muted-foreground text-center">
        선택한 감정은 언제든 변경할 수 있어요
      </p>
    </section>
  )
}
