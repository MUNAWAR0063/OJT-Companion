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

function readableError(error: unknown) {
  if (error instanceof Error) return error
  if (typeof error === "string") return new Error(error)
  try {
    return new Error(JSON.stringify(error))
  } catch {
    return new Error(String(error))
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
    try {
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
    } catch (error) {
      console.error("Session restore failed", readableError(error))
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
