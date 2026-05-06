'use client'

type Props = {
  value:    string
  onChange: (value: string) => void
}

export default function SearchInput({ value, onChange }: Props) {
  return (
    <div className="relative flex items-center">
      {/* 돋보기 아이콘 */}
      <svg
        className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="감정, 상황, 키워드로 검색..."
        className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        autoComplete="off"
      />

      {/* Clear 버튼 */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/50 transition-colors"
          aria-label="검색어 지우기"
        >
          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
