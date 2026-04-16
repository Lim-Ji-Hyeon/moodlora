// 전역 layout의 main 래퍼(px-4 py-6 md:max-w-2xl)를 상쇄하여
// /login 페이지가 전체 뷰포트를 사용할 수 있도록 한다.
// Desktop 2분할 레이아웃(브랜드 영역 + 로그인 카드)에 필요.
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-3.5rem)] flex flex-col">
      {children}
    </div>
  )
}
