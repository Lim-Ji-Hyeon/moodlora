import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { PostWithMeta } from "@/types";
import type { ReactionType } from "@/lib/constants/reactions";

const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

type ProfilePostsResponse = {
  posts: PostWithMeta[];
  nextCursor: string | null;
  hasMore: boolean;
};

// ─── GET /api/profile/posts ───────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { message: "로그인이 필요합니다" } },
      { status: 401 },
    );
  }

  const sp = request.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    cursor: sp.get("cursor") ?? undefined,
    limit: sp.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "잘못된 요청 파라미터입니다" } },
      { status: 400 },
    );
  }

  const { cursor, limit } = parsed.data;

  let query = supabase
    .from("posts")
    .select("*, reactions(*), post_tags(tag_id, tags(id, name))")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: { message: "게시글을 불러오는 데 실패했습니다" } },
      { status: 500 },
    );
  }

  const hasMore = data.length > limit;
  const posts = data.slice(0, limit);

  const result: PostWithMeta[] = posts.map((post) => {
    const reaction_counts: Partial<Record<ReactionType, number>> = {};
    for (const r of (post.reactions as Array<{ type: string }> | null) ?? []) {
      const t = r.type as ReactionType;
      reaction_counts[t] = (reaction_counts[t] ?? 0) + 1;
    }

    const tags = (
      (post.post_tags as Array<{
        tags: { id: string; name: string } | null;
      }> | null) ?? []
    )
      .map((pt) => pt.tags)
      .filter((t): t is { id: string; name: string } => t !== null);

    const {
      reactions: _r,
      post_tags: _pt,
      ...rest
    } = post as typeof post & { reactions: unknown; post_tags: unknown };

    return {
      ...rest,
      // 익명 게시글은 author_id null 마스킹
      author_id: post.is_anonymous ? null : post.author_id,
      tags,
      reaction_counts,
    };
  });

  const nextCursor = hasMore
    ? (result[result.length - 1]?.created_at ?? null)
    : null;

  return NextResponse.json({
    posts: result,
    nextCursor,
    hasMore,
  } satisfies ProfilePostsResponse);
}
