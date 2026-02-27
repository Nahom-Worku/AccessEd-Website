import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserTier } from '@/lib/types/auth'
import { TOKEN_KEYS } from '@/lib/utils/constants'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  tier: UserTier

  setUser: (user: User) => void
  setTier: (tier: UserTier) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      tier: 'explorer',

      setUser: (user) => set({ user, isAuthenticated: true }),
      setTier: (tier) => set({ tier }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEYS.accessToken)
          localStorage.removeItem(TOKEN_KEYS.refreshToken)
        }
        set({ user: null, isAuthenticated: false, tier: 'explorer' })
      },
    }),
    {
      name: 'accessed-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        tier: state.tier,
      }),
    },
  ),
)
