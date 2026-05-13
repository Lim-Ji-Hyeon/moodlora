'use client'

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PostCard from '@/app/feed/_components/PostCard'
import PostCardSkeleton from '@/app/feed/_components/PostCardSkeleton'
import NicknameEditForm from './NicknameEditForm'
import { useProfilePostsQuery } from '@/hooks/useProfilePostsQuery'
import type { Profile } from '@/types'

type Props = {
  profile: Profile | null
  currentUserId: string
}

export default function ProfileClient({ profile, currentUserId }: Props) {
  const [nickname, setNickname] = useState<string | null>(profile?.nickname ?? null)
  const [isEditing, setIsEditing] = useState(false)

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProfilePostsQuery()

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
    <div className="flex flex-col gap-6 md:grid md:grid-cols-[280px_1fr] md:items-start md:gap-6">
      {/* ── 프로필 카드 (좌측 고정) ─────────────────────────────────────────── */}
      <div className="md:sticky md:top-6">
        <Card className="flex flex-col items-center gap-4 p-6">
          {/* 아바타 */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {initial}
          </div>

          {/* 닉네임 표시 또는 수정 폼 */}
          {isEditing ? (
            <div className="w-full">
              <NicknameEditForm
                currentNickname={nickname}
                onSuccess={(newNickname) => {
                  setNickname(newNickname)
                  setIsEditing(false)
                }}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              <p className="text-lg font-semibold text-foreground">{displayName}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setIsEditing(true)}
              >
                닉네임 수정
              </Button>
            </div>
          )}

          {/* 게시글 수 */}
          <div className="w-full border-t border-border pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              게시글 <span className="font-medium text-foreground">{posts.length}</span>개
            </p>
          </div>
        </Card>
      </div>

      {/* ── 게시글 목록 (우측) ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">내가 쓴 글</h2>

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
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-2xl">✍️</p>
            <p className="text-sm font-medium text-foreground">아직 작성한 글이 없어요</p>
            <p className="text-xs text-muted-foreground">오늘의 감정을 기록해 보세요</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
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
