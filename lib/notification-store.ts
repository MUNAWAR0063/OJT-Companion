"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"

export type NotificationType =
  | "reminder"
  | "incomplete-checklist"
  | "weekly-deadline"
  | "journal-reminder"
  | "learning-reminder"

export interface NotificationCandidate {
  fingerprint: string
  type: NotificationType
  title: string
  message: string
  href: string
  dueAt?: string
}

export interface AppNotification extends NotificationCandidate {
  id: string
  read: boolean
  createdAt: string
  toastedAt: string | null
}

interface NotificationStore {
  notifications: AppNotification[]
  syncNotifications: (candidates: NotificationCandidate[]) => AppNotification[]
  createReminder: (input: Omit<NotificationCandidate, "fingerprint" | "type">) => AppNotification
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  markAsToasted: (ids: string[]) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      syncNotifications: (candidates) => {
        const existing = new Set(get().notifications.map((notification) => notification.fingerprint))
        const now = new Date().toISOString()
        const added = candidates
          .filter((candidate) => !existing.has(candidate.fingerprint))
          .map((candidate) => ({
            ...candidate,
            id: makeId(),
            read: false,
            createdAt: now,
            toastedAt: null,
          }))
        if (added.length) {
          set((state) => ({
            notifications: [...added, ...state.notifications].slice(0, 300),
          }))
        }
        return added
      },

      createReminder: (input) => {
        const reminder: AppNotification = {
          ...input,
          id: makeId(),
          fingerprint: `manual-${makeId()}`,
          type: "reminder",
          read: false,
          createdAt: new Date().toISOString(),
          toastedAt: null,
        }
        set((state) => ({ notifications: [reminder, ...state.notifications].slice(0, 300) }))
        return reminder
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
        })),

      markAsToasted: (ids) => {
        const idSet = new Set(ids)
        const now = new Date().toISOString()
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            idSet.has(notification.id) ? { ...notification, toastedAt: now } : notification
          ),
        }))
      },
    }),
    {
      name: "ojt-notification-center",
      storage: createJSONStorage(() => supabaseStateStorage),
    }
  )
)
