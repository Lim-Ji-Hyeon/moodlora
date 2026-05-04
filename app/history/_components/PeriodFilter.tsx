'use client'

import { cn } from '@/lib/utils'

type Period = '7d' | '30d' | '90d'

const PERIOD_LABELS: Record<Period, string> = {
  '7d':  '이번 주',
  '30d': '이번 달',
  '90d': '3개월',
}

type Props = {
  value:    Period
  onChange: (period: Period) => void
}

export default function PeriodFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-full bg-muted p-1 w-fit">
      {(Object.keys(PERIOD_LABELS) as Period[]).map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            value === period
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {PERIOD_LABELS[period]}
        </button>
      ))}
    </div>
  )
}
