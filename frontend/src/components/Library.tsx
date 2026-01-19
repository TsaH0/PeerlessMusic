import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Loader2, RefreshCw, X } from "lucide-react";
import { getLibrary } from "@/utils/api";
import { usePlayerStore } from "@/store/playerStore";
import { AddToPlaylistButton } from "./AddToPlaylistButton";
import { formatDuration } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { LibraryTrack, Track } from "@/types";

interface LibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackSelect: (track: LibraryTrack) => void;
}

export function Library({ isOpen, onClose, onTrackSelect }: LibraryProps) {
  const [tracks, setTracks] = useState<LibraryTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTrack, isPlaying } = usePlayerStore();

  const fetchLibrary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLibrary();
      setTracks(data);
    } catch {
      setError("Failed to load library");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLibrary();
    }
  }, [isOpen]);

  const handleTrackClick = (track: LibraryTrack) => {
    onTrackSelect(track);
  };

  // Convert LibraryTrack to Track for playlist
  // Use track_id as video_id - backend now handles both track_id and video_id
  const toTrack = (libraryTrack: LibraryTrack): Track => ({
    video_id: libraryTrack.track_id,
    title: libraryTrack.title,
    artist: libraryTrack.artist,
    thumbnail: libraryTrack.thumbnail,
    duration: libraryTrack.duration,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Library Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[400px] md:w-[500px] glass-strong border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Library
                  </h2>
                  <p className="text-xs sm:text-sm text-surface-500">
                    {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLibrary}
                  disabled={isLoading}
                  className="p-2 text-surface-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn("w-5 h-5", isLoading && "animate-spin")}
                  />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-surface-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-80px)] overflow-y-auto pb-32">
              {isLoading && tracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  <p className="text-surface-500">Loading library...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 px-4">
                  <p className="text-surface-500 text-center">{error}</p>
                  <button
                    onClick={fetchLibrary}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : tracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 px-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Music className="w-8 h-8 text-surface-600" />
                  </div>
                  <p className="text-surface-500 text-center">
                    Your library is empty.
                    <br />
                    Search and play tracks to add them here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {tracks.map((track, index) => {
                    const isCurrentTrack =
                      currentTrack?.track_id === track.track_id;

                    return (
                      <motion.div
                        key={track.track_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-all duration-200",
                          isCurrentTrack ? "bg-white/10" : "hover:bg-white/5",
                        )}
                      >
                        {/* Thumbnail (clickable) */}
                        <div
                          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg cursor-pointer"
                          onClick={() => handleTrackClick(track)}
                        >
                          <img
                            src={track.thumbnail}
                            alt={track.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {isCurrentTrack && isPlaying && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="flex items-center gap-0.5">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="w-0.5 bg-white rounded-full"
                                    animate={{ height: [8, 16, 8] }}
                                    transition={{
                                      duration: 0.8,
                                      repeat: Infinity,
                                      delay: i * 0.2,
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Info (clickable) */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleTrackClick(track)}
                        >
                          <p
                            className={cn(
                              "font-medium truncate text-sm sm:text-base",
                              isCurrentTrack
                                ? "text-white"
                                : "text-surface-200",
                            )}
                          >
                            {track.title}
                          </p>
                          <p className="text-xs sm:text-sm text-surface-500 truncate">
                            {track.artist}
                          </p>
                        </div>

                        {/* Duration */}
                        {track.duration > 0 && (
                          <span className="text-xs sm:text-sm text-surface-600 flex-shrink-0">
                            {formatDuration(track.duration)}
                          </span>
                        )}

                        {/* Add to Playlist Button */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <AddToPlaylistButton
                            track={toTrack(track)}
                            iconOnly
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
