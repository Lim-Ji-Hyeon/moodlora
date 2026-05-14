import type { Metadata } from 'next'
import { Suspense } from 'react'
import SearchClient from './_components/SearchClient'

export const metadata: Metadata = {
  title: '검색 | Moodlora',
  description: '감정과 키워드로 글을 찾아보세요.',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  await searchParams

  return (
    <Suspense>
      <SearchClient />
    </Suspense>
  )
}
