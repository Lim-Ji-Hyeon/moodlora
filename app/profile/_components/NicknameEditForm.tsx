'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { nicknameSchema, type NicknameInput } from '@/lib/validations/profile'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  currentNickname: string | null
  onSuccess: (nickname: string) => void
  onCancel: () => void
}

export default function NicknameEditForm({ currentNickname, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NicknameInput>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: { nickname: currentNickname ?? '' },
  })

  const mutation = useMutation({
    mutationFn: async (data: NicknameInput) => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error?.message ?? '닉네임 수정에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success('닉네임이 변경되었습니다')
      onSuccess(data.profile.nickname)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-2 w-full">
      <Input
        {...register('nickname')}
        placeholder="닉네임 입력 (2~20자)"
        aria-invalid={!!errors.nickname}
        disabled={mutation.isPending}
      />
      {errors.nickname && (
        <p className="text-xs text-destructive">{errors.nickname.message}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={mutation.isPending} className="flex-1">
          {mutation.isPending ? '저장 중...' : '저장'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={mutation.isPending} className="flex-1">
          취소
        </Button>
      </div>
    </form>
  )
}
