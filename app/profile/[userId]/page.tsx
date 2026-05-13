import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PublicProfileClient from './_components/PublicProfileClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>
}): Promise<Metadata> {
  const { userId } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', userId)
    .single()
  const name = data?.nickname ?? '익명 사용자'
  return { title: `${name}의 프로필 | Moodlora` }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nickname')
    .eq('id', userId)
    .single()

  if (!profile) notFound()

  return <PublicProfileClient userId={userId} nickname={profile.nickname} />
}
