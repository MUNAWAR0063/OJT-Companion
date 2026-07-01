"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"

export interface LocalDocumentFile {
  name: string
  type: string
  size: number
  bucket: string
  filePath: string
}

export interface DocumentRecord {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  relatedEquipment: string[]
  relatedKnowledge: string[]
  file: LocalDocumentFile
  createdAt: string
  updatedAt: string
}

export interface DocumentInput {
  title: string
  description: string
  category: string
  tags: string[]
  relatedEquipment: string[]
  relatedKnowledge: string[]
}

interface DocumentStore {
  documents: DocumentRecord[]
  createDocument: (input: DocumentInput, file: LocalDocumentFile, id?: string) => DocumentRecord
  updateDocument: (id: string, input: DocumentInput) => void
  deleteDocument: (id: string) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      documents: [],

      createDocument: (input, file, id) => {
        const now = new Date().toISOString()
        const document: DocumentRecord = {
          id: id ?? makeId(),
          title: input.title.trim(),
          description: input.description.trim(),
          category: input.category,
          tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
          relatedEquipment: input.relatedEquipment,
          relatedKnowledge: input.relatedKnowledge,
          file,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ documents: [document, ...state.documents] }))
        return document
      },

      updateDocument: (id, input) =>
        set((state) => ({
          documents: state.documents.map((document) =>
            document.id === id
              ? {
                  ...document,
                  title: input.title.trim(),
                  description: input.description.trim(),
                  category: input.category,
                  tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
                  relatedEquipment: input.relatedEquipment,
                  relatedKnowledge: input.relatedKnowledge,
                  updatedAt: new Date().toISOString(),
                }
              : document
          ),
        })),

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((document) => document.id !== id),
        })),
    }),
    {
      name: "ojt-document-library",
      storage: createJSONStorage(() => supabaseStateStorage),
      partialize: (state) => ({
        documents: state.documents.map((document) => ({
          ...document,
          file: {
            name: document.file.name,
            type: document.file.type,
            size: document.file.size,
            bucket: document.file.bucket,
            filePath: document.file.filePath,
          },
        })),
      }),
    }
  )
)
