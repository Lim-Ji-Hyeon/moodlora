import { Skeleton } from '@/components/ui/skeleton'
import PostCardSkeleton from '@/app/feed/_components/PostCardSkeleton'

export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6 md:grid md:grid-cols-[280px_1fr] md:items-start md:gap-6">
      {/* 프로필 카드 스켈레톤 */}
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="w-full border-t border-border pt-4">
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </div>

      {/* 게시글 목록 스켈레톤 */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
