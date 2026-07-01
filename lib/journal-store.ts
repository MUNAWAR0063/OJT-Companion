"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"

export interface JournalChecklistItem {
  id: string
  text: string
  done: boolean
  journalEntryId?: string
  weeklyObjectiveId?: string
  dueWeekId?: string
  priority?: "follow_up"
  status?: "not-started" | "completed"
  createdAt?: string
  updatedAt?: string
}

export interface JournalAttachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  createdAt: string
}

export interface JournalEntry {
  id: string
  title: string
  date: string
  dailyActivities: string
  lessonsLearned: string
  problems: string
  questions: string
  reflection: string
  equipment: string[]
  attachments: JournalAttachment[]
  photos: JournalAttachment[]
  checklist: JournalChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface JournalEntryInput {
  title: string
  date: string
  dailyActivities: string
  lessonsLearned: string
  problems: string
  questions: string
  reflection: string
  equipment: string[]
}

interface JournalStore {
  entries: JournalEntry[]
  selectedEntryId: string | null
  createEntry: (input: JournalEntryInput) => JournalEntry
  updateEntry: (id: string, updates: Partial<JournalEntryInput>) => void
  deleteEntry: (id: string) => void
  selectEntry: (id: string | null) => void
  addChecklistItem: (id: string, text: string, metadata?: Partial<JournalChecklistItem>) => JournalChecklistItem | null
  toggleChecklistItem: (id: string, itemId: string) => void
  setChecklistItemDone: (id: string, itemId: string, done: boolean) => void
  deleteChecklistItem: (id: string, itemId: string) => void
  addAttachment: (id: string, kind: "attachments" | "photos", attachment: Omit<JournalAttachment, "id" | "createdAt">) => void
  deleteAttachment: (id: string, kind: "attachments" | "photos", attachmentId: string) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

export const useJournalStore = create<JournalStore>()(
  persist(
    (set) => ({
      entries: [],
      selectedEntryId: null,

      createEntry: (input) => {
        const now = new Date().toISOString()
        const entry: JournalEntry = {
          id: makeId(),
          title: input.title.trim(),
          date: input.date,
          dailyActivities: input.dailyActivities,
          lessonsLearned: input.lessonsLearned,
          problems: input.problems,
          questions: input.questions,
          reflection: input.reflection,
          equipment: input.equipment,
          attachments: [],
          photos: [],
          checklist: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ entries: [entry, ...state.entries], selectedEntryId: entry.id }))
        return entry
      },

      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  ...updates,
                  title: updates.title?.trim() || entry.title,
                  updatedAt: new Date().toISOString(),
                }
              : entry
          ),
        })),

      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
          selectedEntryId: state.selectedEntryId === id ? null : state.selectedEntryId,
        })),

      selectEntry: (id) => set({ selectedEntryId: id }),

      addChecklistItem: (id, text, metadata = {}) => {
        let created: JournalChecklistItem | null = null
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? (() => {
                  const now = new Date().toISOString()
                  created = {
                    id: metadata.id || makeId(),
                    text: text.trim(),
                    done: Boolean(metadata.done),
                    journalEntryId: metadata.journalEntryId || entry.id,
                    weeklyObjectiveId: metadata.weeklyObjectiveId,
                    dueWeekId: metadata.dueWeekId,
                    priority: metadata.priority,
                    status: metadata.status || (metadata.done ? "completed" : "not-started"),
                    createdAt: metadata.createdAt || now,
                    updatedAt: metadata.updatedAt || now,
                  }
                  return {
                    ...entry,
                    checklist: [...entry.checklist, created],
                    updatedAt: now,
                  }
                })()
              : entry
          ),
        }))
        return created
      },

      toggleChecklistItem: (id, itemId) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  checklist: entry.checklist.map((item) =>
                    item.id === itemId
                      ? {
                          ...item,
                          done: !item.done,
                          status: !item.done ? "completed" : "not-started",
                          updatedAt: new Date().toISOString(),
                        }
                      : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : entry
          ),
        })),

      setChecklistItemDone: (id, itemId, done) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  checklist: entry.checklist.map((item) =>
                    item.id === itemId
                      ? {
                          ...item,
                          done,
                          status: done ? "completed" : "not-started",
                          updatedAt: new Date().toISOString(),
                        }
                      : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : entry
          ),
        })),

      deleteChecklistItem: (id, itemId) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  checklist: entry.checklist.filter((item) => item.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : entry
          ),
        })),

      addAttachment: (id, kind, attachment) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  [kind]: [
                    ...entry[kind],
                    { ...attachment, id: makeId(), createdAt: new Date().toISOString() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : entry
          ),
        })),

      deleteAttachment: (id, kind, attachmentId) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  [kind]: entry[kind].filter((attachment) => attachment.id !== attachmentId),
                  updatedAt: new Date().toISOString(),
                }
              : entry
          ),
        })),
    }),
    {
      name: "ojt-daily-journal",
      storage: createJSONStorage(() => supabaseStateStorage),
      partialize: (state) => ({ entries: state.entries, selectedEntryId: state.selectedEntryId }),
    }
  )
)
