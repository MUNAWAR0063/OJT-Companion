"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"
import { disciplineLabelToCode, inferEntityDiscipline, type DisciplineCode } from "@/lib/discipline/discipline-engine"
import { useAuthStore } from "@/lib/auth/auth-store"
import { useSettingsStore } from "@/lib/settings-store"

export const equipmentSectionLabels = {
  overview: "Overview",
  workingPrinciple: "Working Principle",
  construction: "Construction",
  components: "Components",
  specifications: "Specifications",
  inspection: "Inspection",
  testing: "Testing",
  preventiveMaintenance: "Preventive Maintenance",
  predictiveMaintenance: "Predictive Maintenance",
  correctiveMaintenance: "Corrective Maintenance",
  failureModes: "Failure Modes",
  troubleshooting: "Troubleshooting",
  lessonsLearned: "Lessons Learned",
  notes: "Notes",
} as const

export type EquipmentSectionKey = keyof typeof equipmentSectionLabels
export type EquipmentSections = Record<EquipmentSectionKey, string>

export interface EquipmentChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface EquipmentAttachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  createdAt: string
}

export interface EquipmentRecord {
  id: string
  discipline: DisciplineCode
  name: string
  category: string
  manufacturer: string
  model: string
  rating: string
  location: string
  sections: EquipmentSections
  checklist: EquipmentChecklistItem[]
  photos: EquipmentAttachment[]
  documents: EquipmentAttachment[]
  progress: number
  createdAt: string
  updatedAt: string
}

export interface EquipmentInput {
  name: string
  category: string
  manufacturer: string
  model: string
  rating: string
  location: string
}

