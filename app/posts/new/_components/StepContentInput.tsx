'use client'

import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface StepContentInputProps {
  value:             string
  onChange:          React.ChangeEventHandler<HTMLTextAreaElement>
  onBlur:            React.FocusEventHandler<HTMLTextAreaElement>
  error?:            string
  isAnonymous:       boolean
  onAnonymousChange: (value: boolean) => void
}

export default function StepContentInput({
  value, onChange, onBlur, error, isAnonymous, onAnonymousChange,
}: StepContentInputProps) {
  return (
    <div className="space-y-4">
      {/* ─── 익명 토글 ────────────────────────────────────────────────────────── */}
      <label className="flex items-center justify-between p-4 rounded-xl border-2 border-border cursor-pointer hover:border-violet-300 transition-colors">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">익명으로 작성</p>
          <p className="text-xs text-muted-foreground">작성자 이름이 "익명의 감정러버"로 표시돼요</p>
        </div>

        {/* 커스텀 토글 스위치 */}
        <div className="relative shrink-0 ml-3">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => onAnonymousChange(e.target.checked)}
            className="sr-only"
          />
          <div className={cn(
            'w-11 h-6 rounded-full transition-colors duration-200',
            isAnonymous ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'
          )} />
          <div className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
            isAnonymous && 'translate-x-5'
          )} />
        </div>
      </label>

      {/* ─── 본문 입력 ────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Textarea
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="오늘의 감정을 솔직하게 나눠주세요..."
          rows={8}
          maxLength={1000}
          className={cn(
            'resize-none rounded-xl text-base leading-relaxed',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
        />
        <div className="flex items-center justify-between text-xs">
          {error
            ? <span className="text-destructive">{error}</span>
            : <span className="text-muted-foreground">10자 이상 입력해주세요</span>
          }
          <span className={cn(
            'tabular-nums',
            value.length > 900 ? 'text-amber-500' : 'text-muted-foreground',
            value.length >= 1000 && 'text-destructive font-medium'
          )}>
            {value.length.toLocaleString()}/1,000
          </span>
        </div>
      </div>
    </div>
  )
}
