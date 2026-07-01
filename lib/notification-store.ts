"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"
import {
  isRoadmapChecklistNotification,
  reconcileRoadmapChecklistNotifications,
} from "@/lib/notification-policy.mjs"

export type NotificationType =
  | "reminder"
  | "incomplete-checklist"
  | "roadmap-checklist"
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
  weekNumber?: number
}

export interface AppNotification extends NotificationCandidate {
  id: string
  read: boolean
  createdAt: string
  toastedAt: string | null
}

interface NotificationStore {
  notifications: AppNotification[]
  dismissedFingerprints: string[]
  syncNotifications: (candidates: NotificationCandidate[]) => AppNotification[]
  createReminder: (input: Omit<NotificationCandidate, "fingerprint" | "type">) => AppNotification
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  markAsToasted: (ids: string[]) => void
  resetHistory: () => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      dismissedFingerprints: [],

      syncNotifications: (candidates) => {
        const current = get()
        const activeRoadmapCandidate = candidates.find(
          (candidate) => candidate.type === "roadmap-checklist"
        )
        const activeRoadmapFingerprint = activeRoadmapCandidate?.fingerprint ?? null
        const activeCandidates = candidates.filter(
          (candidate) =>
            !isRoadmapChecklistNotification(candidate) ||
            candidate.fingerprint === activeRoadmapFingerprint
        )
        const activeFingerprints = new Set(activeCandidates.map((candidate) => candidate.fingerprint))
        const reconciledNotifications = reconcileRoadmapChecklistNotifications(
          current.notifications,
          activeRoadmapCandidate
        ) as AppNotification[]
        const dismissedFingerprints = current.dismissedFingerprints.filter((fingerprint) =>
          activeFingerprints.has(fingerprint)
        )
        const dismissed = new Set(dismissedFingerprints)
        const existing = new Set(
          reconciledNotifications.map((notification) => notification.fingerprint)
        )
        const now = new Date().toISOString()
        const added = activeCandidates
          .filter(
            (candidate) =>
              !existing.has(candidate.fingerprint) && !dismissed.has(candidate.fingerprint)
          )
          .map((candidate) => ({
            ...candidate,
            id: makeId(),
            read: false,
            createdAt: now,
            toastedAt: null,
          }))
        if (
          added.length ||
          reconciledNotifications.length !== current.notifications.length ||
          dismissedFingerprints.length !== current.dismissedFingerprints.length
        ) {
          set({
            notifications: [...added, ...reconciledNotifications].slice(0, 300),
            dismissedFingerprints,
          })
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

      resetHistory: () =>
        set((state) => ({
          notifications: [],
          dismissedFingerprints: Array.from(
            new Set([
              ...state.dismissedFingerprints,
              ...state.notifications.map((notification) => notification.fingerprint),
            ])
          ).slice(0, 500),
        })),
    }),
    {
      name: "ojt-notification-center",
      storage: createJSONStorage(() => supabaseStateStorage),
    }
  )
)