interface EquipmentStore {
  equipment: EquipmentRecord[]
  selectedEquipmentId: string | null
  createEquipment: (input: EquipmentInput) => EquipmentRecord
  updateEquipment: (id: string, input: EquipmentInput) => void
  deleteEquipment: (id: string) => void
  selectEquipment: (id: string | null) => void
  updateSection: (id: string, section: EquipmentSectionKey, content: string) => void
  addChecklistItem: (id: string, text: string) => void
  toggleChecklistItem: (id: string, itemId: string) => void
  deleteChecklistItem: (id: string, itemId: string) => void
  addAttachment: (id: string, kind: "photos" | "documents", attachment: Omit<EquipmentAttachment, "id" | "createdAt">) => void
  deleteAttachment: (id: string, kind: "photos" | "documents", attachmentId: string) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

const emptySections = (): EquipmentSections =>
  Object.fromEntries(Object.keys(equipmentSectionLabels).map((key) => [key, ""])) as EquipmentSections

const currentDiscipline = () =>
  disciplineLabelToCode(useAuthStore.getState().profile?.discipline ?? useSettingsStore.getState().profile.discipline)

export function calculateEquipmentProgress(equipment: EquipmentRecord) {
  const sections = Object.values(equipment.sections)
  const completedSections = sections.filter((content) => content.trim().length > 0).length
  const checklistDone = equipment.checklist.filter((item) => item.done).length
  const total = sections.length + equipment.checklist.length
  return total ? Math.round(((completedSections + checklistDone) / total) * 100) : 0
}

function normalizeEquipment(equipment: EquipmentRecord): EquipmentRecord {
  return {
    ...equipment,
    progress: calculateEquipmentProgress(equipment),
    updatedAt: new Date().toISOString(),
  }
}

export const useEquipmentStore = create<EquipmentStore>()(
  persist(
    (set) => ({
      equipment: [],
      selectedEquipmentId: null,

      createEquipment: (input) => {
        const now = new Date().toISOString()
        const equipment: EquipmentRecord = {
          id: makeId(),
          discipline: currentDiscipline(),
          name: input.name.trim(),
          category: input.category,
          manufacturer: input.manufacturer.trim(),
          model: input.model.trim(),
          rating: input.rating.trim(),
          location: input.location.trim(),
          sections: emptySections(),
          checklist: [],
          photos: [],
          documents: [],
          progress: 0,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          equipment: [equipment, ...state.equipment],
          selectedEquipmentId: equipment.id,
        }))
        return equipment
      },

      updateEquipment: (id, input) =>
        set((state) => ({
          equipment: state.equipment.map((equipment) =>
            equipment.id === id
              ? normalizeEquipment({
                  ...equipment,
                  discipline: equipment.discipline ?? inferEntityDiscipline({ ...equipment, ...input }),
                  name: input.name.trim(),
                  category: input.category,
                  manufacturer: input.manufacturer.trim(),
                  model: input.model.trim(),
                  rating: input.rating.trim(),
                  location: input.location.trim(),
                })
              : equipment
          ),
        })),

      deleteEquipment: (id) =>
        set((state) => {
          const equipment = state.equipment.filter((item) => item.id !== id)
          return {
            equipment,
            selectedEquipmentId:
              state.selectedEquipmentId === id ? (equipment[0]?.id ?? null) : state.selectedEquipmentId,
          }
        }),

      selectEquipment: (id) => set({ selectedEquipmentId: id }),

      updateSection: (id, section, content) =>
        set((state) => ({
          equipment: state.equipment.map((equipment) =>
            equipment.id === id
              ? normalizeEquipment({
                  ...equipment,
                  sections: { ...equipment.sections, [section]: content },
                })
              : equipment
          ),
        })),

      addChecklistItem: (id, text) =>
        set((state) => ({
          equipment: state.equipment.map((equipment) =>
            equipment.id === id
              ? normalizeEquipment({
                  ...equipment,
                  checklist: [...equipment.checklist, { id: makeId(), text: text.trim(), done: false }],
                })
              : equipment
          ),
        })),

      toggleChecklistItem: (id, itemId) =>
        set((state) => ({
          equipment: state.equipment.map((equipment) =>
            equipment.id === id
              ? normalizeEquipment({
                  ...equipment,
                  checklist: equipment.checklist.map((item) =>
                    item.id === itemId ? { ...item, done: !item.done } : item
                  ),
                })
              : equipment
          ),
        })),

      deleteChecklistItem: (id, itemId) =>
        set((state) => ({
          equipment: state.equipment.map((equipment) =>
            equipment.id === id
              ? normalizeEquipment({
                  ...equipment,
                  checklist: equipment.checklist.filter((item) => item.id !== itemId),
                })
              : equipment
          ),
        })),

      addAttachment: (id, kind, attachment) =>
        set((state) => ({
          equipment: state.equipment.map((equipment) =>
            equipment.id === id
              ? normalizeEquipment({
                  ...equipment,
                  [kind]: [
                    ...equipment[kind],
                    { ...attachment, id: makeId(), createdAt: new Date().toISOString() },
                  ],
                })
              : equipment
          ),
        })),

      deleteAttachment: (id, kind, attachmentId) =>
        set((state) => ({
          equipment: state.equipment.map((equipment) =>
            equipment.id === id
              ? normalizeEquipment({
                  ...equipment,
                  [kind]: equipment[kind].filter((attachment) => attachment.id !== attachmentId),
                })
              : equipment
          ),
        })),
    }),
    {
      name: "ojt-equipment-library",
      storage: createJSONStorage(() => supabaseStateStorage),
      partialize: (state) => ({
        equipment: state.equipment,
        selectedEquipmentId: state.selectedEquipmentId,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<EquipmentStore> | undefined
        return {
          ...current,
          ...persistedState,
          equipment: (persistedState?.equipment ?? []).map((item) => ({
            ...item,
            discipline: item.discipline ?? inferEntityDiscipline(item),
          })),
        }
      },
    }
  )
)

export const getEquipmentLibraryProgress = (equipment: EquipmentRecord[]) =>
  equipment.length
    ? Math.round(equipment.reduce((total, item) => total + item.progress, 0) / equipment.length)
    : 0
