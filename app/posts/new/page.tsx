import type { Metadata } from 'next'
import NewPostForm from './_components/NewPostForm'

export const metadata: Metadata = {
  title: '새 글 쓰기 | Moodlora',
}

export default function NewPostPage() {
  return <NewPostForm />
}
