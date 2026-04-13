# Moodlora 개발 가이드라인

## 프로젝트 개요

- **서비스**: 감정 기반 익명 소셜 플랫폼 (7가지 감정으로 피드 분류)
- **스택**: Next.js 16.2.2 (App Router) + Supabase + TailwindCSS v4 + shadcn/ui
- **상태**: create-next-app 스캐폴딩 → 단계적 구현 진행 중
- **참고 문서**: `docs/PLAN.md` (전체 아키텍처·구현 단계), `docs/PRD.md` (요구사항), `docs/ROADMAP.md` (로드맵)

---

## 프로젝트 디렉토리 구조

```
moodlora/
├── app/
│   ├── (onboarding)/welcome/page.tsx   # 감정 선택 온보딩
│   ├── (auth)/login/page.tsx           # Google/Kakao 로그인
│   ├── (auth)/auth/callback/route.ts   # Supabase OAuth 콜백
│   ├── (main)/layout.tsx               # BottomNav + TopBar 포함
│   ├── (main)/feed/page.tsx
│   ├── (main)/posts/new/page.tsx
│   ├── (main)/posts/[id]/page.tsx
│   ├── (main)/search/page.tsx
│   ├── (main)/history/page.tsx
│   ├── (main)/profile/page.tsx
│   ├── (main)/profile/[userId]/page.tsx
│   └── api/                            # Route Handlers
├── components/
│   ├── ui/                             # shadcn 컴포넌트
│   ├── emotion/                        # EmotionPicker, EmotionBadge, EmotionFilter, EmotionChart
│   ├── post/                           # PostCard, PostForm, PostMenu, SituationTagPicker
│   ├── reaction/                       # ReactionBar, ReactionButton
│   ├── comment/                        # CommentList, CommentItem, CommentForm
│   ├── feed/                           # FeedSortTabs, FeedFilterBar, InfiniteFeed
│   ├── layout/                         # Providers, BottomNav, TopBar
│   └── safety/                         # ReportDialog, BlockConfirmDialog
├── lib/
│   ├── supabase/client.ts              # 브라우저 클라이언트
│   ├── supabase/server.ts              # 서버 클라이언트
│   ├── validations/                    # Zod 스키마
│   ├── constants/emotions.ts           # EMOTIONS 상수
│   ├── constants/situationTags.ts      # SITUATION_TAGS 상수
│   └── queries/                        # TanStack Query 훅
├── stores/emotionStore.ts              # Zustand 전역 감정 상태
├── types/database.types.ts             # Supabase 자동 생성 타입
├── hooks/                              # useInfiniteScroll, useCurrentUser
├── supabase/migrations/                # SQL 마이그레이션 파일
└── middleware.ts                       # 세션 갱신 + 라우팅 보호
```

---

## Next.js 16 필수 패턴 (파괴적 변경)

### params / searchParams — 반드시 await

```ts
// ✅ 올바른 패턴
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sort?: string; emotion?: string }>
}) {
  const { id } = await params
  const { sort, emotion } = await searchParams
}

// ✅ Route Handler params — 반드시 await
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
}

// ❌ 금지: params.id 직접 접근 (타입 오류 + 런타임 오류)
```

### cookies() — 반드시 await

```ts
// ✅ 올바른 패턴
import { cookies } from 'next/headers'
const cookieStore = await cookies()

// ❌ 금지: const cookieStore = cookies()
```

---

## Supabase 클라이언트 패턴

### 서버/클라이언트 분리 — 절대 혼용 금지

| 사용 위치 | import 경로 |
|---|---|
| 클라이언트 컴포넌트 (`'use client'`) | `@/lib/supabase/client` |
| 서버 컴포넌트, Route Handler, middleware | `@/lib/supabase/server` |

### lib/supabase/server.ts 패턴

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### lib/supabase/client.ts 패턴

```ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

### 인증 확인 — getUser() 사용

```ts
// ✅ 올바른 패턴 (서버 검증)
const { data: { user } } = await supabase.auth.getUser()

// ❌ 금지: getSession() 단독 사용 (클라이언트 캐시 기반, 서버에서 신뢰 불가)
```

---

## shadcn/ui 컴포넌트 사용 규칙

### radix-ui import — 패키지명 주의

```ts
// ✅ 올바른 패턴 (이 프로젝트의 radix-ui 설치 방식)
import { Slot } from 'radix-ui'
const Comp = asChild ? Slot.Root : 'button'

