import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Slider from "@radix-ui/react-slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
  ChevronDown,
  X,
} from "lucide-react";
import { useState, useRef } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/format";

export function Player() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);

  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLoading,
    setVolume,
    togglePlayPause,
  } = usePlayerStore();

  const { seek, skipNext, skipPrevious } = useAudio();

  useEffect(() => {
    if ("mediaSession" in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: [
          { src: currentTrack.thumbnail, sizes: "512x512", type: "image/jpeg" },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => togglePlayPause());
      navigator.mediaSession.setActionHandler("pause", () => togglePlayPause());
      navigator.mediaSession.setActionHandler("previoustrack", () =>
        skipPrevious(),
      );
      navigator.mediaSession.setActionHandler("nexttrack", () => skipNext());
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      });
    }
  }, [currentTrack, togglePlayPause, skipNext, skipPrevious, seek]);

  const handleVolumeToggle = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) return null;

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-xl"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        className={cn(
          "fixed z-50 shadow-2xl shadow-black/50",
          isExpanded
            ? "inset-0 sm:inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[90vh] bg-gradient-to-b from-surface-900 to-surface-950 md:rounded-3xl"
            : "bottom-0 left-0 right-0 glass-strong rounded-t-2xl sm:rounded-t-3xl",
        )}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Mini player drag handle */}
        {!isExpanded && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-surface-600 rounded-full cursor-pointer hover:bg-surface-500 transition-colors"
            onClick={() => setIsExpanded(true)}
          />
        )}

        {/* Progress bar for mini player */}
        {!isExpanded && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-surface-800 overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
            <div
              className="h-full bg-white/80 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className={cn("p-3 sm:p-4", isExpanded && "p-0")}>
          {isExpanded ? (
            <ExpandedPlayer
              track={currentTrack}
              isPlaying={isPlaying}
              isLoading={isLoading}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              onPlayPause={togglePlayPause}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onVolumeToggle={handleVolumeToggle}
              onCollapse={() => setIsExpanded(false)}
              onSkipNext={skipNext}
              onSkipPrevious={skipPrevious}
            />
          ) : (
            <MiniPlayer
              track={currentTrack}
              isPlaying={isPlaying}
              isLoading={isLoading}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              onPlayPause={togglePlayPause}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onVolumeToggle={handleVolumeToggle}
              onExpand={() => setIsExpanded(true)}
              onSkipNext={skipNext}
              onSkipPrevious={skipPrevious}
            />
          )}
        </div>
      </motion.div>
    </>
  );
}

interface PlayerProps {
  track: {
    title: string;
    artist: string;
    thumbnail: string;
  };
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onSeek: (value: number[]) => void;
  onVolumeChange: (value: number[]) => void;
  onVolumeToggle: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
}

interface MiniPlayerProps extends PlayerProps {
  onExpand: () => void;
}

