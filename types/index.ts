import type { Database, Tables } from './database.types'
import type { ReactionType } from '@/lib/constants/reactions'

// ─── 기본 테이블 타입 ────────────────────────────────────────────────────────
// Supabase CLI가 자동 생성한 database.types.ts의 Tables<> 유틸리티로 추출

export type Profile    = Tables<'profiles'>
export type Post       = Tables<'posts'>
export type Comment    = Tables<'comments'>
export type Reaction   = Tables<'reactions'>
export type EmotionLog = Tables<'emotion_logs'>
export type Tag        = Tables<'tags'>
export type Report     = Tables<'reports'>

// ─── DB ENUM 타입 ────────────────────────────────────────────────────────────
// constants에 정의된 앱 레벨 타입과 DB ENUM 타입을 명시적으로 분리 관리

export type DbEmotionType  = Database['public']['Enums']['emotion_type']
export type DbReactionType = Database['public']['Enums']['reaction_type']
export type DbReportReason = Database['public']['Enums']['report_reason']

// ─── 확장(조인) 타입 ──────────────────────────────────────────────────────────
// Supabase 쿼리 결과를 타입세이프하게 사용하기 위한 도메인 모델

/** 댓글 + 작성자 프로필 */
export type CommentWithAuthor = Comment & {
  author: Profile | null
}

/** 피드 목록용: 태그 + 감정별 반응 수 포함 */
export type PostWithMeta = Post & {
  tags: Tag[]
  reaction_counts: Partial<Record<ReactionType, number>>
}

/** 게시글 상세용: 태그 + 반응 수 + 댓글(작성자 포함) */
export type PostDetail = PostWithMeta & {
  comments: CommentWithAuthor[]
}

/** 댓글 + 작성자 + 대댓글 목록 (UI 표시용) */
export type CommentWithReplies = Comment & {
  author: Pick<Profile, 'id' | 'nickname'> | null
  replies: (Comment & { author: Pick<Profile, 'id' | 'nickname'> | null })[]
}
