import { motion, AnimatePresence } from 'framer-motion'
import { TrackCard } from './TrackCard'
import { usePlayerStore } from '@/store/playerStore'
import type { Track } from '@/types'

interface RecentTracksProps {
  tracks: Track[]
  onTrackClick: (track: Track) => void
}

export function RecentTracks({ tracks, onTrackClick }: RecentTracksProps) {
  const { currentTrack, isPlaying, isLoading } = usePlayerStore()

  if (tracks.length === 0) return null

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Recently Played
        </motion.h2>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {tracks.map((track, index) => (
              <motion.div
                key={track.video_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <TrackCard
                  track={track}
                  isPlaying={isPlaying}
                  isLoading={isLoading}
                  isCurrentTrack={currentTrack?.track_id === track.video_id ||
                    (currentTrack?.title === track.title && currentTrack?.artist === track.artist)}
                  onClick={() => onTrackClick(track)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
