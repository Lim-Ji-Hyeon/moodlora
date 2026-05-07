import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  COMPLEMENTARY_EMOTIONS,
  type EmotionType,
} from "@/lib/constants/emotions";
import type { PostWithMeta } from "@/types";
import type { ReactionType } from "@/lib/constants/reactions";

const EMOTION_VALUES = [
  "JOY",
  "EXCITEMENT",
  "CALM",
  "SADNESS",
  "ANGER",
  "LETHARGY",
  "ANXIETY",
  "LONELINESS",
] as const;

const querySchema = z.object({
  emotion: z.enum(EMOTION_VALUES),
  excludeId: z.string().uuid().optional(),
});

type RawPost = {
  id: string;
  author_id: string | null;
  content: string;
  emotion: string;
  is_anonymous: boolean | null;
  view_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  reactions: unknown;
  post_tags: unknown;
};

function sortByReactions(rows: RawPost[]): RawPost[] {
  return [...rows].sort(
    (a, b) =>
      ((b.reactions as unknown[])?.length ?? 0) -
      ((a.reactions as unknown[])?.length ?? 0),
  );
}

function toPostWithMeta(post: RawPost): PostWithMeta {
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

  return {
    id: post.id,
    author_id: post.is_anonymous ? null : post.author_id,
    content: post.content,
    emotion: post.emotion as EmotionType,
    is_anonymous: post.is_anonymous,
    view_count: post.view_count,
    created_at: post.created_at,
    updated_at: post.updated_at,
    tags,
    reaction_counts,
  };
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const parsed = querySchema.safeParse({
    emotion: sp.get("emotion") ?? undefined,
    excludeId: sp.get("excludeId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          message: "감정 파라미터가 필요합니다",
          issues: parsed.error.issues,
        },
      },
      { status: 400 },
    );
  }

  const { emotion, excludeId } = parsed.data;
  const supabase = await createClient();

  const compEmotions: EmotionType[] =
    COMPLEMENTARY_EMOTIONS[emotion as EmotionType] ?? [];

  async function fetchCandidates(emotions: EmotionType[]) {
    let q = supabase
      .from("posts")
      .select("*, reactions(*), post_tags(tag_id, tags(id, name))")
      .in("emotion", emotions)
      .order("created_at", { ascending: false })
      .limit(15);
    if (excludeId) q = q.neq("id", excludeId);
    return q;
  }

  const sameRes = await fetchCandidates([emotion as EmotionType]);
  if (sameRes.error) {
    return NextResponse.json(
      { error: { message: "추천 게시글 조회에 실패했습니다" } },
      { status: 500 },
    );
  }

  const compData =
    compEmotions.length > 0
      ? ((await fetchCandidates(compEmotions)).data ?? [])
      : [];

  const top3 = sortByReactions(sameRes.data as RawPost[]).slice(0, 3);
  const top2 = sortByReactions(compData as RawPost[]).slice(0, 2);

  const posts: PostWithMeta[] = [...top3, ...top2]
    .filter((post, i, arr) => arr.findIndex((p) => p.id === post.id) === i)
    .slice(0, 5)
    .map(toPostWithMeta);

  return NextResponse.json({ posts });
}
