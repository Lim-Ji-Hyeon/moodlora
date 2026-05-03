import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCommentSchema } from '@/lib/validations/comment'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('*, author:profiles(id, nickname), replies:comments!parent_id(*, author:profiles(id, nickname))')
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: { message: '댓글을 불러오지 못했습니다' } },
      { status: 500 }
    )
  }

  return NextResponse.json({ comments: data ?? [] })
}

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
  const parsed = createCommentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: '올바르지 않은 입력입니다' } },
      { status: 400 }
    )
  }

  const { content, parent_id } = parsed.data

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id:   postId,
      author_id: user.id,
      content,
      parent_id: parent_id ?? null,
    })
    .select('*, author:profiles(id, nickname)')
    .single()

  if (error) {
    return NextResponse.json(
      { error: { message: '댓글 작성에 실패했습니다' } },
      { status: 500 }
    )
  }

  return NextResponse.json({ comment: data }, { status: 201 })
}
