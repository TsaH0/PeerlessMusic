export interface Track {
  video_id: string
  title: string
  artist: string
  thumbnail: string
  duration: number
  url?: string
}

export interface StreamResponse {
  track_id: string
  title: string
  artist: string
  thumbnail: string
  duration: number
  audio_url: string
  cached: boolean
}

export interface LibraryTrack {
  track_id: string
  title: string
  artist: string
  thumbnail: string
  duration: number
  audio_url: string
  created_at?: string
}

export interface PlayerState {
  currentTrack: StreamResponse | null
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  isLoading: boolean
  queue: Track[]
}

export interface Playlist {
  id: string
  name: string
  description?: string
  tracks: Track[]
  createdAt: string
  updatedAt: string
  coverImage?: string
  userId?: string
}

export interface User {
  id: string
  username: string
  displayName?: string
}
