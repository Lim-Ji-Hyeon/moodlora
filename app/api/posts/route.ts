import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { PostWithMeta } from '@/types'
import type { ReactionType } from '@/lib/constants/reactions'

// ─── 쿼리 파라미터 스키마 ─────────────────────────────────────────────────────

const EMOTION_VALUES = [
  'JOY', 'EXCITEMENT', 'CALM', 'SADNESS',
  'ANGER', 'LETHARGY', 'ANXIETY', 'LONELINESS',
] as const

const querySchema = z.object({
  emotion: z.enum(EMOTION_VALUES).optional(),
  tags:    z.string().optional(),
  sort:    z.enum(['latest', 'popular']).default('latest'),
  cursor:  z.string().optional(),
  limit:   z.coerce.number().int().min(1).max(50).default(20),
})

// ─── 응답 타입 ────────────────────────────────────────────────────────────────

type FeedApiResponse = {
  posts:      PostWithMeta[]
  nextCursor: string | null
  hasMore:    boolean
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams

  const parsed = querySchema.safeParse({
    emotion: sp.get('emotion') ?? undefined,
    tags:    sp.get('tags')    ?? undefined,
    sort:    sp.get('sort')    ?? undefined,
    cursor:  sp.get('cursor')  ?? undefined,
    limit:   sp.get('limit')   ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: '잘못된 요청 파라미터입니다', issues: parsed.error.issues } },
      { status: 400 }
    )
  }

  const { emotion, tags, sort, cursor, limit } = parsed.data

  // ─── 인증 확인 ──────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ─── 차단·숨김 ID 수집 (로그인 시만) ────────────────────────────────────────
  let blockedIds:   string[] = []
  let hiddenPostIds: string[] = []

  if (user) {
    const [blocksRes, hiddenRes] = await Promise.all([
      supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id),
      supabase.from('hidden_posts').select('post_id').eq('user_id', user.id),
    ])
    blockedIds    = blocksRes.data?.map(b => b.blocked_id) ?? []
    hiddenPostIds = hiddenRes.data?.map(h => h.post_id)   ?? []
  }

  // ─── 태그 필터 post_id 수집 ─────────────────────────────────────────────────
  // null: 필터 미적용(전체), []: 해당 태그 게시글 없음(빈 결과)
  let filteredPostIds: string[] | null = null

  if (tags) {
    const tagNames = tags.split(',').map(t => t.trim()).filter(Boolean)
    if (tagNames.length > 0) {
      const { data: ptData } = await supabase
        .from('post_tags')
        .select('post_id, tags!inner(name)')
        .in('tags.name', tagNames)
      filteredPostIds = ptData ? [...new Set(ptData.map(pt => pt.post_id))] : []
    }
  }

  // 해당 태그 게시글이 없으면 즉시 빈 응답 반환
  if (filteredPostIds !== null && filteredPostIds.length === 0) {
    return NextResponse.json({ posts: [], nextCursor: null, hasMore: false } satisfies FeedApiResponse)
  }

  // ─── 메인 posts 쿼리 ─────────────────────────────────────────────────────────
  let query = supabase
    .from('posts')
    .select('*, reactions(*), post_tags(tag_id, tags(id, name))')
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (emotion)                       query = query.eq('emotion', emotion)
  if (filteredPostIds !== null)      query = query.in('id', filteredPostIds)
  if (blockedIds.length > 0)        query = query.not('author_id', 'in', `(${blockedIds.join(',')})`)
  if (hiddenPostIds.length > 0)     query = query.not('id', 'in', `(${hiddenPostIds.join(',')})`)
  if (cursor && sort === 'latest')  query = query.lt('created_at', cursor)

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: { message: '피드를 불러오는 데 실패했습니다' } },
      { status: 500 }
    )
  }

  // ─── 결과 가공 ───────────────────────────────────────────────────────────────
  const hasMore = data.length > limit
  let posts = data.slice(0, limit)

  // popular 정렬: 총 반응 수 내림차순, 동점은 created_at 내림차순
  if (sort === 'popular') {
    posts = [...posts].sort((a, b) => {
      const countA = (a.reactions as unknown[])?.length ?? 0
      const countB = (b.reactions as unknown[])?.length ?? 0
      if (countB !== countA) return countB - countA
      return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    })
  }

  const result: PostWithMeta[] = posts.map(post => {
    // reaction_counts: ReactionType별 count 집계
    const reaction_counts: Partial<Record<ReactionType, number>> = {}
    for (const r of (post.reactions as Array<{ type: string }> | null) ?? []) {
      const t = r.type as ReactionType
      reaction_counts[t] = (reaction_counts[t] ?? 0) + 1
    }

    // tags: post_tags 중첩에서 Tag[] 추출
    const tags = ((post.post_tags as Array<{ tags: { id: string; name: string } | null }> | null) ?? [])
      .map(pt => pt.tags)
      .filter((t): t is { id: string; name: string } => t !== null)

    // raw reactions/post_tags 제거
    const { reactions: _r, post_tags: _pt, ...rest } = post as typeof post & {
      reactions: unknown
      post_tags: unknown
    }

    return {
      ...rest,
      author_id:       post.is_anonymous ? null : post.author_id,
      tags,
      reaction_counts,
    }
  })

  // latest 커서: 마지막 게시글의 created_at, popular는 커서 미지원
  const nextCursor = hasMore && sort === 'latest'
    ? (result[result.length - 1]?.created_at ?? null)
    : null

  return NextResponse.json({ posts: result, nextCursor, hasMore } satisfies FeedApiResponse)
}
