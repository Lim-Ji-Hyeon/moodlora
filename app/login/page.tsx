import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { LoginCard } from './_components/LoginCard'

export const metadata: Metadata = {
  title: '로그인 | Moodlora',
  description: 'Google 또는 Kakao로 간편하게 로그인하세요.',
}

// ─── /login 서버 컴포넌트 ─────────────────────────────────────────────────────
// 이미 로그인된 사용자는 next 또는 /feed로 즉시 리다이렉트.
// Next.js 16.2.2: searchParams는 비동기 API — await 필수.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(next ?? '/feed')

  return <LoginCard next={next} error={error} />
}
