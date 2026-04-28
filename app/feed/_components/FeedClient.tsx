'use client'

import { useSearchParams } from 'next/navigation'
import EmotionFilterBar from './EmotionFilterBar'
import TagFilter from './TagFilter'
import SortTabs from './SortTabs'
import FeedList from './FeedList'

export default function FeedClient() {
  const searchParams = useSearchParams()

  const emotion = searchParams.get('emotion') ?? undefined
  const tags    = searchParams.get('tags')?.split(',').filter(Boolean) ?? []
  const sort    = (searchParams.get('sort') === 'popular' ? 'popular' : 'latest') as 'latest' | 'popular'

  return (
    <>
      {/* ── Mobile: 단일 컬럼 ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:hidden">
        <EmotionFilterBar />
        <div className="flex flex-col gap-2">
          <TagFilter />
          <SortTabs />
        </div>
        {/* 하단 탭바 높이(56px) 만큼 여백 */}
        <div className="pb-16">
          <FeedList emotion={emotion} tags={tags} sort={sort} />
        </div>
      </div>

      {/* ── Tablet/Desktop: 다컬럼 ─────────────────────────────────────────── */}
      <div className="hidden md:flex md:gap-6">
        {/* 좌측 사이드바 */}
        <aside className="w-56 shrink-0">
          <div className="sticky top-6 flex flex-col gap-4">
            <EmotionFilterBar />
            <TagFilter />
            <SortTabs />
          </div>
        </aside>

        {/* 메인 피드 */}
        <main className="min-w-0 flex-1">
          <FeedList emotion={emotion} tags={tags} sort={sort} />
        </main>

        {/* 우측 패널 (Desktop only) — 추천 영역 placeholder */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">이런 글은 어때요?</p>
            <p className="mt-2 text-xs text-muted-foreground">추천 기능은 곧 추가될 예정이에요.</p>
          </div>
        </aside>
      </div>
    </>
  )
}
