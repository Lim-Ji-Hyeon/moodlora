import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EmotionType } from '@/lib/constants/emotions'

// ─── 쿠키 헬퍼 ───────────────────────────────────────────────────────────────
// Next.js Middleware(서버 사이드)에서 감정 선택 여부를 읽기 위해
// localStorage(persist)와 함께 쿠키도 동기화한다.

const COOKIE_NAME = 'emotion_selected'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30일

function setCookie(value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

function deleteCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

// ─── 스토어 ───────────────────────────────────────────────────────────────────

interface EmotionStore {
  currentEmotion: EmotionType | null
  setCurrentEmotion: (emotion: EmotionType) => void
  clearEmotion: () => void
}

export const useEmotionStore = create<EmotionStore>()(
  persist(
    (set) => ({
      currentEmotion: null,
      setCurrentEmotion: (emotion) => {
        set({ currentEmotion: emotion })
        setCookie(emotion)
      },
      clearEmotion: () => {
        set({ currentEmotion: null })
        deleteCookie()
      },
    }),
    { name: 'moodlora-emotion' }
  )
)
