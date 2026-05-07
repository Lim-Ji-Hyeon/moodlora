"use client";

import { useSearchParams } from "next/navigation";
import EmotionFilterBar from "./EmotionFilterBar";
import TagFilter from "./TagFilter";
import SortTabs from "./SortTabs";
import FeedList from "./FeedList";
import RecommendationPanel from "@/components/recommendations/RecommendationPanel";
import { useEmotionStore } from "@/stores/emotionStore";
import type { EmotionType } from "@/lib/constants/emotions";

export default function FeedClient() {
  const searchParams = useSearchParams();
  const currentEmotion = useEmotionStore((s) => s.currentEmotion);

  const emotion = searchParams.get("emotion") ?? undefined;
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
  const sort = (
    searchParams.get("sort") === "popular" ? "popular" : "latest"
  ) as "latest" | "popular";

  // 피드 필터에서 선택한 감정 우선, 없으면 Zustand 현재 감정 폴백
  const panelEmotion = (emotion as EmotionType | undefined) ?? currentEmotion;

  return (
    <>
      {/* ── Mobile: 단일 컬럼 ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:hidden">
        <EmotionFilterBar />
        <div className="flex flex-col gap-2">
          <TagFilter />
          <SortTabs />
        </div>
        {/* 하단 탭바 높이(56px) 만큼 여백 */}
        <div className="pb-16">
          <FeedList emotion={emotion} tags={tags} sort={sort} />
        </div>
      </div>

      {/* ── Tablet/Desktop: 다컬럼 ─────────────────────────────────────────── */}
      <div className="hidden md:flex md:gap-6">
        {/* 좌측 사이드바 */}
        <aside className="w-56 shrink-0">
          <div className="sticky top-6 flex flex-col gap-4">
            <EmotionFilterBar />
            <TagFilter />
            <SortTabs />
          </div>
        </aside>

        {/* 메인 피드 */}
        <main className="min-w-0 flex-1">
          <FeedList emotion={emotion} tags={tags} sort={sort} />
        </main>

        {/* 우측 패널 (Desktop only) — 추천 */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 rounded-xl border border-border bg-card p-4">
            {panelEmotion ? (
              <RecommendationPanel emotion={panelEmotion} />
            ) : (
              <p className="text-xs text-muted-foreground">
                감정을 선택하면 추천 글이 표시돼요.
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
