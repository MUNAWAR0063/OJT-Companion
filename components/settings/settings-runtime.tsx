"use client"

import { useEffect } from "react"
import { useSettingsStore } from "@/lib/settings-store"

export function SettingsRuntime() {
  const language = useSettingsStore((state) => state.language)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return null
}
