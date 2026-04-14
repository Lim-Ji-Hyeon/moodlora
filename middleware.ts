import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const EMOTION_COOKIE = 'emotion_selected'
const PROTECTED_PATHS = ['/posts/new', '/profile', '/history']
const PUBLIC_PATHS = ['/welcome', '/login', '/auth']

export async function middleware(request: NextRequest) {
  // Supabase 세션 갱신을 위한 response 준비
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        // 갱신된 세션 토큰을 response 쿠키에 반영
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          ),
      },
    }
  )

  // getUser() 호출이 access_token 자동 갱신을 트리거함
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // 1. 공개 경로: 인증 여부와 무관하게 통과
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return supabaseResponse
  }

  // 2. 루트(/): emotion_selected 쿠키로 온보딩 완료 여부 판단
  if (pathname === '/') {
    const hasEmotion = request.cookies.has(EMOTION_COOKIE)
    return NextResponse.redirect(
      new URL(hasEmotion ? '/feed' : '/welcome', request.url)
    )
  }

  // 3. 보호 경로: 미인증 사용자 → /login
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
