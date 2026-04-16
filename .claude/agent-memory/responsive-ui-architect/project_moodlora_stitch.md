---
name: Moodlora Stitch 프로젝트
description: Moodlora 감정 기반 익명 소셜 플랫폼의 Google Stitch 디자인 프로젝트 정보 (반응형 버전 포함)
type: project
---

Stitch 프로젝트 ID: 706293808131804710
디자인 시스템 ID: assets/12305768813800255499

**Why:** 2026-04-14 초기 UI 디자인 작업으로 생성. 이후 라이트 모드 전환 및 반응형(태블릿/데스크탑) 버전 확장.

**How to apply:** 추가 화면 생성 시 projectId와 designSystem assetId를 위 값으로 사용.

## 디자인 시스템 설정 (최신)
- 색상 모드: LIGHT (흰 배경 기반)
- 주 색상: #8B5CF6 (보라)
- 보조: #EC4899 (핑크), #F59E0B (amber)
- 폰트: Plus Jakarta Sans
- 둥글기: ROUND_TWELVE
- 스타일: EXPRESSIVE color variant
- 기본 배경: #FFFFFF, 서브 배경: #F8F7FF
- 다크 모드 배경: #0F0A1E

## 생성된 화면 목록

### 모바일 화면 (원본 + 라이트 모드 편집)
| 화면명 | Screen ID | 비고 |
|--------|-----------|------|
| Welcome (온보딩) | 88d890ed5e72485dbf135a10094b8440 | 원본 (7감정) |
| Welcome (온보딩, 8감정) | 4fd3d1cf3ab94908b746496c29999f31 | 외로움 추가, 2×4 그리드 |
| Welcome (Light) | 25b25e778f8e48dcbd3b22fbd340a2f9 | 라이트 모드 |
| 피드 (Light Mode) | fd43c1eaf04844c8a2dea9960823c13d | 원본 (7감정) |
| 피드 (8감정) | ba1d17e06dea42e7bbbef0ad7f89b1e6 | 외로움 필터칩 추가 |
| 피드 (Light) | b4e4c7407c17464791d1292e2fd555fd | 라이트 모드 |
| 게시글 상세 (Light) | ccefc83b56de4607b25386c133674a9f | 라이트 모드 편집 |
| 게시글 상세 | 63f8b8d4bf0e479fb5aa8ba8f1127873 | 원본 |
| 로그인 (Light) | 95c21a98301e4473a0b0849c3664bc75 | 라이트 모드 |
| 로그인 | dd64fd194d254a92bc7ec9ef4e19b761 | 원본 |
| 감정 히스토리 (Light) | ea57ff3407314f3e9b53125ef60e1666 | 라이트 모드 편집 |
| 감정 히스토리 | 2ce9aff3601d49dc8f538d36c505e370 | 원본 |
| 프로필 | b6a1a6b4ca5c4c00a19aedd736a4ba12 | 원본 |
| 게시글 작성 (상황 태그) | cb823b252841436eb5b44194bece169a | 최신 |
| 게시글 작성 (상황 태그 v2) | 0a7a86462504420cb9560ffeaa67a552 | 대안 |
| 게시글 작성 Step1 감정선택 | 39290603e7db449c94f030c350cf8300 | 2026-04-14 신규 |
| 게시글 작성 Step3 본문입력 | d89f701b452840029491e53264005b3e | 2026-04-14 신규 |
| 검색 페이지 | da73d194b53748bf8cb3aa2dcf6e52bb | 2026-04-14 신규 |
| 타인 프로필 | 683f34e7007b473d9251cfa67e318b91 | 2026-04-14 신규 |

### 태블릿/데스크탑 화면 (DESKTOP deviceType으로 생성됨)
| 화면명 | Screen ID | 비고 |
|--------|-----------|------|
| Tablet 피드 | f781dfa2c7224c7baa7aa44f19865fd1 | 태블릿 레이아웃 |
| Tablet Feed | 9dea807219044285996afff3fb6d2529 | 태블릿 레이아웃 v2 |
| Tablet 피드 (라이트 모드) | 8eb203d590394c2981dee0aafc99d7e9 | 태블릿 라이트 모드 |
| Tablet 게시글 상세 (Light) | 83c693341065409ba64296c3b33a5e55 | 태블릿 상세 |
| 데스크탑 게시글 상세 | 353c9a3cc3b143d6bf9b7e933a257e76 | 3컬럼 데스크탑 |
| 데스크탑 피드 (라이트 모드) | f3c6257205b34ccfbc3ba1cba7b91dba | 원본 (7감정) |
| 데스크탑 피드 (8감정) | 392911e3f98e4115bad2de8700816d57 | 외로움 사이드바 추가 |
| 감정 온보딩 (데스크탑) | c15a2712efc54eb5a5cf93920d847602 | 원본 (7감정) |
| 감정 온보딩 (데스크탑, 8감정) | 938937f0955744b889d17962b33a23e6 | 외로움 추가, 2×4 그리드 |
| 로그인 (데스크탑) | 578cafeb1f2944bfb87b66c05a87a4c6 | 2026-04-14 신규 → Next.js 컴포넌트 구현 완료 |
| 검색 (데스크탑) | 2c5cd1cc967d47c08bef9bed7221dfed | 2026-04-15 신규, 3컬럼 라이트 |
| 내 프로필 (데스크탑) | 6c83f21bfb8b4f989f6cfe278764c321 | 2026-04-15 신규, 2컬럼 라이트 |

## 타임아웃 패턴 주의사항
- 2026-04-14 기준: DESKTOP deviceType 화면 생성 시 타임아웃 빈번 발생
- 프롬프트를 짧게 유지해야 성공률 높아짐 (50자 이내 권장)
- 연속 시도 시 타임아웃 축적 → 잠시 간격 후 재시도 효과적
- **generate_screen_from_text는 DESKTOP deviceType 시 타임아웃 매우 빈번**
- **edit_screens가 상대적으로 성공률 높음 — 모바일 소스 화면을 DESKTOP으로 edit 방식 권장**
- edit_screens도 타임아웃 발생 시 영어 프롬프트로 전환하면 성공률 향상됨
- "Convert to desktop layout with 2 columns" 같은 매우 짧은 영어 프롬프트가 효과적

## 감정 8종 컬러 시스템 (2026-04-14 외로움 추가)
- 기쁨: #F59E0B (amber)
- 설렘: #EC4899 (pink)
- 평온: #0EA5E9 (sky)
- 슬픔: #3B82F6 (blue)
- 분노: #EF4444 (red)
- 무기력: #64748B (slate)
- 불안: #8B5CF6 (purple)
- 외로움: #6366F1 (indigo) ← 신규
