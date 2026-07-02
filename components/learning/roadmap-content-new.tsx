"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, CalendarDays, GripVertical, Link2, Map, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react"
import {
  getRoadmapProgress,
  useRoadmapStore,
  type RoadmapDiscipline,
  type RoadmapItem,
  type RoadmapTrip,
  type RoadmapWizardState,
} from "@/lib/roadmap-store"
import { generateRoadmap as buildGeneratedRoadmap, normalizeDiscipline } from "@/lib/roadmap-template-engine.mjs"
import { getProfileDisplayName, useUserProfileStore, type UserProfile } from "@/lib/user-profile-store"

const createTripDefaults = (): RoadmapTrip[] =>
  Array.from({ length: 6 }, (_, index) => ({
    id: `trip-${index + 1}`,
    tripNumber: index + 1,
    name: `Trip ${index + 1}`,
    location: index === 0 ? "Primary site" : `Rotation ${index + 1}`,
    focus: index === 0 ? "Core systems" : "Specialized learning",
    description: index === 0 ? "Foundational training on the core equipment and safety routines." : "Targeted placement for the next training stage.",
  }))

const createWeekDefaults = (trips: RoadmapTrip[]) =>
  Array.from({ length: 18 }, (_, index) => ({
    weekNumber: index + 1,
    title: `Week ${index + 1}`,
    tripId: trips[Math.min(Math.floor(index / 3), trips.length - 1)].id,
    tripName: trips[Math.min(Math.floor(index / 3), trips.length - 1)].name,
    location: trips[Math.min(Math.floor(index / 3), trips.length - 1)].location,
    objectives: [
      {
        title: "Core objective",
        description: "Complete the week’s key training activity.",
        priority: "high" as const,
        checklist: ["Review the standard", "Log the observation"],
        equipment: ["Safety PPE"],
        notes: "Capture any follow-up actions.",
      },
    ],
    reflection: "",
  }))

const buildWizardState = (profile: UserProfile, roadmap?: RoadmapItem): RoadmapWizardState => {
  if (!roadmap) {
    return buildGeneratedRoadmap({
      discipline: normalizeDiscipline(profile.discipline),
      group: "A",
      title: "OJT Learning Roadmap",
      traineeName: getProfileDisplayName(profile),
      companyName: profile.company,
      startDate: new Date().toISOString().slice(0, 10),
    }) as RoadmapWizardState
  }

  const trips = roadmap.trips.length ? roadmap.trips : createTripDefaults()
  return {
    title: roadmap?.title ?? "OJT Learning Roadmap",
    traineeName: getProfileDisplayName(profile),
    companyName: profile.company,
    discipline: roadmap?.discipline ?? (normalizeDiscipline(profile.discipline) as RoadmapDiscipline),
    group: roadmap?.group ?? "A",
    mode: roadmap?.mode ?? "manual",
    variationSeed: roadmap?.variationSeed,
    startDate: roadmap?.startDate ?? new Date().toISOString().slice(0, 10),
    trips,
    weeks: roadmap?.weeks.length
      ? roadmap.weeks.map((week) => ({
          weekNumber: week.weekNumber,
          title: week.title,
          tripId: week.tripId,
          tripName: week.tripName,
          location: week.location,
          phase: week.phase,
          variationSeed: week.variationSeed,
          status: week.status,
          objectives: week.objectives.map((objective) => ({
            title: objective.title,
            description: objective.description,
            priority: objective.priority,
            category: objective.category,
            discipline: objective.discipline,
            difficulty: objective.difficulty,
            siteContext: objective.siteContext,
            siteContrast: objective.siteContrast,
            variationSeed: objective.variationSeed,
            checklist: objective.checklist.map((item) => item.text),
            equipment: objective.equipment,
            notes: objective.notes,
            source: objective.source === "daily_journal" ? undefined : "roadmap",
          })),
          reflection: week.reflection ?? "",
        }))
      : createWeekDefaults(trips),
  }
}

const wizardSteps = ["OJT Information", "Trip Configuration", "Week Configuration", "Generate Roadmap"]

