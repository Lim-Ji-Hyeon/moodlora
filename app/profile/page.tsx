import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from './_components/ProfileClient'

export const metadata: Metadata = {
  title: '내 프로필 | Moodlora',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('id', user.id)
    .single()

  return <ProfileClient profile={profile} currentUserId={user.id} />
}
