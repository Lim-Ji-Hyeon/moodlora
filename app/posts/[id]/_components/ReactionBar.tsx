'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { REACTIONS, type ReactionType } from '@/lib/constants/reactions'
import { EMOTIONS, EMOTION_STYLES, type EmotionType } from '@/lib/constants/emotions'
import { cn } from '@/lib/utils'

interface ReactionBarProps {
  postId:         string
  emotion:        EmotionType
  reactionCounts: Partial<Record<ReactionType, number>>
  userReactions:  ReactionType[]
  currentUserId:  string | null
}

export default function ReactionBar({
  postId,
  emotion,
  reactionCounts,
  userReactions,
  currentUserId,
}: ReactionBarProps) {
  const REACTION_KEYS = Object.keys(REACTIONS) as ReactionType[]

  const [localCounts, setLocalCounts] = useState<Partial<Record<ReactionType, number>>>(reactionCounts)
  const [activeSet,   setActiveSet]   = useState<Set<ReactionType>>(new Set(userReactions))

  // 게시글 감정 기반 활성 스타일
  const emotionColor = EMOTIONS[emotion]?.color ?? 'violet'
  const styles       = EMOTION_STYLES[emotionColor as keyof typeof EMOTION_STYLES]

  const mutation = useMutation({
    mutationFn: async (type: ReactionType) => {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type }),
      })
      if (!res.ok) throw new Error()
      return res.json() as Promise<{ action: 'added' | 'removed'; type: ReactionType }>
    },
    onMutate: (type) => {
      const wasActive = activeSet.has(type)
      const prev = { counts: { ...localCounts }, active: new Set(activeSet) }

      setLocalCounts((c) => ({
        ...c,
        [type]: Math.max(0, (c[type] ?? 0) + (wasActive ? -1 : 1)),
      }))
      setActiveSet((s) => {
        const next = new Set(s)
        wasActive ? next.delete(type) : next.add(type)
        return next
      })

      return prev
    },
    onError: (_err, _type, ctx) => {
      if (ctx) {
        setLocalCounts(ctx.counts)
        setActiveSet(ctx.active)
      }
      toast.error('반응을 적용하지 못했습니다. 다시 시도해주세요.')
    },
  })

  function handleClick(type: ReactionType) {
    if (!currentUserId) {
      toast('로그인 후 공감을 표현할 수 있어요', {
        action: { label: '로그인', onClick: () => window.location.assign('/login') },
      })
      return
    }
    if (mutation.isPending) return
    mutation.mutate(type)
  }

  return (
    <section className="space-y-3 py-4 border-t border-border">
      <h2 className="text-sm font-semibold text-muted-foreground px-1">공감 반응</h2>

      <div className="grid grid-cols-2 gap-3">
        {REACTION_KEYS.map((type) => {
          const reaction  = REACTIONS[type]
          const count     = localCounts[type] ?? 0
          const isActive  = activeSet.has(type)

          return (
            <button
              key={type}
              type="button"
              onClick={() => handleClick(type)}
              aria-label={`${reaction.label} ${count}개${isActive ? ' (선택됨)' : ''}`}
              aria-pressed={isActive}
              className={cn(
                'rounded-xl p-4 flex flex-col items-center justify-center',
                'border transition-all duration-150 active:scale-95',
                isActive
                  ? [styles.selectedBg, styles.border]
                  : 'bg-muted/60 border-border hover:bg-muted'
              )}
            >
              <span className="text-xl mb-1" aria-hidden="true">{reaction.emoji}</span>
              <span className={cn(
                'text-xs mt-0.5',
                isActive ? [styles.text, 'font-bold'] : 'font-medium text-muted-foreground'
              )}>
                {reaction.label}
              </span>
              <span className={cn(
                'text-xs mt-0.5 tabular-nums',
                isActive ? styles.text : 'text-muted-foreground/60',
                count === 0 && 'invisible'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
