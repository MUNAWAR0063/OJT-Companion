"use client"

import { useEffect } from "react"
import { useSettingsStore } from "@/lib/settings-store"
import { defaultUserProfile, useUserProfileStore } from "@/lib/user-profile-store"

export function SettingsRuntime() {
  const language = useSettingsStore((state) => state.language)
  const legacyProfile = useSettingsStore((state) => state.profile)
  const profile = useUserProfileStore((state) => state.profile)
  const updateProfile = useUserProfileStore((state) => state.updateProfile)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    const hasCentralProfile = JSON.stringify(profile) !== JSON.stringify(defaultUserProfile)
    const hasLegacyProfile = JSON.stringify(legacyProfile) !== JSON.stringify(defaultUserProfile)

    if (!hasCentralProfile && hasLegacyProfile) {
      updateProfile(legacyProfile)
    }
  }, [legacyProfile, profile, updateProfile])

  return null
}
