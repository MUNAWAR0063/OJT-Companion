"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"

export type ObjectiveStatus = "not-started" | "in-progress" | "completed"
export type ObjectivePriority = "high" | "medium" | "low"

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface RoadmapObjective {
  id: string
  title: string
  description: string
  priority: ObjectivePriority
  status: ObjectiveStatus
  checklist: ChecklistItem[]
  equipment: string[]
  notes: string
  progress: number
}

export interface RoadmapWeek {
  id: string
  weekNumber: number
  title: string
  tripId: string
  tripName: string
  location: string
  objectives: RoadmapObjective[]
  reflection: string
  progress: number
}

export interface RoadmapTrip {
  id: string
  tripNumber: number
  name: string
  location: string
  focus: string
  description: string
}

export interface RoadmapItem {
  id: string
  title: string
  traineeName: string
  companyName: string
  startDate: string
  endDate: string
  trips: RoadmapTrip[]
  weeks: RoadmapWeek[]
  createdAt: string
}

export interface RoadmapWizardState {
  title: string
  traineeName: string
  companyName: string
  startDate: string
  trips: RoadmapTrip[]
  weeks: Array<{
    weekNumber: number
    title: string
    tripId: string
    tripName: string
    location: string
    objectives: Array<{
      title: string
      description: string
      priority: ObjectivePriority
      checklist: string[]
      equipment: string[]
      notes: string
    }>
    reflection: string
  }>
}

