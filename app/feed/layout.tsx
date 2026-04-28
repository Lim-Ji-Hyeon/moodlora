// 전역 main의 px-4 py-6를 취소하고 피드 전용 max-w-6xl 컨테이너로 교체
export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </div>
    </div>
  )
}
