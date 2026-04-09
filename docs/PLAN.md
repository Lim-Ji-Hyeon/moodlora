# Moodlora 구현 플랜

## Context

감정 기반 익명 소셜 플랫폼 "moodlora"를 처음부터 구현한다.
현재 프로젝트는 create-next-app 스캐폴딩 상태 (Next.js 16.2.2, shadcn Button 1개만 존재).
사용자가 자신의 감정을 선택하고, 같은 감정을 가진 사람들의 글을 읽고 공감하는 서비스.

**핵심 기술 결정:**
- Supabase: DB (PostgreSQL) + Auth (Google + Kakao OAuth) 통합
- NextAuth 제거 → `@supabase/ssr` 패턴으로 대체
- Prisma 제거 → Supabase JS 클라이언트 + 자동 생성 TypeScript 타입 사용

---

## 기술 스택

| 역할 | 라이브러리 |
|---|---|
| 프레임워크 | Next.js 16.2.2 (App Router) |
| 데이터베이스 | Supabase PostgreSQL |
| 인증 | Supabase Auth (Google, Kakao OAuth) |
| DB 클라이언트 | `@supabase/supabase-js` + `@supabase/ssr` |
| 서버 상태 | `@tanstack/react-query` |
| 폼 | `react-hook-form` + `zod` + `@hookform/resolvers` |
| 전역 상태 | `zustand` (현재 감정) |
| 차트 | `recharts` |
| UI | shadcn/ui, lucide-react, TailwindCSS v4 |

---

## 패키지 설치

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install react-hook-form @hookform/resolvers zod
npm install zustand recharts
```

---

## 데이터베이스 스키마 (Supabase SQL)

`supabase/migrations/001_initial.sql` 에 정의:

```sql
-- 감정 타입
CREATE TYPE emotion_type AS ENUM (
  'JOY', 'EXCITEMENT', 'CALM', 'SADNESS', 'ANGER', 'LETHARGY', 'ANXIETY'
);

-- 공감 반응 타입
CREATE TYPE reaction_type AS ENUM (
  'ME_TOO', 'UNDERSTOOD', 'CHEER_UP', 'EMPATHY'
);

-- 신고 사유
CREATE TYPE report_reason AS ENUM (
  'SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FALSE_INFORMATION', 'OTHER'
);

-- 프로필 (auth.users 확장)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 상황 태그
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL  -- '직장', '연애', '가족', '건강', '학업', '친구', '자기계발', '기타'
);

-- 게시글
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  emotion emotion_type NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 게시글-태그 (M:N)
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 공감 반응
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, user_id, type)  -- 같은 타입 중복 불가
);

-- 댓글 (대댓글: parent_id 자기 참조)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 감정 기록
CREATE TABLE emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emotion emotion_type NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 신고
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  reason report_reason NOT NULL,
  description TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 게시글 숨기기
