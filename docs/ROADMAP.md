# Moodlora 프로젝트 로드맵

> **버전**: 1.0.0 | **작성일**: 2026-04-09 | **기반 문서**: PRD v1.1.0
> **개발자**: jihyeonlim (1인 개발) | **예상 총 기간**: 8~10주

---

## 개요

### 프로젝트 비전

감정을 숨기지 않아도 되는 공간. 같은 마음을 가진 누군가와 연결되는 경험을 제공하는 **감정 기반 익명 소셜 플랫폼**.

### 핵심 성공 지표 (KPI)

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 피드 초기 로드 | 1,500ms 이하 (p95) | Supabase Query 실행 시간 |
| 무한 스크롤 추가 로드 | 800ms 이하 (p95) | TanStack Query devtools |
| LCP | 2,500ms 이하 | Core Web Vitals |
| 동시 접속 | 500명 세션 처리 | Supabase Free Tier 범위 |

### 전체 타임라인 요약

```
Phase 1: 애플리케이션 골격 (2주)     ████████░░░░░░░░░░░░  
Phase 2: UI/UX 구현 (2주)            ░░░░░░░░████████░░░░░░  
Phase 3: 핵심 기능 (3주)             ░░░░░░░░░░░░░░░░████████████  
Phase 4: 고급 기능 + QA (2~3주)      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████
```

---

## 기술 스택

| 역할 | 기술 | 선택 이유 |
|------|------|-----------|
| 프레임워크 | Next.js 16.2.2 (App Router) | SSR/SSG 지원, `params`/`searchParams` **반드시 `await` 필요** |
| UI | React 19 + TailwindCSS v4 + shadcn/ui | 모바일 우선 반응형, 일관된 디자인 시스템 |
| 데이터베이스 | Supabase PostgreSQL | RLS 기반 접근 제어, 1인 개발 복잡도 감소 |
| 인증 | Supabase Auth (`@supabase/ssr`) | DB와 인증 통합, Google + Kakao OAuth |
| 서버 상태 | TanStack Query v5 | 캐싱, 무한 스크롤, 낙관적 업데이트 |
| 클라이언트 상태 | Zustand (+ persist) | 감정 상태 전역 관리, 새로고침 유지 |
| 폼 관리 | react-hook-form + Zod + @hookform/resolvers | 3단계 폼 검증 |
| 차트 | Recharts | 감정 히스토리 AreaChart |

### 기술 특이사항

> **Next.js 16.2.2 Breaking Change**: 동적 라우트의 `params`와 `searchParams`는 반드시 `await`해야 한다. 모든 서버 컴포넌트 및 Route Handler에서 이 패턴을 준수해야 한다.

> **sonner 버전 고정**: sonner v2.x는 React 19 + Next.js 16 App Router 환경에서 `createPortal` 포털 렌더링 이슈가 있어 **v1.7.4로 고정**. 향후 sonner 공식 지원 시 재업그레이드 검토.

> **hydration mismatch 방지**: `app/layout.tsx`의 `<html>` 태그에 `suppressHydrationWarning` 적용. next-themes 등 클라이언트 측 className 변경으로 인한 불일치 억제.

> **에러 표시 방식**: toast 대신 `role="alert"` 인라인 배너 사용 (OAuth 콜백 실패, 로그인 에러 등). sonner 포털 이슈 우회.

