'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, OctagonX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── 감정 원형 장식 데이터 ─────────────────────────────────────────────────────
// EMOTION_STYLES의 dot 클래스를 정적으로 명시 (Tailwind v4 purge 방지)
const EMOTION_DOTS = [
  { key: 'joy',        dotClass: 'bg-amber-400',  size: 'w-12 h-12' },
  { key: 'excitement', dotClass: 'bg-pink-400',   size: 'w-8 h-8'   },
  { key: 'calm',       dotClass: 'bg-sky-400',    size: 'w-10 h-10' },
  { key: 'sadness',    dotClass: 'bg-blue-400',   size: 'w-6 h-6'   },
  { key: 'anger',      dotClass: 'bg-red-400',    size: 'w-9 h-9'   },
  { key: 'lethargy',   dotClass: 'bg-slate-400',  size: 'w-7 h-7'   },
  { key: 'anxiety',    dotClass: 'bg-purple-400', size: 'w-11 h-11' },
  { key: 'loneliness', dotClass: 'bg-indigo-400', size: 'w-8 h-8'   },
] as const

// ─── 구글 아이콘 SVG ─────────────────────────────────────────────────────────
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

// ─── 카카오 아이콘 SVG ────────────────────────────────────────────────────────
function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 3C6.477 3 2 6.477 2 10.5c0 2.568 1.526 4.836 3.862 6.229l-.98 3.57a.375.375 0 0 0 .55.41l4.162-2.747A12.64 12.64 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"
        fill="#000000"
      />
    </svg>
  )
}

// ─── Props 타입 ───────────────────────────────────────────────────────────────
interface LoginCardProps {
  /** 로그인 후 이동할 경로. 미지정 시 '/feed' */
  next?: string
  /** 에러 코드. 'auth_failed' 시 토스트 알림 표시 */
  error?: string
}

// ─── OAuth 제공자 타입 ────────────────────────────────────────────────────────
type OAuthProvider = 'google' | 'kakao'

