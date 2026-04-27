'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SITUATION_TAGS } from '@/lib/constants/situationTags'

export default function TagFilter() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) ?? []

  function toggle(tag: string) {
    const sp   = new URLSearchParams(searchParams.toString())
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]

    if (next.length) sp.set('tags', next.join(','))
    else             sp.delete('tags')
    sp.delete('cursor')

    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SITUATION_TAGS.map((tag) => {
        const selected = selectedTags.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={[
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
            ].join(' ')}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
