'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEmotionStore } from '@/stores/emotionStore'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { EMOTIONS } from '@/lib/constants/emotions'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function Header() {
  const router = useRouter()
  const { currentEmotion } = useEmotionStore()
  const { user } = useCurrentUser()
  const emotion = currentEmotion ? EMOTIONS[currentEmotion] : null

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-14 border-b px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href="/" className="font-bold text-lg">Moodlora</Link>
        {emotion && (
          <span className="text-sm text-muted-foreground">
            {emotion.emoji} {emotion.label}
          </span>
        )}
      </div>
      <div>
        {user ? (
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            로그아웃
          </Button>
        ) : (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">로그인</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
