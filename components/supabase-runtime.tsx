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
    let unsubscribe: () => void = () => undefined

    async function start() {
      try {
        if (!supabase) return
        const { data } = await supabase.auth.getSession()
        if (!data.session) return
        if (!active) return
        await rehydrateStores()
        unsubscribe = await subscribeToAppStateChanges((storageKey) => {
          void rehydrateStores([storageKey])
        })
      } catch (error) {
        console.error("Supabase data source failed to initialize", error)
      }
    }

    void start()

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return null
}
