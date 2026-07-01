"use client"

import { type ChangeEvent, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Download,
  Edit2,
  FileText,
  ImagePlus,
  MapPin,
  Paperclip,
  Plus,
  Search,
  Trash2,
  Upload,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  equipmentSectionLabels,
  useEquipmentStore,
  type EquipmentInput,
  type EquipmentRecord,
  type EquipmentSectionKey,
} from "@/lib/equipment-store"
import { useDisciplineWorkspace } from "@/lib/discipline/use-discipline-workspace"

const categories = [
  "Transformer",
  "Generator",
  "Motor",
  "Switchgear",
  "Protection Relay",
  "UPS",
  "Battery",
  "Cable",
  "Instrument",
  "Other",
]

const sectionGroups: Array<{
  value: string
  label: string
  sections: EquipmentSectionKey[]
}> = [
  {
    value: "knowledge",
    label: "Knowledge",
    sections: ["overview", "workingPrinciple", "construction", "components", "specifications"],
  },
  {
    value: "maintenance",
    label: "Maintenance",
    sections: [
      "inspection",
      "testing",
      "preventiveMaintenance",
      "predictiveMaintenance",
      "correctiveMaintenance",
    ],
  },
  {
    value: "reliability",
    label: "Reliability",
    sections: ["failureModes", "troubleshooting", "lessonsLearned", "notes"],
  },
]

const emptyForm: EquipmentInput = {
  name: "",
  category: "Transformer",
  manufacturer: "",
  model: "",
  rating: "",
  location: "",
}

