import { z } from 'zod'
import type { PostWithMeta } from '@/types'

const EMOTION_VALUES = [
  'JOY', 'EXCITEMENT', 'CALM', 'SADNESS',
  'ANGER', 'LETHARGY', 'ANXIETY', 'LONELINESS',
] as const

export const searchQuerySchema = z.object({
  q:       z.string().min(2, '2자 이상 입력해주세요').max(100),
  emotion: z.enum(EMOTION_VALUES).optional(),
  tags:    z.string().optional(),
  limit:   z.coerce.number().int().min(1).max(50).default(20),
})

export type SearchQueryInput = z.infer<typeof searchQuerySchema>

export type SearchApiResponse = {
  posts: PostWithMeta[]
  total: number
}
