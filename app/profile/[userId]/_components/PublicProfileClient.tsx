'use client'

import { useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PostCard from '@/app/feed/_components/PostCard'
import PostCardSkeleton from '@/app/feed/_components/PostCardSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import { usePublicPostsQuery } from '@/hooks/usePublicPostsQuery'

type Props = {
  userId: string
  nickname: string | null
}

export default function PublicProfileClient({ userId, nickname }: Props) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePublicPostsQuery(userId)

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        },
        { rootMargin: '200px' },
      )
      observer.observe(node)
      return () => observer.disconnect()
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  const displayName = nickname ?? '익명 사용자'
  const initial = displayName.charAt(0).toUpperCase()
  const posts = data?.pages.flatMap((p) => p.posts) ?? []

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* ── 프로필 카드 ──────────────────────────────────────────────────────── */}
      <Card className="mb-6 flex flex-col items-center gap-4 p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
          {initial}
        </div>
        <p className="text-lg font-semibold text-foreground">{displayName}</p>
      </Card>

      {/* ── 게시글 목록 ──────────────────────────────────────────────────────── */}
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        {displayName}의 글
      </h2>

      <div className="flex flex-col gap-3">
        {isLoading && (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">게시글을 불러오지 못했어요.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              다시 시도
            </Button>
          </div>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <EmptyState
            emoji="📭"
            title="아직 공개된 글이 없어요"
          />
        )}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={null}
          />
        ))}

        {isFetchingNextPage && (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        )}

        {!hasNextPage && posts.length > 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            모든 글을 읽었어요 ✨
          </p>
        )}

        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  )
}
