import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <p className="text-lg font-medium text-foreground">페이지를 찾을 수 없어요</p>
      <p className="text-sm text-muted-foreground">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/feed">피드로 돌아가기</Link>
      </Button>
    </div>
  )
}
