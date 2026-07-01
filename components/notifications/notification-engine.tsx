"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEquipmentStore } from "@/lib/equipment-store"
import { useJournalStore } from "@/lib/journal-store"
import { useKnowledgeStore } from "@/lib/knowledge-store"
import { useNotificationStore, type NotificationCandidate } from "@/lib/notification-store"
import { usePlannerStore } from "@/lib/planner-store"
import { useRoadmapStore } from "@/lib/roadmap-store"

const localDateKey = (date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function NotificationEngine() {
  const router = useRouter()
  const plannerWeeks = usePlannerStore((state) => state.weeks)
  const equipment = useEquipmentStore((state) => state.equipment)
  const articles = useKnowledgeStore((state) => state.articles)
  const journals = useJournalStore((state) => state.entries)
  const roadmaps = useRoadmapStore((state) => state.roadmaps)
  const selectedRoadmapId = useRoadmapStore((state) => state.selectedRoadmapId)
  const notifications = useNotificationStore((state) => state.notifications)
  const syncNotifications = useNotificationStore((state) => state.syncNotifications)
  const markAsToasted = useNotificationStore((state) => state.markAsToasted)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const candidates = useMemo(() => {
    const next: NotificationCandidate[] = []
    const today = localDateKey(new Date(now))

    plannerWeeks.forEach((week) =>
      week.objectives.forEach((objective) =>
        objective.checklist.filter((item) => !item.done).forEach((item) => {
          next.push({
            fingerprint: `planner-checklist-${item.id}`,
            type: "incomplete-checklist",
            title: "Incomplete Planner Checklist",
            message: `Week ${week.weekNumber} · ${objective.title}: ${item.text}`,
            href: "/calendar",
          })
        })
      )
    )
    equipment.forEach((item) =>
      item.checklist.filter((check) => !check.done).forEach((check) => {
        next.push({
          fingerprint: `equipment-checklist-${check.id}`,
          type: "incomplete-checklist",
          title: "Incomplete Equipment Checklist",
          message: `${item.name}: ${check.text}`,
          href: "/equipment",
        })
      })
    )
    articles.forEach((article) =>
      article.checklist.filter((item) => !item.done).forEach((item) => {
        next.push({
          fingerprint: `knowledge-checklist-${item.id}`,
          type: "incomplete-checklist",
          title: "Incomplete Learning Checklist",
          message: `${article.title}: ${item.text}`,
          href: "/tasks",
        })
      })
    )
    journals.forEach((entry) =>
      entry.checklist.filter((item) => !item.done).forEach((item) => {
        next.push({
          fingerprint: `journal-checklist-${item.id}`,
          type: "incomplete-checklist",
          title: "Incomplete Journal Checklist",
          message: `${entry.title}: ${item.text}`,
          href: "/team",
        })
      })
    )
    roadmaps.forEach((roadmap) =>
      roadmap.weeks.forEach((week) =>
        week.objectives.forEach((objective) =>
          objective.checklist.filter((item) => !item.done).forEach((item) => {
            next.push({
              fingerprint: `roadmap-checklist-${item.id}`,
              type: "incomplete-checklist",
              title: "Incomplete Roadmap Checklist",
              message: `Week ${week.weekNumber} · ${objective.title}: ${item.text}`,
              href: "/learning/roadmap",
            })
          })
        )
      )
    )

    const roadmap = roadmaps.find((item) => item.id === selectedRoadmapId) ?? roadmaps[0]
    if (roadmap) {
      plannerWeeks.filter((week) => week.progress < 100).forEach((week) => {
        const dueDate = new Date(`${roadmap.startDate}T23:59:59`)
        dueDate.setDate(dueDate.getDate() + week.weekNumber * 7 - 1)
        const daysRemaining = Math.ceil((dueDate.getTime() - now) / (24 * 60 * 60 * 1000))
        if (daysRemaining <= 2) {
          next.push({
            fingerprint: `weekly-deadline-${week.id}-${localDateKey(dueDate)}`,
            type: "weekly-deadline",
            title: daysRemaining < 0 ? "Weekly Deadline Passed" : "Weekly Deadline Approaching",
            message:
              daysRemaining < 0
                ? `Week ${week.weekNumber} is overdue and ${week.progress}% complete.`
                : `Week ${week.weekNumber} is due ${daysRemaining === 0 ? "today" : `in ${daysRemaining} days`} and ${week.progress}% complete.`,
            href: "/calendar",
          })
        }
      })
    }

    if (!journals.some((entry) => entry.date === today)) {
      next.push({
        fingerprint: `journal-reminder-${today}`,
        type: "journal-reminder",
        title: "Daily Journal Reminder",
        message: "No journal entry has been recorded for today.",
        href: "/team",
      })
    }

    const hasLearningToReview =
      !articles.length ||
      articles.some(
        (article) => !article.content.trim() || article.checklist.some((item) => !item.done)
      )
    if (hasLearningToReview) {
      next.push({
        fingerprint: `learning-reminder-${today}`,
        type: "learning-reminder",
        title: "Learning Reminder",
        message: articles.length
          ? "Your knowledge base has learning items that still need review."
          : "Create a knowledge article to document today's learning.",
        href: "/tasks",
      })
    }
    return next
  }, [articles, equipment, journals, now, plannerWeeks, roadmaps, selectedRoadmapId])

  useEffect(() => {
    syncNotifications(candidates)
  }, [candidates, syncNotifications])

  useEffect(() => {
    const due = notifications.filter(
      (notification) =>
        !notification.toastedAt &&
        (!notification.dueAt || new Date(notification.dueAt).getTime() <= now)
    )
    due.slice(0, 3).forEach((notification) => {
      toast.info(notification.title, {
        description: notification.message,
        action: { label: "View", onClick: () => router.push(notification.href) },
      })
    })
    if (due.length > 3) {
      toast.info(`${due.length - 3} additional notifications`, {
        action: { label: "Open", onClick: () => router.push("/notifications") },
      })
    }
    if (due.length) markAsToasted(due.map((notification) => notification.id))
  }, [markAsToasted, notifications, now, router])

  return null
}
