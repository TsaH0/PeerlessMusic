import { motion } from 'framer-motion'
import { Music2, Library, ListMusic, LogOut } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuthStore } from '@/store/authStore'
import { logoutIdentity } from '@/utils/api'
import { usePlaylistStore } from '@/store/playlistStore'

interface HeaderProps {
  onLibraryClick?: () => void
  onPlaylistsClick?: () => void
}

export function Header({ onLibraryClick, onPlaylistsClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { clearPlaylists, fetchPlaylists } = usePlaylistStore()

  const handleLogout = async () => {
    await logoutIdentity()
    logout()
    clearPlaylists()
    fetchPlaylists()
  }

  const navItems = [
    { name: 'Library', icon: Library, action: onLibraryClick },
    { name: 'Playlists', icon: ListMusic, action: onPlaylistsClick },
  ]

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 glass"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2 sm:gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/10">
            <Music2 className="w-4 h-4 sm:w-5 sm:h-5 text-surface-900" />
          </div>
          <span className="text-lg sm:text-xl font-semibold tracking-tight text-white">
            Peerless <span className="text-surface-400 hidden sm:inline">Music</span>
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-2 md:gap-4">
          {navItems.map((item) => (
            <motion.button
              key={item.name}
              onClick={item.action}
              className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </motion.button>
          ))}
          
          {/* Auth Button */}
          {isAuthenticated && user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <motion.button
                  className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 ml-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline">{user.displayName || user.username}</span>
                </motion.button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[160px] bg-surface-900 border border-surface-700 rounded-lg p-1 shadow-xl z-50"
                  sideOffset={5}
                  align="end"
                >
                  <div className="px-3 py-2 text-xs text-surface-500">
                    Signed in as <span className="text-white">@{user.username}</span>
                  </div>
                  <DropdownMenu.Separator className="h-px bg-surface-700 my-1" />
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded cursor-pointer outline-none"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <motion.button
              onClick={onPlaylistsClick}
              className="flex items-center gap-2 text-surface-300 hover:text-white transition-colors text-sm font-medium px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 ml-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Identity
            </motion.button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex sm:hidden items-center gap-1">
          {navItems.map((item) => (
            <button 
              key={item.name}
              onClick={item.action}
              className="p-2.5 text-surface-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
          
          {/* Mobile Auth */}
          {isAuthenticated && user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-1.5 ml-1">
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[160px] bg-surface-900 border border-surface-700 rounded-lg p-1 shadow-xl z-50"
                  sideOffset={5}
                  align="end"
                >
                  <div className="px-3 py-2 text-xs text-surface-500">
                    @{user.username}
                  </div>
                  <DropdownMenu.Separator className="h-px bg-surface-700 my-1" />
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded cursor-pointer outline-none"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <button 
              onClick={onPlaylistsClick}
              className="ml-1 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
            >
              Identity
            </button>
          )}
        </div>
      </div>
    </motion.header>
  )
}