// ❌ 금지: import { Slot } from '@radix-ui/react-slot'
```

### 새 shadcn 컴포넌트 추가

- `npx shadcn@latest add <component>` 명령으로만 추가
- 생성된 파일은 `components/ui/` 에 위치
- 기존 `components/ui/button.tsx` 스타일 패턴 참고

---

## TailwindCSS v4 사용 규칙

- CSS 변수 기반 테마 시스템 사용 (`globals.css`의 `@theme` 블록)
- `tailwind.config.js` 파일 없음 — `postcss.config.mjs` + `@tailwindcss/postcss` 사용
- `@apply` 사용 최소화, CSS 레이어 (`@layer`) 활용
- `cn()` 유틸 (`lib/utils.ts`) 항상 사용하여 클래스 병합

---

## TanStack Query v5 사용 규칙

### useInfiniteQuery — initialPageParam 필수

```ts
// ✅ 올바른 패턴
useInfiniteQuery({
  queryKey: ['posts', filters],
  queryFn: ({ pageParam }) => fetchPosts({ ...filters, cursor: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: undefined,  // ← v5 필수
  staleTime: 60_000,
})

// ❌ 금지: initialPageParam 누락
```

### QueryClient 설정

- `components/layout/Providers.tsx`에서만 QueryClient 초기화
- `app/layout.tsx`에서 Providers 래핑
- `QueryClientProvider` + `ReactQueryDevtools` 함께 등록

---

## Zustand 스토어 규칙

- 스토어 파일: `stores/` 디렉토리에만 위치
- 현재 감정 상태: `stores/emotionStore.ts`의 `useEmotionStore` 훅만 사용
- persist 미들웨어 key: `'moodlora-emotion'` (변경 금지)
- 새 전역 상태 추가 시 별도 스토어 파일 생성

---

## Zod v4 + react-hook-form 사용 규칙

```ts
// ✅ 올바른 패턴
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const schema = z.object({ ... })
type FormData = z.infer<typeof schema>
const form = useForm<FormData>({ resolver: zodResolver(schema) })
```

- 모든 Zod 스키마: `lib/validations/` 에 위치
- 게시글: `lib/validations/post.ts`, 댓글: `lib/validations/comment.ts`, 신고: `lib/validations/report.ts`

---

## 감정(Emotion) 관련 규칙

### EMOTIONS 상수 — 단일 소스

```ts
// lib/constants/emotions.ts — 이 파일만 수정
export const EMOTIONS = {
  JOY:        { label: '기쁨',   emoji: '😊', color: 'amber' },
  EXCITEMENT: { label: '설렘',   emoji: '✨', color: 'pink' },
  CALM:       { label: '평온',   emoji: '😌', color: 'sky' },
  SADNESS:    { label: '슬픔',   emoji: '😢', color: 'blue' },
  ANGER:      { label: '분노',   emoji: '😤', color: 'red' },
  LETHARGY:   { label: '무기력', emoji: '😶', color: 'slate' },
  ANXIETY:    { label: '불안',   emoji: '😰', color: 'purple' },
} as const

export type EmotionType = keyof typeof EMOTIONS
```

- DB의 `emotion_type` ENUM과 EMOTIONS 키 항상 동일하게 유지
- 감정 표시 UI: `EmotionBadge` 컴포넌트 재사용
- 감정 선택 UI: `EmotionPicker` 컴포넌트 재사용
- 하드코딩된 감정 문자열 사용 금지 — `EmotionType` 타입 및 `EMOTIONS` 상수 사용

---

## DB 타입 사용 규칙

- `types/database.types.ts`: `supabase gen types typescript` 자동 생성 파일
- **직접 수정 금지** — Supabase 스키마 변경 후 재생성
- 컴포넌트/훅에서 DB 타입 사용: `import type { Database } from '@/types/database.types'`
- 비즈니스 로직 타입은 별도 인터페이스로 정의 후 DB 타입과 분리

---

## API Route Handler 규칙

- 위치: `app/api/` 하위
- 인증 필요 엔드포인트: 항상 `supabase.auth.getUser()` 로 검증
- 응답 형식: `Response.json()` 사용
- 에러 응답: `{ error: string }` + 적절한 HTTP 상태코드
- 서버 클라이언트만 사용: `@/lib/supabase/server`

```ts
// ✅ Route Handler 패턴
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  // ...
}
```

---

## Middleware 규칙

- `middleware.ts`: 프로젝트 루트에 위치
- Supabase 세션 쿠키 갱신 항상 최우선 실행
- 보호 경로: `/posts/new`, `/profile`, `/history`
- 감정 미선택 시: `/welcome` 리다이렉트 (쿠키 `emotion_selected` 확인)
- `matcher`: API 라우트, 정적 파일 경로 제외

---

## 파일 동시 수정 규칙

| 수정 대상 | 함께 수정해야 할 파일 |
|---|---|
| DB 스키마 (`supabase/migrations/`) | `types/database.types.ts` 재생성 |
| `lib/constants/emotions.ts` | DB enum, Zod 스키마 (`lib/validations/post.ts`) |
| `components/layout/Providers.tsx` | `app/layout.tsx` (Providers 래핑 확인) |
| 새 shadcn 컴포넌트 추가 | `components.json` (자동 업데이트됨) |
| 새 API Route 추가 | 대응하는 `lib/queries/` 훅 파일 |

---

## 금지 사항

- **`cookies()` await 생략** — Next.js 16에서 반드시 await 필요
- **`params`/`searchParams` await 생략** — Next.js 16 파괴적 변경
- **`@radix-ui/react-*` 직접 import** — `radix-ui` 패키지 사용
- **서버 컴포넌트에서 `lib/supabase/client` 사용** — 서버는 `lib/supabase/server` 전용
- **`getSession()` 서버 검증 단독 사용** — 반드시 `getUser()` 사용
- **`types/database.types.ts` 직접 편집** — 자동 생성 파일
- **EMOTIONS 상수 외 감정 문자열 하드코딩** — 타입 안전성 파괴
- **`initialPageParam` 없는 `useInfiniteQuery`** — v5 필수 필드
- **`tailwind.config.js` 생성** — v4는 postcss 방식 사용
- **`components/ui/` 외 디렉토리에 shadcn 컴포넌트 직접 생성**
- **`.env.local` 커밋** — 환경 변수 파일은 항상 gitignore
