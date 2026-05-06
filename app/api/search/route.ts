import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchQuerySchema } from '@/lib/validations/search'
import type { PostWithMeta } from '@/types'
import type { ReactionType } from '@/lib/constants/reactions'
import type { SearchApiResponse } from '@/lib/validations/search'

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams

  const parsed = searchQuerySchema.safeParse({
    q:       sp.get('q')       ?? undefined,
    emotion: sp.get('emotion') ?? undefined,
    tags:    sp.get('tags')    ?? undefined,
    limit:   sp.get('limit')   ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: '잘못된 검색 파라미터입니다', issues: parsed.error.issues } },
      { status: 400 }
    )
  }

  const { q, emotion, tags, limit } = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ─── 차단·숨김 ID 수집 (로그인 시만) ──────────────────────────────────────
  let blockedIds:    string[] = []
  let hiddenPostIds: string[] = []

  if (user) {
    const [blocksRes, hiddenRes] = await Promise.all([
      supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id),
      supabase.from('hidden_posts').select('post_id').eq('user_id', user.id),
    ])
    blockedIds    = blocksRes.data?.map(b => b.blocked_id) ?? []
    hiddenPostIds = hiddenRes.data?.map(h => h.post_id)   ?? []
  }

  // ─── 태그 필터 post_id 수집 ────────────────────────────────────────────────
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

  if (filteredPostIds !== null && filteredPostIds.length === 0) {
    return NextResponse.json({ posts: [], total: 0 } satisfies SearchApiResponse)
  }

  // ─── 메인 검색 쿼리 ────────────────────────────────────────────────────────
  let query = supabase
    .from('posts')
    .select('*, reactions(*), post_tags(tag_id, tags(id, name))')
    .ilike('content', `%${q}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (emotion)                       query = query.eq('emotion', emotion)
  if (filteredPostIds !== null)      query = query.in('id', filteredPostIds)
  if (blockedIds.length > 0)        query = query.not('author_id', 'in', `(${blockedIds.join(',')})`)
  if (hiddenPostIds.length > 0)     query = query.not('id', 'in', `(${hiddenPostIds.join(',')})`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: { message: '검색에 실패했습니다' } },
      { status: 500 }
    )
  }

  // ─── PostWithMeta 변환 ────────────────────────────────────────────────────
  const posts: PostWithMeta[] = (data ?? []).map(post => {
    const reaction_counts: Partial<Record<ReactionType, number>> = {}
    for (const r of (post.reactions as Array<{ type: string }> | null) ?? []) {
      const t = r.type as ReactionType
      reaction_counts[t] = (reaction_counts[t] ?? 0) + 1
    }

    const postTags = ((post.post_tags as Array<{ tags: { id: string; name: string } | null }> | null) ?? [])
      .map(pt => pt.tags)
      .filter((t): t is { id: string; name: string } => t !== null)

    const { reactions: _r, post_tags: _pt, ...rest } = post as typeof post & {
      reactions: unknown
      post_tags: unknown
    }

    return {
      ...rest,
      author_id:       post.is_anonymous ? null : post.author_id,
      tags:            postTags,
      reaction_counts,
    }
  })

  return NextResponse.json({ posts, total: posts.length } satisfies SearchApiResponse)
}
