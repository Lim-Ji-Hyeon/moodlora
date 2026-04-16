'use client'

import { useRouter } from 'next/navigation'
import { EMOTIONS, EMOTION_STYLES, type EmotionType } from '@/lib/constants/emotions'
import { useEmotionStore } from '@/stores/emotionStore'
import { cn } from '@/lib/utils'

// ─── 감정 키 배열 (상수 순서 보장) ────────────────────────────────────────────
const EMOTION_KEYS = Object.keys(EMOTIONS) as EmotionType[]

export default function EmotionPicker() {
  const router = useRouter()
  const { currentEmotion, setCurrentEmotion } = useEmotionStore()

  // 감정 선택 핸들러: 스토어 업데이트 후 /feed로 이동
  function handleSelect(key: EmotionType) {
    setCurrentEmotion(key)
    router.push('/feed')
  }

  // 키보드 접근성: Enter / Space 키 처리
  function handleKeyDown(e: React.KeyboardEvent, key: EmotionType) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(key)
    }
  }

  return (
    <section className="flex flex-col items-center justify-center flex-1 px-4 py-10 md:py-16">
      {/* ─── 헤더 텍스트 영역 ───────────────────────────────────────────────── */}
      <div className="text-center mb-10 md:mb-12 space-y-3">
        {/* 상단 배지 */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          Moodlora
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          지금 어떤 감정이세요?
        </h1>

        {/* 서브 텍스트 */}
        <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
          감정을 선택하면 같은 마음의 글을 모아드려요
        </p>
      </div>

      {/* ─── 감정 카드 그리드 ────────────────────────────────────────────────── */}
      {/*
        반응형 열 수:
          모바일(기본): 2열
          md(768px~):   4열
          lg(1024px~):  7열 (전체 한 줄)
        7번째 카드는 모바일에서 col-span-2로 full-width 처리
      */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 w-full max-w-4xl"
        role="group"
        aria-label="감정 선택"
      >
        {EMOTION_KEYS.map((key) => {
          const emotion = EMOTIONS[key]
          const styles = EMOTION_STYLES[emotion.color]
          const isSelected = currentEmotion === key

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${emotion.label} ${emotion.emoji} 감정 선택`}
              onClick={() => handleSelect(key)}
              onKeyDown={(e) => handleKeyDown(e, key)}
              className={cn(
                // ── 기본 레이아웃
                'relative flex flex-col items-center justify-center gap-2',
                'py-5 px-3 rounded-xl cursor-pointer select-none',
                'transition-all duration-200 ease-out',
                // ── 기본 배경 및 보더
                'border-2',
                // ── 선택 여부에 따른 스타일 분기
                isSelected
                  ? [
                      styles.selectedBg,
                      styles.border,
                      'ring-2',
                      styles.ring,
                      'shadow-md',
                      '-translate-y-0.5',
                    ]
                  : [
                      'bg-white dark:bg-card',
                      'border-border',
                      'hover:-translate-y-1',
                      'hover:shadow-md',
                      'hover:border-opacity-60',
                    ]
              )}
            >
              {/* 이모지 */}
              <span
                className="text-3xl md:text-4xl leading-none transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                {emotion.emoji}
              </span>

              {/* 감정 레이블 */}
              <span
                className={cn(
                  'text-sm font-semibold tracking-tight',
                  isSelected ? styles.text : 'text-foreground'
                )}
              >
                {emotion.label}
              </span>

              {/* 선택 상태 인디케이터 점 */}
              {isSelected && (
                <span
                  className={cn(
                    'absolute top-2 right-2 w-2 h-2 rounded-full',
                    styles.dot
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>

      {/* ─── 하단 안내 문구 ───────────────────────────────────────────────────── */}
      <p className="mt-8 text-xs text-muted-foreground text-center">
        선택한 감정은 언제든 변경할 수 있어요
      </p>
    </section>
  )
}
