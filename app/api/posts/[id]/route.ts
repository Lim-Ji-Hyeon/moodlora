import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PostWithMeta, Profile } from '@/types'
import type { ReactionType } from '@/lib/constants/reactions'

// ─── 응답 타입 ────────────────────────────────────────────────────────────────

type PostDetailApiResponse = {
  post: PostWithMeta & { author: Profile | null }
}

// ─── GET /api/posts/[id] ──────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, reactions(*), post_tags(tag_id, tags(id, name))')
    .eq('id', id)
    .single()

  if (error || !post) {
    return NextResponse.json(
      { error: { message: '게시글을 찾을 수 없습니다' } },
      { status: 404 }
    )
  }

  // view_count 증가 (fire-and-forget)
  void supabase
    .from('posts')
    .update({ view_count: (post.view_count ?? 0) + 1 })
    .eq('id', id)

  // author profile 조회 (비익명 게시글만)
  let author: Profile | null = null
  if (!post.is_anonymous && post.author_id) {
    const { data } = await supabase
      .from('profiles')
      .select()
      .eq('id', post.author_id)
      .single()
    author = data
  }

  // reaction_counts 집계 (GET /api/posts 패턴 동일)
  const reaction_counts: Partial<Record<ReactionType, number>> = {}
  for (const r of (post.reactions as Array<{ type: string }> | null) ?? []) {
    const t = r.type as ReactionType
    reaction_counts[t] = (reaction_counts[t] ?? 0) + 1
  }

  // tags 추출
  const tags = (
    (post.post_tags as Array<{ tags: { id: string; name: string } | null }> | null) ?? []
  )
    .map((pt) => pt.tags)
    .filter((t): t is { id: string; name: string } => t !== null)

  // raw reactions / post_tags 제거
  const { reactions: _r, post_tags: _pt, ...rest } = post as typeof post & {
    reactions: unknown
    post_tags: unknown
  }

  return NextResponse.json({
    post: {
      ...rest,
      author_id:       post.is_anonymous ? null : post.author_id,
      tags,
      reaction_counts,
      author,
    },
  } satisfies PostDetailApiResponse)
}

// ─── DELETE /api/posts/[id] ───────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: { message: '로그인이 필요합니다' } },
      { status: 401 }
    )
  }

  const { data: post } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', id)
    .single()

  if (!post) {
    return NextResponse.json(
      { error: { message: '게시글을 찾을 수 없습니다' } },
      { status: 404 }
    )
  }

  if (post.author_id !== user.id) {
    return NextResponse.json(
      { error: { message: '삭제 권한이 없습니다' } },
      { status: 403 }
    )
  }

  await supabase.from('posts').delete().eq('id', id)

  return new NextResponse(null, { status: 204 })
}
