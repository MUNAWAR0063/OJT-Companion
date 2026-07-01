"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"

export type StandardsOrganization =
  | "IEC"
  | "IEEE"
  | "NFPA"
  | "API"
  | "ISA"
  | "NEMA"
  | "Company Standards"

export interface StandardRecord {
  id: string
  organization: StandardsOrganization
  reference: string
  title: string
  summary: string
  relatedEquipment: string[]
  notes: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface StandardInput {
  organization: StandardsOrganization
  reference: string
  title: string
  summary: string
  relatedEquipment: string[]
  notes: string
  tags: string[]
}

interface StandardsStore {
  standards: StandardRecord[]
  createStandard: (input: StandardInput) => StandardRecord
  updateStandard: (id: string, input: StandardInput) => void
  deleteStandard: (id: string) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

export const useStandardsStore = create<StandardsStore>()(
  persist(
    (set) => ({
      standards: [],

      createStandard: (input) => {
        const now = new Date().toISOString()
        const standard: StandardRecord = {
          id: makeId(),
          organization: input.organization,
          reference: input.reference.trim(),
          title: input.title.trim(),
          summary: input.summary.trim(),
          relatedEquipment: input.relatedEquipment,
          notes: input.notes.trim(),
          tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ standards: [standard, ...state.standards] }))
        return standard
      },

      updateStandard: (id, input) =>
        set((state) => ({
          standards: state.standards.map((standard) =>
            standard.id === id
              ? {
                  ...standard,
                  organization: input.organization,
                  reference: input.reference.trim(),
                  title: input.title.trim(),
                  summary: input.summary.trim(),
                  relatedEquipment: input.relatedEquipment,
                  notes: input.notes.trim(),
                  tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
                  updatedAt: new Date().toISOString(),
                }
              : standard
          ),
        })),

      deleteStandard: (id) =>
        set((state) => ({ standards: state.standards.filter((standard) => standard.id !== id) })),
    }),
    {
      name: "ojt-standards-library",
      storage: createJSONStorage(() => supabaseStateStorage),
    }
  )
)
