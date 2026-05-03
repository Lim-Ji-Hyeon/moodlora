import { z } from 'zod'

export const createCommentSchema = z.object({
  content:   z.string().min(1, '내용을 입력해주세요').max(500, '500자 이내로 작성해주세요'),
  parent_id: z.string().uuid().optional(),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