CREATE TABLE hidden_posts (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- 유저 차단
CREATE TABLE blocks (
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- 인덱스
CREATE INDEX idx_posts_emotion ON posts(emotion);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_emotion_logs_user ON emotion_logs(user_id, created_at DESC);

-- auth.users 신규 등록 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

RLS (Row Level Security) 정책은 각 테이블에 별도 마이그레이션 파일로 정의.

---

## 폴더/파일 구조

```
moodlora/
├── app/
│   ├── layout.tsx                    # Providers 래핑, lang="ko"
│   ├── page.tsx                      # / → 쿠키 확인 후 /welcome 또는 /feed 리다이렉트
│   ├── globals.css
│   │
│   ├── (onboarding)/
│   │   └── welcome/
│   │       └── page.tsx              # 감정 선택 온보딩
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx            # Google/Kakao 로그인 + 익명 진입
│   │   └── auth/callback/route.ts    # Supabase OAuth 콜백 핸들러
│   │
│   ├── (main)/
│   │   ├── layout.tsx                # BottomNav + TopBar
│   │   ├── feed/
│   │   │   ├── page.tsx              # 피드 (searchParams await)
│   │   │   └── loading.tsx
│   │   ├── posts/
│   │   │   ├── new/page.tsx          # 게시글 작성
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # 상세 (params await)
│   │   │       └── loading.tsx
│   │   ├── search/page.tsx           # 검색 (searchParams await)
│   │   ├── history/page.tsx          # 감정 히스토리
│   │   └── profile/
│   │       ├── page.tsx              # 내 프로필
│   │       └── [userId]/page.tsx     # 타인 프로필
│   │
│   └── api/
│       ├── posts/
│       │   ├── route.ts              # GET(목록) POST(작성)
│       │   └── [id]/
│       │       ├── route.ts          # GET(상세) DELETE
│       │       ├── reactions/route.ts
│       │       └── comments/route.ts
│       ├── emotions/
│       │   ├── route.ts              # POST(기록)
│       │   └── history/route.ts      # GET(히스토리)
│       ├── recommendations/route.ts  # GET(추천)
│       ├── search/route.ts           # GET(검색)
│       └── safety/
│           ├── report/route.ts
│           ├── hide/route.ts
│           └── block/route.ts
│
├── components/
│   ├── ui/                           # shadcn 컴포넌트 (필요시 추가)
│   ├── emotion/
│   │   ├── EmotionPicker.tsx         # 7가지 감정 선택 카드 UI
│   │   ├── EmotionBadge.tsx          # 감정 배지 (색상+이모지)
│   │   ├── EmotionFilter.tsx         # 피드 필터바 감정 선택
│   │   └── EmotionChart.tsx          # recharts AreaChart
│   ├── post/
│   │   ├── PostCard.tsx              # 피드 카드
│   │   ├── PostForm.tsx              # 3단계 다단계 폼
│   │   ├── PostMenu.tsx              # 신고/숨기기/차단 드롭다운
│   │   └── SituationTagPicker.tsx    # 상황 태그 다중 선택
│   ├── reaction/
│   │   ├── ReactionBar.tsx           # 4종 공감 버튼 모음
│   │   └── ReactionButton.tsx        # 개별 공감 (토글 애니메이션)
│   ├── comment/
│   │   ├── CommentList.tsx
│   │   ├── CommentItem.tsx           # 대댓글 포함
│   │   └── CommentForm.tsx
│   ├── feed/
│   │   ├── FeedSortTabs.tsx          # 최신/인기 탭
│   │   ├── FeedFilterBar.tsx         # 감정 + 태그 필터
│   │   └── InfiniteFeed.tsx          # 무한 스크롤 래퍼
│   ├── layout/
│   │   ├── Providers.tsx             # QueryClient + Zustand 초기화
│   │   ├── BottomNav.tsx
│   │   └── TopBar.tsx
│   └── safety/
│       ├── ReportDialog.tsx
│       └── BlockConfirmDialog.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # createBrowserClient (클라이언트용)
│   │   └── server.ts                 # createServerClient (서버용)
│   ├── validations/
│   │   ├── post.ts                   # Zod: 게시글
│   │   ├── comment.ts                # Zod: 댓글
│   │   └── report.ts                 # Zod: 신고
│   ├── constants/
│   │   ├── emotions.ts               # EMOTIONS 상수
│   │   └── situationTags.ts          # SITUATION_TAGS 상수
│   ├── queries/
│   │   ├── posts.ts                  # TanStack Query 훅
│   │   ├── comments.ts
│   │   ├── emotions.ts
│   │   └── recommendations.ts
│   └── utils.ts                      # 기존 cn 유틸
│
├── stores/
│   └── emotionStore.ts               # Zustand (현재 감정 + persist)
│
├── types/
│   └── database.types.ts             # supabase gen types 자동 생성
│
├── hooks/
│   ├── useInfiniteScroll.ts
│   └── useCurrentUser.ts
│
├── supabase/
│   └── migrations/
│       ├── 001_initial.sql
│       └── 002_rls_policies.sql
│
├── middleware.ts                      # 감정 선택 체크 + 보호 라우트
└── .env.local                        # Supabase 환경 변수
```

---

## 핵심 구현 패턴

### Supabase 클라이언트 초기화

**`lib/supabase/client.ts`** (클라이언트 컴포넌트용):
```ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

**`lib/supabase/server.ts`** (서버 컴포넌트/Route Handler용):
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()  // Next.js 16: await 필수
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

### Next.js 16 필수 패턴

```ts
// page.tsx - params, searchParams 반드시 await
export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sort?: string; emotion?: string }>
}) {
  const { id } = await params
  const { sort, emotion } = await searchParams
}

