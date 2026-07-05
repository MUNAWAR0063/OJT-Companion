"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"
import { getRoadmapOverallProgress } from "@/lib/roadmap-progress.mjs"
import { updateObjectiveStatus as applyObjectiveStatus } from "@/lib/roadmap-planner-integration.mjs"
import { generateRoadmap as buildGeneratedRoadmap, normalizeDiscipline, normalizeRoadmapGroup } from "@/lib/roadmap-template-engine.mjs"

export type ObjectiveStatus = "not-started" | "in-progress" | "completed"
export type ObjectivePriority = "high" | "medium" | "low" | "follow_up"
export type RoadmapDiscipline = "Operator" | "Instrument" | "Mechanical" | "Electrical" | "HSE"
export type RoadmapGroup = "A" | "B"
export type RoadmapMode = "auto" | "manual"
export type RoadmapTaskCategory = "safety" | "technical" | "operation" | "review" | "maintenance"

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface RoadmapObjective {
  id: string
  code?: string
  title: string
  description: string
  priority: ObjectivePriority
  category?: RoadmapTaskCategory
  discipline?: RoadmapDiscipline | "Common"
  difficulty?: "basic" | "intermediate" | "advanced"
  siteContext?: string
  siteContrast?: string
  variationSeed?: string
  subjects?: string[]
  activities?: string[]
  status: ObjectiveStatus
  checklist: ChecklistItem[]
  equipment: string[]
  estimatedHours: number
  notes: string
  progress: number
  source?: "roadmap" | "daily_journal"
  journalEntryId?: string
  journalChecklistItemId?: string
  dueWeekId?: string
}

export interface RoadmapWeek {
  id: string
  weekNumber: number
  title: string
  tripId: string
  tripName: string
  location: string
  phase?: "foundation" | "operation" | "advanced"
  variationSeed?: string
  status?: ObjectiveStatus
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
  discipline: RoadmapDiscipline
  group: RoadmapGroup
  mode: RoadmapMode
  variationSeed?: string
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
  discipline: RoadmapDiscipline
  group: RoadmapGroup
  mode: RoadmapMode
  variationSeed?: string
  startDate: string
  trips: RoadmapTrip[]
  weeks: Array<{
    weekNumber: number
    title: string
    tripId: string
    tripName: string
    location: string
    phase?: "foundation" | "operation" | "advanced"
    variationSeed?: string
    status?: ObjectiveStatus
    objectives: Array<{
      title: string
      description: string
      priority: ObjectivePriority
      code?: string
      category?: RoadmapTaskCategory
      discipline?: RoadmapDiscipline | "Common"
      difficulty?: "basic" | "intermediate" | "advanced"
      siteContext?: string
      siteContrast?: string
      variationSeed?: string
      subjects?: string[]
      activities?: string[]
      checklist: string[]
      equipment: string[]
      notes: string
      source?: "roadmap"
    }>
    reflection: string
  }>
}

interface RoadmapStoreState {
  roadmaps: RoadmapItem[]
  selectedRoadmapId: string | null
  createRoadmap: (input: RoadmapWizardState) => RoadmapItem
  generateRoadmap: (input: Partial<RoadmapWizardState>) => RoadmapItem
  updateRoadmap: (id: string, input: RoadmapWizardState) => void
  deleteRoadmap: (id: string) => void
  setSelectedRoadmap: (id: string | null) => void
  updateWeek: (roadmapId: string, weekId: string, updates: Partial<RoadmapWeek>) => void
  updateObjective: (roadmapId: string, weekId: string, objectiveId: string, updates: Partial<RoadmapObjective>) => void
  createObjective: (roadmapId: string, weekId: string, input: Partial<RoadmapObjective>) => void
  deleteObjective: (roadmapId: string, weekId: string, objectiveId: string) => void
  updateObjectiveStatus: (roadmapId: string, weekId: string, objectiveId: string, status: ObjectiveStatus, beforeId?: string) => void
  toggleChecklistItem: (roadmapId: string, weekId: string, objectiveId: string, itemId: string) => void
  reorderWeeks: (roadmapId: string, startIndex: number, endIndex: number) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)
const OJT_TOTAL_WEEKS = 18
const WEEKS_PER_TRIP = 3

