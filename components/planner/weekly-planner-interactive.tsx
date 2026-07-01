"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CalendarDays,
  Clock3,
  Edit2,
  GripVertical,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  usePlannerStore,
  type ObjectiveInput,
  type PlannerPriority,
  type PlannerStatus,
  type WeekInput,
} from "@/lib/planner-store"
import { useJournalStore } from "@/lib/journal-store"
import { generateWeeklyPlansFromRoadmap } from "@/lib/roadmap-planner-integration.mjs"
import {
  useRoadmapStore,
  type RoadmapObjective,
  type RoadmapWeek,
} from "@/lib/roadmap-store"

type LinkedPlannerObjective = RoadmapObjective & {
  estimatedHours?: number
  roadmapId: string
  roadmapWeekId: string
}

type LinkedPlannerWeek = Omit<RoadmapWeek, "objectives"> & {
  linkedRoadmapId: string
  linkedWeekId: string
  objectives: LinkedPlannerObjective[]
}

const statuses: Array<{ value: PlannerStatus; label: string; color: string }> = [
  { value: "not-started", label: "Todo", color: "bg-slate-500" },
  { value: "in-progress", label: "In progress", color: "bg-blue-500" },
  { value: "completed", label: "Done", color: "bg-emerald-500" },
]

const priorityStyles: Record<PlannerPriority, string> = {
  high: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  low: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  follow_up: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
}

const priorityLabels: Record<PlannerPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  follow_up: "Follow Up",
}

const emptyObjective: ObjectiveInput = {
  title: "",
  description: "",
  checklist: ["Complete objective"],
  priority: "medium",
  status: "not-started",
  equipment: [],
  estimatedHours: 1,
  notes: "",
}

function objectiveToInput(objective: LinkedPlannerObjective): ObjectiveInput {
  return {
    title: objective.title,
    description: objective.description,
    checklist: objective.checklist.map((item) => item.text),
    priority: objective.priority,
    status: objective.status,
    equipment: objective.equipment,
    estimatedHours: objective.estimatedHours ?? 1,
    notes: objective.notes,
  }
}

function objectiveInputToRoadmap(
  input: ObjectiveInput,
  existing?: LinkedPlannerObjective
): Partial<RoadmapObjective> {
  return {
    title: input.title,
    description: input.description,
    priority: input.priority,
    status: input.status,
    checklist: input.checklist
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text, index) => {
        const previous = existing?.checklist[index]
        return {
          id: previous?.text === text ? previous.id : Math.random().toString(36).slice(2, 10),
          text,
          done:
            input.status === "completed"
              ? true
              : input.status === "not-started"
                ? false
                : previous?.text === text
                  ? previous.done
                  : false,
        }
      }),
    equipment: input.equipment,
    estimatedHours: Math.max(0, Number(input.estimatedHours) || 0),
    notes: input.notes,
  }
}

