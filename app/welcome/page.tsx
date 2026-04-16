import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import EmotionPicker from './_components/EmotionPicker'

export const metadata: Metadata = {
  title: '감정 선택 | Moodlora',
  description: '지금 어떤 감정이세요? 감정을 선택하면 같은 마음의 글을 모아드려요.',
}

// ─── /welcome 서버 컴포넌트 ───────────────────────────────────────────────────
// emotion_selected 쿠키가 존재하면 이미 감정을 선택한 사용자이므로 /feed로 이동.
// Next.js 16.2.2: cookies()는 비동기 API — await 필수.
export default async function WelcomePage() {
  const cookieStore = await cookies()
  if (cookieStore.has('emotion_selected')) {
    redirect('/feed')
  }

  return <EmotionPicker />
}
