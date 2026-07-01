"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"

export interface GalleryImage {
  name: string
  type: string
  size: number
  dataUrl: string
}

export interface GalleryPhoto {
  id: string
  title: string
  category: string
  location: string
  notes: string
  relatedEquipment: string[]
  relatedJournal: string[]
  image: GalleryImage
  createdAt: string
  updatedAt: string
}

export interface GalleryPhotoInput {
  title: string
  category: string
  location: string
  notes: string
  relatedEquipment: string[]
  relatedJournal: string[]
}

interface GalleryStore {
  photos: GalleryPhoto[]
  createPhoto: (input: GalleryPhotoInput, image: GalleryImage) => GalleryPhoto
  updatePhoto: (id: string, input: GalleryPhotoInput) => void
  deletePhoto: (id: string) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

export const useGalleryStore = create<GalleryStore>()(
  persist(
    (set) => ({
      photos: [],

      createPhoto: (input, image) => {
        const now = new Date().toISOString()
        const photo: GalleryPhoto = {
          id: makeId(),
          title: input.title.trim(),
          category: input.category,
          location: input.location.trim(),
          notes: input.notes.trim(),
          relatedEquipment: input.relatedEquipment,
          relatedJournal: input.relatedJournal,
          image,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ photos: [photo, ...state.photos] }))
        return photo
      },

      updatePhoto: (id, input) =>
        set((state) => ({
          photos: state.photos.map((photo) =>
            photo.id === id
              ? {
                  ...photo,
                  title: input.title.trim(),
                  category: input.category,
                  location: input.location.trim(),
                  notes: input.notes.trim(),
                  relatedEquipment: input.relatedEquipment,
                  relatedJournal: input.relatedJournal,
                  updatedAt: new Date().toISOString(),
                }
              : photo
          ),
        })),

      deletePhoto: (id) =>
        set((state) => ({ photos: state.photos.filter((photo) => photo.id !== id) })),
    }),
    {
      name: "ojt-photo-gallery",
      storage: createJSONStorage(() => supabaseStateStorage),
    }
  )
)