function getRoadmapEndDate(startDate: string) {
  return new Date(new Date(startDate).getTime() + (OJT_TOTAL_WEEKS * 7 - 1) * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
}

function buildDefaultObjectives(weekNumber: number, tripName: string) {
  const baseObjectives = [
    {
      title: `${tripName} fundamentals`,
      description: `Review the essential system knowledge and standards for Week ${weekNumber}.`,
      priority: "high" as const,
    checklist: ["Review core documentation", "Note observations"],
    equipment: ["Safety PPE"],
      estimatedHours: 1,
    notes: "Capture key lessons learned.",
    },
    {
      title: `Hands-on application`,
      description: `Practice the core task in a supervised setting during Week ${weekNumber}.`,
      priority: "medium" as const,
    checklist: ["Inspect equipment", "Log findings"],
    equipment: [tripName],
      estimatedHours: 1,
    notes: "Record outstanding questions.",
    },
    {
      title: `Reflection and next steps`,
      description: `Summarize outcomes and plan the next learning focus for Week ${weekNumber}.`,
      priority: "low" as const,
    checklist: ["Complete reflection"],
    equipment: [],
      estimatedHours: 1,
    notes: "Prepare to carry forward any follow-up actions.",
    },
  ]

  return baseObjectives.map((objective) => ({
    ...objective,
    checklist: objective.checklist.map((text) => ({ id: makeId(), text, done: false })),
    equipment: [...objective.equipment],
    estimatedHours: objective.estimatedHours,
    notes: objective.notes,
    progress: 0,
    source: "roadmap" as const,
    code: "",
    category: "technical" as const,
    discipline: "Common" as const,
    difficulty: "basic" as const,
    subjects: [],
    activities: [],
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

function buildGeneratedObjective(
  objective: RoadmapWizardState["weeks"][number]["objectives"][number],
  objectiveIndex: number
): RoadmapObjective {
  return {
    id: makeId(),
    title: objective.title || `Objective ${objectiveIndex + 1}`,
    code: objective.code,
    description: objective.description || "Working objective for this week.",
    priority: objective.priority || "medium",
    status: "not-started",
    checklist: (objective.checklist ?? []).map((text) => ({ id: makeId(), text, done: false })),
    equipment: objective.equipment ?? [],
    estimatedHours: 1,
    notes: objective.notes ?? "",
    source: objective.source || "roadmap",
    category: objective.category,
    discipline: objective.discipline,
    difficulty: objective.difficulty,
    siteContext: objective.siteContext,
    siteContrast: objective.siteContrast,
    variationSeed: objective.variationSeed,
    subjects: objective.subjects,
    activities: objective.activities,
    progress: 0,
  }
}

function normalizeWeek(week: RoadmapWeek): RoadmapWeek {
  const objectives = (week.objectives ?? []).map((objective) => {
    const progress = calculateObjectiveProgress(objective)
    return {
      ...objective,
      estimatedHours: Math.max(0, Number(objective.estimatedHours) || 0),
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
    status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started",
  }
}

function normalizeRoadmap(roadmap: RoadmapItem): RoadmapItem {
  const discipline = (normalizeDiscipline(roadmap.discipline) as RoadmapDiscipline) || "Electrical"
  const group = (normalizeRoadmapGroup(roadmap.group) as RoadmapGroup) || "A"
  const generated = buildGeneratedRoadmap({
    title: roadmap.title,
    traineeName: roadmap.traineeName,
    companyName: roadmap.companyName,
    discipline,
    group,
    startDate: roadmap.startDate,
    seed: roadmap.variationSeed || `${roadmap.id}-week-normalization`,
  }) as RoadmapWizardState
  const generatedTrips = generated.trips
  const trips = (roadmap.trips?.length ? roadmap.trips : generatedTrips).slice(0, 6).map((trip, index) => ({
    id: trip.id || generatedTrips[index]?.id || makeId(),
    tripNumber: index + 1,
    name: trip.name || generatedTrips[index]?.name || `Trip ${index + 1}`,
    location: trip.location || generatedTrips[index]?.location || "Site location",
    focus: trip.focus || generatedTrips[index]?.focus || "Core training",
    description: trip.description || generatedTrips[index]?.description || "Training focus for this rotation.",
  }))
  const existingWeeks = Array.isArray(roadmap.weeks) ? roadmap.weeks.slice(0, OJT_TOTAL_WEEKS) : []
  const weeks = Array.from({ length: OJT_TOTAL_WEEKS }, (_, index) => {
    const weekNumber = index + 1
    const existingWeek =
      existingWeeks.find((week) => Number(week.weekNumber) === weekNumber) ?? existingWeeks[index]
    if (existingWeek) return normalizeWeek({ ...existingWeek, weekNumber })

    const generatedWeek = generated.weeks[index]
    const trip = trips[Math.min(Math.floor(index / WEEKS_PER_TRIP), trips.length - 1)]
    return normalizeWeek({
      id: makeId(),
      weekNumber,
      title: generatedWeek?.title || `Week ${weekNumber}`,
      tripId: trip.id,
      tripName: trip.name,
      location: trip.location,
      phase: generatedWeek?.phase,
      variationSeed: generatedWeek?.variationSeed,
      status: "not-started",
      objectives: generatedWeek?.objectives?.length
        ? generatedWeek.objectives.map((objective, objectiveIndex) =>
            buildGeneratedObjective(objective, objectiveIndex)
          )
        : buildDefaultObjectives(weekNumber, trip.name),
      reflection: "",
      progress: 0,
    })
  })
  return {
    ...roadmap,
    discipline,
    group,
    mode: roadmap.mode || "manual",
    endDate: roadmap.startDate ? getRoadmapEndDate(roadmap.startDate) : roadmap.endDate,
    trips,
    weeks,
  }
}

function buildObjective(input: Partial<RoadmapObjective>): RoadmapObjective {
  return {
    id: input.id || makeId(),
    code: input.code,
    title: input.title?.trim() || "New objective",
    description: input.description?.trim() || "",
    priority: input.priority || "medium",
    status: input.status || "not-started",
    checklist: (input.checklist ?? [{ id: makeId(), text: "Complete objective", done: false }]).map(
      (item) => ({
        id: item.id || makeId(),
        text: item.text?.trim() || "Complete objective",
        done: Boolean(item.done),
      })
    ),
    equipment: input.equipment ?? [],
    estimatedHours: Math.max(0, Number(input.estimatedHours) || 0),
    notes: input.notes?.trim() || "",
    progress: 0,
    source: input.source,
    category: input.category,
    discipline: input.discipline,
    difficulty: input.difficulty,
    siteContext: input.siteContext,
    siteContrast: input.siteContrast,
    variationSeed: input.variationSeed,
    subjects: input.subjects,
    activities: input.activities,
    journalEntryId: input.journalEntryId,
    journalChecklistItemId: input.journalChecklistItemId,
    dueWeekId: input.dueWeekId,
  }
}

export const useRoadmapStore = create<RoadmapStoreState>()(
  persist(
    (set, get) => ({
      roadmaps: [],
      selectedRoadmapId: null,

      createRoadmap: (input) => {
        const discipline = normalizeDiscipline(input.discipline) as RoadmapDiscipline
        const group = normalizeRoadmapGroup(input.group) as RoadmapGroup
        const mode = input.mode || "manual"
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
          const selectedTrip = trips.find((entry) => entry.id === week.tripId)
          const trip = selectedTrip ?? (mode === "auto" ? trips[Math.min(index, trips.length - 1)] : null)
          const objectives = (week.objectives ?? []).length
            ? week.objectives.map((objective, objectiveIndex) => ({
                id: makeId(),
                title: objective.title || `Objective ${objectiveIndex + 1}`,
                code: objective.code,
                description: objective.description || "Working objective for this week.",
                priority: objective.priority || "medium",
                status: "not-started" as const,
                checklist: (objective.checklist ?? []).map((text) => ({ id: makeId(), text, done: false })),
                equipment: objective.equipment ?? [],
                estimatedHours: 1,
                notes: objective.notes ?? "",
                source: objective.source || "roadmap",
                category: objective.category,
                discipline: objective.discipline,
                difficulty: objective.difficulty,
                siteContext: objective.siteContext,
                siteContrast: objective.siteContrast,
                variationSeed: objective.variationSeed,
                subjects: objective.subjects,
                activities: objective.activities,
                progress: 0,
              }))
            : mode === "manual"
              ? []
              : buildDefaultObjectives(index + 1, trip?.name ?? `Trip ${index + 1}`)

          return {
            id: makeId(),
            weekNumber: index + 1,
            title: mode === "manual" ? week.title.trim() : week.title || `Week ${index + 1}`,
            tripId: trip?.id ?? "",
            tripName: trip?.name ?? "",
            location: trip?.location ?? "",
            phase: week.phase,
            variationSeed: week.variationSeed,
            status: week.status || "not-started",
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
          discipline,
          group,
          mode,
          variationSeed: input.variationSeed,
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

      generateRoadmap: (input) => {
        const generated = buildGeneratedRoadmap({
          ...input,
          discipline: input.discipline,
          group: input.group,
        }) as RoadmapWizardState
        return get().createRoadmap(generated)
      },

      updateRoadmap: (id, input) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((roadmap) => {
            if (roadmap.id !== id) return roadmap

            const discipline = normalizeDiscipline(input.discipline) as RoadmapDiscipline
            const group = normalizeRoadmapGroup(input.group) as RoadmapGroup
            const mode = input.mode || roadmap.mode || "manual"
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
              const selectedTrip = trips.find((entry) => entry.id === week.tripId)
              const trip = selectedTrip ?? (mode === "auto" ? trips[Math.min(index, trips.length - 1)] : null)
              const previousWeek = roadmap.weeks[index] ?? roadmap.weeks[roadmap.weeks.length - 1]
              const objectives = (week.objectives ?? []).length
                ? week.objectives.map((objective, objectiveIndex) => ({
                    id: previousWeek?.objectives[objectiveIndex]?.id || makeId(),
                    title: objective.title || `Objective ${objectiveIndex + 1}`,
                    code: objective.code || previousWeek?.objectives[objectiveIndex]?.code,
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
                    estimatedHours: previousWeek?.objectives[objectiveIndex]?.estimatedHours ?? 1,
                    notes: objective.notes ?? "",
                    source: objective.source || previousWeek?.objectives[objectiveIndex]?.source || "roadmap",
                    category: objective.category || previousWeek?.objectives[objectiveIndex]?.category,
                    discipline: objective.discipline || previousWeek?.objectives[objectiveIndex]?.discipline,
                    difficulty: objective.difficulty || previousWeek?.objectives[objectiveIndex]?.difficulty,
                    siteContext: objective.siteContext || previousWeek?.objectives[objectiveIndex]?.siteContext,
                    siteContrast: objective.siteContrast || previousWeek?.objectives[objectiveIndex]?.siteContrast,
                    variationSeed: objective.variationSeed || previousWeek?.objectives[objectiveIndex]?.variationSeed,
                    subjects: objective.subjects || previousWeek?.objectives[objectiveIndex]?.subjects,
                    activities: objective.activities || previousWeek?.objectives[objectiveIndex]?.activities,
                    progress: 0,
                  }))
                : previousWeek?.objectives ??
                  (mode === "manual"
                    ? []
                    : buildDefaultObjectives(index + 1, trip?.name ?? `Trip ${index + 1}`))

              return {
                id: previousWeek?.id || makeId(),
                weekNumber: index + 1,
                title: mode === "manual" ? week.title.trim() : week.title || `Week ${index + 1}`,
                tripId: trip?.id ?? "",
                tripName: trip?.name ?? "",
                location: trip?.location ?? "",
                phase: week.phase,
                variationSeed: week.variationSeed,
                status: week.status || previousWeek?.status || "not-started",
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
              discipline,
              group,
              mode,
              variationSeed: input.variationSeed || roadmap.variationSeed,
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

      createObjective: (roadmapId, weekId, input) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((roadmap) => {
            if (roadmap.id !== roadmapId) return roadmap
            return normalizeRoadmap({
              ...roadmap,
              weeks: roadmap.weeks.map((week) =>
                week.id === weekId
                  ? { ...week, objectives: [...week.objectives, buildObjective(input)] }
                  : week
              ),
            })
          }),
        }))
      },

      deleteObjective: (roadmapId, weekId, objectiveId) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((roadmap) => {
            if (roadmap.id !== roadmapId) return roadmap
            return normalizeRoadmap({
              ...roadmap,
              weeks: roadmap.weeks.map((week) =>
                week.id === weekId
                  ? { ...week, objectives: week.objectives.filter((objective) => objective.id !== objectiveId) }
                  : week
              ),
            })
          }),
        }))
      },

      updateObjectiveStatus: (roadmapId, weekId, objectiveId, status, beforeId) => {
        set((state) => ({
          roadmaps: state.roadmaps.map((roadmap) => {
            if (roadmap.id !== roadmapId) return roadmap
            return normalizeRoadmap({
              ...roadmap,
              weeks: roadmap.weeks.map((week) => {
                if (week.id !== weekId) return week
                const current = week.objectives.find((objective) => objective.id === objectiveId)
                if (!current) return week
                const moved = applyObjectiveStatus(current, status) as RoadmapObjective
                const objectives = week.objectives.filter((objective) => objective.id !== objectiveId)
                const targetIndex = beforeId
                  ? objectives.findIndex((objective) => objective.id === beforeId)
                  : -1
                objectives.splice(targetIndex >= 0 ? targetIndex : objectives.length, 0, moved)
                return { ...week, objectives }
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
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<RoadmapStoreState> | undefined
        return {
          ...currentState,
          ...persisted,
          roadmaps: (persisted?.roadmaps ?? []).map((roadmap) => normalizeRoadmap(roadmap)),
          selectedRoadmapId: persisted?.selectedRoadmapId ?? currentState.selectedRoadmapId,
        }
      },
    }
  )
)

export const getRoadmapProgress = (roadmap: RoadmapItem | null | undefined) => {
  return getRoadmapOverallProgress(roadmap)
}
