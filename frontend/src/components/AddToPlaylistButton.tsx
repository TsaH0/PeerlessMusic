import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, ListMusic, X } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { usePlaylistStore } from '@/store/playlistStore'
import { cn } from '@/utils/cn'
import type { Track } from '@/types'

interface AddToPlaylistButtonProps {
  track: Track
  className?: string
  iconOnly?: boolean
}

export function AddToPlaylistButton({
  track,
  className = '',
  iconOnly = false,
}: AddToPlaylistButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const { 
    playlists, 
    createPlaylist, 
    addTrackToPlaylist, 
    isTrackInPlaylist,
    fetchPlaylists 
  } = usePlaylistStore()

  // Fetch playlists when dropdown opens
  useEffect(() => {
    if (isOpen && playlists.length === 0) {
      fetchPlaylists()
    }
  }, [isOpen, playlists.length, fetchPlaylists])

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      await addTrackToPlaylist(playlistId, track)
      setJustAdded(playlistId)
      setTimeout(() => setJustAdded(null), 1500)
    } catch {
      // Error handled in store
    }
  }

  const handleCreateAndAdd = async () => {
    if (newPlaylistName.trim()) {
      try {
        const id = await createPlaylist(newPlaylistName.trim())
        await addTrackToPlaylist(id, track)
        setNewPlaylistName('')
        setIsCreating(false)
        setJustAdded(id)
        setTimeout(() => {
          setJustAdded(null)
          setIsOpen(false)
        }, 1500)
      } catch {
        // Error handled in store
      }
    }
  }

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <motion.button
          className={cn(
            'p-2 rounded-lg bg-surface-800/80 hover:bg-surface-700 text-surface-400 hover:text-white transition-all',
            className
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="w-4 h-4" />
          {!iconOnly && <span className="ml-1.5 text-sm">Add to Playlist</span>}
        </motion.button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] max-h-[300px] overflow-y-auto bg-surface-900 border border-surface-700 rounded-xl p-2 shadow-2xl z-[100]"
          sideOffset={5}
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1.5 text-xs text-surface-500 uppercase tracking-wider">
            Add to Playlist
          </div>

          <AnimatePresence>
            {isCreating ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="New playlist name..."
                    className="flex-1 bg-surface-800 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500 border border-surface-600"
                    autoFocus
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === 'Enter') handleCreateAndAdd()
                      if (e.key === 'Escape') {
                        setIsCreating(false)
                        setNewPlaylistName('')
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={handleCreateAndAdd}
                    disabled={!newPlaylistName.trim()}
                    className="p-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewPlaylistName('')
                    }}
                    className="p-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-800 rounded-lg cursor-pointer outline-none text-primary-400"
                onClick={() => setIsCreating(true)}
                onSelect={(e) => e.preventDefault()}
              >
                <Plus className="w-4 h-4" />
                Create New Playlist
              </DropdownMenu.Item>
            )}
          </AnimatePresence>

          {playlists.length > 0 && (
            <>
              <DropdownMenu.Separator className="h-px bg-surface-700 my-1" />
              {playlists.map((playlist) => {
                const isInPlaylist = isTrackInPlaylist(playlist.id, track.video_id)
                const wasJustAdded = justAdded === playlist.id

                return (
                  <DropdownMenu.Item
                    key={playlist.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer outline-none transition-colors',
                      isInPlaylist
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'hover:bg-surface-800'
                    )}
                    onClick={() => {
                      if (!isInPlaylist) {
                        handleAddToPlaylist(playlist.id)
                      }
                    }}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <ListMusic className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{playlist.name}</span>
                    {(isInPlaylist || wasJustAdded) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-500"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </DropdownMenu.Item>
                )
              })}
            </>
          )}

          {playlists.length === 0 && !isCreating && (
            <div className="px-3 py-2 text-sm text-surface-500">
              No playlists yet. Create one!
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
