'use client'

import { EMOTIONS, type EmotionType } from '@/lib/constants/emotions'
import type { EmotionLogItem } from '@/lib/validations/emotion'

type Props = {
  date:        string | null
  logs:        EmotionLogItem[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default function DayLogList({ date, logs }: Props) {
  const filtered = date
    ? logs.filter((l) => l.created_at.slice(0, 10) === date)
    : logs

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {date ? '해당 날짜의 감정 기록이 없어요.' : '감정 기록이 없어요.'}
      </p>
    )
  }

  // 날짜별 그룹핑
  const grouped: Record<string, EmotionLogItem[]> = {}
  for (const log of filtered) {
    const d = log.created_at.slice(0, 10)
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(log)
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([d, dayLogs]) => {
          const emotion   = dayLogs[0]?.emotion as EmotionType
          const isToday   = d === new Date().toISOString().slice(0, 10)
          const dateLabel = isToday ? `${formatDate(d + 'T00:00:00')} (오늘)` : formatDate(d + 'T00:00:00')

          return (
            <div key={d}>
              <p className="text-xs font-semibold text-primary mb-2">{dateLabel}</p>
              <div className="space-y-2">
                {dayLogs.map((log) => {
                  const em = log.emotion as EmotionType
                  const info = EMOTIONS[em]
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex flex-col items-center gap-0.5 min-w-[40px]">
                        <span className="text-xs text-muted-foreground">{formatTime(log.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg leading-none">{info?.emoji}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                          {info?.label}
                        </span>
                        {log.note && (
                          <p className="text-sm text-foreground truncate">{log.note}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
    </div>
  )
}
