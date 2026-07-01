"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"

export interface RecentSearch {
  id: string
  query: string
  createdAt: string
}

interface SearchStore {
  recentSearches: RecentSearch[]
  addRecentSearch: (query: string) => void
  removeRecentSearch: (id: string) => void
  clearRecentSearches: () => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      recentSearches: [],

      addRecentSearch: (query) =>
        set((state) => {
          const normalized = query.trim()
          if (!normalized) return state
          const recentSearches = state.recentSearches.filter(
            (item) => item.query.toLowerCase() !== normalized.toLowerCase()
          )
          return {
            recentSearches: [
              { id: makeId(), query: normalized, createdAt: new Date().toISOString() },
              ...recentSearches,
            ].slice(0, 8),
          }
        }),

      removeRecentSearch: (id) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter((item) => item.id !== id),
        })),

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "ojt-recent-searches",
      storage: createJSONStorage(() => supabaseStateStorage),
    }
  )
)
