import { useEffect, useCallback } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { usePlaylistStore } from '@/store/playlistStore'
import { streamTrack } from '@/utils/api'

// Global singleton audio instance
const globalAudio = new Audio()
globalAudio.preload = 'auto' // Better for streaming

export function useAudio() {
  const {
    currentTrack,
    isPlaying,
    volume,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setIsLoading,
    setCurrentTrack,
  } = usePlayerStore()

  const {
    getNextTrack,
    getPreviousTrack,
    activePlaylistId,
    currentPlaylistTrackIndex,
    setCurrentPlaylistTrackIndex,
  } = usePlaylistStore()

  // Handle track ended - auto play next track
  const playNextTrack = useCallback(async () => {
    const nextTrack = getNextTrack()
    
    if (nextTrack && activePlaylistId) {
      const nextIndex = currentPlaylistTrackIndex + 1
      setCurrentPlaylistTrackIndex(nextIndex)
      setIsLoading(true)

      try {
        const response = await streamTrack(nextTrack.video_id)
        setCurrentTrack(response)
        setIsPlaying(true)
      } catch (error) {
        console.error('Failed to play next track:', error)
        setIsPlaying(false)
      } finally {
        setIsLoading(false)
      }
    } else {
      // No next track, stop playing
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [
    getNextTrack,
    activePlaylistId,
    currentPlaylistTrackIndex,
    setCurrentPlaylistTrackIndex,
    setCurrentTrack,
    setIsPlaying,
    setIsLoading,
    setCurrentTime,
  ])

  useEffect(() => {
    const audio = globalAudio

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      // Try to play next track in playlist
      playNextTrack()
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleError = () => {
      console.error("Audio error:", audio.error)
      setIsPlaying(false)
      setIsLoading(false)
    }


    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [setCurrentTime, setDuration, setIsPlaying, setIsLoading, playNextTrack])

  // Handle source change
  useEffect(() => {
    if (currentTrack?.audio_url) {
      // Only set source if it's different to prevent reloading
      if (globalAudio.src !== currentTrack.audio_url) {
        globalAudio.src = currentTrack.audio_url
        globalAudio.load()
        if (isPlaying) {
          globalAudio.play().catch(e => console.warn("Play failed:", e))
        }
      }
    }
  }, [currentTrack?.audio_url, isPlaying])

  // Handle play/pause toggle
  useEffect(() => {
    if (currentTrack?.audio_url) {
      if (isPlaying) {
        globalAudio.play().catch(e => console.warn("Play failed:", e))
      } else {
        globalAudio.pause()
      }
    }
  }, [isPlaying, currentTrack?.audio_url])

  // Handle volume
  useEffect(() => {
    globalAudio.volume = volume
  }, [volume])

  const seek = useCallback((time: number) => {
    if (Number.isFinite(time)) {
      globalAudio.currentTime = time
      setCurrentTime(time)
    }
  }, [setCurrentTime])

  // Skip to next/previous track
  const skipNext = useCallback(async () => {
    const nextTrack = getNextTrack()
    if (nextTrack && activePlaylistId) {
      const nextIndex = currentPlaylistTrackIndex + 1
      setCurrentPlaylistTrackIndex(nextIndex)
      setIsLoading(true)

      try {
        const response = await streamTrack(nextTrack.video_id)
        setCurrentTrack(response)
        setIsPlaying(true)
      } catch (error) {
        console.error('Failed to skip to next track:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [
    getNextTrack,
    activePlaylistId,
    currentPlaylistTrackIndex,
    setCurrentPlaylistTrackIndex,
    setCurrentTrack,
    setIsPlaying,
    setIsLoading,
  ])

  const skipPrevious = useCallback(async () => {
    const prevTrack = getPreviousTrack()
    
    // If we're more than 3 seconds into the song, restart it instead
    if (globalAudio.currentTime > 3) {
      globalAudio.currentTime = 0
      setCurrentTime(0)
      return
    }
    
    if (prevTrack && activePlaylistId) {
      const prevIndex = currentPlaylistTrackIndex - 1
      setCurrentPlaylistTrackIndex(prevIndex)
      setIsLoading(true)

      try {
        const response = await streamTrack(prevTrack.video_id)
        setCurrentTrack(response)
        setIsPlaying(true)
      } catch (error) {
        console.error('Failed to skip to previous track:', error)
      } finally {
        setIsLoading(false)
      }
    } else {
      // No previous track, just restart current
      globalAudio.currentTime = 0
      setCurrentTime(0)
    }
  }, [
    getPreviousTrack,
    activePlaylistId,
    currentPlaylistTrackIndex,
    setCurrentPlaylistTrackIndex,
    setCurrentTrack,
    setIsPlaying,
    setIsLoading,
    setCurrentTime,
  ])

  return { seek, skipNext, skipPrevious }
}
