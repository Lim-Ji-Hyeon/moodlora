// 전역 layout의 main 래퍼(px-4 py-6 md:max-w-3xl)를 상쇄하여
// /welcome 페이지가 전체 뷰포트 너비를 사용할 수 있도록 한다.
export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-3.5rem)] flex flex-col">
      {children}
    </div>
  );
}
