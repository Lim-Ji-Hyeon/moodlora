'use client'

import { SITUATION_TAGS } from '@/lib/constants/situationTags'
import { cn } from '@/lib/utils'

type Props = {
  value:    string[]
  onChange: (tags: string[]) => void
  scrollable?: boolean
}

export default function SearchTagFilter({ value, onChange, scrollable = false }: Props) {
  function toggle(tag: string) {
    onChange(
      value.includes(tag)
        ? value.filter(t => t !== tag)
        : [...value, tag]
    )
  }

  return (
    <div className={cn('flex gap-2', scrollable ? 'overflow-x-auto pb-1 scrollbar-none' : 'flex-wrap')}>
      {SITUATION_TAGS.map((tag) => {
        const selected = value.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={cn(
              'flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