function MiniPlayer({
  track,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlayPause,
  onVolumeChange,
  onVolumeToggle,
  onExpand,
  onSkipNext,
  onSkipPrevious,
}: MiniPlayerProps) {
  const handleControlClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
  };

  return (
    <div
      className="flex items-center gap-3 sm:gap-4 cursor-pointer"
      onClick={onExpand}
    >
      {/* Thumbnail */}
      <motion.div
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden shadow-lg flex-shrink-0"
        whileHover={{ scale: 1.05 }}
      >
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-full h-full object-cover"
        />
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-white rounded-full"
                  animate={{
                    height: ["8px", "16px", "8px"],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate text-sm sm:text-base">
          {track.title}
        </p>
        <p className="text-xs sm:text-sm text-surface-500 truncate">
          {track.artist}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs text-surface-600 hidden sm:block w-20 text-right">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>

        {/* Volume Controls - Desktop only */}
        <div
          className="hidden md:flex items-center gap-2 ml-2 sm:ml-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => handleControlClick(e, onVolumeToggle)}
            className="p-2 text-surface-500 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
          <Slider.Root
            className="relative flex items-center w-20 sm:w-24 h-5 select-none touch-none"
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={onVolumeChange}
          >
            <Slider.Track className="bg-surface-800 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-white rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-3 h-3 bg-white rounded-full hover:scale-110 focus:outline-none transition-transform" />
          </Slider.Root>
        </div>

        {/* Playback Controls */}
        <div
          className="flex items-center gap-0.5 sm:gap-1 ml-1 sm:ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            onClick={(e) => handleControlClick(e, onSkipPrevious)}
            className="p-1.5 sm:p-2 text-surface-500 hover:text-white transition-colors hidden sm:block"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>

          <motion.button
            onClick={(e) => handleControlClick(e, onPlayPause)}
            className="p-2.5 sm:p-3 rounded-full bg-white text-surface-900 hover:bg-surface-200 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            )}
          </motion.button>

          <motion.button
            onClick={(e) => handleControlClick(e, onSkipNext)}
            className="p-1.5 sm:p-2 text-surface-500 hover:text-white transition-colors hidden sm:block"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

interface ExpandedPlayerProps extends PlayerProps {
  onCollapse: () => void;
}

function ExpandedPlayer({
  track,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onVolumeToggle,
  onCollapse,
  onSkipNext,
  onSkipPrevious,
}: ExpandedPlayerProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      onSeek([Math.max(0, Math.min(duration, newTime))]);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen sm:min-h-0 md:min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <button
          onClick={onCollapse}
          className="p-2 text-surface-500 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <span className="text-sm text-surface-500 font-medium">
          Now Playing
        </span>
        <button
          onClick={onCollapse}
          className="p-2 text-surface-500 hover:text-white transition-colors rounded-full hover:bg-white/10 md:hidden"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="w-10 hidden md:block" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 pb-8">
        {/* Album Art */}
        <motion.div
          className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 mb-8"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <img
            src={track.thumbnail}
            alt={track.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {isPlaying && (
            <motion.div
              className="absolute inset-0 border-4 border-white/20 rounded-2xl"
              animate={{
                boxShadow: [
                  "inset 0 0 30px rgba(255, 255, 255, 0.1)",
                  "inset 0 0 60px rgba(255, 255, 255, 0.15)",
                  "inset 0 0 30px rgba(255, 255, 255, 0.1)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Track Info */}
        <div className="text-center mb-6 w-full max-w-sm">
          <motion.h2
            className="text-xl sm:text-2xl font-bold text-white truncate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {track.title}
          </motion.h2>
          <motion.p
            className="text-surface-400 mt-1 text-base sm:text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {track.artist}
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-sm mb-6">
          <div
            ref={progressRef}
            className="relative h-2 bg-surface-800 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <Slider.Root
              className="absolute inset-0 flex items-center select-none touch-none"
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={onSeek}
            >
              <Slider.Track className="relative grow rounded-full h-2">
                <Slider.Range className="absolute bg-white rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110 focus:outline-none transition-all" />
            </Slider.Root>
          </div>
          <div className="flex justify-between mt-2 text-xs text-surface-500">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mb-8">
          <motion.button
            onClick={onSkipPrevious}
            className="p-3 text-surface-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipBack className="w-7 h-7 sm:w-8 sm:h-8" />
          </motion.button>

          <motion.button
            onClick={onPlayPause}
            className="p-5 sm:p-6 rounded-full bg-white text-surface-900 hover:bg-surface-100 transition-colors shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 sm:w-10 sm:h-10" />
            ) : (
              <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" />
            )}
          </motion.button>

          <motion.button
            onClick={onSkipNext}
            className="p-3 text-surface-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipForward className="w-7 h-7 sm:w-8 sm:h-8" />
          </motion.button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <button
            onClick={onVolumeToggle}
            className="p-2 text-surface-500 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <Slider.Root
            className="relative flex items-center flex-1 h-5 select-none touch-none group"
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={onVolumeChange}
          >
            <Slider.Track className="bg-surface-800 relative grow rounded-full h-1.5">
              <Slider.Range className="absolute bg-white rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-lg hover:scale-110 focus:outline-none transition-transform" />
          </Slider.Root>
        </div>
      </div>
    </div>
  );
}
