'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type SortType = 'latest' | 'popular'

const TABS: { value: SortType; label: string }[] = [
  { value: 'latest',  label: '최신순' },
  { value: 'popular', label: '인기순' },
]

export default function SortTabs() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = (searchParams.get('sort') ?? 'latest') as SortType

  function select(sort: SortType) {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set('sort', sort)
    sp.delete('cursor')
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
      {TABS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => select(value)}
          className={[
            'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            current === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
