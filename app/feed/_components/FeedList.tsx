'use client'

import { useCallback } from 'react'
import { useFeedQuery } from '@/hooks/useFeedQuery'
import PostCard from './PostCard'
import PostCardSkeleton from './PostCardSkeleton'

interface FeedListProps {
  emotion?: string
  tags:     string[]
  sort:     'latest' | 'popular'
}

export default function FeedList({ emotion, tags, sort }: FeedListProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFeedQuery({ emotion, tags, sort })

  // IntersectionObserver sentinel — 뷰포트 200px 전 진입 시 다음 페이지 요청
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        },
        { rootMargin: '200px' }
      )
      observer.observe(node)
      return () => observer.disconnect()
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  // ─── 초기 로딩 ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // ─── 에러 ──────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">피드를 불러오지 못했어요.</p>
        <button
          onClick={() => refetch()}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          다시 시도
        </button>
      </div>
    )
  }

  const posts = data?.pages.flatMap((p) => p.posts) ?? []

  // ─── 빈 상태 ───────────────────────────────────────────────────────────────
  if (posts.length === 0) {
    const hasFilter = emotion || tags.length > 0
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-2xl">🌙</p>
        <p className="text-sm font-medium text-foreground">
          {hasFilter ? '조건에 맞는 글이 없어요' : '아직 글이 없어요'}
        </p>
        <p className="text-xs text-muted-foreground">
          {hasFilter ? '다른 감정이나 태그로 탐색해 보세요' : '첫 번째 글을 남겨보세요'}
        </p>
      </div>
    )
  }

  // ─── 피드 목록 ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* 추가 로딩 스켈레톤 */}
      {isFetchingNextPage && (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      )}

      {/* 마지막 페이지 메시지 */}
      {!hasNextPage && posts.length > 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          모든 글을 읽었어요 ✨
        </p>
      )}

      {/* IntersectionObserver sentinel */}
      <div ref={sentinelRef} className="h-1" />
    </div>
  )
}
