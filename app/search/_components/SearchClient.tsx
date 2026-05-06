'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { EmotionType } from '@/lib/constants/emotions'
import type { SearchApiResponse } from '@/lib/validations/search'
import PostCard          from '@/app/feed/_components/PostCard'
import PostCardSkeleton  from '@/app/feed/_components/PostCardSkeleton'
import SearchInput       from './SearchInput'
import SearchEmotionFilter from './SearchEmotionFilter'
import SearchTagFilter   from './SearchTagFilter'

async function fetchSearch(
  q: string,
  emotion: EmotionType | null,
  tags: string[]
): Promise<SearchApiResponse> {
  const sp = new URLSearchParams({ q })
  if (emotion)       sp.set('emotion', emotion)
  if (tags.length)   sp.set('tags', tags.join(','))
  const res = await fetch(`/api/search?${sp.toString()}`)
  if (!res.ok) throw new Error('검색에 실패했습니다')
  return res.json()
}

export default function SearchClient() {
  const [query,         setQuery        ] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [emotion,       setEmotion      ] = useState<EmotionType | null>(null)
  const [tags,          setTags         ] = useState<string[]>([])

  // debounce 400ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading, isFetching } = useQuery({
    queryKey:  ['search', debouncedQuery, emotion, tags],
    queryFn:   () => fetchSearch(debouncedQuery, emotion, tags),
    enabled:   debouncedQuery.length >= 2,
    staleTime: 30_000,
  })

  const showSkeleton = (isLoading || isFetching) && debouncedQuery.length >= 2
  const posts        = data?.posts ?? []
  const hasSearched  = debouncedQuery.length >= 2

  return (
    <div className="md:flex md:gap-6">

      {/* ── Desktop: 좌측 필터 사이드바 ────────────────────────────────────── */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-6 bg-card rounded-2xl border border-border p-5 shadow-sm space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">감정</p>
            <SearchEmotionFilter value={emotion} onChange={setEmotion} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">상황</p>
            <SearchTagFilter value={tags} onChange={setTags} />
          </div>
        </div>
      </aside>

      {/* ── 메인 영역 ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* 검색 입력 */}
        <SearchInput value={query} onChange={setQuery} />

        {/* Mobile: 감정 필터 (가로 스크롤) */}
        <div className="md:hidden space-y-2">
          <p className="text-xs font-medium text-muted-foreground">감정</p>
          <SearchEmotionFilter value={emotion} onChange={setEmotion} scrollable />
          <p className="text-xs font-medium text-muted-foreground pt-1">상황</p>
          <SearchTagFilter value={tags} onChange={setTags} scrollable />
        </div>

        {/* 결과 영역 */}
        {!hasSearched ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-3xl">🔍</p>
            <p className="text-sm font-medium text-foreground">감정과 키워드로 검색해보세요</p>
            <p className="text-xs text-muted-foreground">2자 이상 입력하면 검색이 시작돼요.</p>
          </div>
        ) : showSkeleton ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-3xl">😶</p>
            <p className="text-sm font-medium text-foreground">검색 결과가 없어요</p>
            <p className="text-xs text-muted-foreground">다른 키워드나 필터로 찾아보세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">"{debouncedQuery}"</span> 검색 결과 {data?.total}개
            </p>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
