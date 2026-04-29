'use client'

import { REACTIONS, type ReactionType } from '@/lib/constants/reactions'
import { cn } from '@/lib/utils'

interface ReactionBarProps {
  postId:         string
  reactionCounts: Partial<Record<ReactionType, number>>
}

export default function ReactionBar({ reactionCounts }: ReactionBarProps) {
  const REACTION_KEYS = Object.keys(REACTIONS) as ReactionType[]

  return (
    <div className="flex flex-wrap gap-2.5 py-4 border-y border-border">
      {REACTION_KEYS.map((type) => {
        const reaction = REACTIONS[type]
        const count    = reactionCounts[type] ?? 0

        return (
          <button
            key={type}
            type="button"
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-border',
              'text-sm font-medium transition-all duration-150',
              'bg-white dark:bg-card hover:border-violet-300 hover:shadow-sm',
              count > 0 && 'border-violet-200 bg-violet-50 dark:bg-violet-950'
            )}
            aria-label={`${reaction.label} ${count}개`}
          >
            <span className="text-base" aria-hidden="true">{reaction.emoji}</span>
            <span className="text-foreground">{reaction.label}</span>
            {count > 0 && (
              <span className="text-violet-600 font-semibold tabular-nums">{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