```typescript
// 올바른 패턴
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// Route Handler
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

---

## UI 화면 설계

Stitch MCP로 제작된 반응형 프로토타입을 기반으로 개발한다.

- **Stitch 프로젝트 ID**: `706293808131804710`
- **디자인 시스템**: `assets/12305768813800255499` (라이트 모드 기본, 다크모드 토글 포함)

### 화면별 반응형 버전 (총 21개)

| # | 라우트 | 화면명 | Mobile | Tablet | Desktop | Phase | 우선순위 |
|---|--------|--------|:------:|:------:|:-------:|-------|---------|
| 1 | `/welcome` | 감정 온보딩 | ✅ | ✅ | ✅ | 2 | P0 |
| 2 | `/login` | 로그인 | ✅ | — | ✅ | 2 | P0 |
| 3 | `/feed` | 피드 메인 | ✅ | ✅ | ✅ | 2 | P0 |
| 4 | `/posts/new` Step 1 | 게시글 작성 — 감정 선택 | ✅ | — | — | 3 | P0 |
| 5 | `/posts/new` Step 2 | 게시글 작성 — 상황 태그 | ✅ | — | — | 3 | P0 |
| 6 | `/posts/new` Step 3 | 게시글 작성 — 본문 입력 | ✅ | — | — | 3 | P0 |
| 7 | `/posts/[id]` | 게시글 상세 + 공감 + 댓글 | ✅ | ✅ | ✅ | 3 | P1 |
| 8 | `/history` | 감정 히스토리 차트 | ✅ | — | ✅ | 3 | P1 |
| 9 | `/search` | 검색 | ✅ | — | ✅ | 3 | P1 |
| 10 | `/profile` | 내 프로필 | ✅ | — | ✅ | 4 | P1 |
| 11 | `/profile/[userId]` | 타인 프로필 | ✅ | — | — | 4 | P1 |

> Tablet(—) 화면은 Mobile 레이아웃이 확장되거나 Desktop 레이아웃을 그대로 적용한다.

### 반응형 브레이크포인트

| 구분 | 범위 | 레이아웃 전략 |
|------|------|--------------|
| Mobile | 375px ~ 767px | 단일 컬럼, 하단 탭바, 중앙 FAB |
| Tablet | 768px ~ 1279px | 2컬럼 (사이드바 + 메인), 피드·게시글 상세·온보딩만 별도 설계 |
| Desktop | 1280px~ | 2~3컬럼 풀 레이아웃, 좌측 고정 사이드바 |

---

## 마일스톤 개요

| Phase | 이름 | 기간 | PRD 매핑 | 릴리즈 |
|-------|------|------|----------|--------|
| Phase 1 | 애플리케이션 골격 | 2주 | PRD Phase 1~2 | - |
| Phase 2 | UI/UX 구현 | 2주 | PRD Phase 3~4 | Alpha 내부 테스트 |
| Phase 3 | 핵심 기능 | 3주 | PRD Phase 5~8 | Beta 제한 공개 |
| Phase 4 | 고급 기능 + QA | 2~3주 | PRD Phase 9~11 | v1.0 공개 출시 |

---

## 상세 마일스톤

---

### Phase 1: 애플리케이션 골격 (2주)

**목표**: Supabase 연결, 인증 시스템, 전역 상태 관리, 공통 레이아웃 등 전체 애플리케이션의 기반 인프라를 구축한다.

**완료 기준**: Supabase 연결 확인, 소셜 로그인 후 profiles 자동 생성 확인, 감정 상수 및 Zustand 스토어 정상 작동 확인.

**PRD 매핑**: FR-01(일부), FR-02

---

#### Task 1.1: Supabase 프로젝트 설정 및 DB 스키마 구축

**담당**: 풀스택 | **예상**: 2일

- [x] Supabase 프로젝트 생성 및 환경변수 설정 (`.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 구성)
- [x] 커스텀 ENUM 타입 생성 (`emotion_type`, `reaction_type`, `report_reason`)
- [x] 핵심 테이블 생성: `profiles`, `posts`, `tags`, `post_tags`, `reactions`, `comments`, `emotion_logs`
- [x] 안전 기능 테이블 생성: `reports`, `hidden_posts`, `blocks`
- [x] 주요 인덱스 생성 (`idx_posts_emotion`, `idx_posts_created_at`, `idx_comments_post_id`, `idx_reactions_post_id`, `idx_emotion_logs_user`)
- [x] RLS 정책 설정 (PRD 6-2 테이블별 RLS 정책 적용)
- [x] `auth.users` INSERT 트리거로 `profiles` 자동 생성 함수 작성
- [x] `emotion_type` ENUM에 `LONELINESS` 추가 (마이그레이션 `004_add_loneliness_emotion`)
- [x] TypeScript DB 타입 재생성 (`types/database.types.ts` 동기화)

---

#### Task 1.2: Supabase 클라이언트 유틸리티 구성

**담당**: 풀스택 | **예상**: 1일

