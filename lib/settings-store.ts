"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"
import { defaultUserProfile, useUserProfileStore, type UserProfile } from "@/lib/user-profile-store"

export type AppLanguage = "en" | "th"

interface SettingsStore {
  profile: UserProfile
  language: AppLanguage
  updateProfile: (profile: UserProfile) => void
  resetProfile: () => void
  setLanguage: (language: AppLanguage) => void
}

const defaultProfile = defaultUserProfile

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      language: "en",
      updateProfile: (profile) => {
        useUserProfileStore.getState().updateProfile(profile)
        set({ profile })
      },
      resetProfile: () => {
        useUserProfileStore.getState().resetProfile()
        set({ profile: defaultProfile })
      },
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "ojt-settings",
      storage: createJSONStorage(() => supabaseStateStorage),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<SettingsStore> | undefined

        return {
          ...current,
          ...persistedState,
          profile: {
            ...defaultProfile,
            ...persistedState?.profile,
          },
        }
      },
    }
  )
)
