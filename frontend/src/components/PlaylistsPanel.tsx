import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Plus,
  Music,
  Trash2,
  Play,
  MoreVertical,
  ListMusic,
  Edit2,
  Check,
  Loader2,
  User,
  Key,
  LogIn,
  UserPlus,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { usePlaylistStore } from '@/store/playlistStore'
import { usePlayerStore } from '@/store/playerStore'
import { useAuthStore } from '@/store/authStore'
import { createIdentity, loginIdentity } from '@/utils/api'
import type { Track, Playlist } from '@/types'
import { formatDuration } from '@/utils/format'
import { cn } from '@/utils/cn'

interface PlaylistsPanelProps {
  isOpen: boolean
  onClose: () => void
  onTrackSelect: (track: Track, playlistId: string, trackIndex: number) => void
}

export function PlaylistsPanel({
  isOpen,
  onClose,
  onTrackSelect,
}: PlaylistsPanelProps) {
  const { user, isAuthenticated, localPlaylistIds, setUser } = useAuthStore()
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  
  // Identity state
  const [showIdentityModal, setShowIdentityModal] = useState(false)
  const [identityMode, setIdentityMode] = useState<'create' | 'login'>('create')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [identityError, setIdentityError] = useState('')
  const [identityLoading, setIdentityLoading] = useState(false)

  const {
    playlists,
    isLoading,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    activePlaylistId,
    setActivePlaylist,
    currentPlaylistTrackIndex,
    fetchPlaylists,
    removeTrackFromPlaylist,
  } = usePlaylistStore()

  const { currentTrack, isPlaying } = usePlayerStore()

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId)

  // Fetch playlists when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchPlaylists()
    }
  }, [isOpen, fetchPlaylists])

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      try {
        const id = await createPlaylist(newPlaylistName.trim())
        setNewPlaylistName('')
        setIsCreating(false)
        setSelectedPlaylistId(id)
      } catch {
        // Error handled in store
      }
    }
  }

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
      setActivePlaylist(playlist.id)
      onTrackSelect(playlist.tracks[0], playlist.id, 0)
    }
  }

  const handleTrackClick = (track: Track, index: number, playlistId: string) => {
    setActivePlaylist(playlistId)
    onTrackSelect(track, playlistId, index)
  }

  const startEditing = (playlist: Playlist) => {
    setEditingId(playlist.id)
    setEditName(playlist.name)
  }

  const saveEdit = async () => {
    if (editingId && editName.trim()) {
      await updatePlaylist(editingId, { name: editName.trim() })
    }
    setEditingId(null)
  }

  const handleDeletePlaylist = async (id: string) => {
    await deletePlaylist(id)
  }

  const handleRemoveTrack = async (playlistId: string, videoId: string) => {
    await removeTrackFromPlaylist(playlistId, videoId)
  }

  // Identity handlers
  const handleCreateIdentity = async () => {
    if (!username.trim() || !password.trim()) {
      setIdentityError('Username and password are required')
      return
    }
    
    setIdentityLoading(true)
    setIdentityError('')
    
    try {
      const identity = await createIdentity(
        username.trim(),
        password,
        displayName.trim() || undefined,
        localPlaylistIds  // Assign anonymous playlists to new identity
      )
      
      setUser({
        id: identity.id,
        username: identity.username,
        displayName: identity.display_name,
      })
      
      // Clear form and close modal
      setUsername('')
      setPassword('')
      setDisplayName('')
      setShowIdentityModal(false)
      
      // Refresh playlists
      await fetchPlaylists()
    } catch (error) {
      setIdentityError(error instanceof Error ? error.message : 'Failed to create identity')
    } finally {
      setIdentityLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setIdentityError('Username and password are required')
      return
    }
    
    setIdentityLoading(true)
    setIdentityError('')
    
    try {
      const identity = await loginIdentity(username.trim(), password)
      
      setUser({
        id: identity.id,
        username: identity.username,
        displayName: identity.display_name,
      })
      
      // Clear form and close modal
      setUsername('')
      setPassword('')
      setShowIdentityModal(false)
      
      // Refresh playlists
      await fetchPlaylists()
    } catch (error) {
      setIdentityError(error instanceof Error ? error.message : 'Invalid credentials')
    } finally {
      setIdentityLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-surface-950 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-800">
              <div className="flex items-center gap-3">
                {selectedPlaylist ? (
                  <button
                    onClick={() => setSelectedPlaylistId(null)}
                    className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
                  >
                    <ListMusic className="w-5 h-5" />
                  </button>
                ) : (
                  <ListMusic className="w-6 h-6 text-primary-400" />
                )}
                <h2 className="text-xl font-bold">
                  {selectedPlaylist ? selectedPlaylist.name : 'Your Playlists'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-surface-500" />
                </div>
              ) : selectedPlaylist ? (
                <PlaylistDetail
                  playlist={selectedPlaylist}
                  onTrackClick={(track, index) =>
                    handleTrackClick(track, index, selectedPlaylist.id)
                  }
                  onRemoveTrack={(videoId) => handleRemoveTrack(selectedPlaylist.id, videoId)}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  isActivePlaylist={activePlaylistId === selectedPlaylist.id}
                  currentTrackIndex={currentPlaylistTrackIndex}
                />
              ) : (
                <>
                  {/* Identity Section */}
                  {!isAuthenticated && (
                    <div className="mb-6 p-4 bg-surface-900/50 rounded-xl border border-surface-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">Create Your Identity</h3>
                          <p className="text-xs text-surface-500">Save playlists across devices (optional)</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIdentityMode('create')
                            setShowIdentityModal(true)
                            setIdentityError('')
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-medium transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          Create New
                        </button>
                        <button
                          onClick={() => {
                            setIdentityMode('login')
                            setShowIdentityModal(true)
                            setIdentityError('')
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-surface-800 hover:bg-surface-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <LogIn className="w-4 h-4" />
                          Sign In
                        </button>
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  {isAuthenticated && user && (
                    <div className="mb-6 p-4 bg-surface-900/50 rounded-xl border border-surface-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-lg font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{user.displayName || user.username}</h3>
                          <p className="text-xs text-surface-500">@{user.username}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <PlaylistList
                    playlists={playlists}
                    activePlaylistId={activePlaylistId}
                    isCreating={isCreating}
                    newPlaylistName={newPlaylistName}
                    editingId={editingId}
                    editName={editName}
                    onCreateClick={() => setIsCreating(true)}
                    onCancelCreate={() => {
                      setIsCreating(false)
                      setNewPlaylistName('')
                    }}
                    onNameChange={setNewPlaylistName}
                    onSubmitCreate={handleCreatePlaylist}
                    onSelectPlaylist={setSelectedPlaylistId}
                    onPlayPlaylist={handlePlayPlaylist}
                    onDeletePlaylist={handleDeletePlaylist}
                    onStartEditing={startEditing}
                    onEditNameChange={setEditName}
                    onSaveEdit={saveEdit}
                  />
                </>
              )}
            </div>

            {/* Identity Modal */}
            <AnimatePresence>
              {showIdentityModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10"
                  onClick={() => setShowIdentityModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-sm bg-surface-900 rounded-2xl p-6 border border-surface-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-xl font-bold mb-1">
                      {identityMode === 'create' ? 'Create Your Identity' : 'Sign In'}
                    </h3>
                    <p className="text-sm text-surface-500 mb-6">
                      {identityMode === 'create'
                        ? 'Choose a username and password to save your playlists'
                        : 'Sign in with your existing identity'}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-surface-400 mb-1">Username</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="your_username"
                            className="w-full bg-surface-800 pl-10 pr-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 border border-surface-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-surface-400 mb-1">Password</label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-surface-800 pl-10 pr-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 border border-surface-700"
                          />
                        </div>
                      </div>

                      {identityMode === 'create' && (
                        <div>
                          <label className="block text-sm text-surface-400 mb-1">
                            Display Name <span className="text-surface-600">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your Name"
                            className="w-full bg-surface-800 px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 border border-surface-700"
                          />
                        </div>
                      )}

                      {identityError && (
                        <p className="text-red-400 text-sm">{identityError}</p>
                      )}

                      <button
                        onClick={identityMode === 'create' ? handleCreateIdentity : handleLogin}
                        disabled={identityLoading}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {identityLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : identityMode === 'create' ? (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Create Identity
                          </>
                        ) : (
                          <>
                            <LogIn className="w-4 h-4" />
                            Sign In
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setIdentityMode(identityMode === 'create' ? 'login' : 'create')
                          setIdentityError('')
                        }}
                        className="w-full py-2 text-sm text-surface-400 hover:text-white transition-colors"
                      >
                        {identityMode === 'create'
                          ? 'Already have an identity? Sign in'
                          : "Don't have an identity? Create one"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface PlaylistListProps {
  playlists: Playlist[]
  activePlaylistId: string | null
  isCreating: boolean
  newPlaylistName: string
  editingId: string | null
  editName: string
  onCreateClick: () => void
  onCancelCreate: () => void
  onNameChange: (name: string) => void
  onSubmitCreate: () => void
  onSelectPlaylist: (id: string) => void
  onPlayPlaylist: (playlist: Playlist) => void
  onDeletePlaylist: (id: string) => void
  onStartEditing: (playlist: Playlist) => void
  onEditNameChange: (name: string) => void
  onSaveEdit: () => void
}

function PlaylistList({
  playlists,
  activePlaylistId,
  isCreating,
  newPlaylistName,
  editingId,
  editName,
  onCreateClick,
  onCancelCreate,
  onNameChange,
  onSubmitCreate,
  onSelectPlaylist,
  onPlayPlaylist,
  onDeletePlaylist,
  onStartEditing,
  onEditNameChange,
  onSaveEdit,
}: PlaylistListProps) {
  return (
    <div className="space-y-4">
      {/* Create Button */}
      {!isCreating ? (
        <motion.button
          onClick={onCreateClick}
          className="w-full p-4 border-2 border-dashed border-surface-700 rounded-xl hover:border-primary-500 hover:bg-surface-900/50 transition-all flex items-center justify-center gap-2 text-surface-400 hover:text-primary-400"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus className="w-5 h-5" />
          <span>Create New Playlist</span>
        </motion.button>
      ) : (
        <div className="p-4 bg-surface-900 rounded-xl border border-surface-700">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Playlist name..."
            className="w-full bg-transparent border-b border-surface-600 pb-2 mb-3 outline-none focus:border-primary-500 transition-colors"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmitCreate()
              if (e.key === 'Escape') onCancelCreate()
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={onSubmitCreate}
              disabled={!newPlaylistName.trim()}
              className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 rounded-lg transition-colors"
            >
              Create
            </button>
            <button
              onClick={onCancelCreate}
              className="px-4 py-2 bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Playlist Items */}
      {playlists.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <Music className="w-12 h-12 mx-auto text-surface-600 mb-4" />
          <p className="text-surface-500">No playlists yet</p>
          <p className="text-sm text-surface-600 mt-1">
            Create one to start organizing your music
          </p>
        </div>
      )}

      <div className="space-y-2">
        {playlists.map((playlist) => (
          <motion.div
            key={playlist.id}
            className={cn(
              'group relative p-3 sm:p-4 bg-surface-900/50 hover:bg-surface-800/80 rounded-xl transition-all cursor-pointer border border-transparent',
              activePlaylistId === playlist.id && 'border-primary-500/50 bg-surface-800/60'
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
          >
            <div
              className="flex items-center gap-3"
              onClick={() => onSelectPlaylist(playlist.id)}
            >
              {/* Cover */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0">
                {playlist.coverImage ? (
                  <img
                    src={playlist.coverImage}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-surface-600" />
                  </div>
                )}
                {/* Play overlay */}
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPlayPlaylist(playlist)
                  }}
                >
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {editingId === playlist.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => onEditNameChange(e.target.value)}
                      className="flex-1 bg-surface-800 px-2 py-1 rounded outline-none focus:ring-1 focus:ring-primary-500"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSaveEdit()
                        if (e.key === 'Escape') onSaveEdit()
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSaveEdit()
                      }}
                      className="p-1 hover:bg-surface-700 rounded"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-medium truncate">{playlist.name}</h3>
                    <p className="text-sm text-surface-500">
                      {playlist.tracks.length}{' '}
                      {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-surface-700 rounded-lg transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[160px] bg-surface-900 border border-surface-700 rounded-lg p-1 shadow-xl z-50"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-800 rounded cursor-pointer outline-none"
                      onClick={() => onPlayPlaylist(playlist)}
                    >
                      <Play className="w-4 h-4" />
                      Play All
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-800 rounded cursor-pointer outline-none"
                      onClick={() => onStartEditing(playlist)}
                    >
                      <Edit2 className="w-4 h-4" />
                      Rename
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-surface-700 my-1" />
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded cursor-pointer outline-none"
                      onClick={() => onDeletePlaylist(playlist.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface PlaylistDetailProps {
  playlist: Playlist
  onTrackClick: (track: Track, index: number) => void
  onRemoveTrack: (videoId: string) => void
  currentTrack: { title: string; artist: string } | null
  isPlaying: boolean
  isActivePlaylist: boolean
  currentTrackIndex: number
}

function PlaylistDetail({
  playlist,
  onTrackClick,
  onRemoveTrack,
  currentTrack,
  isPlaying,
  isActivePlaylist,
  currentTrackIndex,
}: PlaylistDetailProps) {
  if (playlist.tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="w-12 h-12 mx-auto text-surface-600 mb-4" />
        <p className="text-surface-500">This playlist is empty</p>
        <p className="text-sm text-surface-600 mt-1">
          Search for songs and add them here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {playlist.tracks.map((track, index) => {
        const isCurrentTrack =
          isActivePlaylist &&
          currentTrack?.title === track.title &&
          currentTrack?.artist === track.artist
        const isCurrentIndex = isActivePlaylist && currentTrackIndex === index

        return (
          <motion.div
            key={`${track.video_id}-${index}`}
            className={cn(
              'group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer',
              isCurrentIndex
                ? 'bg-primary-500/20 border border-primary-500/40'
                : 'bg-surface-900/50 hover:bg-surface-800/80'
            )}
            onClick={() => onTrackClick(track, index)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Index / Play indicator */}
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              {isCurrentTrack && isPlaying ? (
                <div className="flex items-center gap-0.5">
                  <motion.div
                    className="w-1 h-3 bg-primary-400 rounded-full"
                    animate={{ scaleY: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-1 h-3 bg-primary-400 rounded-full"
                    animate={{ scaleY: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-1 h-3 bg-primary-400 rounded-full"
                    animate={{ scaleY: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              ) : (
                <span className="text-sm text-surface-500 group-hover:hidden">
                  {index + 1}
                </span>
              )}
              {!isCurrentTrack && (
                <Play className="w-4 h-4 hidden group-hover:block" />
              )}
            </div>

            {/* Thumbnail */}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0">
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-medium truncate text-sm',
                  isCurrentIndex && 'text-primary-400'
                )}
              >
                {track.title}
              </p>
              <p className="text-xs text-surface-500 truncate">{track.artist}</p>
            </div>

            {/* Duration */}
            {track.duration > 0 && (
              <span className="text-sm text-surface-500">
                {formatDuration(track.duration)}
              </span>
            )}

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemoveTrack(track.video_id)
              }}
              className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
