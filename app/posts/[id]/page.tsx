import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { PostWithMeta, Profile } from '@/types'
import type { ReactionType } from '@/lib/constants/reactions'
import type { EmotionType } from '@/lib/constants/emotions'
import PostDetailContent from './_components/PostDetailContent'
import ReactionBar       from './_components/ReactionBar'
import CommentSection    from './_components/CommentSection'

type PostDetailData = PostWithMeta & { author: Profile | null }

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id }  = await params
  const supabase = await createClient()
  const { data } = await supabase.from('posts').select('content').eq('id', id).single()
  const preview  = data?.content?.slice(0, 60) ?? '게시글'
  return { title: `${preview}... | Moodlora` }
}

export default async function PostDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }   = await params
  const supabase = await createClient()

  // ─── 게시글 조회 ───────────────────────────────────────────────────────────
  const { data: raw, error } = await supabase
    .from('posts')
    .select('*, reactions(*), post_tags(tag_id, tags(id, name))')
    .eq('id', id)
    .single()

  if (error || !raw) notFound()

  // view_count 증가 (fire-and-forget)
  void supabase
    .from('posts')
    .update({ view_count: (raw.view_count ?? 0) + 1 })
    .eq('id', id)

  // ─── 데이터 가공 (route.ts와 동일 패턴) ────────────────────────────────────
  const reaction_counts: Partial<Record<ReactionType, number>> = {}
  for (const r of (raw.reactions as Array<{ type: string }> | null) ?? []) {
    const t = r.type as ReactionType
    reaction_counts[t] = (reaction_counts[t] ?? 0) + 1
  }

  const tags = (
    (raw.post_tags as Array<{ tags: { id: string; name: string } | null }> | null) ?? []
  )
    .map((pt) => pt.tags)
    .filter((t): t is { id: string; name: string } => t !== null)

  const { reactions: _r, post_tags: _pt, ...rest } = raw as typeof raw & {
    reactions: unknown
    post_tags: unknown
  }

  // ─── author profile 조회 (비익명만) ───────────────────────────────────────
  let author: Profile | null = null
  if (!raw.is_anonymous && raw.author_id) {
    const { data } = await supabase
      .from('profiles')
      .select()
      .eq('id', raw.author_id)
      .single()
    author = data
  }

  const post: PostDetailData = {
    ...rest,
    author_id:       raw.is_anonymous ? null : raw.author_id,
    tags,
    reaction_counts,
    author,
  }

  // ─── 현재 사용자 & 소유자 판단 ─────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = !!user && user.id === raw.author_id && !raw.is_anonymous

  // ─── 현재 사용자의 이 게시글 반응 목록 조회 ──────────────────────────────────
  let userReactions: ReactionType[] = []
  if (user) {
    const { data: myReactions } = await supabase
      .from('reactions')
      .select('type')
      .eq('post_id', id)
      .eq('user_id', user.id)
    userReactions = (myReactions ?? []).map((r) => r.type as ReactionType)
  }

  // ─── 레이아웃 ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_300px_260px] gap-6 items-start">

        {/* ── 메인 컬럼: 게시글 + 공감 + 댓글 ──────────────────────────────── */}
        <div className="space-y-0 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <PostDetailContent post={post} isOwner={isOwner} />

          <ReactionBar
            postId={id}
            emotion={post.emotion as EmotionType}
            reactionCounts={post.reaction_counts}
            userReactions={userReactions}
            currentUserId={user?.id ?? null}
          />

          {/* 댓글은 md 미만에서만 메인 컬럼에 표시 */}
          <div className="md:hidden">
            <CommentSection postId={id} currentUserId={user?.id ?? null} />
          </div>
        </div>

        {/* ── 댓글 패널 (md 이상) ──────────────────────────────────────────── */}
        <div className="hidden md:block bg-card rounded-2xl border border-border p-5 shadow-sm">
          <CommentSection postId={id} currentUserId={user?.id ?? null} />
        </div>

        {/* ── 추천 패널 (lg 이상, Task 4.1 placeholder) ────────────────────── */}
        <div className="hidden lg:block bg-card rounded-2xl border border-border p-5 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-foreground">이런 글은 어때요?</p>
          <p className="text-xs text-muted-foreground">추천 기능은 곧 추가될 예정이에요.</p>
        </div>

      </div>
    </div>
  )
}
