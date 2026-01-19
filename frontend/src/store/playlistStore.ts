import { create } from 'zustand'
import type { Playlist, Track } from '@/types'
import {
  getPlaylists,
  getPlaylistsByIds,
  createPlaylistApi,
  updatePlaylistApi,
  deletePlaylistApi,
  addTrackToPlaylistApi,
  removeTrackFromPlaylistApi,
} from '@/utils/api'
import { useAuthStore } from './authStore'

interface PlaylistStore {
  playlists: Playlist[]
  activePlaylistId: string | null
  currentPlaylistTrackIndex: number
  isLoading: boolean
  error: string | null

  // Fetch playlists
  fetchPlaylists: () => Promise<void>
  
  // Playlist CRUD
  createPlaylist: (name: string, description?: string) => Promise<string>
  updatePlaylist: (id: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>) => Promise<void>
  deletePlaylist: (id: string) => Promise<void>
  
  // Track management
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>
  removeTrackFromPlaylist: (playlistId: string, videoId: string) => Promise<void>

  // Local getters
  getPlaylist: (id: string) => Playlist | undefined

  // Playback
  setActivePlaylist: (id: string | null) => void
  setCurrentPlaylistTrackIndex: (index: number) => void
  getNextTrack: () => Track | null
  getPreviousTrack: () => Track | null
  isTrackInPlaylist: (playlistId: string, videoId: string) => boolean
  
  // Clear state
  clearPlaylists: () => void
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  activePlaylistId: null,
  currentPlaylistTrackIndex: -1,
  isLoading: false,
  error: null,

  fetchPlaylists: async () => {
    set({ isLoading: true, error: null })
    try {
      const { isAuthenticated, localPlaylistIds } = useAuthStore.getState()
      
      let playlists: Playlist[] = []
      
      if (isAuthenticated) {
        // Fetch user's playlists from server
        playlists = await getPlaylists()
      } else if (localPlaylistIds.length > 0) {
        // Fetch anonymous playlists by IDs
        playlists = await getPlaylistsByIds(localPlaylistIds)
      }
      
      set({ playlists, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch playlists',
        isLoading: false 
      })
    }
  },

  createPlaylist: async (name, description) => {
    set({ isLoading: true, error: null })
    try {
      const newPlaylist = await createPlaylistApi(name, description)
      
      // If anonymous, save playlist ID locally
      const { isAuthenticated, addLocalPlaylistId } = useAuthStore.getState()
      if (!isAuthenticated) {
        addLocalPlaylistId(newPlaylist.id)
      }
      
      set((state) => ({
        playlists: [...state.playlists, newPlaylist],
        isLoading: false,
      }))
      return newPlaylist.id
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create playlist',
        isLoading: false 
      })
      throw error
    }
  },

  updatePlaylist: async (id, updates) => {
    try {
      const updated = await updatePlaylistApi(id, {
        name: updates.name,
        description: updates.description,
        coverImage: updates.coverImage,
      })
      set((state) => ({
        playlists: state.playlists.map((p) => (p.id === id ? updated : p)),
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update playlist' })
      throw error
    }
  },

  deletePlaylist: async (id) => {
    try {
      await deletePlaylistApi(id)
      
      // Remove from local IDs if anonymous
      const { removeLocalPlaylistId } = useAuthStore.getState()
      removeLocalPlaylistId(id)
      
      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== id),
        activePlaylistId: state.activePlaylistId === id ? null : state.activePlaylistId,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete playlist' })
      throw error
    }
  },

  addTrackToPlaylist: async (playlistId, track) => {
    try {
      const updated = await addTrackToPlaylistApi(playlistId, track)
      set((state) => ({
        playlists: state.playlists.map((p) => (p.id === playlistId ? updated : p)),
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add track' })
      throw error
    }
  },

  removeTrackFromPlaylist: async (playlistId, videoId) => {
    try {
      const updated = await removeTrackFromPlaylistApi(playlistId, videoId)
      set((state) => ({
        playlists: state.playlists.map((p) => (p.id === playlistId ? updated : p)),
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove track' })
      throw error
    }
  },

  getPlaylist: (id) => {
    return get().playlists.find((p) => p.id === id)
  },

  setActivePlaylist: (id) => {
    set({ activePlaylistId: id, currentPlaylistTrackIndex: id ? 0 : -1 })
  },

  setCurrentPlaylistTrackIndex: (index) => {
    set({ currentPlaylistTrackIndex: index })
  },

  getNextTrack: () => {
    const { playlists, activePlaylistId, currentPlaylistTrackIndex } = get()
    if (!activePlaylistId) return null

    const playlist = playlists.find((p) => p.id === activePlaylistId)
    if (!playlist || playlist.tracks.length === 0) return null

    const nextIndex = currentPlaylistTrackIndex + 1
    if (nextIndex >= playlist.tracks.length) return null

    return playlist.tracks[nextIndex]
  },

  getPreviousTrack: () => {
    const { playlists, activePlaylistId, currentPlaylistTrackIndex } = get()
    if (!activePlaylistId) return null

    const playlist = playlists.find((p) => p.id === activePlaylistId)
    if (!playlist || playlist.tracks.length === 0) return null

    const prevIndex = currentPlaylistTrackIndex - 1
    if (prevIndex < 0) return null

    return playlist.tracks[prevIndex]
  },

  isTrackInPlaylist: (playlistId, videoId) => {
    const playlist = get().playlists.find((p) => p.id === playlistId)
    return playlist?.tracks.some((t) => t.video_id === videoId) ?? false
  },

  clearPlaylists: () => {
    set({
      playlists: [],
      activePlaylistId: null,
      currentPlaylistTrackIndex: -1,
    })
  },
}))
