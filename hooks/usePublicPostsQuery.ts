'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import type { PostWithMeta } from '@/types'

export type PublicPostsResponse = {
  posts:      PostWithMeta[]
  nextCursor: string | null
  hasMore:    boolean
}

export function usePublicPostsQuery(userId: string) {
  return useInfiniteQuery({
    queryKey: ['public-posts', userId],
    queryFn: async ({ pageParam }) => {
      const sp = new URLSearchParams()
      sp.set('limit', '20')
      if (pageParam) sp.set('cursor', pageParam)

      const res = await fetch(`/api/users/${userId}/posts?${sp.toString()}`)
      if (!res.ok) throw new Error('게시글을 불러오지 못했습니다')
      return res.json() as Promise<PublicPostsResponse>
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}
