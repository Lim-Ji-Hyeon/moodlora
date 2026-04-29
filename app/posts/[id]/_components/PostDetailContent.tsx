'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Trash2, Eye } from 'lucide-react'
import { EMOTIONS, EMOTION_STYLES, type EmotionType } from '@/lib/constants/emotions'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { PostWithMeta, Profile } from '@/types'

type PostDetailData = PostWithMeta & { author: Profile | null }

interface PostDetailContentProps {
  post:    PostDetailData
  isOwner: boolean
}

export default function PostDetailContent({ post, isOwner }: PostDetailContentProps) {
  const router      = useRouter()
  const queryClient = useQueryClient()

  const emotion       = EMOTIONS[post.emotion as EmotionType]
  const styles        = EMOTION_STYLES[emotion.color]
  const authorName    = post.is_anonymous ? '익명의 감정러버' : (post.author?.nickname ?? '알 수 없음')

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      toast.success('게시글이 삭제되었습니다.')
      router.push('/feed')
    },
    onError: () => {
      toast.error('삭제에 실패했습니다. 다시 시도해주세요.')
    },
  })

  function handleDelete() {
    if (!confirm('게시글을 삭제할까요?')) return
    deleteMutation.mutate()
  }

  return (
    <article className="space-y-5">
      {/* ─── 상단 네비 + 삭제 버튼 ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </button>

        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </Button>
        )}
      </div>

      {/* ─── 감정 배지 + 메타 ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium', styles.badge)}>
            {emotion.emoji} {emotion.label}
          </span>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {(post.view_count ?? 0).toLocaleString()}
            </span>
            <span>{formatRelativeTime(post.created_at ?? '')}</span>
          </div>
        </div>

        {/* 작성자 */}
        <p className="text-sm font-medium text-foreground">{authorName}</p>

        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ─── 본문 ────────────────────────────────────────────────────────── */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
          {post.content}
        </p>
      </div>
    </article>
  )
}