- [x] 서버 컴포넌트용 Supabase 클라이언트 생성 (`@supabase/ssr` 활용, 쿠키 기반 세션)
- [x] 클라이언트 컴포넌트용 Supabase 브라우저 클라이언트 생성
- [x] Route Handler용 Supabase 클라이언트 생성 (`SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용)
- [x] Supabase TypeScript 타입 자동 생성 설정 (`supabase gen types`)

---

#### Task 1.3: 감정 상수 및 타입 정의

**담당**: 풀스택 | **예상**: 1일

- [x] 8가지 감정 상수 정의 (`EMOTIONS` 배열: key, label, emoji, color 포함) — 외로움(LONELINESS/indigo) 추가
- [x] 8종 상황 태그 상수 정의 (`TAGS`: 직장, 연애, 가족, 건강, 학업, 친구, 자기계발, 기타)
- [x] 4종 공감 반응 상수 정의 (`REACTIONS`: ME_TOO, SAD, ANGRY, CHEER_UP)
- [x] 보완 감정 매핑 상수 정의 (`COMPLEMENTARY_EMOTIONS`: ANXIETY->CALM, SADNESS->JOY/EXCITEMENT, ANGER->CALM, LONELINESS->JOY/EXCITEMENT)
- [x] 전역 TypeScript 타입 정의 (`Post`, `Comment`, `Reaction`, `EmotionLog`, `Profile` 등)

---

#### Task 1.4: Zustand 스토어 설정

**담당**: 풀스택 | **예상**: 1일

- [x] 감정 스토어 생성 (현재 선택 감정 상태, persist 미들웨어로 localStorage 영속화)
- [x] 감정 선택/변경/초기화 액션 정의
- [x] `emotion_selected` 쿠키 동기화 로직 (Zustand 상태 변경 시 쿠키도 함께 업데이트)

---

#### Task 1.5: 인증 시스템 구현 (Google/Kakao OAuth)

**담당**: 풀스택 | **예상**: 2일

- [x] Supabase 대시보드에서 Google OAuth Provider 설정
- [x] Supabase 대시보드에서 Kakao OAuth Provider 설정 (개발 단계: 테스터 계정)
<!-- 대시보드 설정은 수동 작업 필요. Redirect URI: https://zhvcwvbityltywbjulca.supabase.co/auth/v1/callback -->
- [x] `/auth/callback` Route Handler 구현 (OAuth 토큰 처리, 세션 쿠키 설정)
- [x] `useCurrentUser` 커스텀 훅 구현 (현재 로그인 사용자 정보 조회)
- [x] Playwright MCP 테스트: OAuth 콜백 처리 및 세션 생성 확인

---

#### Task 1.6: Middleware 및 라우팅 보호

**담당**: 풀스택 | **예상**: 1일

- [x] Next.js Middleware 구현: Supabase 세션 갱신 처리
- [x] `emotion_selected` 쿠키 미존재 시 `/` -> `/welcome` 리다이렉트
- [x] 보호 경로 정의: `/posts/new`, `/profile`, `/history` 접근 시 미인증 사용자 `/login` 리다이렉트
- [x] 비로그인 상태에서 `/feed`, `/posts/[id]` 읽기 전용 접근 허용

---

#### Task 1.7: 공통 Providers 및 레이아웃 설정

**담당**: 풀스택 | **예상**: 2일

- [x] TanStack Query Provider 구성 (`QueryClientProvider`, `ReactQueryDevtools`)
- [x] 전역 레이아웃 구성 (`app/layout.tsx`: 메타데이터, `lang="ko"`, Provider 래핑)
- [x] shadcn/ui 초기 설정 및 공통 컴포넌트 설치 (Button, Card, Dialog, Toast, Skeleton, Input, Textarea 등)
- [x] 공통 Header/Navigation 컴포넌트 구현 (감정 상태 표시, 로그인/로그아웃 버튼)
- [x] Toast 알림 시스템 설정 (비로그인 상태 공감/글 작성 시도 시 로그인 유도 토스트)
- [x] 반응형 레이아웃 기본 구조 (모바일 우선, 375px 최소 뷰포트, 768px 이상 데스크탑 보정)
- [x] Moodlora 디자인 시스템 CSS 변수 정의 (`globals.css`: 컬러 팔레트, 감정 토큰, 다크모드, radius)
- [x] 폰트 Plus Jakarta Sans 적용 (Stitch 디자인 시스템 기준)
- [x] `EMOTION_STYLES` Tailwind 정적 클래스 맵 정의 (`lib/constants/emotions.ts`)

---

### Phase 2: UI/UX 구현 (2주)

**목표**: 감정 온보딩 플로우와 피드 페이지의 UI/UX를 완성하여, 사용자가 감정을 선택하고 피드를 탐색할 수 있는 핵심 경험을 구현한다.

**완료 기준**: 감정 선택 후 `/feed` 이동 E2E 확인, 피드에서 감정/태그 필터 변경 및 무한 스크롤 동작 확인.

**PRD 매핑**: FR-01, FR-03

---

#### Task 2.1: 감정 온보딩 페이지 (`/welcome`)

**담당**: 풀스택 | **예상**: 2일

- [x] `/welcome` 페이지 서버 컴포넌트 구현 (이미 감정 선택된 경우 `/feed` 리다이렉트)
- [x] `EmotionPicker` 클라이언트 컴포넌트 구현 (8가지 감정 카드: 감정명, 이모지, 색상 표시)
- [x] 감정 카드 선택 시 Zustand 스토어 업데이트 + 쿠키 저장 + `/feed` 라우팅
- [x] 키보드 내비게이션 지원 (감정 카드 Tab/Enter 접근)
- [x] 색각이상자 고려: 이모지 병기로 색상 외 구분 수단 제공
- [x] **반응형**: Mobile(2열 그리드) / Tablet(3~4열 가로 배치) / Desktop(7개 가로 한 줄 or 4+3 배치)

---

#### Task 2.2: 로그인 페이지 (`/login`)

**담당**: 풀스택 | **예상**: 1일

- [x] `/login` 페이지 구현 (Google / Kakao 로그인 버튼 노출)
- [x] 로그인 성공 후 이전 페이지 또는 `/feed`로 리다이렉트 (`?next=` 파라미터 → `/auth/callback` 연동)
- [x] 비로그인 탐색 안내 메시지 ("로그인 없이 둘러보기" 링크)
- [x] **반응형**: Mobile(단일 컬럼 카드) / Desktop(좌측 브랜드 영역 60% + 우측 로그인 카드 40%)
- [x] 에러 처리: `error=auth_failed` 시 인라인 에러 배너 (`role="alert"`) 표시
- [x] Playwright MCP 테스트: 페이지 렌더링, 비로그인 링크 동작, 에러 메시지 표시 확인

---

#### Task 2.3: 피드 API Route Handler 구현

**담당**: 풀스택 | **예상**: 2일

- [x] `GET /api/posts` Route Handler 구현: 감정 필터, 태그 필터(다중 선택), 정렬(최신순/인기순), 커서 기반 페이지네이션
- [x] `searchParams`를 반드시 `await`하여 처리 (Next.js 16.2.2 필수)
- [x] 차단한 사용자 게시글 서버 사이드 필터링, 숨긴 게시글 제외
- [x] 익명 게시글의 `author_id` null 마스킹 처리
- [x] 초기 로드 20개, 커서 기반 다음 페이지 응답 구조 (`nextCursor`, `hasMore`)
- [x] Zod 스키마로 쿼리 파라미터 검증
- [x] Playwright MCP 테스트: 피드 API 필터/정렬/페이지네이션 동작 확인

---

#### Task 2.4: 피드 페이지 UI (`/feed`)

**담당**: 풀스택 | **예상**: 3일

- [x] 감정 필터 바 구현 (8가지 감정 칩, 선택 시 URL `searchParams` 업데이트 및 피드 재조회)
- [x] 상황 태그 필터 구현 (8종 태그, 다중 선택 가능)
- [x] 최신순/인기순 탭 전환 UI
- [x] `PostCard` 컴포넌트 구현 (감정 이모지, 본문 미리보기, 태그, 반응 수, 작성 시간)
- [x] TanStack Query `useInfiniteQuery`로 무한 스크롤 구현 (하단 200px 이내 도달 시 자동 요청, `IntersectionObserver` 활용)
- [x] 마지막 페이지 도달 시 "모든 글을 읽었어요" 메시지 표시
- [x] 로딩 중 스켈레톤 UI 표시 (`PostCardSkeleton`)
- [x] **반응형**: Mobile(단일 컬럼 + 하단 탭바) / Tablet(좌측 사이드바 필터 + 우측 피드) / Desktop(3컬럼: 사이드바 + 피드 + 추천 패널)

---

### Phase 3: 핵심 기능 (3주)

**목표**: 게시글 작성, 상세 조회, 공감 반응, 댓글, 감정 히스토리, 검색 기능을 구현하여 서비스의 핵심 사용자 루프를 완성한다.

**완료 기준**: 글 작성 -> 피드 노출, 공감 토글 + 댓글 작성 E2E 확인, 감정 기록 -> 차트 반영 확인, 키워드 검색 결과 정확도 확인.

**PRD 매핑**: FR-04, FR-05, FR-06, FR-07, FR-08

---

#### Task 3.1: 게시글 작성 API

**담당**: 풀스택 | **예상**: 1일

- [x] `POST /api/posts` Route Handler 구현 (인증 필수)
- [x] Zod 스키마 검증: 감정(필수), 태그(1~5개), 본문(10~1,000자), 익명 토글
- [x] 게시글 생성 시 `post_tags` 조인 테이블에 태그 연결
- [x] 게시글 작성 시 `emotion_logs`에 감정 자동 기록
- [x] 익명 게시글의 경우 `is_anonymous: true` 저장
- [x] Playwright MCP 테스트: 게시글 생성 API 검증 (정상 케이스 + 유효성 실패 케이스)

---

#### Task 3.2: 게시글 작성 3단계 폼 UI (`/posts/new`)

**담당**: 풀스택 | **예상**: 2일

- [x] Step 1: 감정 선택 (현재 Zustand 감정이 기본값, `EmotionPicker` 재활용)
- [x] Step 2: 상황 태그 선택 (1개 이상 ~ 5개 이하, 선택 수 표시)
- [x] Step 3: 본문 입력 (10~1,000자, 실시간 글자 수 카운터) + 익명 토글
- [x] react-hook-form + Zod resolver로 단계별 유효성 검증
- [x] 제출 성공 시 작성된 게시글 상세 페이지(`/posts/[id]`)로 이동
- [x] 제출 실패 시 에러 토스트 표시, 폼 데이터 유지
- [x] TanStack Query `useMutation`으로 서버 요청 및 피드 캐시 무효화
- [x] **반응형**: Mobile 전용 (큰 화면에서도 중앙 정렬 단일 컬럼 폼으로 처리)

---

#### Task 3.3: 게시글 상세 페이지 (`/posts/[id]`)

**담당**: 풀스택 | **예상**: 2일

- [ ] `GET /api/posts/[id]` Route Handler 구현 (`params`를 반드시 `await`, 조회 시 `view_count` +1)
- [ ] `DELETE /api/posts/[id]` Route Handler 구현 (본인 게시글만 삭제 가능)
- [ ] 게시글 상세 페이지 서버 컴포넌트 구현 (감정, 태그, 본문, 작성 시간, 조회수)
- [ ] 익명 게시글의 작성자 정보 "익명" 표시 처리
- [ ] Playwright MCP 테스트: 게시글 상세 조회 API, 조회수 증가, 삭제 권한 확인
- [ ] **반응형**: Mobile(단일 컬럼) / Tablet(게시글 + 우측 댓글 패널 2분할) / Desktop(게시글 + 댓글 + 우측 추천 글 3컬럼)

---

#### Task 3.4: 공감 반응 시스템

**담당**: 풀스택 | **예상**: 2일

- [ ] `POST /api/posts/[id]/reactions` Route Handler 구현 (`params` await 필수, 인증 필수, 반응 토글: 있으면 삭제, 없으면 생성)
- [ ] Zod 스키마로 `reaction_type` 검증
- [ ] 4종 공감 반응 버튼 UI (나도 그래, 너무 슬퍼, 화가 나, 힘내세요)
- [ ] TanStack Query 낙관적 업데이트: 버튼 탭 시 즉시 카운트 반영, 서버 실패 시 롤백
- [ ] 4종 반응 동시 가능, 같은 타입만 중복 불가 (토글)
- [ ] 비로그인 상태 반응 시도 시 로그인 유도 토스트
- [ ] Playwright MCP 테스트: 반응 토글 API, 중복 방지, 낙관적 업데이트 롤백 시나리오

---

#### Task 3.5: 댓글 및 대댓글 시스템

**담당**: 풀스택 | **예상**: 2일

- [ ] `GET /api/posts/[id]/comments` Route Handler 구현 (`params` await 필수, 댓글 + 대댓글 `parent_id` 기반 트리 구조 응답)
- [ ] `POST /api/posts/[id]/comments` Route Handler 구현 (인증 필수, Zod 검증: 1~500자)
- [ ] 댓글 삭제 API 구현 (본인 댓글만)
- [ ] 댓글 목록 UI (작성자 표시, 익명 옵션, 대댓글 들여쓰기)
- [ ] 댓글 입력 폼 (익명 토글 포함)
- [ ] 비로그인 상태 댓글 작성 시도 시 로그인 유도 토스트
- [ ] Playwright MCP 테스트: 댓글 CRUD, 대댓글 parent_id 연결 확인

---

#### Task 3.6: 감정 히스토리 기능

**담당**: 풀스택 | **예상**: 2일

- [ ] `POST /api/emotions` Route Handler 구현 (인증 필수, Zod 검증)
- [ ] `GET /api/emotions/history` Route Handler 구현 (기간 필터: 7일/30일/90일, 본인 레코드만)
- [ ] `/history` 페이지 구현 (인증 필수 페이지)
- [ ] Recharts `AreaChart`로 날짜별 감정 분포 시각화 (감정별 색상 적용)
- [ ] 7일/30일/90일 기간 필터 탭 UI
- [ ] 특정 날짜 포인트 선택 시 해당일 감정 로그 목록 하단 표시
- [ ] 히스토리 없음 시 안내 메시지 + 감정 기록 유도 UI
- [ ] Playwright MCP 테스트: 감정 기록 API, 히스토리 조회 기간 필터 확인
- [ ] **반응형**: Mobile(단일 컬럼 차트) / Desktop(좌측 기간 필터 + 통계 카드, 우측 넓은 차트)

---

#### Task 3.7: 검색 기능

**담당**: 풀스택 | **예상**: 2일

- [ ] `GET /api/search` Route Handler 구현 (Supabase `ilike` 검색, `searchParams` await 필수)
- [ ] 감정 필터, 태그 필터와 키워드 검색 조합 지원
- [ ] 최소 2자 이상 입력 시 검색 실행 (클라이언트 유효성)
- [ ] `/search` 페이지 구현: 검색 입력, 필터 UI, 결과 리스트 (`PostCard` 재활용)
- [ ] 검색 결과 없음 시 빈 상태 화면 표시
- [ ] 검색 중 로딩 스피너 표시
- [ ] Playwright MCP 테스트: 검색 API 키워드/필터 조합 결과 확인
- [ ] **반응형**: Mobile(상단 검색바 + 필터 칩 가로 스크롤 + 결과 목록) / Desktop(좌측 필터 사이드바 + 중앙 결과 + 우측 추천 패널)

---

### Phase 4: 고급 기능 + QA (2~3주)

**목표**: 추천 시스템, 안전 기능, 프로필을 구현하고 전체 애플리케이션의 품질을 검증하여 v1.0 출시를 준비한다.

**완료 기준**: 추천 카드 노출 확인, 차단 후 피드에서 해당 글 미노출 확인, 프로필 닉네임 수정 동작, 전체 QA 통과.

**PRD 매핑**: FR-09, FR-10, FR-11

---

#### Task 4.1: 추천 시스템

**담당**: 풀스택 | **예상**: 2일

- [ ] `GET /api/recommendations` Route Handler 구현 (같은 감정 인기순 3개 + 보완 감정 2개 조합)
- [ ] 보완 감정 매핑 로직 적용 (ANXIETY->CALM, SADNESS->JOY/EXCITEMENT, ANGER->CALM)
- [ ] 이미 읽은 게시글(조회 이력) 추천 제외 처리
- [ ] 피드 하단 "이런 글은 어때요?" 추천 섹션 UI (카드 최대 5개)
- [ ] Playwright MCP 테스트: 추천 API 응답 구조 및 보완 감정 매핑 확인

---

#### Task 4.2: 안전 기능 (신고/숨기기/차단)

**담당**: 풀스택 | **예상**: 3일

- [ ] `POST /api/safety/report` Route Handler 구현 (인증 필수, Zod 검증: 사유 필수 선택)
- [ ] `POST /api/safety/hide` Route Handler 구현 (인증 필수, `hidden_posts` 기록)
- [ ] `POST /api/safety/block` Route Handler 구현 (인증 필수, `blocks` 테이블 기록)
- [ ] `PostMenu` 컴포넌트 구현 (더보기 메뉴: 신고/숨기기/작성자 차단, 자기 게시글은 메뉴 미표시)
- [ ] 신고 다이얼로그 UI (사유 선택: SPAM, HARASSMENT, INAPPROPRIATE_CONTENT, FALSE_INFORMATION, OTHER)
- [ ] 숨긴 게시글 피드에서 즉시 제거 (클라이언트 캐시 업데이트)
- [ ] 동일 게시글 신고 5건 이상 시 자동 숨김 처리 (DB 트리거 또는 API 로직)
- [ ] Playwright MCP 테스트: 신고/숨기기/차단 API 동작 및 피드 필터링 확인

---

#### Task 4.3: 프로필 페이지

**담당**: 풀스택 | **예상**: 2일

- [ ] `/profile` 페이지 구현 (본인 프로필: 닉네임, 내 게시글 목록 최신순)
- [ ] 닉네임 수정 기능 (Zod 검증: 2~20자, 특수문자 제외)
- [ ] `/profile/[userId]` 동적 라우트 구현 (`params` await 필수, 타인 프로필: 공개 게시글만 표시)
- [ ] 익명으로 작성한 게시글은 프로필에서도 "익명" 처리
- [ ] Playwright MCP 테스트: 프로필 조회, 닉네임 수정 API 확인
- [ ] **반응형 (내 프로필)**: Mobile(단일 컬럼) / Desktop(좌측 프로필 카드 + 우측 게시글 목록 2컬럼)
- [ ] **반응형 (타인 프로필)**: Mobile 전용 (큰 화면에서 중앙 정렬 단일 컬럼)

---

#### Task 4.4: 전체 UI 폴리싱 및 에러 처리

**담당**: 풀스택 | **예상**: 2일

- [ ] 스켈레톤 UI 전체 페이지 적용 (피드, 상세, 댓글, 히스토리, 프로필)
- [ ] Error Boundary 전역 및 페이지별 설정 (`error.tsx`, `not-found.tsx`)
- [ ] 빈 상태 UI 통일 (게시글 없음, 댓글 없음, 검색 결과 없음, 히스토리 없음)
- [ ] 로딩/에러/빈 상태 토스트 메시지 통일
- [ ] 키보드 내비게이션 전체 검수 (감정 선택, 공감 버튼, 폼 제출 등)

---

#### Task 4.5: 성능 최적화 및 QA

**담당**: 풀스택 | **예상**: 2일

- [ ] Core Web Vitals 측정 및 LCP 2,500ms 이하 달성 확인
- [ ] TanStack Query 캐시 전략 최적화 (`staleTime`, `gcTime` 조정)
- [ ] 이미지 최적화 (Next.js `Image` 컴포넌트 적용, 필요시)
- [ ] 번들 사이즈 점검 및 불필요한 클라이언트 번들 제거
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 번들에 포함되지 않는지 보안 점검
- [ ] 전체 사용자 플로우 E2E 테스트 (온보딩 -> 피드 -> 글 작성 -> 공감 -> 댓글 -> 히스토리 -> 검색 -> 추천 -> 신고/차단 -> 프로필)

---

## 기술 부채 및 개선 계획

| 항목 | 현재 상태 | 개선 방향 | 시점 |
|------|-----------|-----------|------|
| 검색 | `ilike` 기반 | pg_trgm Full-text Search 도입 | 사용자 규모 증가 시 |
| 알림 시스템 | 미구현 | Supabase Realtime 또는 Push Notification | v1.1 |
| 다국어(i18n) | 한국어 고정 | `next-intl` 도입 | v2.0 |
| 관리자 대시보드 | 미구현 | 신고 관리, 사용자 관리 UI | v1.1 |
| 이미지 첨부 | 미구현 | Supabase Storage 활용 | v1.1 |
| 게시글 작성 제한 | 제한 없음 | Rate Limiting 도입 | Beta 출시 전 재검토 |

---

## 리스크 레지스터

| ID | 리스크 | 영향도 | 발생 확률 | 완화 전략 |
|----|--------|--------|-----------|-----------|
| R1 | Supabase Free Tier 한계 (500 동시접속, 500MB DB) | 높음 | 중간 | 초기 사용자 규모 모니터링, Pro 플랜 전환 기준 사전 정의 |
| R2 | Next.js 16.2.2 `params`/`searchParams` await 패턴 누락 | 높음 | 높음 | 모든 동적 라우트/Route Handler에서 코드 리뷰 시 필수 체크 |
| R3 | Kakao OAuth 비즈니스 채널 미등록 상태에서 출시 | 중간 | 중간 | Phase 2 시작 전 비즈니스 앱 전환 절차 착수 (PRD Q4) |
| R4 | 1인 개발 번아웃으로 인한 일정 지연 | 높음 | 중간 | 각 Phase에 버퍼 기간 포함, 우선순위 철저한 관리 |
| R5 | OAuth 제공자(Google/Kakao) 서비스 장애 | 중간 | 낮음 | 2개 제공자 상호 대체 가능, 장애 시 안내 메시지 표시 |
| R6 | 익명 게시글 악용 (스팸, 혐오 표현) | 높음 | 중간 | 신고 5건 자동 숨김, 추후 Rate Limiting 도입 |

---

## 의존성 맵

```
Phase 1
  Task 1.1 (DB 스키마) ─────────────┐
  Task 1.2 (Supabase 클라이언트) ────┤
  Task 1.3 (상수/타입) ──────────────┼─── Task 1.4 (Zustand) ──┐
  Task 1.5 (인증) ───────────────────┤                         │
  Task 1.6 (Middleware) ─── depends on 1.5                      │
  Task 1.7 (Providers/레이아웃) ─── depends on 1.2, 1.3        │
                                                                │
Phase 2                                                         │
  Task 2.1 (온보딩) ─── depends on 1.3, 1.4, 1.6 ──────────────┘
  Task 2.2 (로그인) ─── depends on 1.5
  Task 2.3 (피드 API) ─── depends on 1.1, 1.2
  Task 2.4 (피드 UI) ─── depends on 2.3, 1.7

Phase 3
  Task 3.1 (글 작성 API) ─── depends on 1.1, 1.2
  Task 3.2 (글 작성 UI) ─── depends on 3.1, 2.1
  Task 3.3 (글 상세) ─── depends on 2.3
  Task 3.4 (공감) ─── depends on 3.3
  Task 3.5 (댓글) ─── depends on 3.3
  Task 3.6 (히스토리) ─── depends on 3.1 (emotion_logs 기록)
  Task 3.7 (검색) ─── depends on 2.3

Phase 4
  Task 4.1 (추천) ─── depends on 2.3, 1.3
  Task 4.2 (안전) ─── depends on 1.1 (safety 테이블), 2.4
  Task 4.3 (프로필) ─── depends on 1.5, 3.1
  Task 4.4 (폴리싱) ─── depends on Phase 1~3 전체
  Task 4.5 (QA) ─── depends on Phase 1~4 전체
```

---

## PRD 요구사항 추적 매트릭스

| PRD 기능 | 우선순위 | 로드맵 Task | Phase |
|----------|----------|-------------|-------|
| FR-01: 감정 온보딩 | P0 | Task 1.3, 1.4, 2.1 | 1, 2 |
| FR-02: 인증 시스템 | P0 | Task 1.5, 1.6, 2.2 | 1, 2 |
| FR-03: 피드 | P0 | Task 2.3, 2.4 | 2 |
| FR-04: 게시글 작성 | P0 | Task 3.1, 3.2 | 3 |
| FR-05: 게시글 상세 + 공감 | P1 | Task 3.3, 3.4 | 3 |
| FR-06: 댓글 및 대댓글 | P1 | Task 3.5 | 3 |
| FR-07: 감정 히스토리 | P1 | Task 3.6 | 3 |
| FR-08: 검색 | P1 | Task 3.7 | 3 |
| FR-09: 추천 시스템 | P2 | Task 4.1 | 4 |
| FR-10: 안전 기능 | P1 | Task 4.2 | 4 |
| FR-11: 프로필 | P1 | Task 4.3 | 4 |
| 비기능: 성능 | - | Task 4.5 | 4 |
| 비기능: 보안 (RLS) | - | Task 1.1, 4.5 | 1, 4 |
| 비기능: 접근성 | - | Task 2.1, 4.4 | 2, 4 |

---

## 열린 질문 및 가정

PRD에서 식별된 열린 질문에 대한 현재 가정과 결정 시점:

| ID | 질문 | 현재 가정 | 결정 시점 |
|----|------|-----------|-----------|
| Q1 | 익명 게시글 삭제 기준 | 작성자 본인(세션의 author_id)만 삭제 가능 | Phase 3 Task 3.3 시작 전 |
| Q2 | 신고 자동 숨김 임계값 | 동일 게시글 5건 신고 시 자동 숨김, 환경변수로 관리 | Phase 4 Task 4.2 시작 전 |
| Q3 | emotion_logs 기록 시점 | 온보딩 감정 선택 + 게시글 작성 시 기록 | Phase 3 Task 3.6 시작 전 |
| Q4 | Kakao OAuth 비즈니스 채널 등록 | 개발 단계는 테스터 계정, 출시 전 비즈니스 앱 전환 | Phase 1 Task 1.5 시작 전 |
| Q5 | 게시글 1인 일일 작성 제한 | 제한 없음, 스팸은 신고 시스템으로 대응 | Beta 출시 전 |

---

## MVP 제외 항목 (Out of Scope)

다음 기능은 v1.0 범위에서 명시적으로 제외한다:

- 실시간 알림 (댓글/공감 푸시)
- 팔로우/팔로잉 시스템
- 다국어(i18n) 지원
- 관리자 대시보드
- 유료 기능 / 광고 시스템
- 이미지/파일 첨부
- DM (다이렉트 메시지)
- 네이티브 앱 (iOS/Android) 빌드
