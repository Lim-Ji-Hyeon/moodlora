import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const bodySchema = z.object({
  type: z.enum(['ME_TOO', 'SAD', 'ANGRY', 'CHEER_UP']),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: { message: '로그인이 필요합니다' } },
      { status: 401 }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: '올바르지 않은 반응 타입입니다' } },
      { status: 400 }
    )
  }

  const { type } = parsed.data

  // 기존 반응 확인
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('type', type)
    .maybeSingle()

  if (existing) {
    // 이미 있으면 삭제 (토글 off)
    await supabase.from('reactions').delete().eq('id', existing.id)
    return NextResponse.json({ action: 'removed', type })
  }

  // 없으면 생성 (토글 on)
  await supabase.from('reactions').insert({
    post_id: postId,
    user_id: user.id,
    type,
  })

  return NextResponse.json({ action: 'added', type }, { status: 201 })
}