export function WeeklyPlannerInteractive() {
  const searchParams = useSearchParams()
  const roadmaps = useRoadmapStore((state) => state.roadmaps)
  const selectedRoadmapId = useRoadmapStore((state) => state.selectedRoadmapId)
  const updateRoadmapWeek = useRoadmapStore((state) => state.updateWeek)
  const createRoadmapObjective = useRoadmapStore((state) => state.createObjective)
  const updateRoadmapObjective = useRoadmapStore((state) => state.updateObjective)
  const deleteRoadmapObjective = useRoadmapStore((state) => state.deleteObjective)
  const toggleRoadmapChecklist = useRoadmapStore((state) => state.toggleChecklistItem)
  const moveRoadmapObjective = useRoadmapStore((state) => state.updateObjectiveStatus)
  const setJournalChecklistItemDone = useJournalStore((state) => state.setChecklistItemDone)
  const roadmap = roadmaps.find((item) => item.id === selectedRoadmapId) ?? roadmaps[0] ?? null
  const weeks = useMemo(
    () => (roadmap ? (generateWeeklyPlansFromRoadmap(roadmap) as LinkedPlannerWeek[]) : []),
    [roadmap]
  )
  const selectedWeekId = usePlannerStore((state) => state.selectedWeekId)
  const selectWeek = usePlannerStore((state) => state.selectWeek)

  const requestedWeekId = searchParams.get("week")
  const selectedWeek =
    weeks.find((week) => week.id === requestedWeekId) ??
    weeks.find((week) => week.id === selectedWeekId) ??
    weeks[0] ??
    null
  const [weekDialogOpen, setWeekDialogOpen] = useState(false)
  const [editingWeekId, setEditingWeekId] = useState<string | null>(null)
  const [weekForm, setWeekForm] = useState<WeekInput>({
    weekNumber: 1,
    title: "",
    reflection: "",
  })
  const [objectiveDialogOpen, setObjectiveDialogOpen] = useState(false)
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null)
  const [objectiveForm, setObjectiveForm] = useState<ObjectiveInput>(emptyObjective)
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<PlannerPriority | "all">("all")
  const [equipmentFilter, setEquipmentFilter] = useState("all")
  const [sort, setSort] = useState("manual")
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const equipmentOptions = useMemo(
    () =>
      Array.from(new Set(selectedWeek?.objectives.flatMap((objective) => objective.equipment) ?? [])).sort(),
    [selectedWeek]
  )

  const visibleObjectives = useMemo(() => {
    if (!selectedWeek) return []
    const query = search.trim().toLowerCase()
    const result = selectedWeek.objectives.filter(
      (objective) =>
        (priorityFilter === "all" || objective.priority === priorityFilter) &&
        (equipmentFilter === "all" || objective.equipment.includes(equipmentFilter)) &&
        (!query ||
          objective.title.toLowerCase().includes(query) ||
          objective.description.toLowerCase().includes(query) ||
          objective.notes.toLowerCase().includes(query) ||
          objective.equipment.some((item) => item.toLowerCase().includes(query)))
    )
    const priorityRank: Record<PlannerPriority, number> = { follow_up: 0, high: 1, medium: 2, low: 3 }
    if (sort === "priority") result.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    if (sort === "hours") result.sort((a, b) => (b.estimatedHours ?? 1) - (a.estimatedHours ?? 1))
    if (sort === "title") result.sort((a, b) => a.title.localeCompare(b.title))
    return result
  }, [equipmentFilter, priorityFilter, search, selectedWeek, sort])

  useEffect(() => {
    if (selectedWeek && selectedWeek.id !== selectedWeekId) selectWeek(selectedWeek.id)
  }, [selectWeek, selectedWeek, selectedWeekId])

  const openEditWeek = (week: LinkedPlannerWeek) => {
    setEditingWeekId(week.id)
    setWeekForm({ weekNumber: week.weekNumber, title: week.title, reflection: week.reflection })
    setWeekDialogOpen(true)
  }

  const saveWeek = () => {
    if (!weekForm.title.trim()) {
      toast.error("Week title is required")
      return
    }
    if (roadmap && editingWeekId) {
      updateRoadmapWeek(roadmap.id, editingWeekId, weekForm as Partial<RoadmapWeek>)
      toast.success("Week updated")
    }
    setWeekDialogOpen(false)
  }

  const openCreateObjective = (status: PlannerStatus = "not-started") => {
    setEditingObjectiveId(null)
    setObjectiveForm({ ...emptyObjective, checklist: [...emptyObjective.checklist], status })
    setObjectiveDialogOpen(true)
  }

  const openEditObjective = (objective: LinkedPlannerObjective) => {
    setEditingObjectiveId(objective.id)
    setObjectiveForm(objectiveToInput(objective))
    setObjectiveDialogOpen(true)
  }

  const saveObjective = () => {
    if (!roadmap || !selectedWeek || !objectiveForm.title.trim()) {
      toast.error("Objective title is required")
      return
    }
    const existingObjective = selectedWeek.objectives.find((objective) => objective.id === editingObjectiveId)
    const input = objectiveInputToRoadmap(objectiveForm, existingObjective)
    if (editingObjectiveId) {
      updateRoadmapObjective(roadmap.id, selectedWeek.id, editingObjectiveId, input)
      toast.success("Objective updated")
    } else {
      createRoadmapObjective(roadmap.id, selectedWeek.id, input)
      toast.success("Objective created")
    }
    setObjectiveDialogOpen(false)
  }

  const removeObjective = (objective: LinkedPlannerObjective) => {
    if (!roadmap || !selectedWeek || !window.confirm(`Delete "${objective.title}"?`)) return
    deleteRoadmapObjective(roadmap.id, selectedWeek.id, objective.id)
    toast.success("Objective deleted")
  }

  const handleDrop = (status: PlannerStatus, beforeId?: string) => {
    if (!roadmap || !selectedWeek || !draggedId) return
    const draggedObjective = selectedWeek.objectives.find((objective) => objective.id === draggedId)
    moveRoadmapObjective(roadmap.id, selectedWeek.id, draggedId, status, beforeId)
    if (draggedObjective?.source === "daily_journal" && draggedObjective.journalEntryId) {
      const journalChecklistItemId =
        draggedObjective.journalChecklistItemId || draggedObjective.checklist[0]?.id
      if (!journalChecklistItemId) {
        setDraggedId(null)
        return
      }
      setJournalChecklistItemDone(
        draggedObjective.journalEntryId,
        journalChecklistItemId,
        status === "completed"
      )
    }
    setDraggedId(null)
  }

  return (
    <div className="space-y-6">
      {weeks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <CalendarDays className="h-11 w-11 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No roadmap-linked weekly plans yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Create or select a Learning Roadmap to generate weekly goals automatically.
              </p>
            </div>
            <Button asChild>
              <Link href="/learning/roadmap">
              <Plus className="mr-2 h-4 w-4" />
              Open Roadmap
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : selectedWeek ? (
        <>
          <Card>
            <CardHeader className="gap-4">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{selectedWeek.title}</CardTitle>
                    <Badge variant="outline">Week {selectedWeek.weekNumber}</Badge>
                    <Badge variant="secondary">Linked to Roadmap</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Changes update the active Learning Roadmap and are saved to Supabase.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditWeek(selectedWeek)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit week
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/learning/roadmap">Open Roadmap</Link>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{selectedWeek.objectives.length} objectives</span>
                  <span className="font-medium">{selectedWeek.progress}% complete</span>
                </div>
                <Progress value={selectedWeek.progress} />
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Select week</p>
                  <p className="text-xs text-muted-foreground">Weekly goals are generated from the active roadmap.</p>
                </div>
                <Badge variant="outline">{weeks.length} weeks</Badge>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[...weeks]
                  .sort((a, b) => a.weekNumber - b.weekNumber)
                  .map((week) => {
                    const active = week.id === selectedWeek.id
                    return (
                      <Button
                        key={week.id}
                        type="button"
                        variant={active ? "default" : "outline"}
                        size="sm"
                        className="h-auto min-w-24 shrink-0 flex-col items-start gap-1 px-3 py-2"
                        onClick={() => {
                          selectWeek(week.id)
                          setEquipmentFilter("all")
                          setSearch("")
                        }}
                      >
                        <span className="text-xs font-medium">Week {week.weekNumber}</span>
                        <span className="max-w-20 truncate text-[11px] opacity-80">{week.progress}% complete</span>
                      </Button>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search objectives..."
              />
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3 lg:flex lg:justify-end">
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as PlannerPriority | "all")}>
                <SelectTrigger className="w-full min-w-0 text-xs sm:w-44 sm:text-sm" aria-label="Filter by priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="high">High priority</SelectItem>
                  <SelectItem value="medium">Medium priority</SelectItem>
                  <SelectItem value="low">Low priority</SelectItem>
                </SelectContent>
              </Select>
              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger className="w-full min-w-0 text-xs sm:w-52 sm:text-sm" aria-label="Filter by equipment"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All equipment</SelectItem>
                  {equipmentOptions.map((equipment) => (
                    <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full min-w-0 text-xs sm:w-44 sm:text-sm" aria-label="Sort objectives"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual order</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="hours">Estimated hours</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto pb-3">
            <div className="grid min-w-[900px] grid-cols-3 gap-4">
              {statuses.map((status) => {
                const objectives = visibleObjectives.filter((objective) => objective.status === status.value)
                return (
                  <section
                    key={status.value}
                    className="min-h-[360px] rounded-xl border bg-muted/25 p-3"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(status.value)}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${status.color}`} />
                        <h3 className="text-sm font-semibold">{status.label}</h3>
                        <Badge variant="secondary">{objectives.length}</Badge>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => openCreateObjective(status.value)} aria-label={`Add to ${status.label}`}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {objectives.map((objective) => (
                        <Card
                          key={objective.id}
                          draggable
                          onDragStart={() => setDraggedId(objective.id)}
                          onDragEnd={() => setDraggedId(null)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.stopPropagation()
                            handleDrop(status.value, objective.id)
                          }}
                          className="cursor-grab bg-card active:cursor-grabbing"
                        >
                          <CardContent className="space-y-3 p-4">
                            <div className="flex items-start gap-2">
                              <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium leading-snug">{objective.title}</p>
                                {objective.description && (
                                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{objective.description}</p>
                                )}
                              </div>
                              <div className="flex">
                                <Button size="icon" variant="ghost" onClick={() => openEditObjective(objective)} aria-label={`Edit ${objective.title}`}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => removeObjective(objective)} aria-label={`Delete ${objective.title}`}>
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={priorityStyles[objective.priority]}>
                                {priorityLabels[objective.priority]}
                              </Badge>
                              <Badge variant="outline">
                                <Clock3 className="mr-1 h-3 w-3" />
                                {objective.estimatedHours ?? 1}h
                              </Badge>
                              {objective.equipment.map((equipment) => (
                                <Badge key={equipment} variant="secondary">
                                  <Package className="mr-1 h-3 w-3" />
                                  {equipment}
                                </Badge>
                              ))}
                            </div>

                            {objective.checklist.length > 0 && (
                              <div className="space-y-2 border-t pt-3">
                                {objective.checklist.map((item) => (
                                  <label key={item.id} className="flex cursor-pointer items-start gap-2 text-xs">
                                    <Checkbox
                                      className="mt-0.5"
                                      checked={item.done}
                                      onCheckedChange={() => {
                                        if (!roadmap) return
                                        const nextDone = !item.done
                                        toggleRoadmapChecklist(roadmap.id, selectedWeek.id, objective.id, item.id)
                                        if (objective.source === "daily_journal" && objective.journalEntryId) {
                                          setJournalChecklistItemDone(
                                            objective.journalEntryId,
                                            objective.journalChecklistItemId || item.id,
                                            nextDone
                                          )
                                        }
                                      }}
                                    />
                                    <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.text}</span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {objective.notes && (
                              <p className="rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
                                {objective.notes}
                              </p>
                            )}

                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Completion</span>
                                <span>{objective.progress}%</span>
                              </div>
                              <Progress value={objective.progress} className="h-1.5" />
                            </div>

                          </CardContent>
                        </Card>
                      ))}
                      {objectives.length === 0 && (
                        <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
                          No matching objectives
                        </div>
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly reflection</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={selectedWeek.reflection}
                onChange={(event) =>
                  roadmap &&
                  updateRoadmapWeek(roadmap.id, selectedWeek.id, { reflection: event.target.value })
                }
                placeholder="Capture outcomes, lessons learned, and next steps..."
                className="min-h-28"
              />
            </CardContent>
          </Card>
        </>
      ) : null}

      <Dialog open={weekDialogOpen} onOpenChange={setWeekDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingWeekId ? "Edit Week" : "Create Week"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-[120px_1fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium">Week number</label>
              <Input
                type="number"
                min={1}
                value={weekForm.weekNumber}
                onChange={(event) => setWeekForm((current) => ({ ...current, weekNumber: Number(event.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={weekForm.title}
                onChange={(event) => setWeekForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Foundation and safety"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Reflection</label>
              <Textarea
                value={weekForm.reflection}
                onChange={(event) => setWeekForm((current) => ({ ...current, reflection: event.target.value }))}
                placeholder="Optional starting reflection"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWeekDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveWeek}>{editingWeekId ? "Save Changes" : "Create Week"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={objectiveDialogOpen} onOpenChange={setObjectiveDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingObjectiveId ? "Edit Objective" : "Create Objective"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Objective</label>
              <Input
                value={objectiveForm.title}
                onChange={(event) => setObjectiveForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Inspect the protection relay"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={objectiveForm.description}
                onChange={(event) => setObjectiveForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Expected outcome and scope"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={objectiveForm.priority}
                onValueChange={(value) => setObjectiveForm((current) => ({ ...current, priority: value as PlannerPriority }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={objectiveForm.status}
                onValueChange={(value) => setObjectiveForm((current) => ({ ...current, status: value as PlannerStatus }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Equipment</label>
              <Input
                value={objectiveForm.equipment.join(", ")}
                onChange={(event) =>
                  setObjectiveForm((current) => ({
                    ...current,
                    equipment: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                  }))
                }
                placeholder="Relay, multimeter"
              />
              <p className="text-xs text-muted-foreground">Separate items with commas.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated hours</label>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={objectiveForm.estimatedHours}
                onChange={(event) =>
                  setObjectiveForm((current) => ({ ...current, estimatedHours: Number(event.target.value) }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Checklist</label>
              <Textarea
                value={objectiveForm.checklist.join("\n")}
                onChange={(event) =>
                  setObjectiveForm((current) => ({
                    ...current,
                    checklist: event.target.value.split("\n"),
                  }))
                }
                placeholder="One checklist item per line"
                className="min-h-28"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={objectiveForm.notes}
                onChange={(event) => setObjectiveForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="References, constraints, or follow-up notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setObjectiveDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveObjective}>{editingObjectiveId ? "Save Changes" : "Create Objective"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
