import PostCardSkeleton from './_components/PostCardSkeleton'

export default function FeedLoading() {
  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* 피드 레이아웃: 필터 사이드바 + 게시글 목록 */}
        <div className="hidden md:flex md:gap-6">
          <aside className="w-56 shrink-0 space-y-4">
            <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-32 w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          </aside>
          <main className="min-w-0 flex-1 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </main>
        </div>
        <div className="flex flex-col gap-3 md:hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
