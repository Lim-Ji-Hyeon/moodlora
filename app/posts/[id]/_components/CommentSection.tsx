'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { MessageCircle, Send, Trash2, CornerDownRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { CommentWithReplies } from '@/types'

interface CommentSectionProps {
  postId:        string
  currentUserId: string | null
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  if (mins < 1)  return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}시간 전`
  return `${Math.floor(hrs / 24)}일 전`
}

type ReplyItem = CommentWithReplies['replies'][number]

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments,    setComments]    = useState<CommentWithReplies[]>([])
  const [isLoading,   setIsLoading]   = useState(true)
  const [commentText, setCommentText] = useState('')
  const [replyingTo,  setReplyingTo]  = useState<string | null>(null)
  const [replyText,   setReplyText]   = useState('')

  // ─── 초기 댓글 로드 ──────────────────────────────────────────────────────────
  const loadComments = useCallback(async () => {
    setIsLoading(true)
    try {
      const res  = await fetch(`/api/posts/${postId}/comments`)
      const data = await res.json()
      setComments(data.comments ?? [])
    } catch {
      toast.error('댓글을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => { void loadComments() }, [loadComments])

  // ─── 댓글/대댓글 작성 ────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async ({ content, parent_id }: { content: string; parent_id?: string }) => {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content, parent_id }),
      })
      if (!res.ok) throw new Error()
      return res.json() as Promise<{ comment: ReplyItem & { replies?: ReplyItem[] } }>
    },
    onMutate: ({ content, parent_id }) => {
      const tempId   = `temp_${Date.now()}`
      const tempItem = {
        id:           tempId,
        content,
        author_id:    currentUserId,
        parent_id:    parent_id ?? null,
        is_anonymous: null,
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
        post_id:      postId,
        author:       null,
        replies:      [],
      } satisfies CommentWithReplies

      const prev = [...comments]
      if (parent_id) {
        setComments((cs) =>
          cs.map((c) =>
            c.id === parent_id
              ? { ...c, replies: [...c.replies, tempItem] }
              : c
          )
        )
      } else {
        setComments((cs) => [...cs, tempItem])
      }
      return prev
    },
    onSuccess: ({ comment }, { parent_id }) => {
      if (parent_id) {
        setComments((cs) =>
          cs.map((c) =>
            c.id === parent_id
              ? {
                  ...c,
                  replies: c.replies.map((r) =>
                    r.id.startsWith('temp_') ? (comment as ReplyItem) : r
                  ),
                }
              : c
          )
        )
        setReplyingTo(null)
        setReplyText('')
      } else {
        setComments((cs) =>
          cs.map((c) =>
            c.id.startsWith('temp_') ? { ...(comment as CommentWithReplies), replies: [] } : c
          )
        )
        setCommentText('')
      }
    },
    onError: (_err, _vars, prev) => {
      if (prev) setComments(prev)
      toast.error('댓글 등록에 실패했습니다.')
    },
  })

  // ─── 댓글 삭제 ───────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async ({ commentId, parentId }: { commentId: string; parentId?: string }) => {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error()
      return { commentId, parentId }
    },
    onMutate: ({ commentId, parentId }) => {
      const prev = [...comments]
      if (parentId) {
        setComments((cs) =>
          cs.map((c) =>
            c.id === parentId
              ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
              : c
          )
        )
      } else {
        setComments((cs) => cs.filter((c) => c.id !== commentId))
      }
      return prev
    },
    onError: (_err, _vars, prev) => {
      if (prev) setComments(prev)
      toast.error('댓글 삭제에 실패했습니다.')
    },
  })

  function handleSubmitComment() {
    if (!currentUserId) {
      toast('로그인 후 댓글을 작성할 수 있어요', {
        action: { label: '로그인', onClick: () => window.location.assign('/login') },
      })
      return
    }
    const trimmed = commentText.trim()
    if (!trimmed) return
    addMutation.mutate({ content: trimmed })
  }

  function handleSubmitReply(parentId: string) {
    if (!currentUserId) {
      toast('로그인 후 대댓글을 작성할 수 있어요', {
        action: { label: '로그인', onClick: () => window.location.assign('/login') },
      })
      return
    }
    const trimmed = replyText.trim()
    if (!trimmed) return
    addMutation.mutate({ content: trimmed, parent_id: parentId })
  }

  const totalCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)

  return (
    <div className="space-y-4 pt-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">
          댓글 {totalCount > 0 ? `${totalCount}개` : ''}
        </h3>
      </div>

      {/* 댓글 목록 */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-1.5">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          아직 댓글이 없어요. 따뜻한 한마디를 남겨보세요 💬
        </div>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                onDelete={(id) => deleteMutation.mutate({ commentId: id })}
                onReplyToggle={(id) => {
                  setReplyingTo((prev) => (prev === id ? null : id))
                  setReplyText('')
                }}
                isReplying={replyingTo === comment.id}
              />

              {/* 인라인 대댓글 폼 */}
              {replyingTo === comment.id && (
                <div className="mt-2 ml-8 flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="대댓글을 입력하세요..."
                    rows={2}
                    className="resize-none rounded-xl text-sm flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSubmitReply(comment.id)
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="rounded-xl self-end"
                    disabled={!replyText.trim() || addMutation.isPending}
                    onClick={() => handleSubmitReply(comment.id)}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {/* 대댓글 목록 */}
              {comment.replies.length > 0 && (
                <ul className="mt-2 ml-8 space-y-3">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <ReplyItem
                        reply={reply}
                        currentUserId={currentUserId}
                        onDelete={(id) =>
                          deleteMutation.mutate({ commentId: id, parentId: comment.id })
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 댓글 작성 폼 */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={currentUserId ? '따뜻한 댓글을 남겨주세요...' : '로그인 후 댓글을 작성할 수 있어요'}
          rows={2}
          className="resize-none rounded-xl text-sm flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmitComment()
            }
          }}
        />
        <Button
          size="sm"
          className="rounded-xl self-end"
          disabled={!commentText.trim() || addMutation.isPending}
          onClick={handleSubmitComment}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── 댓글 아이템 ──────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment:       CommentWithReplies
  currentUserId: string | null
  onDelete:      (id: string) => void
  onReplyToggle: (id: string) => void
  isReplying:    boolean
}

function CommentItem({ comment, currentUserId, onDelete, onReplyToggle, isReplying }: CommentItemProps) {
  const isOwner    = !!currentUserId && currentUserId === comment.author_id
  const authorName = comment.is_anonymous
    ? '익명'
    : (comment.author?.nickname ?? '알 수 없음')

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{authorName}</span>
          <span>{comment.created_at ? timeAgo(comment.created_at) : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onReplyToggle(comment.id)}
            className={cn(
              'flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors',
              isReplying
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <CornerDownRight className="w-3 h-3" />
            답글
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="댓글 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
    </div>
  )
}

// ─── 대댓글 아이템 ────────────────────────────────────────────────────────────

interface ReplyItemProps {
  reply:         CommentWithReplies['replies'][number]
  currentUserId: string | null
  onDelete:      (id: string) => void
}

function ReplyItem({ reply, currentUserId, onDelete }: ReplyItemProps) {
  const isOwner    = !!currentUserId && currentUserId === reply.author_id
  const authorName = reply.is_anonymous
    ? '익명'
    : (reply.author?.nickname ?? '알 수 없음')

  return (
    <div className="space-y-1 pl-3 border-l-2 border-border/60">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{authorName}</span>
          <span>{reply.created_at ? timeAgo(reply.created_at) : ''}</span>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={() => onDelete(reply.id)}
            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="대댓글 삭제"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <p className="text-sm text-foreground leading-relaxed">{reply.content}</p>
    </div>
  )
}
