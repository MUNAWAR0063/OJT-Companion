"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"

export type PlannerPriority = "high" | "medium" | "low" | "follow_up"
export type PlannerStatus = "not-started" | "in-progress" | "completed"

export interface PlannerChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface PlannerObjective {
  id: string
  title: string
  description: string
  checklist: PlannerChecklistItem[]
  priority: PlannerPriority
  status: PlannerStatus
  equipment: string[]
  estimatedHours: number
  notes: string
  progress: number
  createdAt: string
}

export interface PlannerWeek {
  id: string
  weekNumber: number
  title: string
  reflection: string
  objectives: PlannerObjective[]
  progress: number
  createdAt: string
  updatedAt: string
}

export interface WeekInput {
  weekNumber: number
  title: string
  reflection: string
}

export interface ObjectiveInput {
  title: string
  description: string
  checklist: string[]
  priority: PlannerPriority
  status: PlannerStatus
  equipment: string[]
  estimatedHours: number
  notes: string
}

interface PlannerStore {
  weeks: PlannerWeek[]
  selectedWeekId: string | null
  createWeek: (input: WeekInput) => PlannerWeek
  updateWeek: (weekId: string, updates: Partial<WeekInput>) => void
  deleteWeek: (weekId: string) => void
  selectWeek: (weekId: string | null) => void
  createObjective: (weekId: string, input: ObjectiveInput) => void
  updateObjective: (weekId: string, objectiveId: string, input: ObjectiveInput) => void
  deleteObjective: (weekId: string, objectiveId: string) => void
  toggleChecklist: (weekId: string, objectiveId: string, checklistId: string) => void
  moveObjective: (weekId: string, objectiveId: string, status: PlannerStatus, beforeId?: string) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

function objectiveProgress(objective: PlannerObjective) {
  if (objective.checklist.length) {
    return Math.round(
      (objective.checklist.filter((item) => item.done).length / objective.checklist.length) * 100
    )
  }
  return objective.status === "completed" ? 100 : objective.status === "in-progress" ? 50 : 0
}

function checklistForStatus(
  checklist: PlannerChecklistItem[],
  currentStatus: PlannerStatus,
  nextStatus: PlannerStatus
) {
  if (currentStatus === nextStatus) return checklist
  if (nextStatus === "completed") return checklist.map((item) => ({ ...item, done: true }))
  if (nextStatus === "not-started") return checklist.map((item) => ({ ...item, done: false }))
  if (checklist.length && checklist.every((item) => item.done)) {
    return checklist.map((item, index) => (index === checklist.length - 1 ? { ...item, done: false } : item))
  }
  return checklist
}

function normalizeWeek(week: PlannerWeek): PlannerWeek {
  const objectives = week.objectives.map((objective) => ({
    ...objective,
    progress: objectiveProgress(objective),
  }))
  const progress = objectives.length
    ? Math.round(objectives.reduce((total, objective) => total + objective.progress, 0) / objectives.length)
    : 0
  return { ...week, objectives, progress, updatedAt: new Date().toISOString() }
}

function buildObjective(input: ObjectiveInput): PlannerObjective {
  const checklist = input.checklist
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ id: makeId(), text, done: input.status === "completed" }))
  const objective: PlannerObjective = {
    id: makeId(),
    title: input.title.trim(),
    description: input.description.trim(),
    checklist,
    priority: input.priority,
    status: input.status,
    equipment: input.equipment.map((item) => item.trim()).filter(Boolean),
    estimatedHours: Math.max(0, input.estimatedHours || 0),
    notes: input.notes.trim(),
    progress: 0,
    createdAt: new Date().toISOString(),
  }
  return { ...objective, progress: objectiveProgress(objective) }
}

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      weeks: [],
      selectedWeekId: null,

      createWeek: (input) => {
        const now = new Date().toISOString()
        const week: PlannerWeek = {
          id: makeId(),
          weekNumber: Math.max(1, input.weekNumber || 1),
          title: input.title.trim() || `Week ${input.weekNumber}`,
          reflection: input.reflection.trim(),
          objectives: [],
          progress: 0,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ weeks: [...state.weeks, week], selectedWeekId: week.id }))
        return week
      },

      updateWeek: (weekId, updates) =>
        set((state) => ({
          weeks: state.weeks.map((week) =>
            week.id === weekId
              ? normalizeWeek({
                  ...week,
                  ...updates,
                  weekNumber: Math.max(1, updates.weekNumber ?? week.weekNumber),
                })
              : week
          ),
        })),

      deleteWeek: (weekId) =>
        set((state) => {
          const weeks = state.weeks.filter((week) => week.id !== weekId)
          return {
            weeks,
            selectedWeekId:
              state.selectedWeekId === weekId ? (weeks[0]?.id ?? null) : state.selectedWeekId,
          }
        }),

      selectWeek: (weekId) => set({ selectedWeekId: weekId }),

      createObjective: (weekId, input) =>
        set((state) => ({
          weeks: state.weeks.map((week) =>
            week.id === weekId
              ? normalizeWeek({ ...week, objectives: [...week.objectives, buildObjective(input)] })
              : week
          ),
        })),

      updateObjective: (weekId, objectiveId, input) =>
        set((state) => ({
          weeks: state.weeks.map((week) => {
            if (week.id !== weekId) return week
            return normalizeWeek({
              ...week,
              objectives: week.objectives.map((objective) => {
                if (objective.id !== objectiveId) return objective
                const editedChecklist = input.checklist
                  .map((text) => text.trim())
                  .filter(Boolean)
                  .map((text, index) => ({
                    id: objective.checklist[index]?.id ?? makeId(),
                    text,
                    done: objective.checklist[index]?.text === text ? objective.checklist[index].done : false,
                  }))
                return {
                  ...objective,
                  ...input,
                  title: input.title.trim(),
                  description: input.description.trim(),
                  notes: input.notes.trim(),
                  equipment: input.equipment.map((item) => item.trim()).filter(Boolean),
                  estimatedHours: Math.max(0, input.estimatedHours || 0),
                  checklist: checklistForStatus(editedChecklist, objective.status, input.status),
                }
              }),
            })
          }),
        })),

      deleteObjective: (weekId, objectiveId) =>
        set((state) => ({
          weeks: state.weeks.map((week) =>
            week.id === weekId
              ? normalizeWeek({
                  ...week,
                  objectives: week.objectives.filter((objective) => objective.id !== objectiveId),
                })
              : week
          ),
        })),

      toggleChecklist: (weekId, objectiveId, checklistId) =>
        set((state) => ({
          weeks: state.weeks.map((week) => {
            if (week.id !== weekId) return week
            return normalizeWeek({
              ...week,
              objectives: week.objectives.map((objective) => {
                if (objective.id !== objectiveId) return objective
                const checklist = objective.checklist.map((item) =>
                  item.id === checklistId ? { ...item, done: !item.done } : item
                )
                const done = checklist.filter((item) => item.done).length
                return {
                  ...objective,
                  checklist,
                  status:
                    done === checklist.length
                      ? "completed"
                      : done > 0
                        ? "in-progress"
                        : "not-started",
                }
              }),
            })
          }),
        })),

      moveObjective: (weekId, objectiveId, status, beforeId) =>
        set((state) => ({
          weeks: state.weeks.map((week) => {
            if (week.id !== weekId) return week
            const source = week.objectives.find((objective) => objective.id === objectiveId)
            if (!source) return week
            if (beforeId === objectiveId && status === source.status) return week
            const checklist = checklistForStatus(source.checklist, source.status, status)
            const moved = { ...source, status, checklist }
            const objectives = week.objectives.filter((objective) => objective.id !== objectiveId)
            const targetIndex = beforeId
              ? objectives.findIndex((objective) => objective.id === beforeId)
              : -1
            objectives.splice(targetIndex >= 0 ? targetIndex : objectives.length, 0, moved)
            return normalizeWeek({ ...week, objectives })
          }),
        })),
    }),
    {
      name: "ojt-weekly-planner",
      storage: createJSONStorage(() => supabaseStateStorage),
      partialize: (state) => ({ weeks: state.weeks, selectedWeekId: state.selectedWeekId }),
    }
  )
)

export const getPlannerProgress = (weeks: PlannerWeek[]) => {
  const objectives = weeks.flatMap((week) => week.objectives)
  return objectives.length
    ? Math.round(objectives.reduce((total, objective) => total + objective.progress, 0) / objectives.length)
    : 0
}
