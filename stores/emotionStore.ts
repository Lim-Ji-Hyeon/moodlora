import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EmotionType } from '@/lib/constants/emotions'

interface EmotionStore {
  currentEmotion: EmotionType | null
  setCurrentEmotion: (emotion: EmotionType) => void
  clearEmotion: () => void
}

export const useEmotionStore = create<EmotionStore>()(
  persist(
    (set) => ({
      currentEmotion: null,
      setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),
      clearEmotion: () => set({ currentEmotion: null }),
    }),
    { name: 'moodlora-emotion' }
  )
)
