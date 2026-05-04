import type { Metadata } from 'next'
import { Suspense } from 'react'
import HistoryClient from './_components/HistoryClient'

export const metadata: Metadata = {
  title: '감정 히스토리 | Moodlora',
  description: '내 감정 기록을 돌아보세요.',
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  await searchParams

  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground text-sm">로딩 중...</div>}>
      <HistoryClient />
    </Suspense>
  )
}
