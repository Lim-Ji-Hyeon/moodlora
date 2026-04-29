'use client'

import { SITUATION_TAGS, type SituationTag } from '@/lib/constants/situationTags'
import { cn } from '@/lib/utils'

const TAG_EMOJI: Record<SituationTag, string> = {
  '직장':   '💼',
  '연애':   '💕',
  '가족':   '🏠',
  '건강':   '🏃',
  '학업':   '📚',
  '친구':   '👥',
  '자기계발': '🌱',
  '기타':   '💭',
}

interface StepTagSelectProps {
  value:    SituationTag[]
  onChange: (tags: SituationTag[]) => void
}

export default function StepTagSelect({ value, onChange }: StepTagSelectProps) {
  function toggle(tag: SituationTag) {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag))
    } else if (value.length < 5) {
      onChange([...value, tag])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        {SITUATION_TAGS.map((tag) => {
          const selected = value.includes(tag)
          const maxed    = value.length >= 5 && !selected

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              disabled={maxed}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-all duration-150',
                selected
                  ? 'bg-violet-50 border-violet-400 text-violet-700 ring-2 ring-violet-400 shadow-sm'
                  : 'bg-white dark:bg-card border-border text-foreground hover:border-violet-300 hover:shadow-sm',
                maxed && 'opacity-40 cursor-not-allowed'
              )}
            >
              <span aria-hidden="true">{TAG_EMOJI[tag]}</span>
              <span>{tag}</span>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground text-right">
        <span className={cn(value.length >= 5 ? 'text-violet-600 font-semibold' : '')}>
          {value.length}
        </span>
        /5개 선택됨
      </p>
    </div>
  )
}
