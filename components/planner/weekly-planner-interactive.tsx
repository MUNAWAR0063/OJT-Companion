"use client"

import { useMemo, useState } from "react"
import {
  CalendarDays,
  CheckCircle2,
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
  type PlannerObjective,
  type PlannerPriority,
  type PlannerStatus,
  type PlannerWeek,
  type WeekInput,
} from "@/lib/planner-store"

const statuses: Array<{ value: PlannerStatus; label: string; color: string }> = [
  { value: "not-started", label: "Todo", color: "bg-slate-500" },
  { value: "in-progress", label: "In progress", color: "bg-blue-500" },
  { value: "completed", label: "Done", color: "bg-emerald-500" },
]

const priorityStyles: Record<PlannerPriority, string> = {
  high: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  low: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
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

function objectiveToInput(objective: PlannerObjective): ObjectiveInput {
  return {
    title: objective.title,
    description: objective.description,
    checklist: objective.checklist.map((item) => item.text),
    priority: objective.priority,
    status: objective.status,
    equipment: objective.equipment,
    estimatedHours: objective.estimatedHours,
    notes: objective.notes,
  }
}

export function WeeklyPlannerInteractive() {
  const weeks = usePlannerStore((state) => state.weeks)
  const selectedWeekId = usePlannerStore((state) => state.selectedWeekId)
  const selectWeek = usePlannerStore((state) => state.selectWeek)
  const createWeek = usePlannerStore((state) => state.createWeek)
  const updateWeek = usePlannerStore((state) => state.updateWeek)
  const deleteWeek = usePlannerStore((state) => state.deleteWeek)
  const createObjective = usePlannerStore((state) => state.createObjective)
  const updateObjective = usePlannerStore((state) => state.updateObjective)
  const deleteObjective = usePlannerStore((state) => state.deleteObjective)
  const toggleChecklist = usePlannerStore((state) => state.toggleChecklist)
  const moveObjective = usePlannerStore((state) => state.moveObjective)

  const selectedWeek = weeks.find((week) => week.id === selectedWeekId) ?? weeks[0] ?? null
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
    const priorityRank: Record<PlannerPriority, number> = { high: 0, medium: 1, low: 2 }
    if (sort === "priority") result.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    if (sort === "hours") result.sort((a, b) => b.estimatedHours - a.estimatedHours)
    if (sort === "title") result.sort((a, b) => a.title.localeCompare(b.title))
    return result
  }, [equipmentFilter, priorityFilter, search, selectedWeek, sort])

  const openCreateWeek = () => {
    setEditingWeekId(null)
    setWeekForm({ weekNumber: Math.max(0, ...weeks.map((week) => week.weekNumber)) + 1, title: "", reflection: "" })
    setWeekDialogOpen(true)
  }

  const openEditWeek = (week: PlannerWeek) => {
    setEditingWeekId(week.id)
    setWeekForm({ weekNumber: week.weekNumber, title: week.title, reflection: week.reflection })
    setWeekDialogOpen(true)
  }

  const saveWeek = () => {
    if (!weekForm.title.trim()) {
      toast.error("Week title is required")
      return
    }
    if (editingWeekId) {
      updateWeek(editingWeekId, weekForm)
      toast.success("Week updated")
    } else {
      createWeek(weekForm)
      toast.success("Week created")
    }
    setWeekDialogOpen(false)
  }

  const removeWeek = (week: PlannerWeek) => {
    if (!window.confirm(`Delete Week ${week.weekNumber} and all of its objectives?`)) return
    deleteWeek(week.id)
    toast.success("Week deleted")
  }

  const openCreateObjective = (status: PlannerStatus = "not-started") => {
    setEditingObjectiveId(null)
    setObjectiveForm({ ...emptyObjective, checklist: [...emptyObjective.checklist], status })
    setObjectiveDialogOpen(true)
  }

  const openEditObjective = (objective: PlannerObjective) => {
    setEditingObjectiveId(objective.id)
    setObjectiveForm(objectiveToInput(objective))
    setObjectiveDialogOpen(true)
  }

  const saveObjective = () => {
    if (!selectedWeek || !objectiveForm.title.trim()) {
      toast.error("Objective title is required")
      return
    }
    if (editingObjectiveId) {
      updateObjective(selectedWeek.id, editingObjectiveId, objectiveForm)
      toast.success("Objective updated")
    } else {
      createObjective(selectedWeek.id, objectiveForm)
      toast.success("Objective created")
    }
    setObjectiveDialogOpen(false)
  }

  const removeObjective = (objective: PlannerObjective) => {
    if (!selectedWeek || !window.confirm(`Delete "${objective.title}"?`)) return
    deleteObjective(selectedWeek.id, objective.id)
    toast.success("Objective deleted")
  }

  const handleDrop = (status: PlannerStatus, beforeId?: string) => {
    if (!selectedWeek || !draggedId) return
    moveObjective(selectedWeek.id, draggedId, status, beforeId)
    setDraggedId(null)
  }

  return (
    <div className="space-y-6">
      {weeks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <CalendarDays className="h-11 w-11 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No weekly plans yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Create a week, add objectives, and move work across the board as your OJT progresses.
              </p>
            </div>
            <Button onClick={openCreateWeek}>
              <Plus className="mr-2 h-4 w-4" />
              Create Week
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
                  </div>
                  <p className="text-sm text-muted-foreground">Changes are saved automatically on this device.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditWeek(selectedWeek)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit week
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => removeWeek(selectedWeek)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Button size="sm" onClick={openCreateWeek}>
                    <Plus className="mr-2 h-4 w-4" />
                    New week
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

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1.3fr_0.8fr_0.8fr]">
            <Select
              value={selectedWeek.id}
              onValueChange={(value) => {
                selectWeek(value)
                setEquipmentFilter("all")
                setSearch("")
              }}
            >
              <SelectTrigger aria-label="Select week">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...weeks]
                  .sort((a, b) => a.weekNumber - b.weekNumber)
                  .map((week) => (
                    <SelectItem key={week.id} value={week.id}>
                      Week {week.weekNumber}: {week.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search objectives..."
              />
            </div>
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as PlannerPriority | "all")}>
              <SelectTrigger aria-label="Filter by priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="high">High priority</SelectItem>
                <SelectItem value="medium">Medium priority</SelectItem>
                <SelectItem value="low">Low priority</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger aria-label="Sort objectives"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual order</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="hours">Estimated hours</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {equipmentOptions.length > 0 && (
            <div className="max-w-xs">
              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger aria-label="Filter by equipment"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All equipment</SelectItem>
                  {equipmentOptions.map((equipment) => (
                    <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                              <Badge variant="outline" className={priorityStyles[objective.priority]}>{objective.priority}</Badge>
                              <Badge variant="outline">
                                <Clock3 className="mr-1 h-3 w-3" />
                                {objective.estimatedHours}h
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
                                      onCheckedChange={() => toggleChecklist(selectedWeek.id, objective.id, item.id)}
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

                            <Select
                              value={objective.status}
                              onValueChange={(value) => moveObjective(selectedWeek.id, objective.id, value as PlannerStatus)}
                            >
                              <SelectTrigger className="h-8 text-xs" aria-label={`Change status for ${objective.title}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                onChange={(event) => updateWeek(selectedWeek.id, { reflection: event.target.value })}
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
