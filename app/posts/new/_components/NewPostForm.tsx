'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { useEmotionStore } from '@/stores/emotionStore'
import { EMOTIONS, EMOTION_STYLES, type EmotionType } from '@/lib/constants/emotions'
import { SITUATION_TAGS, type SituationTag } from '@/lib/constants/situationTags'
import EmotionPicker from '@/app/welcome/_components/EmotionPicker'
import StepTagSelect from './StepTagSelect'
import StepContentInput from './StepContentInput'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PostWithMeta } from '@/types'

// ─── Zod 스키마 ───────────────────────────────────────────────────────────────
const EMOTION_VALUES = Object.keys(EMOTIONS) as [EmotionType, ...EmotionType[]]

const newPostSchema = z.object({
  emotion:      z.enum(EMOTION_VALUES, { message: '감정을 선택해 주세요' }),
  tags:         z
    .array(z.enum(SITUATION_TAGS))
    .min(1, '태그를 1개 이상 선택해주세요')
    .max(5, '태그는 최대 5개까지 선택 가능합니다'),
  content:      z
    .string()
    .min(10, '10자 이상 입력해주세요')
    .max(1000, '1,000자 이내로 입력해주세요'),
  is_anonymous: z.boolean(),
})

type NewPostFormValues = z.infer<typeof newPostSchema>

// ─── Step 진행 표시 ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`3단계 중 ${current}단계`}>
      {[1, 2, 3].map((s) => (
        <span
          key={s}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            s === current  ? 'w-6 bg-violet-600'
            : s < current ? 'w-2 bg-violet-300'
            :                'w-2 bg-gray-200 dark:bg-gray-700'
          )}
        />
      ))}
    </div>
  )
}

// ─── 메인 폼 컴포넌트 ─────────────────────────────────────────────────────────
export default function NewPostForm() {
  const router      = useRouter()
  const queryClient = useQueryClient()
  const { currentEmotion } = useEmotionStore()

  const [step, setStep] = useState<1 | 2 | 3>(1)

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<NewPostFormValues>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      emotion:      currentEmotion ?? undefined,
      tags:         [],
      content:      '',
      is_anonymous: false,
    },
  })

  const selectedEmotion = watch('emotion')
  const selectedTags    = watch('tags') as SituationTag[]

  const emotionInfo   = selectedEmotion ? EMOTIONS[selectedEmotion] : null
  const emotionStyles = emotionInfo ? EMOTION_STYLES[emotionInfo.color] : null

  // ─── TanStack Query mutation ────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (data: NewPostFormValues) => {
      const res = await fetch('/api/posts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      return res.json() as Promise<{ post: PostWithMeta }>
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      router.push('/posts/' + data.post.id)
    },
    onError: () => {
      toast.error('게시글 저장에 실패했습니다. 다시 시도해주세요.')
    },
  })

  // ─── 단계 전환 ──────────────────────────────────────────────────────────────
  async function handleNext() {
    if (step === 1) {
      const ok = await trigger('emotion')
      if (ok) setStep(2)
    } else if (step === 2) {
      const ok = await trigger('tags')
      if (ok) setStep(3)
    }
  }

  function handleBack() {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3)
    else router.back()
  }

  return (
    <div className="max-w-md mx-auto pb-10">
      {/* ─── 상단 헤더 ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-4 mb-2">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold text-foreground">새 글 쓰기</span>
          <StepIndicator current={step} />
        </div>

        <div className="w-9" />
      </div>

      {/* ─── Step 1: 감정 선택 ──────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-foreground">지금 어떤 감정인가요?</h1>
            <p className="text-sm text-muted-foreground">솔직한 감정을 선택해 주세요</p>
          </div>

          <Controller
            name="emotion"
            control={control}
            render={({ field }) => (
              <EmotionPicker
                value={field.value}
                onChange={field.onChange}
                compact
              />
            )}
          />

          {errors.emotion && (
            <p className="text-sm text-destructive">{errors.emotion.message}</p>
          )}

          <Button type="button" onClick={handleNext} className="w-full h-12 rounded-xl">
            다음
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* ─── Step 2: 상황 태그 ──────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          {/* 선택된 감정 배지 + 변경 버튼 */}
          {emotionInfo && emotionStyles && (
            <div className="flex items-center justify-between">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                emotionStyles.badge
              )}>
                {emotionInfo.emoji} {emotionInfo.label}
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                변경
              </button>
            </div>
          )}

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">어떤 상황에서 느꼈나요?</h2>
            <p className="text-sm text-muted-foreground">최대 5개까지 선택할 수 있어요</p>
          </div>

          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <StepTagSelect
                value={field.value as SituationTag[]}
                onChange={field.onChange}
              />
            )}
          />

          {errors.tags && (
            <p className="text-sm text-destructive">{errors.tags.message}</p>
          )}

          <Button type="button" onClick={handleNext} className="w-full h-12 rounded-xl">
            다음
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* ─── Step 3: 본문 입력 ──────────────────────────────────────────────── */}
      {step === 3 && (
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="flex flex-col gap-6"
        >
          {/* 선택 요약 배지 */}
          <div className="flex flex-wrap gap-2">
            {emotionInfo && emotionStyles && (
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
                emotionStyles.badge
              )}>
                {emotionInfo.emoji} {emotionInfo.label}
              </span>
            )}
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">감정을 글로 표현해보세요</h2>
            <p className="text-sm text-muted-foreground">익명으로 작성할 수 있어요</p>
          </div>

          {/* 익명 + 본문 입력 */}
          <Controller
            name="is_anonymous"
            control={control}
            render={({ field: anonField }) => (
              <Controller
                name="content"
                control={control}
                render={({ field: contentField }) => (
                  <StepContentInput
                    value={contentField.value}
                    onChange={contentField.onChange}
                    onBlur={contentField.onBlur}
                    error={errors.content?.message}
                    isAnonymous={anonField.value}
                    onAnonymousChange={anonField.onChange}
                  />
                )}
              />
            )}
          />

          {/* 안내 메시지 */}
          <div className="flex items-start gap-2 p-3.5 rounded-xl bg-muted/60 text-xs text-muted-foreground">
            <span className="mt-0.5 shrink-0">💡</span>
            <span>따뜻한 말 한마디가 누군가에게 큰 힘이 됩니다. 커뮤니티 가이드를 지켜주세요.</span>
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-12 rounded-xl"
          >
            {mutation.isPending ? '게시 중...' : (
              <>게시하기 <Send className="w-4 h-4 ml-1.5" /></>
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
