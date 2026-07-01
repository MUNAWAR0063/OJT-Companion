"use client"

import { useEffect } from "react"
import { useDocumentStore } from "@/lib/document-store"
import { useEquipmentStore } from "@/lib/equipment-store"
import { useGalleryStore } from "@/lib/gallery-store"
import { useJournalStore } from "@/lib/journal-store"
import { useKnowledgeStore } from "@/lib/knowledge-store"
import { useNotificationStore } from "@/lib/notification-store"
import { usePlannerStore } from "@/lib/planner-store"
import { useReportStore } from "@/lib/report-store"
import { useRoadmapStore } from "@/lib/roadmap-store"
import { useSearchStore } from "@/lib/search-store"
import { useSettingsStore } from "@/lib/settings-store"
import { useStandardsStore } from "@/lib/standards-store"
import { subscribeToAppStateChanges } from "@/lib/supabase/storage"
import { supabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/auth/auth-store"

type PersistedStore = {
  persist: {
    rehydrate: () => Promise<void> | void
  }
}

const persistedStores: Record<string, PersistedStore> = {
  "ojt-document-library": useDocumentStore,
  "ojt-equipment-library": useEquipmentStore,
  "ojt-photo-gallery": useGalleryStore,
  "ojt-daily-journal": useJournalStore,
  "ojt-knowledge-base": useKnowledgeStore,
  "ojt-notification-center": useNotificationStore,
  "ojt-weekly-planner": usePlannerStore,
  "ojt-generated-reports": useReportStore,
  "ojt-roadmap-store": useRoadmapStore,
  "ojt-recent-searches": useSearchStore,
  "ojt-settings": useSettingsStore,
  "ojt-standards-library": useStandardsStore,
}

async function rehydrateStores(keys = Object.keys(persistedStores)) {
  await Promise.all(keys.map((key) => persistedStores[key]?.persist.rehydrate()))
}

export function SupabaseRuntime() {
  useEffect(() => {
    let active = true
    let hasRealtimeSubscription = false
    let unsubscribe: () => void = () => undefined

    async function startRealtimeSubscription() {
      if (!supabase || hasRealtimeSubscription) return
      hasRealtimeSubscription = true
      unsubscribe = await subscribeToAppStateChanges((storageKey) => {
        void rehydrateStores([storageKey])
      })
    }

    async function loadUserData() {
      try {
        if (!active) return
        await rehydrateStores()
        await startRealtimeSubscription()
      } catch (error) {
        console.error("Supabase data source failed to initialize", error)
      }
    }

    const authState = useAuthStore.getState()
    if (!authState.isRestoring && authState.status === "authenticated") void loadUserData()

    const unsubscribeAuth = useAuthStore.subscribe((state, previousState) => {
      if (
        state.status === "authenticated" &&
        !state.isRestoring &&
        (previousState.status !== "authenticated" || previousState.isRestoring)
      ) {
        void loadUserData()
      }
    })

    return () => {
      active = false
      unsubscribeAuth()
      unsubscribe()
    }
  }, [])

  return null
}