interface RoadmapStoreState {
  roadmaps: RoadmapItem[]
  selectedRoadmapId: string | null
  createRoadmap: (input: RoadmapWizardState) => RoadmapItem
  updateRoadmap: (id: string, input: RoadmapWizardState) => void
  deleteRoadmap: (id: string) => void
  setSelectedRoadmap: (id: string | null) => void
  updateWeek: (roadmapId: string, weekId: string, updates: Partial<RoadmapWeek>) => void
  updateObjective: (roadmapId: string, weekId: string, objectiveId: string, updates: Partial<RoadmapObjective>) => void
  toggleChecklistItem: (roadmapId: string, weekId: string, objectiveId: string, itemId: string) => void
  reorderWeeks: (roadmapId: string, startIndex: number, endIndex: number) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

function buildDefaultObjectives(weekNumber: number, tripName: string) {
  const baseObjectives = [
    {
      title: `${tripName} fundamentals`,
      description: `Review the essential system knowledge and standards for Week ${weekNumber}.`,
      priority: "high" as const,
      checklist: ["Review core documentation", "Note observations"],
      equipment: ["Safety PPE"],
      notes: "Capture key lessons learned.",
    },
    {
      title: `Hands-on application`,
      description: `Practice the core task in a supervised setting during Week ${weekNumber}.`,
      priority: "medium" as const,
      checklist: ["Inspect equipment", "Log findings"],
      equipment: [tripName],
      notes: "Record outstanding questions.",
    },
    {
      title: `Reflection and next steps`,
      description: `Summarize outcomes and plan the next learning focus for Week ${weekNumber}.`,
      priority: "low" as const,
      checklist: ["Complete reflection"],
      equipment: [],
      notes: "Prepare to carry forward any follow-up actions.",
    },
  ]

  return baseObjectives.map((objective) => ({
    ...objective,
    checklist: objective.checklist.map((text) => ({ id: makeId(), text, done: false })),
    equipment: [...objective.equipment],
    notes: objective.notes,
    progress: 0,
    status: "not-started" as const,
    id: makeId(),
  }))
}

function calculateObjectiveProgress(objective: RoadmapObjective) {
  if (objective.checklist.length > 0) {
    const done = objective.checklist.filter((item) => item.done).length
    return Math.round((done / objective.checklist.length) * 100)
  }

  if (objective.status === "completed") return 100
  if (objective.status === "in-progress") return 50
  return 0
}

function normalizeWeek(week: RoadmapWeek): RoadmapWeek {
  const objectives = (week.objectives ?? []).map((objective) => {
    const progress = calculateObjectiveProgress(objective)
    return {
      ...objective,
      progress,
      status:
        progress === 100
          ? ("completed" as const)
          : progress > 0
            ? ("in-progress" as const)
            : ("not-started" as const),
    }
  })

  const progress = objectives.length
    ? Math.round(objectives.reduce((sum, objective) => sum + objective.progress, 0) / objectives.length)
    : 0

  return {
    ...week,
    objectives,
    progress,
  }
}

function normalizeRoadmap(roadmap: RoadmapItem): RoadmapItem {
  const weeks = roadmap.weeks.map((week) => normalizeWeek(week))
  return {
    ...roadmap,
    weeks,
  }
}

export const useRoadmapStore = create<RoadmapStoreState>()(
  persist(
    (set, get) => ({
      roadmaps: [],
      selectedRoadmapId: null,

      createRoadmap: (input) => {
        const startDate = input.startDate || new Date().toISOString().slice(0, 10)
        const endDate = new Date(new Date(startDate).getTime() + (18 * 7 - 1) * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)

        const trips = input.trips.slice(0, 6).map((trip, index) => ({
          id: trip.id || makeId(),
          tripNumber: index + 1,
          name: trip.name || `Trip ${index + 1}`,
          location: trip.location || "Site location",
          focus: trip.focus || "Core training",
          description: trip.description || "Training focus for this rotation.",
        }))

        const weeks = input.weeks.slice(0, 18).map((week, index) => {
          const trip = trips.find((entry) => entry.id === week.tripId) ?? trips[Math.min(index, trips.length - 1)]
          const objectives = (week.objectives ?? []).length
            ? week.objectives.map((objective, objectiveIndex) => ({
                id: makeId(),
                title: objective.title || `Objective ${objectiveIndex + 1}`,
                description: objective.description || "Working objective for this week.",
                priority: objective.priority || "medium",
                status: "not-started" as const,
                checklist: (objective.checklist ?? []).map((text) => ({ id: makeId(), text, done: false })),
                equipment: objective.equipment ?? [],
                notes: objective.notes ?? "",
                progress: 0,
              }))
            : buildDefaultObjectives(index + 1, trip.name)

          return {
            id: makeId(),
            weekNumber: index + 1,
            title: week.title || `Week ${index + 1}`,
            tripId: trip.id,
            tripName: trip.name,
            location: trip.location,
            objectives,
            reflection: week.reflection || "",
            progress: 0,
          }
        })

        const roadmap = normalizeRoadmap({
          id: makeId(),
          title: input.title || "OJT Learning Roadmap",
          traineeName: input.traineeName || "Trainee",
          companyName: input.companyName || "Company",
          startDate,
          endDate,
          trips,
          weeks,
          createdAt: new Date().toISOString(),
        })

        set((state) => ({
          roadmaps: [roadmap, ...state.roadmaps],
          selectedRoadmapId: roadmap.id,
        }))

        return roadmap
      },

      updateRoadmap: (id, input) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((roadmap) => {
            if (roadmap.id !== id) return roadmap

            const startDate = input.startDate || roadmap.startDate
            const endDate = input.startDate
              ? new Date(new Date(input.startDate).getTime() + (18 * 7 - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
              : roadmap.endDate

            const trips = input.trips.slice(0, 6).map((trip, index) => ({
              id: trip.id || makeId(),
              tripNumber: index + 1,
              name: trip.name || `Trip ${index + 1}`,
              location: trip.location || "Site location",
              focus: trip.focus || "Core training",
              description: trip.description || "Training focus for this rotation.",
            }))

            const weeks = input.weeks.slice(0, 18).map((week, index) => {
              const trip = trips.find((entry) => entry.id === week.tripId) ?? trips[Math.min(index, trips.length - 1)]
              const previousWeek = roadmap.weeks[index] ?? roadmap.weeks[roadmap.weeks.length - 1]
              const objectives = (week.objectives ?? []).length
                ? week.objectives.map((objective, objectiveIndex) => ({
                    id: previousWeek?.objectives[objectiveIndex]?.id || makeId(),
                    title: objective.title || `Objective ${objectiveIndex + 1}`,
                    description: objective.description || "Working objective for this week.",
                    priority: objective.priority || "medium",
                    status: previousWeek?.objectives[objectiveIndex]?.status || "not-started",
                    checklist: (objective.checklist ?? []).length
                      ? objective.checklist.map((text, checklistIndex) => {
                          const previousItem = previousWeek?.objectives[objectiveIndex]?.checklist[checklistIndex]
                          return {
                            id: previousItem?.id || makeId(),
                            text,
                            done: previousItem?.text === text ? previousItem.done : false,
                          }
                        })
                      : previousWeek?.objectives[objectiveIndex]?.checklist || [],
                    equipment: objective.equipment ?? [],
                    notes: objective.notes ?? "",
                    progress: 0,
                  }))
                : previousWeek?.objectives || buildDefaultObjectives(index + 1, trip.name)

              return {
                id: previousWeek?.id || makeId(),
                weekNumber: index + 1,
                title: week.title || `Week ${index + 1}`,
                tripId: trip.id,
                tripName: trip.name,
                location: trip.location,
                objectives,
                reflection: week.reflection || previousWeek?.reflection || "",
                progress: 0,
              }
            })

            return normalizeRoadmap({
              ...roadmap,
              title: input.title || roadmap.title,
              traineeName: input.traineeName || roadmap.traineeName,
              companyName: input.companyName || roadmap.companyName,
              startDate,
              endDate,
              trips,
              weeks,
            })
          }),
        }))
      },

      deleteRoadmap: (id) => {
        set((state) => {
          const remaining = state.roadmaps.filter((roadmap) => roadmap.id !== id)
          return {
            roadmaps: remaining,
            selectedRoadmapId: remaining.length ? remaining[0].id : null,
          }
        })
      },

      setSelectedRoadmap: (id) => set({ selectedRoadmapId: id }),

      updateWeek: (roadmapId, weekId, updates) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((roadmap) => {
            if (roadmap.id !== roadmapId) return roadmap
            return normalizeRoadmap({
              ...roadmap,
              weeks: roadmap.weeks.map((week) => (week.id === weekId ? { ...week, ...updates } : week)),
            })
          }),
        }))
      },

      updateObjective: (roadmapId, weekId, objectiveId, updates) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((roadmap) => {
            if (roadmap.id !== roadmapId) return roadmap
            return normalizeRoadmap({
              ...roadmap,
              weeks: roadmap.weeks.map((week) => {
                if (week.id !== weekId) return week
                return {
                  ...week,
                  objectives: week.objectives.map((objective) =>
                    objective.id === objectiveId ? { ...objective, ...updates } : objective
                  ),
                }
              }),
            })
          }),
        }))
      },

      toggleChecklistItem: (roadmapId, weekId, objectiveId, itemId) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((roadmap) => {
            if (roadmap.id !== roadmapId) return roadmap
            return normalizeRoadmap({
              ...roadmap,
              weeks: roadmap.weeks.map((week) => {
                if (week.id !== weekId) return week
                return {
                  ...week,
                  objectives: week.objectives.map((objective) => {
                    if (objective.id !== objectiveId) return objective
                    return {
                      ...objective,
                      checklist: objective.checklist.map((item) =>
                        item.id === itemId ? { ...item, done: !item.done } : item
                      ),
                    }
                  }),
                }
              }),
            })
          }),
        }))
      },

      reorderWeeks: (roadmapId, startIndex, endIndex) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((roadmap) => {
            if (roadmap.id !== roadmapId) return roadmap
            const weeks = [...roadmap.weeks]
            const [moved] = weeks.splice(startIndex, 1)
            weeks.splice(endIndex, 0, moved)
            return normalizeRoadmap({
              ...roadmap,
              weeks: weeks.map((week, index) => ({ ...week, weekNumber: index + 1 })),
            })
          }),
        }))
      },
    }),
    {
      name: "ojt-roadmap-store",
      storage: createJSONStorage(() => supabaseStateStorage),
      partialize: (state) => ({
        roadmaps: state.roadmaps,
        selectedRoadmapId: state.selectedRoadmapId,
      }),
    }
  )
)

export const getRoadmapProgress = (roadmap: RoadmapItem | null | undefined) => {
  if (!roadmap) return 0
  const total = roadmap.weeks.reduce((sum, week) => sum + week.progress, 0)
  return roadmap.weeks.length ? Math.round(total / roadmap.weeks.length) : 0
}
