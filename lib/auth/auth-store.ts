"use client"

import { create } from "zustand"
import { authAdapter } from "@/lib/auth/auth-adapter"
import type { AuthProfile, AuthSession, AuthStatus, AuthUser, SignInInput, SignUpInput } from "@/lib/auth/auth-types"
import { defaultUserProfile, useUserProfileStore } from "@/lib/user-profile-store"

interface AuthStore {
  user: AuthUser | null
  profile: AuthProfile | null
  session: AuthSession | null
  status: AuthStatus
  isRestoring: boolean
  signUp: (input: SignUpInput) => Promise<void>
  signIn: (input: SignInInput) => Promise<void>
  restoreSession: () => Promise<void>
  signOut: () => Promise<void>
}

function seedUserProfile(profile: AuthProfile) {
  const currentProfile = useUserProfileStore.getState().profile
  const hasCustomProfile = JSON.stringify(currentProfile) !== JSON.stringify(defaultUserProfile)

  if (!hasCustomProfile) {
    useUserProfileStore.getState().updateProfile(profile)
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  session: null,
  status: "anonymous",
  isRestoring: true,

  signUp: async (input) => {
    await authAdapter.signUp(input)
    set({ user: null, profile: null, session: null, status: "pending-verification" })
  },

  signIn: async (input) => {
    const result = await authAdapter.signIn(input)
    seedUserProfile(result.profile)
    set({
      user: result.user,
      profile: result.profile,
      session: result.session,
      status: "authenticated",
    })
  },

  restoreSession: async () => {
    set({ isRestoring: true })
    const result = await authAdapter.getSession()
    if (result?.session) {
      seedUserProfile(result.profile)
      set({
        user: result.user,
        profile: result.profile,
        session: result.session,
        status: "authenticated",
        isRestoring: false,
      })
      return
    }

    set({
      user: null,
      profile: null,
      session: null,
      status: "anonymous",
      isRestoring: false,
    })
  },

  signOut: async () => {
    await authAdapter.signOut()
    set({ user: null, profile: null, session: null, status: "anonymous" })
  },
}))
