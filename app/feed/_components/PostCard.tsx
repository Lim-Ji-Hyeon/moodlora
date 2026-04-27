import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { EMOTIONS, EMOTION_STYLES } from '@/lib/constants/emotions'
import type { PostWithMeta } from '@/types'
import type { EmotionType } from '@/lib/constants/emotions'

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

export default function PostCard({ post }: { post: PostWithMeta }) {
  const emotion       = EMOTIONS[post.emotion as EmotionType]
  const styles        = EMOTION_STYLES[emotion.color]
  const totalReactions = Object.values(post.reaction_counts).reduce<number>((sum, v) => sum + (v ?? 0), 0)
  const visibleTags   = post.tags.slice(0, 3)
  const extraCount    = post.tags.length - 3

  return (
    <Link href={`/posts/${post.id}`} className="block transition-opacity hover:opacity-90">
      <Card className="gap-3 py-4">
        {/* 감정 배지 + 시간 */}
        <div className="flex items-center justify-between px-4">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}>
            {emotion.emoji} {emotion.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(post.created_at ?? '')}
          </span>
        </div>

        {/* 본문 */}
        <div className="px-4">
          <p className="line-clamp-3 text-sm leading-relaxed text-foreground">
            {post.content}
          </p>
        </div>

        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 px-4">
            {visibleTags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                외 {extraCount}개
              </span>
            )}
          </div>
        )}

        {/* 반응 수 */}
        <div className="border-t border-border bg-muted/50 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">공감 {totalReactions}개</span>
        </div>
      </Card>
    </Link>
  )
}
