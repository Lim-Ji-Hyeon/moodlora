import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { historyQuerySchema } from '@/lib/validations/emotion'
import type { EmotionType } from '@/lib/constants/emotions'
import type { HistoryApiResponse, EmotionLogItem } from '@/lib/validations/emotion'

const PERIOD_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: { message: '로그인이 필요합니다' } },
      { status: 401 }
    )
  }

  const sp     = request.nextUrl.searchParams
  const parsed = historyQuerySchema.safeParse({ period: sp.get('period') ?? undefined })
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: '잘못된 기간 파라미터입니다' } },
      { status: 400 }
    )
  }

  const { period } = parsed.data
  const days       = PERIOD_DAYS[period]
  const cutoff     = new Date(Date.now() - days * 86_400_000).toISOString()

  const { data, error } = await supabase
    .from('emotion_logs')
    .select('id, emotion, created_at, note')
    .eq('user_id', user.id)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: { message: '히스토리 조회에 실패했습니다' } },
      { status: 500 }
    )
  }

  const logs = (data ?? []) as EmotionLogItem[]

  const grouped: Record<string, Partial<Record<EmotionType, number>>> = {}
  for (const log of logs) {
    const date = log.created_at.slice(0, 10)
    if (!grouped[date]) grouped[date] = {}
    const em = log.emotion as EmotionType
    grouped[date][em] = (grouped[date][em] ?? 0) + 1
  }

  return NextResponse.json({ logs, grouped } satisfies HistoryApiResponse)
}