// Route Handler - params 반드시 await
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
}
```

### Middleware (세션 갱신 + 라우팅)

```ts
// middleware.ts
export async function middleware(request: NextRequest) {
  // Supabase 세션 쿠키 갱신 (SSR 필수)
  const supabaseResponse = await updateSession(request)

  const emotionCookie = request.cookies.get('emotion_selected')
  if (!emotionCookie && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  // 보호 경로 (로그인 필요)
  const protectedPaths = ['/posts/new', '/profile', '/history']
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
```

### 감정 상수

**`lib/constants/emotions.ts`**:
```ts
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

**`lib/constants/situationTags.ts`**:
```ts
export const SITUATION_TAGS = [
  '직장', '연애', '가족', '건강', '학업', '친구', '자기계발', '기타'
] as const
```

### Zustand 감정 스토어

**`stores/emotionStore.ts`**:
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EmotionType } from '@/lib/constants/emotions'

interface EmotionStore {
  currentEmotion: EmotionType | null
  setCurrentEmotion: (e: EmotionType) => void
}

export const useEmotionStore = create<EmotionStore>()(
  persist(
    (set) => ({
      currentEmotion: null,
      setCurrentEmotion: (e) => set({ currentEmotion: e }),
    }),
    { name: 'moodlora-emotion' }
  )
)
```

### Zod 스키마 (게시글)

**`lib/validations/post.ts`**:
```ts
export const postSchema = z.object({
  emotion: z.enum(['JOY','EXCITEMENT','CALM','SADNESS','ANGER','LETHARGY','ANXIETY']),
  tags: z.array(z.string()).min(1, '태그를 1개 이상 선택해주세요').max(5),
  content: z.string().min(10, '10자 이상 작성해주세요').max(1000),
  isAnonymous: z.boolean().default(false),
})
```

### TanStack Query 피드 훅 (무한 스크롤)

**`lib/queries/posts.ts`**:
```ts
export const usePosts = (filters: FeedFilters) =>
  useInfiniteQuery({
    queryKey: ['posts', filters],
    queryFn: ({ pageParam }) => fetchPosts({ ...filters, cursor: pageParam }),
    getNextPageParam: (last) => last.nextCursor,
    initialPageParam: undefined,
    staleTime: 60_000,
  })
```

---

## 구현 단계

### Phase 1 — 기반 설정 (패키지, Supabase, 상수)
1. 패키지 설치
2. Supabase 프로젝트 생성 → `.env.local` 환경 변수 설정
3. `supabase/migrations/001_initial.sql` 실행 (Supabase 대시보드 SQL Editor)
4. `npx supabase gen types typescript --project-id <id>` → `types/database.types.ts` 생성
5. `lib/supabase/client.ts`, `lib/supabase/server.ts` 작성
6. `lib/constants/emotions.ts`, `lib/constants/situationTags.ts`
7. `stores/emotionStore.ts` (Zustand + persist)
8. `components/layout/Providers.tsx` (QueryClient)
9. `app/layout.tsx` 수정 — Providers 래핑, `lang="ko"`

### Phase 2 — 인증 시스템
1. Supabase 대시보드 → Authentication → Providers: Google + Kakao OAuth 설정
2. `app/(auth)/login/page.tsx` — 소셜 로그인 버튼
3. `app/auth/callback/route.ts` — Supabase OAuth 콜백 처리
4. `middleware.ts` — 세션 갱신 + 감정 선택/보호 라우팅
5. `hooks/useCurrentUser.ts`

### Phase 3 — 온보딩 (감정 선택)
1. `components/emotion/EmotionPicker.tsx` — 7가지 감정 카드 선택 UI
2. `components/emotion/EmotionBadge.tsx`
3. `app/(onboarding)/welcome/page.tsx` — 감정 선택 후 쿠키 저장 + `/feed` 이동
4. `app/page.tsx` — 쿠키 확인 후 리다이렉트

### Phase 4 — 피드 핵심
1. `app/api/posts/route.ts` — GET (정렬/감정/태그 필터, 커서 페이지네이션)
2. `lib/queries/posts.ts` — `useInfiniteQuery` 훅
3. `components/emotion/EmotionFilter.tsx`
4. `components/feed/FeedSortTabs.tsx`, `FeedFilterBar.tsx`
5. `components/post/PostCard.tsx`
6. `components/feed/InfiniteFeed.tsx`
7. `app/(main)/feed/page.tsx`
8. `app/(main)/layout.tsx` — BottomNav 포함

### Phase 5 — 게시글 작성
1. `lib/validations/post.ts` (Zod 스키마)
2. `app/api/posts/route.ts` — POST 추가
3. `components/post/SituationTagPicker.tsx`
4. `components/post/PostForm.tsx` — 3단계 폼 (감정 → 태그 → 작성)
5. `app/(main)/posts/new/page.tsx`

### Phase 6 — 게시글 상세 + 공감 + 댓글
1. `app/api/posts/[id]/route.ts` — GET 상세
2. `app/api/posts/[id]/reactions/route.ts` — POST 토글 (이미 있으면 삭제)
3. `app/api/posts/[id]/comments/route.ts` — GET/POST
4. `components/reaction/ReactionButton.tsx`, `ReactionBar.tsx`
5. `components/comment/CommentForm.tsx`, `CommentItem.tsx`, `CommentList.tsx`
6. `app/(main)/posts/[id]/page.tsx`

### Phase 7 — 감정 히스토리
1. `app/api/emotions/route.ts` — POST (감정 기록)
2. `app/api/emotions/history/route.ts` — GET (기간별 히스토리)
3. `components/emotion/EmotionChart.tsx` — recharts AreaChart
4. `app/(main)/history/page.tsx`

### Phase 8 — 검색
1. `app/api/search/route.ts` — Supabase `ilike` 검색
2. `app/(main)/search/page.tsx`

### Phase 9 — 추천 시스템
1. `app/api/recommendations/route.ts`
   - 같은 감정 글 → 최근 인기순
   - 보완 감정 글 (불안→평온, 슬픔→기쁨/설렘)
2. 피드 하단 추천 섹션 컴포넌트

### Phase 10 — 안전 기능
1. `app/api/safety/report/route.ts`, `hide/route.ts`, `block/route.ts`
2. `components/post/PostMenu.tsx` — 드롭다운 (신고/숨기기/차단)
3. `components/safety/ReportDialog.tsx`, `BlockConfirmDialog.tsx`
4. 피드 GET에서 숨김/차단 게시글 필터링

### Phase 11 — 프로필 + 마무리
1. `app/(main)/profile/page.tsx` — 내 게시글, 닉네임 수정
2. `app/(main)/profile/[userId]/page.tsx`
3. 스켈레톤 로딩, 에러 바운더리, 토스트 알림 전체 적용

---

## 환경 변수

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # 관리자 API용 (안전 기능)
```

---

## 검증 방법

1. **온보딩**: 쿠키 삭제 후 접속 → `/welcome` 자동 이동, 감정 선택 후 `/feed` 이동 확인
2. **인증**: Google/Kakao 로그인 → 세션 유지 → `profiles` 테이블 자동 생성 확인
3. **피드**: 감정/태그 필터 변경 시 URL 업데이트, 스크롤 시 추가 로드 확인
4. **공감**: 로그인 상태에서 반응 클릭 → 토글 작동, 반응 수 즉시 반영 (낙관적 업데이트)
5. **댓글**: 익명 댓글 작성 → "익명" 표시 확인
6. **차단**: 차단 후 피드 새로고침 → 해당 유저 글 사라짐 확인
7. **히스토리**: 감정 선택/글 작성마다 `emotion_logs` 기록 확인 → 차트 반영

---

## Critical Files

| 파일 | 역할 |
|---|---|
| `supabase/migrations/001_initial.sql` | 전체 DB 스키마 정의 |
| `lib/supabase/server.ts` | 서버 컴포넌트/API에서 Supabase 접근 핵심 |
| `middleware.ts` | 세션 갱신 + 감정 온보딩 라우팅 |
| `app/(main)/feed/page.tsx` | `searchParams` await 패턴 + 피드 렌더링 |
| `components/post/PostForm.tsx` | 3단계 감정 중심 작성 폼 |
| `components/layout/Providers.tsx` | QueryClient 전역 초기화 |
| `stores/emotionStore.ts` | 현재 감정 전역 상태 (피드·추천·히스토리 연동) |
