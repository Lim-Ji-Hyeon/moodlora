"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  EMOTIONS,
  EMOTION_STYLES,
  type EmotionType,
} from "@/lib/constants/emotions";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostWithMeta } from "@/types";

type Props = {
  emotion: EmotionType;
  excludeId?: string;
};

async function fetchRecommendations(
  emotion: EmotionType,
  excludeId?: string,
): Promise<{ posts: PostWithMeta[] }> {
  const sp = new URLSearchParams({ emotion });
  if (excludeId) sp.set("excludeId", excludeId);
  const res = await fetch(`/api/recommendations?${sp.toString()}`);
  if (!res.ok) throw new Error("추천 조회 실패");
  return res.json();
}

export default function RecommendationPanel({ emotion, excludeId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["recommendations", emotion, excludeId],
    queryFn: () => fetchRecommendations(emotion, excludeId),
    staleTime: 120_000,
  });

  const posts = data?.posts ?? [];

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        이런 글은 어때요?
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="space-y-1.5 rounded-lg border border-border p-3"
            >
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-xs text-muted-foreground">추천할 글이 없어요.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => {
            const em = EMOTIONS[post.emotion as EmotionType];
            const styles = EMOTION_STYLES[em?.color ?? "slate"];
            const total = Object.values(post.reaction_counts).reduce<number>(
              (s, v) => s + (v ?? 0),
              0,
            );

            return (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
              >
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                >
                  {em?.emoji} {em?.label}
                </span>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foreground">
                  {post.content}
                </p>
                {total > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    공감 {total}개
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
