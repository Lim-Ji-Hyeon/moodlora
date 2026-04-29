'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId: _ }: CommentSectionProps) {
  return (
    <div className="space-y-4 pt-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">댓글</h3>
      </div>

      {/* 빈 상태 */}
      <div className="py-8 text-center text-sm text-muted-foreground">
        아직 댓글이 없어요. 따뜻한 한마디를 남겨보세요 💬
      </div>

      {/* 입력 폼 (Task 3.5 placeholder) */}
      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="따뜻한 댓글을 남겨주세요... (준비 중)"
          rows={3}
          disabled
          className="resize-none rounded-xl"
        />
        <div className="flex justify-end">
          <Button disabled size="sm" className="rounded-xl">
            등록
          </Button>
        </div>
      </div>
    </div>
  )
}
