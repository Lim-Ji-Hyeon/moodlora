import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function PostCardSkeleton() {
  return (
    <Card className="gap-3 py-4">
      {/* 감정 배지 + 시간 */}
      <div className="flex items-center justify-between px-4">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>

      {/* 본문 3줄 */}
      <div className="space-y-2 px-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      {/* 태그 */}
      <div className="flex gap-1 px-4">
        <Skeleton className="h-5 w-10 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>

      {/* 반응 수 */}
      <div className="border-t border-border bg-muted/50 px-4 py-2.5">
        <Skeleton className="h-4 w-16" />
      </div>
    </Card>
  )
}
