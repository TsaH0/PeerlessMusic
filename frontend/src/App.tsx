import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CursorGlow } from '@/components/CursorGlow'
import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { SearchBar } from '@/components/SearchBar'
import { RecentTracks } from '@/components/RecentTracks'
import { Player } from '@/components/Player'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { Toast, type ToastType } from '@/components/Toast'
import { Library } from '@/components/Library'
import { PlaylistsPanel } from '@/components/PlaylistsPanel'
import { usePlayerStore } from '@/store/playerStore'
import { usePlaylistStore } from '@/store/playlistStore'
import { useAuthStore } from '@/store/authStore'
import { useAudio } from '@/hooks/useAudio'
import { streamTrack } from '@/utils/api'
import type { Track, LibraryTrack } from '@/types'

const RECENT_TRACKS_KEY = 'peerless_recent_tracks'

function App() {
  const { checkAuth } = useAuthStore()
  const { fetchPlaylists } = usePlaylistStore()
  
  const [recentTracks, setRecentTracks] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_TRACKS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
    isVisible: boolean
  }>({ message: '', type: 'info', isVisible: false })

  const { setCurrentTrack, setIsPlaying, setIsLoading, currentTrack, isPlaying } =
    usePlayerStore()

  const { setCurrentPlaylistTrackIndex, setActivePlaylist } = usePlaylistStore()

  useAudio()

  // Check auth and fetch playlists on app load
  useEffect(() => {
    const init = async () => {
      await checkAuth()
      await fetchPlaylists()
    }
    init()
  }, [checkAuth, fetchPlaylists])

  // Persist recent tracks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_TRACKS_KEY, JSON.stringify(recentTracks))
    } catch {
      // Ignore localStorage errors
    }
  }, [recentTracks])

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }))
    }, 4000)
  }

  const handleTrackSelect = useCallback(
    async (track: Track) => {
      if (
        currentTrack?.title === track.title &&
        currentTrack?.artist === track.artist
      ) {
        setIsPlaying(!isPlaying)
        return
      }

      // Clear active playlist when playing from search/recent
      setActivePlaylist(null)

      setIsLoading(true)
      setIsProcessing(true)
      setProcessingMessage('Preparing your track...')

      try {
        const response = await streamTrack(track.video_id)

        setCurrentTrack(response)
        setIsPlaying(true)

        setRecentTracks((prev) => {
          const filtered = prev.filter((t) => t.video_id !== track.video_id)
          return [track, ...filtered].slice(0, 10)
        })

        if (response.cached) {
          showToast('Playing from cache', 'info')
        } else {
          showToast('Track ready', 'success')
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load track'
        showToast(message, 'error')
      } finally {
        setIsLoading(false)
        setIsProcessing(false)
      }
    },
    [currentTrack, isPlaying, setCurrentTrack, setIsPlaying, setIsLoading, setActivePlaylist]
  )

  const handleLibraryTrackSelect = useCallback(
    (libraryTrack: LibraryTrack) => {
      if (currentTrack?.track_id === libraryTrack.track_id) {
        setIsPlaying(!isPlaying)
        return
      }

      // Clear active playlist when playing from library
      setActivePlaylist(null)

      setCurrentTrack({
        track_id: libraryTrack.track_id,
        title: libraryTrack.title,
        artist: libraryTrack.artist,
        thumbnail: libraryTrack.thumbnail,
        duration: libraryTrack.duration,
        audio_url: libraryTrack.audio_url,
        cached: true,
      })
      setIsPlaying(true)
      showToast('Playing from library', 'info')
      setIsLibraryOpen(false)
    },
    [currentTrack, isPlaying, setCurrentTrack, setIsPlaying, setActivePlaylist]
  )

  const handlePlaylistTrackSelect = useCallback(
    async (track: Track, _playlistId: string, trackIndex: number) => {
      if (
        currentTrack?.title === track.title &&
        currentTrack?.artist === track.artist
      ) {
        setIsPlaying(!isPlaying)
        return
      }

      setCurrentPlaylistTrackIndex(trackIndex)
      setIsLoading(true)
      setIsProcessing(true)
      setProcessingMessage('Preparing your track...')

      try {
        const response = await streamTrack(track.video_id)

        setCurrentTrack(response)
        setIsPlaying(true)

        setRecentTracks((prev) => {
          const filtered = prev.filter((t) => t.video_id !== track.video_id)
          return [track, ...filtered].slice(0, 10)
        })

        showToast('Playing from playlist', 'info')
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load track'
        showToast(message, 'error')
      } finally {
        setIsLoading(false)
        setIsProcessing(false)
      }
    },
    [currentTrack, isPlaying, setCurrentTrack, setIsPlaying, setIsLoading, setCurrentPlaylistTrackIndex]
  )

  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-x-hidden">
      <CursorGlow />
      <Header 
        onLibraryClick={() => setIsLibraryOpen(true)} 
        onPlaylistsClick={() => setIsPlaylistsOpen(true)}
      />

      <main className="relative pb-28 sm:pb-32">
        <HeroSection />

        <motion.div
          className="relative z-10 -mt-2 sm:-mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <SearchBar onTrackSelect={handleTrackSelect} />
        </motion.div>

        <RecentTracks tracks={recentTracks} onTrackClick={handleTrackSelect} />

        {recentTracks.length === 0 && (
          <motion.div
            className="text-center py-12 sm:py-20 px-4 sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-surface-600 text-base sm:text-lg">
              Search for your favorite songs to get started
            </p>
          </motion.div>
        )}
      </main>

      <Player />

      <Library
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onTrackSelect={handleLibraryTrackSelect}
      />

      <PlaylistsPanel
        isOpen={isPlaylistsOpen}
        onClose={() => setIsPlaylistsOpen(false)}
        onTrackSelect={handlePlaylistTrackSelect}
      />

      <LoadingOverlay isVisible={isProcessing} message={processingMessage} />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}

export default App
