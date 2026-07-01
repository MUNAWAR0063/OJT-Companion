"use client"

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  Download,
  Edit2,
  FileText,
  List,
  NotebookPen,
  Paperclip,
  Plus,
  Search,
  Trash2,
  Upload,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarWidget } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEquipmentStore } from "@/lib/equipment-store"
import {
  useJournalStore,
  type JournalEntry,
  type JournalEntryInput,
} from "@/lib/journal-store"
import {
  createFollowUpAction,
  linkFollowUpToWeeklyPlanner,
  resolveWeekFromJournalDate,
} from "@/lib/follow-up-integration.mjs"
import { useRoadmapStore } from "@/lib/roadmap-store"
import type { RoadmapObjective } from "@/lib/roadmap-store"

const todayKey = () => {
  const today = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
}

const emptyForm: JournalEntryInput = {
  title: "",
  date: todayKey(),
  dailyActivities: "",
  lessonsLearned: "",
  problems: "",
  questions: "",
  reflection: "",
  equipment: [],
}

const journalSections: Array<{
  key: "dailyActivities" | "lessonsLearned" | "problems" | "questions" | "reflection"
  title: string
  placeholder: string
}> = [
  { key: "dailyActivities", title: "Daily Activities", placeholder: "What work, training, inspections, or observations did you complete?" },
  { key: "lessonsLearned", title: "Lessons Learned", placeholder: "What technical or professional lessons did you learn?" },
  { key: "problems", title: "Problems", placeholder: "Record issues, failures, constraints, and how they were handled." },
  { key: "questions", title: "Questions", placeholder: "Capture questions to discuss with your mentor or investigate later." },
  { key: "reflection", title: "Reflection", placeholder: "Reflect on the day, your progress, and the next steps." },
]

function entryToInput(entry: JournalEntry): JournalEntryInput {
  return {
    title: entry.title,
    date: entry.date,
    dailyActivities: entry.dailyActivities,
    lessonsLearned: entry.lessonsLearned,
    problems: entry.problems,
    questions: entry.questions,
    reflection: entry.reflection,
    equipment: entry.equipment,
  }
}

function dateFromKey(value: string) {
  return new Date(`${value}T00:00:00`)
}

function keyFromDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  return `${Math.round(size / 1024)} KB`
}