export function RoadmapContentNew() {
  const profile = useUserProfileStore((state) => state.profile)
  const traineeName = getProfileDisplayName(profile)
  const roadmaps = useRoadmapStore((state) => state.roadmaps)
  const selectedRoadmapId = useRoadmapStore((state) => state.selectedRoadmapId)
  const createRoadmap = useRoadmapStore((state) => state.createRoadmap)
  const updateRoadmap = useRoadmapStore((state) => state.updateRoadmap)
  const deleteRoadmap = useRoadmapStore((state) => state.deleteRoadmap)
  const setSelectedRoadmap = useRoadmapStore((state) => state.setSelectedRoadmap)
  const reorderWeeks = useRoadmapStore((state) => state.reorderWeeks)
  const updateStoredWeek = useRoadmapStore((state) => state.updateWeek)
  const toggleChecklistItem = useRoadmapStore((state) => state.toggleChecklistItem)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [wizardState, setWizardState] = useState<RoadmapWizardState>(() => buildWizardState(profile))
  const [draggedWeekId, setDraggedWeekId] = useState<string | null>(null)

  const selectedRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === selectedRoadmapId) ?? roadmaps[0] ?? null,
    [roadmaps, selectedRoadmapId]
  )

  const progressValue = getRoadmapProgress(selectedRoadmap)

  const resetWizard = (roadmap?: RoadmapItem) => {
    setWizardState(buildWizardState(profile, roadmap))
    setStep(0)
    setEditingId(roadmap?.id ?? null)
  }

  const applyAutoTemplate = (
    updates: Partial<Pick<RoadmapWizardState, "discipline" | "group" | "mode" | "title" | "startDate">> = {}
  ) => {
    setWizardState((current) => {
      const next = { ...current, ...updates }
      if (next.mode !== "auto") return next
      return buildGeneratedRoadmap({
        discipline: next.discipline,
        group: next.group,
        title: next.title,
        traineeName,
        companyName: profile.company,
        startDate: next.startDate,
      }) as RoadmapWizardState
    })
  }

  const openCreateWizard = () => {
    resetWizard()
    setIsWizardOpen(true)
  }

  const openEditWizard = (roadmap: RoadmapItem) => {
    resetWizard(roadmap)
    setIsWizardOpen(true)
  }

  const handleWizardSubmit = () => {
    const nextWizardState: RoadmapWizardState = {
      ...wizardState,
      traineeName,
      companyName: profile.company,
    }

    if (editingId) {
      updateRoadmap(editingId, nextWizardState)
    } else {
      createRoadmap(nextWizardState)
    }

    setIsWizardOpen(false)
    setEditingId(null)
  }

  const handleDelete = (roadmapId: string) => {
    if (!window.confirm("Delete this roadmap? This action cannot be undone.")) return
    deleteRoadmap(roadmapId)
  }

  const updateTrip = (tripIndex: number, field: keyof RoadmapTrip, value: string) => {
    const trips = [...wizardState.trips]
    trips[tripIndex] = { ...trips[tripIndex], [field]: value }
    setWizardState((current) => ({ ...current, trips }))
  }

  const updateWeek = (weekIndex: number, field: "title" | "tripId" | "reflection", value: string) => {
    const weeks = [...wizardState.weeks]
    const selectedTrip = wizardState.trips.find((trip) => trip.id === value) ?? wizardState.trips[0]
    weeks[weekIndex] = {
      ...weeks[weekIndex],
      [field]: value,
      tripId: field === "tripId" ? selectedTrip.id : weeks[weekIndex].tripId,
      tripName: field === "tripId" ? selectedTrip.name : weeks[weekIndex].tripName,
      location: field === "tripId" ? selectedTrip.location : weeks[weekIndex].location,
    }
    setWizardState((current) => ({ ...current, weeks }))
  }

  const updateObjective = (weekIndex: number, objectiveIndex: number, field: "title" | "description" | "notes", value: string) => {
    setWizardState((current) => ({
      ...current,
      weeks: current.weeks.map((week, index) =>
        index === weekIndex
          ? {
              ...week,
              objectives: week.objectives.map((objective, itemIndex) =>
                itemIndex === objectiveIndex ? { ...objective, [field]: value } : objective
              ),
            }
          : week
      ),
    }))
  }

  const updateObjectiveChecklist = (weekIndex: number, objectiveIndex: number, value: string) => {
    setWizardState((current) => ({
      ...current,
      weeks: current.weeks.map((week, index) =>
        index === weekIndex
          ? {
              ...week,
              objectives: week.objectives.map((objective, itemIndex) =>
                itemIndex === objectiveIndex
                  ? { ...objective, checklist: value.split("\n").filter((item) => item.trim()).map((item) => item.trim()) }
                  : objective
              ),
            }
          : week
      ),
    }))
  }

  const addObjective = (weekIndex: number) => {
    setWizardState((current) => ({
      ...current,
      weeks: current.weeks.map((week, index) =>
        index === weekIndex
          ? {
              ...week,
              objectives: [
                ...week.objectives,
                {
                  title: `Objective ${week.objectives.length + 1}`,
                  description: "",
                  priority: "medium",
                  checklist: ["Complete objective"],
                  equipment: [],
                  notes: "",
                  source: "roadmap",
                  category: "technical",
                },
              ],
            }
          : week
      ),
    }))
  }

  const removeObjective = (weekIndex: number, objectiveIndex: number) => {
    setWizardState((current) => ({
      ...current,
      weeks: current.weeks.map((week, index) =>
        index === weekIndex
          ? { ...week, objectives: week.objectives.filter((_, itemIndex) => itemIndex !== objectiveIndex) }
          : week
      ),
    }))
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedWeekId === null || !selectedRoadmap) return
    const startIndex = selectedRoadmap.weeks.findIndex((week) => week.id === draggedWeekId)
    if (startIndex >= 0) {
      reorderWeeks(selectedRoadmap.id, startIndex, targetIndex)
    }
    setDraggedWeekId(null)
  }

  return (
    <div className="space-y-6">
      {!selectedRoadmap ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <Map className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No roadmap created</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Create a roadmap to structure your 18-week OJT journey, organize six trips, and track progress automatically.
              </p>
            </div>
            <Button onClick={openCreateWizard} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Roadmap
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
      {roadmaps.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Roadmap</span>
          <Select value={selectedRoadmap.id} onValueChange={setSelectedRoadmap}>
            <SelectTrigger className="max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roadmaps.map((roadmap) => (
                <SelectItem key={roadmap.id} value={roadmap.id}>
                  {roadmap.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">{selectedRoadmap.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {traineeName} • {profile.company || "Company not set"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => openEditWizard(selectedRoadmap)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Roadmap
            </Button>
            <Button variant="outline" onClick={() => handleDelete(selectedRoadmap.id)} className="gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button onClick={openCreateWizard} className="gap-2">
              <Plus className="h-4 w-4" />
              New Roadmap
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              {selectedRoadmap.startDate} → {selectedRoadmap.endDate}
            </Badge>
            <Badge variant="outline">{selectedRoadmap.discipline}</Badge>
            <Badge variant="outline">Group {selectedRoadmap.group}</Badge>
            <Badge variant="outline">{selectedRoadmap.mode === "auto" ? "Auto generated" : "Manual"}</Badge>
            <Badge variant="outline">{selectedRoadmap.weeks.length} weeks</Badge>
            <Badge variant="outline">{selectedRoadmap.trips.length} trips</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span>{progressValue}%</span>
            </div>
            <Progress value={progressValue} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">18-week training structure</h3>
          <div className="space-y-3">
            {selectedRoadmap.weeks.map((week, index) => (
              <Card
                key={week.id}
                draggable
                onDragStart={() => setDraggedWeekId(week.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(index)}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="mt-1 rounded-md bg-primary/10 p-2 text-primary">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">Week {week.weekNumber}</p>
                          <Badge variant="secondary">{week.tripName}</Badge>
                          {week.phase && <Badge variant="outline">{week.phase}</Badge>}
                          <Badge variant="outline" className="gap-1">
                            <Link2 className="h-3 w-3" />
                            Weekly Goals
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{week.title}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-2">
                      <Badge variant="outline">{week.progress}%</Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/calendar?week=${week.id}`}>Open Planner</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      {week.objectives.map((objective) => (
                        <div key={objective.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{objective.title}</p>
                            <div className="flex shrink-0 flex-wrap justify-end gap-1">
                              {objective.category && <Badge variant="outline">{objective.category}</Badge>}
                              {objective.difficulty && <Badge variant="secondary">{objective.difficulty}</Badge>}
                              <Badge variant={objective.priority === "high" ? "default" : objective.priority === "medium" ? "secondary" : "outline"}>
                                {objective.priority}
                              </Badge>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{objective.description}</p>
                          {objective.siteContrast && (
                            <p className="mt-1 text-xs text-muted-foreground">{objective.siteContrast}</p>
                          )}
                          <div className="mt-2 space-y-2">
                            {objective.checklist.map((item) => (
                              <label key={item.id} className="flex cursor-pointer items-center gap-2 text-sm">
                                <Checkbox
                                  checked={item.done}
                                  onCheckedChange={() =>
                                    toggleChecklistItem(selectedRoadmap.id, week.id, objective.id, item.id)
                                  }
                                  aria-label={`${item.done ? "Mark incomplete" : "Mark complete"}: ${item.text}`}
                                />
                                <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reflection</p>
                      <Textarea
                        className="mt-2 min-h-20 bg-background"
                        value={week.reflection}
                        onChange={(event) =>
                          updateStoredWeek(selectedRoadmap.id, week.id, { reflection: event.target.value })
                        }
                        placeholder="What did you learn this week?"
                        aria-label={`Week ${week.weekNumber} reflection`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trip overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedRoadmap.trips.map((trip) => (
                <div key={trip.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{trip.name}</p>
                    <Badge variant="outline">Trip {trip.tripNumber}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{trip.location}</p>
                  <p className="mt-2 text-sm">{trip.focus}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What this module gives you</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                <span>Wizard-based setup with six trip slots and an 18-week structure.</span>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 text-primary" />
                <span>Objectives, checklists, progress bars, and weekly reflections in the same flow.</span>
              </div>
              <div className="flex items-start gap-2">
                <Map className="mt-0.5 h-4 w-4 text-primary" />
                <span>Drag-and-drop week ordering and automatic progress updates.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </>
      )}

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Roadmap" : "Create Roadmap"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-4 gap-2" aria-label="Roadmap wizard progress">
              {wizardSteps.map((label, index) => (
                <div key={label} className="space-y-1">
                  <div className={`h-1.5 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} />
                  <p className={`hidden text-xs sm:block ${index === step ? "font-medium" : "text-muted-foreground"}`}>
                    {index + 1}. {label}
                  </p>
                </div>
              ))}
            </div>
            {step === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Roadmap title</label>
                  <Input
                    value={wizardState.title}
                    onChange={(event) => applyAutoTemplate({ title: event.target.value })}
                    placeholder="OJT Learning Roadmap"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discipline</label>
                  <Select
                    value={wizardState.discipline}
                    onValueChange={(value) => applyAutoTemplate({ discipline: value as RoadmapDiscipline })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Electrical", "Mechanical", "Instrument", "Operator", "HSE"].map((discipline) => (
                        <SelectItem key={discipline} value={discipline}>
                          {discipline}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Group</label>
                  <Select
                    value={wizardState.group}
                    onValueChange={(value) => applyAutoTemplate({ group: value as RoadmapWizardState["group"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Group A</SelectItem>
                      <SelectItem value="B">Group B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Generation mode</label>
                  <Select
                    value={wizardState.mode}
                    onValueChange={(value) => applyAutoTemplate({ mode: value as RoadmapWizardState["mode"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select generation mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto from template registry</SelectItem>
                      <SelectItem value="manual">Manual editing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Trainee name</label>
                  <Input
                    value={traineeName}
                    readOnly
                    className="bg-muted/50 text-muted-foreground"
                    placeholder="Set your name in Personal Settings"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company / organization</label>
                  <Input
                    value={profile.company}
                    readOnly
                    className="bg-muted/50 text-muted-foreground"
                    placeholder="Set your company in Personal Settings"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Start date</label>
                  <Input
                    type="date"
                    value={wizardState.startDate}
                    onChange={(event) => applyAutoTemplate({ startDate: event.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Configure the six rotational trips that guide the roadmap.</p>
                {wizardState.trips.map((trip, index) => (
                  <div key={trip.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-medium">Trip {index + 1}</p>
                      <Badge variant="outline">{trip.name}</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Trip name</label>
                        <Input
                          value={trip.name}
                          onChange={(event) => updateTrip(index, "name", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={trip.location}
                          onChange={(event) => updateTrip(index, "location", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Focus</label>
                        <Input
                          value={trip.focus}
                          onChange={(event) => updateTrip(index, "focus", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={trip.description}
                          onChange={(event) => updateTrip(index, "description", event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Assign each of the 18 weeks to a trip and define the week title.</p>
                {wizardState.weeks.map((week, weekIndex) => (
                  <div key={`${week.weekNumber}-${weekIndex}`} className="rounded-lg border p-4">
                    <p className="mb-3 font-medium">Week {week.weekNumber}</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Week title</label>
                        <Input
                          value={week.title}
                          onChange={(event) => {
                            const weeks = [...wizardState.weeks]
                            weeks[weekIndex] = { ...weeks[weekIndex], title: event.target.value }
                            setWizardState((current) => ({ ...current, weeks }))
                          }}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Trip</label>
                        <Select
                          value={week.tripId}
                          onValueChange={(value) => updateWeek(weekIndex, "tripId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trip" />
                          </SelectTrigger>
                          <SelectContent>
                            {wizardState.trips.map((trip) => (
                              <SelectItem key={trip.id} value={trip.id}>
                                {trip.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Objectives and checklist</label>
                          <Button type="button" size="sm" variant="outline" onClick={() => addObjective(weekIndex)}>
                            <Plus className="mr-1 h-3.5 w-3.5" />
                            Add objective
                          </Button>
                        </div>
                        {week.objectives.map((objective, objectiveIndex) => (
                          <div key={objectiveIndex} className="space-y-3 rounded-md border bg-muted/20 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase text-muted-foreground">
                                Objective {objectiveIndex + 1}
                              </span>
                              {week.objectives.length > 1 && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeObjective(weekIndex, objectiveIndex)}
                                  aria-label={`Remove objective ${objectiveIndex + 1}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <Input
                              value={objective.title}
                              onChange={(event) => updateObjective(weekIndex, objectiveIndex, "title", event.target.value)}
                              placeholder="Objective title"
                            />
                            <Textarea
                              value={objective.description}
                              onChange={(event) =>
                                updateObjective(weekIndex, objectiveIndex, "description", event.target.value)
                              }
                              placeholder="Objective description"
                            />
                            <Textarea
                              value={objective.checklist.join("\n")}
                              onChange={(event) => updateObjectiveChecklist(weekIndex, objectiveIndex, event.target.value)}
                              placeholder={"One checklist item per line"}
                              aria-label={`Objective ${objectiveIndex + 1} checklist`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Reflection</label>
                        <Textarea
                          value={week.reflection}
                          onChange={(event) => {
                            const weeks = [...wizardState.weeks]
                            weeks[weekIndex] = { ...weeks[weekIndex], reflection: event.target.value }
                            setWizardState((current) => ({ ...current, weeks }))
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Review the generated roadmap before saving it.</p>
                <Card className="bg-muted/30">
                  <CardContent className="space-y-3 p-4">
                    <div>
                      <p className="text-sm font-semibold">{wizardState.title}</p>
                      <p className="text-sm text-muted-foreground">{traineeName} • {profile.company || "Company"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{wizardState.discipline}</Badge>
                      <Badge variant="outline">Group {wizardState.group}</Badge>
                      <Badge variant="outline">{wizardState.mode === "auto" ? "Auto generated" : "Manual"}</Badge>
                      <Badge variant="outline">{wizardState.weeks.length} weeks</Badge>
                      <Badge variant="outline">{wizardState.trips.length} trips</Badge>
                    </div>
                    <div className="space-y-2">
                      {wizardState.weeks.slice(0, 6).map((week) => (
                        <div key={week.weekNumber} className="rounded-md border bg-background p-2 text-sm">
                          <span className="font-medium">Week {week.weekNumber}</span> — {week.title}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between gap-2">
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep((current) => current - 1)}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step < 3 ? (
                <Button onClick={() => setStep((current) => current + 1)}>Next</Button>
              ) : (
                <Button onClick={handleWizardSubmit}>Save Roadmap</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
