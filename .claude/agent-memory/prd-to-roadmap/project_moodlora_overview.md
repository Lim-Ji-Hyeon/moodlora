---
name: Moodlora 프로젝트 개요
description: 감정 기반 익명 소셜 플랫폼 Moodlora의 핵심 기술 결정사항 및 PRD 구조
type: project
---

Moodlora는 감정 기반 익명 소셜 플랫폼. 1인 개발 프로젝트 (jihyeonlim).

**Why:** 기존 SNS의 자기 과시 문화에 대한 대안으로, 솔직한 감정 표현과 공감 연결에 집중.

**How to apply:**
- 기술 스택: Next.js 16.2.2 (params/searchParams await 필수), React 19, TailwindCSS v4, shadcn/ui, Supabase (PostgreSQL + Auth), TanStack Query v5, Zustand persist, react-hook-form + Zod, Recharts
- 핵심 루프: 감정 온보딩 -> 피드 -> 글 작성 -> 공감 -> 댓글
- PRD는 11개 Phase (Alpha/Beta/v1.0), 로드맵은 4개 Phase로 재구성 (골격->UI->핵심->고급)
- Supabase Free Tier 제약 (500 동시접속, 500MB DB)
- 모든 API Route Handler에서 Zod 검증 필수, RLS 기반 인가
