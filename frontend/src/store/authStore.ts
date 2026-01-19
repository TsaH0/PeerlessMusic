import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCurrentIdentity, setAuthToken, getAuthToken } from '@/utils/api'

interface User {
  id: string
  username: string
  displayName?: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Local playlist IDs for anonymous users
  localPlaylistIds: string[]

  setUser: (user: User | null) => void
  setIsLoading: (loading: boolean) => void
  logout: () => void
  
  // Local playlist management
  addLocalPlaylistId: (id: string) => void
  removeLocalPlaylistId: (id: string) => void
  clearLocalPlaylistIds: () => void
  
  // Check auth on app load
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      localPlaylistIds: [],

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      logout: () => {
        setAuthToken(null)
        set({
          user: null,
          isAuthenticated: false,
        })
      },

      addLocalPlaylistId: (id) =>
        set((state) => ({
          localPlaylistIds: state.localPlaylistIds.includes(id)
            ? state.localPlaylistIds
            : [...state.localPlaylistIds, id],
        })),

      removeLocalPlaylistId: (id) =>
        set((state) => ({
          localPlaylistIds: state.localPlaylistIds.filter((pid) => pid !== id),
        })),

      clearLocalPlaylistIds: () => set({ localPlaylistIds: [] }),

      checkAuth: async () => {
        const token = getAuthToken()
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          const result = await getCurrentIdentity()
          if (result.authenticated && result.user) {
            set({
              user: {
                id: result.user.id,
                username: result.user.username,
                displayName: result.user.display_name,
              },
              isAuthenticated: true,
            })
          } else {
            setAuthToken(null)
            set({ user: null, isAuthenticated: false })
          }
        } catch {
          setAuthToken(null)
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'peerless-auth',
      partialize: (state) => ({
        localPlaylistIds: state.localPlaylistIds,
      }),
    }
  )
)
