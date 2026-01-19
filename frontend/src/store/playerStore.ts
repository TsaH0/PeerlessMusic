import { create } from 'zustand'
import type { StreamResponse, Track } from '@/types'

interface PlayerStore {
  currentTrack: StreamResponse | null
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  isLoading: boolean
  queue: Track[]

  setCurrentTrack: (track: StreamResponse | null) => void
  setIsPlaying: (playing: boolean) => void
  togglePlayPause: () => void
  setVolume: (volume: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setIsLoading: (loading: boolean) => void
  addToQueue: (track: Track) => void
  removeFromQueue: (videoId: string) => void
  clearQueue: () => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  queue: [],

  setCurrentTrack: (track) => set({ currentTrack: track, currentTime: 0 }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  addToQueue: (track) => set((state) => ({
    queue: [...state.queue.filter(t => t.video_id !== track.video_id), track]
  })),
  removeFromQueue: (videoId) => set((state) => ({
    queue: state.queue.filter(t => t.video_id !== videoId)
  })),
  clearQueue: () => set({ queue: [] }),
}))
