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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Map, Pencil, Plus, Sparkles, Trash2 } from "lucide-react"
import {
  getRoadmapProgress,
  useRoadmapStore,
  type RoadmapDiscipline,
  type RoadmapItem,
  type RoadmapTrip,
  type RoadmapWeek,
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
    objectives: [],
    reflection: "",
  }))

const AUTOMATIC_ROADMAP_START_DATE = "2026-07-09"

const buildManualWizardState = (profile: UserProfile): RoadmapWizardState => {
  const trips = createTripDefaults()
  return {
    title: "OJT Learning Roadmap",
    traineeName: getProfileDisplayName(profile),
    companyName: profile.company,
    discipline: normalizeDiscipline(profile.discipline) as RoadmapDiscipline,
    group: "A",
    mode: "manual",
    startDate: new Date().toISOString().slice(0, 10),
    trips,
    weeks: createWeekDefaults(trips),
  }
}

const buildWizardState = (profile: UserProfile, roadmap?: RoadmapItem): RoadmapWizardState => {
  if (!roadmap) {
    return buildManualWizardState(profile)
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
            code: objective.code,
            title: objective.title,
            description: objective.description,
            priority: objective.priority,
            category: objective.category,
            discipline: objective.discipline,
            difficulty: objective.difficulty,
            siteContext: objective.siteContext,
            siteContrast: objective.siteContrast,
            variationSeed: objective.variationSeed,
            subjects: objective.subjects,
            activities: objective.activities,
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

function getTripWeekSummary(roadmap: RoadmapItem, trip: RoadmapTrip) {
  const weeks = roadmap.weeks.filter((week) => week.tripId === trip.id)
  const sortedWeeks = [...weeks].sort((left, right) => left.weekNumber - right.weekNumber)
  const progress = sortedWeeks.length
    ? Math.round(sortedWeeks.reduce((total, week) => total + week.progress, 0) / sortedWeeks.length)
    : 0

  return {
    weekRange: sortedWeeks.length
      ? `Week ${sortedWeeks[0].weekNumber}-${sortedWeeks[sortedWeeks.length - 1].weekNumber}`
      : "No weeks assigned",
    progress,
  }
}

function stripSiteSuffix(title: string, location: string) {
  const suffix = ` - ${location}`
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title
}

function getWeekFocusSummary(week: RoadmapWeek) {
  const focusTitles = week.objectives
    .map((objective) => stripSiteSuffix(objective.title, week.location))
    .filter(Boolean)

  if (!focusTitles.length) return "Weekly planning focus"
  return focusTitles.join(" + ")
}

function getWeekCodes(week: RoadmapWeek) {
  return week.objectives
    .map((objective) => objective.code)
    .filter((code): code is string => Boolean(code))
}

export function RoadmapContentNew() {
  const profile = useUserProfileStore((state) => state.profile)
  const traineeName = getProfileDisplayName(profile)
  const profileDiscipline = normalizeDiscipline(profile.discipline) as RoadmapDiscipline
  const roadmaps = useRoadmapStore((state) => state.roadmaps)
  const selectedRoadmapId = useRoadmapStore((state) => state.selectedRoadmapId)
  const createRoadmap = useRoadmapStore((state) => state.createRoadmap)
  const updateRoadmap = useRoadmapStore((state) => state.updateRoadmap)
  const deleteRoadmap = useRoadmapStore((state) => state.deleteRoadmap)
  const setSelectedRoadmap = useRoadmapStore((state) => state.setSelectedRoadmap)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTripIndex, setActiveTripIndex] = useState(0)
  const [wizardView, setWizardView] = useState<"choice" | "form">("choice")
  const [step, setStep] = useState(0)
  const [wizardState, setWizardState] = useState<RoadmapWizardState>(() => buildWizardState(profile))

  const selectedRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === selectedRoadmapId) ?? roadmaps[0] ?? null,
    [roadmaps, selectedRoadmapId]
  )

  const progressValue = getRoadmapProgress(selectedRoadmap)
  const clampedTripIndex = selectedRoadmap
    ? Math.min(activeTripIndex, Math.max(selectedRoadmap.trips.length - 1, 0))
    : 0
  const activeTrip = selectedRoadmap?.trips[clampedTripIndex] ?? null
  const activeTripWeeks = useMemo(
    () =>
      selectedRoadmap && activeTrip
        ? selectedRoadmap.weeks
            .filter((week) => week.tripId === activeTrip.id)
            .sort((left, right) => left.weekNumber - right.weekNumber)
        : [],
    [activeTrip, selectedRoadmap]
  )

  const resetWizard = (roadmap?: RoadmapItem) => {
    setWizardState(buildWizardState(profile, roadmap))
    setStep(0)
    setEditingId(roadmap?.id ?? null)
    setWizardView(roadmap ? "form" : "choice")
  }

  const applyAutoTemplate = (
    updates: Partial<Pick<RoadmapWizardState, "discipline" | "group" | "title" | "startDate">> = {}
  ) => {
    setWizardState((current) => {
      return { ...current, ...updates }
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

  const handleAutomaticCreate = () => {
    createRoadmap(
      buildGeneratedRoadmap({
        discipline: profileDiscipline,
        group: "A",
        title: "OJT Learning Roadmap",
        traineeName,
        companyName: profile.company,
        startDate: AUTOMATIC_ROADMAP_START_DATE,
      }) as RoadmapWizardState
    )
    setActiveTripIndex(0)
    setIsWizardOpen(false)
    setEditingId(null)
  }

  const handleManualStart = () => {
    setWizardState(buildManualWizardState(profile))
    setEditingId(null)
    setStep(0)
    setWizardView("form")
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

      <div className="grid gap-4">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg">Trip focus</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Roadmap shows one 3-week trip at a time. Tasks and checklists are handled in Weekly Planner.
                </p>
              </div>
              <Button asChild className="gap-2">
                <Link href="/calendar">
                  Go to Weekly Execution
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-[repeat(6,minmax(92px,1fr))] gap-2 overflow-x-auto pb-2">
              {selectedRoadmap.trips.map((trip, index) => {
                const summary = getTripWeekSummary(selectedRoadmap, trip)
                return (
                  <button
                    key={trip.id}
                    type="button"
                    className={`rounded-lg border p-3 text-left transition hover:bg-muted/60 ${
                      index === clampedTripIndex ? "border-primary bg-primary text-primary-foreground" : "bg-muted/25"
                    }`}
                    onClick={() => {
                      setActiveTripIndex(index)
                    }}
                  >
                    <span className="block whitespace-nowrap text-sm font-medium">Trip {trip.tripNumber}</span>
                    <span className="mt-1 block whitespace-nowrap text-xs opacity-80">{summary.progress}% complete</span>
                  </button>
                )
              })}
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/25 p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{activeTrip ? `Trip ${activeTrip.tripNumber}` : "Trip"}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeTrip
                      ? `${activeTrip.location} - ${getTripWeekSummary(selectedRoadmap, activeTrip).weekRange}`
                      : "No trip selected"}
                  </p>
                </div>
                {activeTrip && <Badge variant="secondary">{activeTrip.location}</Badge>}
              </div>
              {activeTrip && <p className="text-sm">{activeTrip.focus}</p>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {activeTripWeeks.map((week) => {
                const codes = getWeekCodes(week)
                return (
                  <div key={week.id} className="flex min-h-56 flex-col rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">Week {week.weekNumber}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {week.phase ? `${week.phase} phase` : week.tripName}
                        </p>
                      </div>
                      <Badge variant="outline">{week.progress}%</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {codes.length ? (
                        codes.map((code) => (
                          <Badge key={code} variant="secondary" className="font-mono">
                            {code}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">Summary</Badge>
                      )}
                    </div>
                    <div className="mt-4 flex-1 space-y-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">Focus</p>
                      <p className="text-sm leading-relaxed">{getWeekFocusSummary(week)}</p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Week progress</span>
                        <span>{week.progress}%</span>
                      </div>
                      <Progress value={week.progress} className="h-1.5" />
                    </div>
                    <Button asChild variant="outline" className="mt-4 w-full gap-2">
                      <Link href={`/calendar?week=${week.id}`}>
                        Open Week {week.weekNumber}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )
              })}
              {!activeTripWeeks.length && (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-3">
                  No weeks assigned to this trip.
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                className="min-w-0 gap-1 px-3 text-xs sm:gap-2 sm:px-4 sm:text-sm"
                disabled={clampedTripIndex === 0}
                onClick={() => {
                  setActiveTripIndex((current) => Math.max(current - 1, 0))
                }}
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Previous Trip
              </Button>
              <div className="shrink-0 px-1 text-center text-xs text-muted-foreground sm:text-sm">
                {activeTrip ? `Trip ${activeTrip.tripNumber} of ${selectedRoadmap.trips.length}` : "No trip selected"}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="min-w-0 gap-1 px-3 text-xs sm:gap-2 sm:px-4 sm:text-sm"
                disabled={!selectedRoadmap || clampedTripIndex >= selectedRoadmap.trips.length - 1}
                onClick={() => {
                  setActiveTripIndex((current) =>
                    selectedRoadmap ? Math.min(current + 1, selectedRoadmap.trips.length - 1) : current
                  )
                }}
              >
                Next Trip
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Planning summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Discipline</span>
                <Badge variant="outline">{selectedRoadmap.discipline}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Group</span>
                <Badge variant="outline">Group {selectedRoadmap.group}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Current trip</span>
                <span className="font-medium">{activeTrip ? `Trip ${activeTrip.tripNumber}` : "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Weeks shown</span>
                <span className="font-medium">{activeTripWeeks.length}</span>
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

          {wizardView === "choice" && !editingId ? (
            <div className="grid gap-4 py-2 md:grid-cols-2">
              <button
                type="button"
                onClick={handleAutomaticCreate}
                className="rounded-lg border p-5 text-left transition hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-primary/10 p-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div className="space-y-2">
                    <p className="font-semibold">Generate automatically</p>
                    <p className="text-sm text-muted-foreground">
                      Create the default Excel-based roadmap immediately using the template engine.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="secondary">{profileDiscipline}</Badge>
                      <Badge variant="secondary">Start: 09 Jul 2026</Badge>
                      <Badge variant="outline">Auto template</Badge>
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleManualStart}
                className="rounded-lg border p-5 text-left transition hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-muted p-2 text-muted-foreground">
                    <Pencil className="h-5 w-5" />
                  </span>
                  <div className="space-y-2">
                    <p className="font-semibold">Manual editing</p>
                    <p className="text-sm text-muted-foreground">
                      Open the roadmap wizard and manually configure OJT information, trips, and weeks.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="secondary">Custom setup</Badge>
                      <Badge variant="outline">Editable weeks</Badge>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ) : (
          <>
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
                      <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground md:col-span-2">
                        Tasks, checklists, and weekly reflection are managed in Weekly Planner after the roadmap is saved.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Review the roadmap before saving it.</p>
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
          </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
