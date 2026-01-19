import { motion } from 'framer-motion'
import { Play, Pause, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDuration } from '@/utils/format'
import type { Track } from '@/types'
import { AddToPlaylistButton } from './AddToPlaylistButton'

interface TrackCardProps {
  track: Track
  isPlaying: boolean
  isLoading: boolean
  isCurrentTrack: boolean
  onClick: () => void
}

export function TrackCard({
  track,
  isPlaying,
  isLoading,
  isCurrentTrack,
  onClick,
}: TrackCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-300',
        'bg-surface-900/50',
        'hover:shadow-2xl hover:shadow-white/5',
        isCurrentTrack && 'ring-2 ring-white/30'
      )}
    >
      <div className="aspect-square relative overflow-hidden">
        <motion.img
          src={track.thumbnail}
          alt={track.title}
          className="w-full h-full object-cover"
          loading="lazy"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.button
            className={cn(
              'w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center',
              'bg-white/10 backdrop-blur-lg border border-white/20',
              'hover:bg-white/20 transition-colors',
              isCurrentTrack && isPlaying && 'bg-white/30'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isLoading && isCurrentTrack ? (
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
            ) : isPlaying && isCurrentTrack ? (
              <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            ) : (
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
            )}
          </motion.button>
        </motion.div>

        {/* Add to Playlist Button */}
        <div 
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <AddToPlaylistButton track={track} iconOnly />
        </div>

        {isCurrentTrack && isPlaying && (
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-0.5 sm:w-1 bg-white rounded-full"
                animate={{
                  height: [8, 16, 8],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-white truncate mb-1 text-sm sm:text-base group-hover:text-surface-200 transition-colors">
          {track.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-surface-500 truncate flex-1 mr-2">
            {track.artist}
          </p>
          {track.duration > 0 && (
            <span className="text-xs text-surface-600 flex-shrink-0">
              {formatDuration(track.duration)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

