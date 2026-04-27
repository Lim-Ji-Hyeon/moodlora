'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import type { PostWithMeta } from '@/types'

export type FeedApiResponse = {
  posts:      PostWithMeta[]
  nextCursor: string | null
  hasMore:    boolean
}

export type FeedQueryParams = {
  emotion?: string
  tags:     string[]
  sort:     'latest' | 'popular'
}

export function useFeedQuery({ emotion, tags, sort }: FeedQueryParams) {
  return useInfiniteQuery({
    queryKey: ['feed', { emotion, tags, sort }],
    queryFn: async ({ pageParam }) => {
      const sp = new URLSearchParams()
      if (emotion)       sp.set('emotion', emotion)
      if (tags.length)   sp.set('tags', tags.join(','))
      sp.set('sort', sort)
      sp.set('limit', '20')
      if (pageParam)     sp.set('cursor', pageParam)

      const res = await fetch(`/api/posts?${sp.toString()}`)
      if (!res.ok) throw new Error('피드를 불러오지 못했습니다')
      return res.json() as Promise<FeedApiResponse>
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}