function equipmentToForm(equipment: EquipmentRecord): EquipmentInput {
  return {
    name: equipment.name,
    category: equipment.category,
    manufacturer: equipment.manufacturer,
    model: equipment.model,
    rating: equipment.rating,
    location: equipment.location,
  }
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function EquipmentLibraryNew() {
  const workspace = useDisciplineWorkspace()
  const allEquipment = useEquipmentStore((state) => state.equipment)
  const equipment = useMemo(() => workspace.filter(allEquipment), [allEquipment, workspace])
  const selectedEquipmentId = useEquipmentStore((state) => state.selectedEquipmentId)
  const createEquipment = useEquipmentStore((state) => state.createEquipment)
  const updateEquipment = useEquipmentStore((state) => state.updateEquipment)
  const deleteEquipment = useEquipmentStore((state) => state.deleteEquipment)
  const selectEquipment = useEquipmentStore((state) => state.selectEquipment)
  const updateSection = useEquipmentStore((state) => state.updateSection)
  const addChecklistItem = useEquipmentStore((state) => state.addChecklistItem)
  const toggleChecklistItem = useEquipmentStore((state) => state.toggleChecklistItem)
  const deleteChecklistItem = useEquipmentStore((state) => state.deleteChecklistItem)
  const addAttachment = useEquipmentStore((state) => state.addAttachment)
  const deleteAttachment = useEquipmentStore((state) => state.deleteAttachment)

  const selectedEquipment = equipment.find((item) => item.id === selectedEquipmentId) ?? null
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EquipmentInput>(emptyForm)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [checklistInput, setChecklistInput] = useState("")

  const availableCategories = useMemo(
    () => Array.from(new Set([...workspace.configuration.equipment, ...categories, ...equipment.map((item) => item.category)])).sort(),
    [equipment, workspace.configuration.equipment]
  )

  const filteredEquipment = useMemo(() => {
    const query = search.trim().toLowerCase()
    return equipment.filter(
      (item) =>
        (categoryFilter === "all" || item.category === categoryFilter) &&
        (!query ||
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.manufacturer.toLowerCase().includes(query) ||
          item.model.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          Object.values(item.sections).some((content) => content.toLowerCase().includes(query)))
    )
  }, [categoryFilter, equipment, search])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, category: workspace.configuration.equipment[0] ?? emptyForm.category })
    setDialogOpen(true)
  }

  const openEdit = (item: EquipmentRecord) => {
    setEditingId(item.id)
    setForm(equipmentToForm(item))
    setDialogOpen(true)
  }

  const saveEquipment = () => {
    if (!form.name.trim()) {
      toast.error("Equipment name is required")
      return
    }
    if (editingId) {
      updateEquipment(editingId, form)
      toast.success("Equipment updated")
    } else {
      createEquipment(form)
      toast.success("Equipment created")
    }
    setDialogOpen(false)
  }

  const removeEquipment = (item: EquipmentRecord) => {
    if (!window.confirm(`Delete "${item.name}" and its local attachments?`)) return
    deleteEquipment(item.id)
    toast.success("Equipment deleted")
  }

  const addChecklist = () => {
    if (!selectedEquipment || !checklistInput.trim()) return
    addChecklistItem(selectedEquipment.id, checklistInput)
    setChecklistInput("")
  }

  const handleFiles = (
    event: ChangeEvent<HTMLInputElement>,
    kind: "photos" | "documents"
  ) => {
    if (!selectedEquipment) return
    const files = Array.from(event.target.files ?? [])
    let queuedBytes = equipment.reduce(
      (total, item) =>
        total +
        item.photos.reduce((sum, attachment) => sum + attachment.size, 0) +
        item.documents.reduce((sum, attachment) => sum + attachment.size, 0),
      0
    )
    files.forEach((file) => {
      if (file.size > 1024 * 1024) {
        toast.error(`${file.name} exceeds the 1 MB local attachment limit`)
        return
      }
      if (queuedBytes + file.size > 3 * 1024 * 1024) {
        toast.error("The 3 MB local attachment budget has been reached")
        return
      }
      queuedBytes += file.size
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result !== "string") return
        addAttachment(selectedEquipment.id, kind, {
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
      {selectedEquipment ? (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="space-y-3">
              <Button variant="ghost" className="-ml-3" onClick={() => selectEquipment(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Equipment Library
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold">{selectedEquipment.name}</h2>
                  <Badge>{selectedEquipment.category}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[selectedEquipment.manufacturer, selectedEquipment.model, selectedEquipment.location]
                    .filter(Boolean)
                    .join(" · ") || "Engineering equipment workspace"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openEdit(selectedEquipment)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={() => removeEquipment(selectedEquipment)}>
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                Delete
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Workspace completion</span>
                  <span>{selectedEquipment.progress}%</span>
                </div>
                <Progress value={selectedEquipment.progress} />
                <p className="text-xs text-muted-foreground">
                  Progress is calculated from completed engineering sections and checklist items.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-medium">{selectedEquipment.rating || "Not set"}</span>
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{selectedEquipment.location || "Not set"}</span>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="knowledge" className="space-y-4">
            <TabsList className="h-auto w-full justify-start overflow-x-auto">
              {sectionGroups.map((group) => (
                <TabsTrigger key={group.value} value={group.value}>{group.label}</TabsTrigger>
              ))}
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            {sectionGroups.map((group) => (
              <TabsContent key={group.value} value={group.value}>
                <div className="grid gap-4 lg:grid-cols-2">
                  {group.sections.map((section) => (
                    <Card key={section} className={section === "overview" || section === "notes" ? "lg:col-span-2" : ""}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-base">
                          {equipmentSectionLabels[section]}
                          {selectedEquipment.sections[section].trim() && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          key={`${selectedEquipment.id}-${section}`}
                          defaultValue={selectedEquipment.sections[section]}
                          onBlur={(event) => updateSection(selectedEquipment.id, section, event.target.value)}
                          placeholder={`Document ${equipmentSectionLabels[section].toLowerCase()}...`}
                          className="min-h-36"
                          aria-label={equipmentSectionLabels[section]}
                        />
                        <p className="mt-2 text-xs text-muted-foreground">Saved locally when you leave this field.</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}

            <TabsContent value="checklist">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Equipment study checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={checklistInput}
                      onChange={(event) => setChecklistInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") addChecklist()
                      }}
                      placeholder="Add an inspection, study, or maintenance action"
                    />
                    <Button onClick={addChecklist}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add item
                    </Button>
                  </div>
                  {selectedEquipment.checklist.length ? (
                    <div className="divide-y rounded-lg border">
                      {selectedEquipment.checklist.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3">
                          <Checkbox
                            checked={item.done}
                            onCheckedChange={() => toggleChecklistItem(selectedEquipment.id, item.id)}
                            aria-label={`${item.done ? "Mark incomplete" : "Mark complete"}: ${item.text}`}
                          />
                          <span className={`flex-1 text-sm ${item.done ? "text-muted-foreground line-through" : ""}`}>
                            {item.text}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteChecklistItem(selectedEquipment.id, item.id)}
                            aria-label={`Delete ${item.text}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                      No checklist items yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2"><ImagePlus className="h-4 w-4" /> Photos</span>
                      <Button asChild size="sm" variant="outline">
                        <label className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Add photos
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={(event) => handleFiles(event, "photos")}
                          />
                        </label>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedEquipment.photos.length ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {selectedEquipment.photos.map((photo) => (
                          <div key={photo.id} className="group relative overflow-hidden rounded-lg border">
                            {/* Browser-local data URL preview; no remote image optimization is needed. */}
                            <img src={photo.dataUrl} alt={photo.name} className="aspect-square w-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/70 p-2 text-white">
                              <span className="truncate text-xs">{photo.name}</span>
                              <button
                                onClick={() => deleteAttachment(selectedEquipment.id, "photos", photo.id)}
                                aria-label={`Delete ${photo.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                        No photos attached.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2"><Paperclip className="h-4 w-4" /> Documents</span>
                      <Button asChild size="sm" variant="outline">
                        <label className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Add documents
                          <input
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={(event) => handleFiles(event, "documents")}
                          />
                        </label>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedEquipment.documents.length ? (
                      <div className="divide-y rounded-lg border">
                        {selectedEquipment.documents.map((document) => (
                          <div key={document.id} className="flex items-center gap-3 p-3">
                            <FileText className="h-5 w-5 shrink-0 text-primary" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{document.name}</p>
                              <p className="text-xs text-muted-foreground">{formatBytes(document.size)}</p>
                            </div>
                            <Button asChild size="icon" variant="ghost">
                              <a href={document.dataUrl} download={document.name} aria-label={`Download ${document.name}`}>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteAttachment(selectedEquipment.id, "documents", document.id)}
                              aria-label={`Delete ${document.name}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                        No documents attached.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Attachments are stored locally in this browser. Maximum 1 MB per file and 3 MB total.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">Engineering equipment</h2>
              <p className="text-sm text-muted-foreground">
                {equipment.length} cataloged items for {workspace.configuration.label}
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          </div>

          {equipment.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search equipment, location, manufacturer, or notes..."
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger aria-label="Filter by category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {equipment.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <Cpu className="h-11 w-11 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No equipment has been added</h3>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Catalog the equipment you encounter and build a structured engineering knowledge workspace.
                  </p>
                </div>
                <Button onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Equipment
                </Button>
              </CardContent>
            </Card>
          ) : filteredEquipment.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-14 text-center">
                <Search className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
                <h3 className="font-semibold">No matching equipment</h3>
                <p className="mt-1 text-sm text-muted-foreground">Change the search or category filter.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredEquipment.map((item) => (
                <Card key={item.id} className="flex flex-col transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Badge variant="secondary" className="mb-2">{item.category}</Badge>
                        <CardTitle className="truncate text-lg">{item.name}</CardTitle>
                      </div>
                      <div className="rounded-lg bg-primary/10 p-2 text-primary"><Cpu className="h-5 w-5" /></div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {item.manufacturer && <p>{item.manufacturer}{item.model ? ` · ${item.model}` : ""}</p>}
                      {item.location && <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{item.location}</p>}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Workspace progress</span>
                        <span>{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} />
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{item.photos.length} photos</span>
                      <span>·</span>
                      <span>{item.documents.length} documents</span>
                      <span>·</span>
                      <span>{item.checklist.length} checks</span>
                    </div>
                    <div className="mt-auto flex gap-2 pt-2">
                      <Button className="flex-1" variant="outline" onClick={() => selectEquipment(item.id)}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(item)} aria-label={`Edit ${item.name}`}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => removeEquipment(item)} aria-label={`Delete ${item.name}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Equipment" : "Add Equipment"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Equipment name</label>
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Synchronous Generator G-01"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Manufacturer</label>
              <Input
                value={form.manufacturer}
                onChange={(event) => setForm((current) => ({ ...current, manufacturer: event.target.value }))}
                placeholder="Manufacturer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Input
                value={form.model}
                onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
                placeholder="Model or asset number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating / capacity</label>
              <Input
                value={form.rating}
                onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
                placeholder="25 MVA, 11 kV"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="Plant, substation, or workshop"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEquipment}>{editingId ? "Save Changes" : "Create Equipment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
