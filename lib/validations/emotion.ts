import { z } from 'zod'
import type { EmotionType } from '@/lib/constants/emotions'

const EMOTION_VALUES = [
  'JOY', 'EXCITEMENT', 'CALM', 'SADNESS',
  'ANGER', 'LETHARGY', 'ANXIETY', 'LONELINESS',
] as const

export const emotionLogSchema = z.object({
  emotion: z.enum(EMOTION_VALUES),
  note:    z.string().max(200).optional(),
})

export const historyQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d']).default('7d'),
})

export type CreateEmotionLogInput = z.infer<typeof emotionLogSchema>
export type HistoryQueryInput     = z.infer<typeof historyQuerySchema>

export type EmotionLogItem = {
  id:         string
  emotion:    EmotionType
  created_at: string
  note:       string | null
}

export type HistoryApiResponse = {
  logs:    EmotionLogItem[]
  grouped: Record<string, Partial<Record<EmotionType, number>>>
}
