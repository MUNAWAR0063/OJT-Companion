"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"
import { mergeStoredProfile, profileForStorage } from "@/lib/user-profile-persistence.mjs"

export interface UserProfile {
  fullName: string
  displayName: string
  email: string
  phoneNumber: string
  discipline: string
  company: string
  program: string
  ojtBatch: string
  bio: string
  profileImage: string
  avatarPath: string
}

interface UserProfileStore {
  profile: UserProfile
  updateProfile: (profile: UserProfile) => void
  patchProfile: (profile: Partial<UserProfile>) => void
  resetProfile: () => void
}

export const defaultUserProfile: UserProfile = {
  fullName: "OJT Trainee",
  displayName: "",
  email: "",
  phoneNumber: "",
  discipline: "Electrical Engineering Trainee",
  company: "Medco E&P",
  program: "Operations Apprentice Development Program",
  ojtBatch: "OADP 2026",
  bio: "",
  profileImage: "",
  avatarPath: "",
}

export const getProfileDisplayName = (profile: UserProfile) =>
  profile.displayName.trim() || profile.fullName.trim() || "OJT Trainee"

export const getProfileInitials = (profile: UserProfile) =>
  getProfileDisplayName(profile)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "OJ"

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set) => ({
      profile: defaultUserProfile,
      updateProfile: (profile) =>
        set({
          profile: {
            ...defaultUserProfile,
            ...profile,
          },
        }),
      patchProfile: (profile) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...profile,
          },
        })),
      resetProfile: () => set({ profile: defaultUserProfile }),
    }),
    {
      name: "ojt-user-profile",
      storage: createJSONStorage(() => supabaseStateStorage),
      partialize: (state) => ({
        profile: profileForStorage(state.profile),
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<UserProfileStore> | undefined

        return {
          ...current,
          ...persistedState,
          profile: mergeStoredProfile(defaultUserProfile, persistedState?.profile),
        }
      },
    }
  )
)
