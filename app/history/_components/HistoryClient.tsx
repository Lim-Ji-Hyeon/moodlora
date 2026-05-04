'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { EMOTIONS, EMOTION_STYLES, type EmotionType } from '@/lib/constants/emotions'
import type { HistoryApiResponse, EmotionLogItem } from '@/lib/validations/emotion'
import PeriodFilter    from './PeriodFilter'
import EmotionAreaChart from './EmotionAreaChart'
import DayLogList      from './DayLogList'
import { Skeleton } from '@/components/ui/skeleton'

type Period = '7d' | '30d' | '90d'

// 기간별 날짜 배열 생성
function buildDateRange(period: Period): string[] {
  const days   = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const result: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    result.push(d.toISOString().slice(0, 10))
  }
  return result
}

async function fetchHistory(period: Period): Promise<HistoryApiResponse> {
  const res = await fetch(`/api/emotions/history?period=${period}`)
  if (!res.ok) throw new Error('히스토리 조회에 실패했습니다')
  return res.json()
}

export default function HistoryClient() {
  const [period, setPeriod]           = useState<Period>('7d')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey:  ['emotion-history', period],
    queryFn:   () => fetchHistory(period),
    staleTime: 60_000,
  })

  // 차트 데이터: 기간 내 모든 날짜 + grouped 카운트 병합
  const chartData = useMemo(() => {
    const dates = buildDateRange(period)
    return dates.map((date) => ({
      date,
      ...(data?.grouped[date] ?? {}),
    }))
  }, [data, period])

  // 감정별 총 카운트
  const emotionTotals = useMemo(() => {
    const totals: Partial<Record<EmotionType, number>> = {}
    for (const log of data?.logs ?? []) {
      const em = log.emotion as EmotionType
      totals[em] = (totals[em] ?? 0) + 1
    }
    return totals
  }, [data])

  const totalCount = data?.logs.length ?? 0
  const totalDays  = Object.keys(data?.grouped ?? {}).length

  // 가장 많이 기록된 감정
  const dominantEmotion = useMemo<EmotionType | null>(() => {
    let max = 0
    let dom: EmotionType | null = null
    for (const [em, cnt] of Object.entries(emotionTotals)) {
      if ((cnt ?? 0) > max) { max = cnt!; dom = em as EmotionType }
    }
    return dom
  }, [emotionTotals])

  const handleDateClick = (date: string) => {
    setSelectedDate((prev) => (prev === date ? null : date))
  }

  // ── 로딩 스켈레톤 ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56 rounded-full" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  // ── 빈 상태 ──────────────────────────────────────────────────────────────────
  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <PeriodFilter value={period} onChange={(p) => { setPeriod(p); setSelectedDate(null) }} />
        <div className="space-y-3">
          <p className="text-4xl">📊</p>
          <p className="text-lg font-semibold text-foreground">아직 감정 기록이 없어요</p>
          <p className="text-sm text-muted-foreground">
            게시글을 작성하면 감정이 자동으로 기록돼요.
          </p>
          <Link
            href="/posts/new"
            className="inline-block mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            첫 감정 기록하기
          </Link>
        </div>
      </div>
    )
  }

  // ── 감정 통계 사이드바 (Desktop용) ───────────────────────────────────────────
  const StatsSidebar = () => (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">내 감정 기록</p>
        <div className="space-y-2">
          {(Object.keys(EMOTIONS) as EmotionType[]).map((em) => {
            const cnt    = emotionTotals[em] ?? 0
            const pct    = totalCount > 0 ? Math.round((cnt / totalCount) * 100) : 0
            const info   = EMOTIONS[em]
            const styles = EMOTION_STYLES[info.color]
            if (cnt === 0) return null
            return (
              <div key={em} className="flex items-center gap-2">
                <span className="text-base w-5 text-center">{info.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-medium text-foreground">{info.label}</span>
                    <span className="text-muted-foreground">{cnt}회({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${styles.dot}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ── 모바일 상단 통계 카드 ────────────────────────────────────────────────────
  const MobileStatsCard = () => {
    if (!dominantEmotion) return null
    const info   = EMOTIONS[dominantEmotion]
    const pct    = totalCount > 0 ? Math.round(((emotionTotals[dominantEmotion] ?? 0) / totalCount) * 100) : 0
    const styles = EMOTION_STYLES[info.color]
    return (
      <div className={`rounded-xl border p-4 flex items-center justify-between ${styles.bg} ${styles.border}`}>
        <div>
          <p className="text-xs text-muted-foreground mb-1">이번 기간 감정 기록</p>
          <p className={`text-xl font-bold ${styles.text}`}>
            {info.emoji} {info.label} ({pct}%)
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            주로 {info.label} 기록이 많아요.
          </p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${styles.text}`}>{totalDays}일</p>
          <p className="text-xs text-muted-foreground">기록</p>
        </div>
      </div>
    )
  }

  // ── 차트 제목 ─────────────────────────────────────────────────────────────────
  const periodLabel = period === '7d' ? '주간' : period === '30d' ? '월간' : '3개월'

  return (
    <div className="space-y-4 md:space-y-0 md:flex md:gap-6">

      {/* ── Desktop: 좌측 사이드바 ───────────────────────────────────────────── */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-6 bg-card rounded-2xl border border-border p-5 shadow-sm space-y-6">
          <PeriodFilter value={period} onChange={(p) => { setPeriod(p); setSelectedDate(null) }} />
          <StatsSidebar />
        </div>
      </aside>

      {/* ── 메인 영역 ────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Mobile: 기간 필터 */}
        <div className="md:hidden">
          <PeriodFilter value={period} onChange={(p) => { setPeriod(p); setSelectedDate(null) }} />
        </div>

        {/* Mobile: 통계 카드 */}
        <div className="md:hidden">
          <MobileStatsCard />
        </div>

        {/* 차트 */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">{periodLabel} 감정 흐름</p>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                전체 보기
              </button>
            )}
          </div>
          <EmotionAreaChart
            data={chartData}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
          {/* 범례 */}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {(Object.keys(EMOTIONS) as EmotionType[]).map((em) => {
              const cnt  = emotionTotals[em] ?? 0
              if (cnt === 0) return null
              const info = EMOTIONS[em]
              const styles = EMOTION_STYLES[info.color]
              return (
                <span key={em} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className={`inline-block w-2 h-2 rounded-full ${styles.dot}`} />
                  {info.label}
                </span>
              )
            })}
          </div>
        </div>

        {/* 상세 로그 */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-4">
            {selectedDate ? `${selectedDate} 감정 로그` : '상세 감정 로그'}
          </p>
          <DayLogList date={selectedDate} logs={data?.logs ?? []} />
        </div>

      </div>
    </div>
  )
}
