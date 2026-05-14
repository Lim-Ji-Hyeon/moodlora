'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PostDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-4xl">📄</p>
      <p className="text-lg font-medium text-foreground">게시글을 불러올 수 없어요</p>
      <p className="text-sm text-muted-foreground">삭제된 게시글이거나 일시적인 오류입니다.</p>
      <div className="flex gap-2 mt-2">
        <Button variant="outline" onClick={reset}>다시 시도</Button>
        <Button asChild variant="ghost">
          <Link href="/feed">피드로 이동</Link>
        </Button>
      </div>
    </div>
  )
}
