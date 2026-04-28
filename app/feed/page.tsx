import type { Metadata } from 'next'
import { Suspense } from 'react'
import FeedClient from './_components/FeedClient'

export const metadata: Metadata = {
  title: '피드 | Moodlora',
  description: '같은 감정을 가진 사람들의 이야기를 만나보세요.',
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ emotion?: string; tags?: string; sort?: string }>
}) {
  // Next.js 16.2.2: searchParams는 비동기 — await 필수
  await searchParams

  return (
    <Suspense>
      <FeedClient />
    </Suspense>
  )
}