export function FieldNotesInteractive() {
  const entries = useJournalStore((state) => state.entries)
  const selectedEntryId = useJournalStore((state) => state.selectedEntryId)
  const createEntry = useJournalStore((state) => state.createEntry)
  const updateEntry = useJournalStore((state) => state.updateEntry)
  const deleteEntry = useJournalStore((state) => state.deleteEntry)
  const selectEntry = useJournalStore((state) => state.selectEntry)
  const addChecklistItem = useJournalStore((state) => state.addChecklistItem)
  const toggleChecklistItem = useJournalStore((state) => state.toggleChecklistItem)
  const setChecklistItemDone = useJournalStore((state) => state.setChecklistItemDone)
  const deleteChecklistItem = useJournalStore((state) => state.deleteChecklistItem)
  const addAttachment = useJournalStore((state) => state.addAttachment)
  const deleteAttachment = useJournalStore((state) => state.deleteAttachment)
  const equipment = useEquipmentStore((state) => state.equipment)
  const roadmaps = useRoadmapStore((state) => state.roadmaps)
  const selectedRoadmapId = useRoadmapStore((state) => state.selectedRoadmapId)
  const createRoadmapObjective = useRoadmapStore((state) => state.createObjective)
  const deleteRoadmapObjective = useRoadmapStore((state) => state.deleteObjective)
  const updateRoadmapObjectiveStatus = useRoadmapStore((state) => state.updateObjectiveStatus)

  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId) ?? null
  const selectedRoadmap = roadmaps.find((roadmap) => roadmap.id === selectedRoadmapId) ?? roadmaps[0] ?? null
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<JournalEntryInput>(emptyForm)
  const [draft, setDraft] = useState<JournalEntryInput>(() =>
    selectedEntry ? entryToInput(selectedEntry) : emptyForm
  )
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving...">("Saved")
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"list" | "calendar">("list")
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())
  const [checklistInput, setChecklistInput] = useState("")
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSave = useRef<{ id: string; input: JournalEntryInput } | null>(null)

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (pendingSave.current) {
        useJournalStore.getState().updateEntry(pendingSave.current.id, pendingSave.current.input)
      }
    },
    []
  )

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase()
    return [...entries]
      .filter((entry) => {
        const equipmentNames = entry.equipment
          .map((id) => equipment.find((item) => item.id === id)?.name ?? "")
          .join(" ")
        return (
          !query ||
          [
            entry.title,
            entry.dailyActivities,
            entry.lessonsLearned,
            entry.problems,
            entry.questions,
            entry.reflection,
            equipmentNames,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        )
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [entries, equipment, search])

  const calendarEntries = useMemo(
    () => entries.filter((entry) => entry.date === keyFromDate(calendarDate)),
    [calendarDate, entries]
  )

  const flushDraft = () => {
    if (!selectedEntry || !pendingSave.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    updateEntry(selectedEntry.id, pendingSave.current.input)
    pendingSave.current = null
    setSaveStatus("Saved")
  }

  const openEntry = (entry: JournalEntry) => {
    flushDraft()
    setDraft(entryToInput(entry))
    setSaveStatus("Saved")
    selectEntry(entry.id)
  }

  const changeDraft = (
    field: "dailyActivities" | "lessonsLearned" | "problems" | "questions" | "reflection",
    value: string
  ) => {
    if (!selectedEntry) return
    const next = { ...draft, [field]: value }
    setDraft(next)
    setSaveStatus("Saving...")
    pendingSave.current = { id: selectedEntry.id, input: next }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateEntry(selectedEntry.id, next)
      pendingSave.current = null
      setSaveStatus("Saved")
    }, 500)
  }

  const backToJournal = () => {
    flushDraft()
    selectEntry(null)
  }

  const openCreate = (date = keyFromDate(calendarDate)) => {
    setEditingId(null)
    setForm({ ...emptyForm, date, equipment: [] })
    setDialogOpen(true)
  }

  const openEdit = (entry: JournalEntry) => {
    flushDraft()
    setEditingId(entry.id)
    setForm(entryToInput(entry))
    setDialogOpen(true)
  }

  const saveEntry = () => {
    if (!form.title.trim() || !form.date) {
      toast.error("Title and date are required")
      return
    }
    if (editingId) {
      updateEntry(editingId, form)
      setDraft(form)
      toast.success("Journal entry updated")
    } else {
      const entry = createEntry(form)
      setDraft(entryToInput(entry))
      toast.success("Journal entry created")
    }
    setDialogOpen(false)
  }

  const removeEntry = (entry: JournalEntry) => {
    if (!window.confirm(`Delete "${entry.title}" and its attachments?`)) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    pendingSave.current = null
    deleteEntry(entry.id)
    toast.success("Journal entry deleted")
  }

  const toggleEquipment = (id: string) => {
    setForm((current) => ({
      ...current,
      equipment: current.equipment.includes(id)
        ? current.equipment.filter((equipmentId) => equipmentId !== id)
        : [...current.equipment, id],
    }))
  }

  const addChecklist = () => {
    if (!selectedEntry || !checklistInput.trim()) return
    const dueWeek = resolveWeekFromJournalDate(selectedRoadmap, selectedEntry.date)
    const checklistId = Math.random().toString(36).slice(2, 10)
    const weeklyObjectiveId = Math.random().toString(36).slice(2, 10)
    const action = createFollowUpAction({
      id: checklistId,
      journalEntryId: selectedEntry.id,
      title: checklistInput,
      dueWeekId: dueWeek?.id,
      weeklyObjectiveId,
    })
    addChecklistItem(selectedEntry.id, checklistInput, {
      id: action.id,
      journalEntryId: action.journalEntryId,
      weeklyObjectiveId: action.weeklyObjectiveId,
      dueWeekId: action.dueWeekId,
      priority: "follow_up",
      status: action.status as "not-started" | "completed",
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
    })
    if (selectedRoadmap && dueWeek) {
      createRoadmapObjective(
        selectedRoadmap.id,
        dueWeek.id,
        linkFollowUpToWeeklyPlanner({
          action,
          journalEntryTitle: selectedEntry.title,
          journalDate: selectedEntry.date,
        }) as Partial<RoadmapObjective>
      )
    }
    setChecklistInput("")
  }

  const toggleFollowUp = (itemId: string) => {
    if (!selectedEntry) return
    const item = selectedEntry.checklist.find((check) => check.id === itemId)
    if (!item) return
    const nextDone = !item.done
    setChecklistItemDone(selectedEntry.id, itemId, nextDone)
    if (selectedRoadmap && item.dueWeekId && item.weeklyObjectiveId) {
      updateRoadmapObjectiveStatus(
        selectedRoadmap.id,
        item.dueWeekId,
        item.weeklyObjectiveId,
        nextDone ? "completed" : "not-started"
      )
    }
  }

  const deleteFollowUp = (itemId: string) => {
    if (!selectedEntry) return
    const item = selectedEntry.checklist.find((check) => check.id === itemId)
    if (selectedRoadmap && item?.dueWeekId && item.weeklyObjectiveId) {
      deleteRoadmapObjective(selectedRoadmap.id, item.dueWeekId, item.weeklyObjectiveId)
    }
    deleteChecklistItem(selectedEntry.id, itemId)
  }

  const handleFiles = (
    event: ChangeEvent<HTMLInputElement>,
    kind: "attachments" | "photos"
  ) => {
    if (!selectedEntry) return
    const files = Array.from(event.target.files ?? [])
    let queuedBytes = entries.reduce(
      (total, entry) =>
        total +
        entry.attachments.reduce((sum, attachment) => sum + attachment.size, 0) +
        entry.photos.reduce((sum, photo) => sum + photo.size, 0),
      0
    )
    files.forEach((file) => {
      if (file.size > 1024 * 1024) {
        toast.error(`${file.name} exceeds the 1 MB local attachment limit`)
        return
      }
      if (queuedBytes + file.size > 3 * 1024 * 1024) {
        toast.error("The 3 MB journal attachment budget has been reached")
        return
      }
      queuedBytes += file.size
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result !== "string") return
        addAttachment(selectedEntry.id, kind, {
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          dataUrl: reader.result,
        })
        toast.success(`${file.name} attached`)
      }
      reader.onerror = () => toast.error(`Could not read ${file.name}`)
      reader.readAsDataURL(file)
    })
    event.target.value = ""
  }

  return (
    <div className="space-y-6">
      {selectedEntry ? (
        <>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="space-y-3">
              <Button variant="ghost" className="-ml-3" onClick={backToJournal}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Daily Journal
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold">{selectedEntry.title}</h2>
                  <Badge variant="outline"><CalendarDays className="mr-1 h-3.5 w-3.5" />{selectedEntry.date}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Updated {new Date(selectedEntry.updatedAt).toLocaleString()} · {saveStatus}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openEdit(selectedEntry)}>
                <Edit2 className="mr-2 h-4 w-4" />Edit details
              </Button>
              <Button variant="outline" onClick={() => removeEntry(selectedEntry)}>
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />Delete
              </Button>
            </div>
          </div>

          {selectedEntry.equipment.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedEntry.equipment.map((id) => {
                const item = equipment.find((equipmentItem) => equipmentItem.id === id)
                return item ? <Badge key={id} variant="secondary"><Wrench className="mr-1 h-3 w-3" />{item.name}</Badge> : null
              })}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {journalSections.map((section) => (
              <Card key={section.key} className={section.key === "reflection" ? "lg:col-span-2" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={draft[section.key]}
                    onChange={(event) => changeDraft(section.key, event.target.value)}
                    placeholder={section.placeholder}
                    className="min-h-40"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CheckCircle2 className="h-4 w-4" />Checklist</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={checklistInput}
                    onChange={(event) => setChecklistInput(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") addChecklist() }}
                    placeholder="Add a follow-up action"
                  />
                  <Button size="icon" onClick={addChecklist} aria-label="Add checklist item"><Plus className="h-4 w-4" /></Button>
                </div>
                {selectedEntry.checklist.length ? (
                  <div className="divide-y rounded-md border">
                    {selectedEntry.checklist.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3">
                        <Checkbox className="mt-0.5" checked={item.done} onCheckedChange={() => toggleFollowUp(item.id)} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-sm ${item.done ? "text-muted-foreground line-through" : ""}`}>{item.text}</span>
                            {item.priority === "follow_up" && (
                              <Badge variant="outline" className="border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300">
                                Follow Up
                              </Badge>
                            )}
                          </div>
                        </div>
                        <button onClick={() => deleteFollowUp(item.id)} aria-label={`Delete ${item.text}`}><Trash2 className="h-4 w-4 text-destructive" /></button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No checklist items.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2"><Paperclip className="h-4 w-4" />Attachments</span>
                  <Button asChild size="sm" variant="outline">
                    <label className="cursor-pointer"><Upload className="mr-2 h-4 w-4" />Add files<input type="file" multiple className="sr-only" onChange={(event) => handleFiles(event, "attachments")} /></label>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedEntry.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-3 rounded-md border p-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{attachment.name}</p><p className="text-xs text-muted-foreground">{formatBytes(attachment.size)}</p></div>
                    <a href={attachment.dataUrl} download={attachment.name} aria-label={`Download ${attachment.name}`}><Download className="h-4 w-4" /></a>
                    <button onClick={() => deleteAttachment(selectedEntry.id, "attachments", attachment.id)} aria-label={`Delete ${attachment.name}`}><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                ))}
                {!selectedEntry.attachments.length && <p className="text-sm text-muted-foreground">No files attached.</p>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2"><Camera className="h-4 w-4" />Photos</span>
                <Button asChild size="sm" variant="outline">
                  <label className="cursor-pointer"><Upload className="mr-2 h-4 w-4" />Add photos<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => handleFiles(event, "photos")} /></label>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEntry.photos.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {selectedEntry.photos.map((photo) => (
                    <div key={photo.id} className="group relative overflow-hidden rounded-lg border">
                      <img src={photo.dataUrl} alt={photo.name} className="aspect-square w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 bg-black/70 p-2 text-white">
                        <span className="truncate text-xs">{photo.name}</span>
                        <button onClick={() => deleteAttachment(selectedEntry.id, "photos", photo.id)} aria-label={`Delete ${photo.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No photos attached.</p>}
              <p className="mt-3 text-xs text-muted-foreground">Browser-local storage: 1 MB per file, 3 MB total.</p>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">Daily Journal</h2>
              <p className="text-sm text-muted-foreground">{entries.length} journal entries</p>
            </div>
            <div className="flex gap-2">
              <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}><List className="mr-2 h-4 w-4" />List</Button>
              <Button variant={view === "calendar" ? "default" : "outline"} size="sm" onClick={() => setView("calendar")}><CalendarDays className="mr-2 h-4 w-4" />Calendar</Button>
              <Button size="sm" onClick={() => openCreate(todayKey())}><Plus className="mr-2 h-4 w-4" />New Entry</Button>
            </div>
          </div>

          {view === "list" ? (
            <>
              {entries.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search activities, lessons, problems, questions, or equipment..." />
                </div>
              )}
              {entries.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                    <NotebookPen className="h-11 w-11 text-muted-foreground" />
                    <div className="space-y-2"><h3 className="text-lg font-semibold">No journal entries yet</h3><p className="max-w-md text-sm text-muted-foreground">Document daily activities, lessons, problems, questions, and reflections.</p></div>
                    <Button onClick={() => openCreate(todayKey())}><Plus className="mr-2 h-4 w-4" />Create Today&apos;s Entry</Button>
                  </CardContent>
                </Card>
              ) : filteredEntries.length === 0 ? (
                <Card className="border-dashed"><CardContent className="py-14 text-center"><Search className="mx-auto mb-3 h-9 w-9 text-muted-foreground" /><h3 className="font-semibold">No matching entries</h3></CardContent></Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredEntries.map((entry) => (
                    <Card key={entry.id} className="flex flex-col transition-shadow hover:shadow-md">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div><Badge variant="outline" className="mb-2">{entry.date}</Badge><CardTitle className="line-clamp-2 text-lg">{entry.title}</CardTitle></div>
                          <NotebookPen className="h-5 w-5 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col space-y-4">
                        <p className="line-clamp-4 text-sm text-muted-foreground">{entry.dailyActivities || entry.reflection || "Open this entry to add today's activities."}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{entry.checklist.filter((item) => item.done).length}/{entry.checklist.length} checks</span><span>·</span><span>{entry.photos.length} photos</span><span>·</span><span>{entry.attachments.length} files</span>
                        </div>
                        <div className="mt-auto flex gap-2">
                          <Button className="flex-1" variant="outline" onClick={() => openEntry(entry)}>Open Entry<ArrowRight className="ml-2 h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => openEdit(entry)} aria-label={`Edit ${entry.title}`}><Edit2 className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => removeEntry(entry)} aria-label={`Delete ${entry.title}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
              <Card>
                <CardContent className="p-3">
                  <CalendarWidget
                    mode="single"
                    selected={calendarDate}
                    onSelect={(date) => { if (date) setCalendarDate(date) }}
                    modifiers={{ hasEntry: entries.map((entry) => dateFromKey(entry.date)) }}
                    modifiersClassNames={{ hasEntry: "font-bold text-primary underline decoration-2 underline-offset-4" }}
                    className="w-full"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div><CardTitle className="text-lg">{calendarDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</CardTitle><p className="text-sm text-muted-foreground">{calendarEntries.length} entries</p></div>
                    <Button size="sm" onClick={() => openCreate(keyFromDate(calendarDate))}><Plus className="mr-2 h-4 w-4" />Add Entry</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {calendarEntries.map((entry) => (
                    <button key={entry.id} onClick={() => openEntry(entry)} className="flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted">
                      <div><p className="font-medium">{entry.title}</p><p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{entry.dailyActivities || "No activities added yet"}</p></div><ArrowRight className="h-4 w-4" />
                    </button>
                  ))}
                  {!calendarEntries.length && <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No journal entries for this date.</div>}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Journal Details" : "Create Journal Entry"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Generator inspection and testing" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Related equipment</label>
              <div className="grid max-h-52 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                {equipment.map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-start gap-2 text-sm">
                    <Checkbox checked={form.equipment.includes(item.id)} onCheckedChange={() => toggleEquipment(item.id)} />
                    <span>{item.name}</span>
                  </label>
                ))}
                {!equipment.length && <p className="text-sm text-muted-foreground">No equipment cataloged yet.</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEntry}>{editingId ? "Save Changes" : "Create Entry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
