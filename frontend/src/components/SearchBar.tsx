import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { searchTracks } from '@/utils/api'
import { cn } from '@/utils/cn'
import { formatDuration } from '@/utils/format'
import type { Track } from '@/types'

interface SearchBarProps {
  onTrackSelect: (track: Track) => void
}

export function SearchBar({ onTrackSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const data = await searchTracks(debouncedQuery)
        setResults(data)
        setSelectedIndex(-1)
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  const handleSelect = (track: Track) => {
    onTrackSelect(track)
    setQuery('')
    setResults([])
    setIsFocused(false)
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  const showResults = isFocused && (results.length > 0 || isLoading || query.trim())

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 sm:px-0">
      <motion.div
        className={cn(
          'relative flex items-center rounded-xl sm:rounded-2xl transition-all duration-300',
          isFocused
            ? 'glass-strong ring-1 ring-white/20 shadow-xl shadow-white/5'
            : 'glass'
        )}
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className="pl-4 sm:pl-5 pr-2 sm:pr-3">
          {isLoading ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
          ) : (
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-surface-500" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search for songs, artists..."
          className="flex-1 bg-transparent py-3 sm:py-4 pr-3 sm:pr-4 text-white placeholder:text-surface-600 focus:outline-none text-base sm:text-lg"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSearch}
              className="mr-3 sm:mr-4 p-1.5 rounded-full hover:bg-surface-800 transition-colors"
            >
              <X className="w-4 h-4 text-surface-500" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-full left-0 right-0 mt-2 sm:mt-3 mx-4 sm:mx-0 glass-strong rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/50 z-50"
          >
            {isLoading ? (
              <div className="p-6 sm:p-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
                <span className="ml-3 text-surface-400 text-sm sm:text-base">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-[350px] sm:max-h-[400px] overflow-y-auto">
                {results.map((track, index) => (
                  <motion.div
                    key={track.video_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelect(track)}
                    className={cn(
                      'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer transition-all duration-200',
                      selectedIndex === index
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                    )}
                  >
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm sm:text-base">
                        {track.title}
                      </p>
                      <p className="text-xs sm:text-sm text-surface-500 truncate">
                        {track.artist}
                      </p>
                    </div>
                    <span className="text-xs sm:text-sm text-surface-600 flex-shrink-0">
                      {formatDuration(track.duration)}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="p-6 sm:p-8 text-center text-surface-500 text-sm sm:text-base">
                No results found for "{query}"
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