// ─── 브랜드 영역 컴포넌트 (Desktop 좌측) ─────────────────────────────────────
function BrandPanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-center items-start px-16 py-20 bg-gradient-to-br from-purple-600 to-indigo-600 relative overflow-hidden"
      aria-hidden="true"
    >
      {/* 감정 색상 원형 장식 — 배경에 무작위 배치 */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <span className="absolute top-12 left-8 w-12 h-12 rounded-full bg-amber-400 opacity-70 blur-sm" />
        <span className="absolute top-24 right-16 w-8 h-8 rounded-full bg-pink-400 opacity-60 blur-sm" />
        <span className="absolute top-1/3 left-1/4 w-10 h-10 rounded-full bg-sky-400 opacity-50 blur-sm" />
        <span className="absolute top-1/2 right-8 w-6 h-6 rounded-full bg-blue-400 opacity-65 blur-sm" />
        <span className="absolute bottom-32 left-12 w-9 h-9 rounded-full bg-red-400 opacity-55 blur-sm" />
        <span className="absolute bottom-20 right-24 w-7 h-7 rounded-full bg-slate-400 opacity-50 blur-sm" />
        <span className="absolute bottom-1/3 left-1/3 w-11 h-11 rounded-full bg-purple-400 opacity-45 blur-sm" />
        <span className="absolute top-2/3 right-1/3 w-8 h-8 rounded-full bg-indigo-400 opacity-60 blur-sm" />
      </div>

      {/* 브랜드 텍스트 */}
      <div className="relative z-10 space-y-6 max-w-sm">
        {/* 로고 */}
        <div className="flex items-center gap-3">
          <span
            className="text-3xl"
            role="img"
            aria-label="Moodlora 로고"
          >
            🌙
          </span>
          <span className="text-2xl font-bold text-white tracking-tight">
            Moodlora
          </span>
        </div>

        {/* 슬로건 */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white leading-snug">
            감정을 숨기지 않아도
            <br />
            되는 공간
          </h1>
          <p className="text-purple-200 text-base leading-relaxed">
            익명으로 감정을 나누고,
            <br />
            다른 사람의 마음과 연결되세요.
          </p>
        </div>

        {/* 특징 뱃지 */}
        <ul className="space-y-2" aria-label="Moodlora 특징">
          {[
            { emoji: '🔒', text: '철저한 익명성 보장' },
            { emoji: '💜', text: '따뜻한 공감 커뮤니티' },
            { emoji: '✨', text: '감정 시각화 & 기록' },
          ].map(({ emoji, text }) => (
            <li key={text} className="flex items-center gap-2 text-purple-100 text-sm">
              <span role="img" aria-hidden="true">{emoji}</span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── 로그인 카드 내부 컨텐츠 ──────────────────────────────────────────────────
function LoginForm({
  next,
  isLoading,
  loadingProvider,
  onOAuth,
  errorMessage,
}: {
  next: string
  isLoading: boolean
  loadingProvider: OAuthProvider | null
  onOAuth: (provider: OAuthProvider) => Promise<void>
  errorMessage: string | null
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* 인라인 에러 메시지 (toast 대신) */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          <OctagonX className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}
      {/* 로고 + 타이틀 (Desktop에서는 카드 우측에만 표시) */}
      <div className="text-center space-y-1">
        <div
          className="flex justify-center items-center gap-2 mb-3"
          aria-label="Moodlora"
        >
          <span
            className="text-2xl"
            role="img"
            aria-label="Moodlora 로고"
          >
            🌙
          </span>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Moodlora
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">시작하기</h2>
        <p className="text-sm text-gray-500">
          소셜 계정으로 간편하게 가입하세요
        </p>
      </div>

      {/* OAuth 버튼 그룹 */}
      <div className="flex flex-col gap-3">
        {/* Google 로그인 버튼 */}
        <button
          type="button"
          onClick={() => onOAuth('google')}
          disabled={isLoading}
          aria-busy={loadingProvider === 'google'}
          className={cn(
            // 기본 스타일
            'flex items-center justify-center gap-3 w-full h-12 px-4',
            'rounded-xl border border-gray-200 bg-white',
            'text-sm font-medium text-gray-700',
            'shadow-sm transition-all duration-150',
            // 호버/포커스 상태
            'hover:bg-gray-50 hover:border-gray-300 hover:shadow',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
            // 비활성화 상태
            'disabled:opacity-60 disabled:cursor-not-allowed',
          )}
        >
          {loadingProvider === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" aria-hidden="true" />
          ) : (
            <GoogleIcon />
          )}
          <span>Google로 계속하기</span>
        </button>

        {/* Kakao 로그인 버튼 */}
        <button
          type="button"
          onClick={() => onOAuth('kakao')}
          disabled={isLoading}
          aria-busy={loadingProvider === 'kakao'}
          className={cn(
            // 카카오 브랜드 색상
            'flex items-center justify-center gap-3 w-full h-12 px-4',
            'rounded-xl bg-[#FEE500]',
            'text-sm font-medium text-[#191919]',
            'shadow-sm transition-all duration-150',
            // 호버/포커스 상태
            'hover:bg-[#F5DC00] hover:shadow',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2',
            // 비활성화 상태
            'disabled:opacity-60 disabled:cursor-not-allowed',
          )}
        >
          {loadingProvider === 'kakao' ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#191919]/60" aria-hidden="true" />
          ) : (
            <KakaoIcon />
          )}
          <span>카카오로 계속하기</span>
        </button>
      </div>

      {/* 구분선 */}
      <div className="flex items-center gap-3" role="separator" aria-label="또는">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">또는</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 로그인 없이 둘러보기 */}
      <div className="text-center">
        <Link
          href={next}
          className={cn(
            'text-sm text-gray-500',
            'underline underline-offset-4 decoration-gray-300',
            'hover:text-purple-600 hover:decoration-purple-400',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded',
          )}
        >
          로그인 없이 둘러보기
        </Link>
      </div>

      {/* 법적 고지 */}
      <p className="text-center text-xs text-gray-400 leading-relaxed">
        계속 진행하면{' '}
        <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 transition-colors">
          이용약관
        </Link>
        {' '}및{' '}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 transition-colors">
          개인정보처리방침
        </Link>
        에 동의하게 됩니다.
      </p>
    </div>
  )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export function LoginCard({ next, error }: LoginCardProps) {
  const [isLoading, setIsLoading]           = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null)
  const [oauthError, setOauthError]          = useState<string | null>(
    error === 'auth_failed' ? '로그인에 실패했어요. 다시 시도해주세요.' : null
  )

  // OAuth 로그인 핸들러
  async function handleOAuth(provider: OAuthProvider) {
    setIsLoading(true)
    setLoadingProvider(provider)
    setOauthError(null)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? '/feed')}`

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      })

      if (authError) {
        setOauthError('로그인에 실패했어요. 다시 시도해주세요.')
        setIsLoading(false)
        setLoadingProvider(null)
      }
      // 성공 시: 브라우저가 OAuth URL로 리디렉션되므로 로딩 상태 유지
    } catch {
      toast.error('예기치 않은 오류가 발생했어요.')
      setIsLoading(false)
      setLoadingProvider(null)
    }
  }

  const destination = next ?? '/feed'

  return (
    /*
     * 전체 컨테이너
     * Mobile:  단일 열, 중앙 정렬 (flex-1 + justify-center)
     * Desktop: 2분할 그리드 (브랜드 3fr + 카드 2fr)
     */
    <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[3fr_2fr]">
      {/* 브랜드 패널 — Desktop 전용 */}
      <BrandPanel />

      {/*
       * 로그인 카드 영역
       * Mobile:  전체 화면 중앙에 카드 배치
       * Desktop: 우측 패널 내 중앙 배치
       */}
      <div
        className={cn(
          // 공통: 중앙 정렬
          'flex flex-col justify-center items-center',
          // Mobile: 최소 높이 보장, 옅은 보라빛 배경
          'flex-1 px-4 py-12 bg-[#faf8ff]',
          // Desktop: 흰 배경으로 전환
          'lg:bg-white lg:px-12 lg:py-16',
        )}
      >
        {/* 카드 본체 */}
        <div
          className={cn(
            'w-full max-w-sm',
            // Mobile: 흰 카드 스타일
            'bg-white rounded-2xl shadow-md shadow-purple-100/50 p-8 border border-purple-50',
            // Desktop: 카드 테두리/그림자 제거 (우측 패널 자체가 카드 역할)
            'lg:bg-transparent lg:shadow-none lg:border-none lg:p-0',
          )}
          role="main"
          aria-label="로그인"
        >
          <LoginForm
            next={destination}
            isLoading={isLoading}
            loadingProvider={loadingProvider}
            onOAuth={handleOAuth}
            errorMessage={oauthError}
          />
        </div>
      </div>
    </div>
  )
}
