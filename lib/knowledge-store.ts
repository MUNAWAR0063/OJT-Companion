"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"
import { disciplineLabelToCode, inferEntityDiscipline, type DisciplineCode } from "@/lib/discipline/discipline-engine"
import { useAuthStore } from "@/lib/auth/auth-store"
import { useSettingsStore } from "@/lib/settings-store"

export interface KnowledgeChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface KnowledgeAttachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  createdAt: string
}

export interface KnowledgeArticle {
  id: string
  discipline: DisciplineCode
  title: string
  category: string
  tags: string[]
  content: string
  crossReferences: string[]
  relatedEquipment: string[]
  relatedStandards: string[]
  attachments: KnowledgeAttachment[]
  checklist: KnowledgeChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface KnowledgeArticleInput {
  title: string
  category: string
  tags: string[]
  crossReferences: string[]
  relatedEquipment: string[]
  relatedStandards: string[]
}

interface KnowledgeStore {
  articles: KnowledgeArticle[]
  selectedArticleId: string | null
  createArticle: (input: KnowledgeArticleInput) => KnowledgeArticle
  updateArticle: (id: string, input: KnowledgeArticleInput) => void
  updateContent: (id: string, content: string) => void
  deleteArticle: (id: string) => void
  selectArticle: (id: string | null) => void
  addChecklistItem: (id: string, text: string) => void
  toggleChecklistItem: (id: string, itemId: string) => void
  deleteChecklistItem: (id: string, itemId: string) => void
  addAttachment: (id: string, attachment: Omit<KnowledgeAttachment, "id" | "createdAt">) => void
  deleteAttachment: (id: string, attachmentId: string) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)
const currentDiscipline = () =>
  disciplineLabelToCode(useAuthStore.getState().profile?.discipline ?? useSettingsStore.getState().profile.discipline)

export const useKnowledgeStore = create<KnowledgeStore>()(
  persist(
    (set) => ({
      articles: [],
      selectedArticleId: null,

      createArticle: (input) => {
        const now = new Date().toISOString()
        const article: KnowledgeArticle = {
          id: makeId(),
          discipline: currentDiscipline(),
          title: input.title.trim(),
          category: input.category.trim(),
          tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
          content: "# " + input.title.trim() + "\n\nStart documenting your engineering knowledge here.",
          crossReferences: input.crossReferences,
          relatedEquipment: input.relatedEquipment,
          relatedStandards: input.relatedStandards.map((standard) => standard.trim()).filter(Boolean),
          attachments: [],
          checklist: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          articles: [article, ...state.articles],
          selectedArticleId: article.id,
        }))
        return article
      },

      updateArticle: (id, input) =>
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  discipline: article.discipline ?? inferEntityDiscipline({ ...article, ...input }),
                  title: input.title.trim(),
                  category: input.category.trim(),
                  tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
                  crossReferences: input.crossReferences.filter((referenceId) => referenceId !== id),
                  relatedEquipment: input.relatedEquipment,
                  relatedStandards: input.relatedStandards.map((standard) => standard.trim()).filter(Boolean),
                  updatedAt: new Date().toISOString(),
                }
              : article
          ),
        })),

      updateContent: (id, content) =>
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id
              ? { ...article, content, updatedAt: new Date().toISOString() }
              : article
          ),
        })),

      deleteArticle: (id) =>
        set((state) => {
          const articles = state.articles
            .filter((article) => article.id !== id)
            .map((article) => ({
              ...article,
              crossReferences: article.crossReferences.filter((referenceId) => referenceId !== id),
            }))
          return {
            articles,
            selectedArticleId:
              state.selectedArticleId === id ? null : state.selectedArticleId,
          }
        }),

      selectArticle: (id) => set({ selectedArticleId: id }),

      addChecklistItem: (id, text) =>
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  checklist: [...article.checklist, { id: makeId(), text: text.trim(), done: false }],
                  updatedAt: new Date().toISOString(),
                }
              : article
          ),
        })),

      toggleChecklistItem: (id, itemId) =>
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  checklist: article.checklist.map((item) =>
                    item.id === itemId ? { ...item, done: !item.done } : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : article
          ),
        })),

      deleteChecklistItem: (id, itemId) =>
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  checklist: article.checklist.filter((item) => item.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : article
          ),
        })),

      addAttachment: (id, attachment) =>
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  attachments: [
                    ...article.attachments,
                    { ...attachment, id: makeId(), createdAt: new Date().toISOString() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : article
          ),
        })),

      deleteAttachment: (id, attachmentId) =>
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  attachments: article.attachments.filter((attachment) => attachment.id !== attachmentId),
                  updatedAt: new Date().toISOString(),
                }
              : article
          ),
        })),
    }),
    {
      name: "ojt-knowledge-base",
      storage: createJSONStorage(() => supabaseStateStorage),
      partialize: (state) => ({
        articles: state.articles,
        selectedArticleId: state.selectedArticleId,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<KnowledgeStore> | undefined
        return {
          ...current,
          ...persistedState,
          articles: (persistedState?.articles ?? []).map((article) => ({
            ...article,
            discipline: article.discipline ?? inferEntityDiscipline(article),
          })),
        }
      },
    }
  )
)
