"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookMarked,
  Building2,
  Edit2,
  Eye,
  Plus,
  Search,
  Tags,
  Trash2,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useEquipmentStore } from "@/lib/equipment-store"
import {
  useStandardsStore,
  type StandardInput,
  type StandardRecord,
  type StandardsOrganization,
} from "@/lib/standards-store"

const organizations: StandardsOrganization[] = [
  "IEC",
  "IEEE",
  "NFPA",
  "API",
  "ISA",
  "NEMA",
  "Company Standards",
]

const starterStandardCategories = ["IEC", "IEEE", "NFPA", "API", "ISA", "NEMA", "Company Standard"]

const organizationStyles: Record<StandardsOrganization, string> = {
  IEC: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  IEEE: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  NFPA: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  API: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  ISA: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  NEMA: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "Company Standards": "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
}

const emptyForm: StandardInput = {
  organization: "IEC",
  reference: "",
  title: "",
  summary: "",
  relatedEquipment: [],
  notes: "",
  tags: [],
}

function standardToInput(standard: StandardRecord): StandardInput {
  return {
    organization: standard.organization,
    reference: standard.reference,
    title: standard.title,
    summary: standard.summary,
    relatedEquipment: standard.relatedEquipment,
    notes: standard.notes,
    tags: standard.tags,
  }
}

export function StandardsLibrary() {
  const standards = useStandardsStore((state) => state.standards)
  const createStandard = useStandardsStore((state) => state.createStandard)
  const updateStandard = useStandardsStore((state) => state.updateStandard)
  const deleteStandard = useStandardsStore((state) => state.deleteStandard)
  const equipment = useEquipmentStore((state) => state.equipment)
  const selectEquipment = useEquipmentStore((state) => state.selectEquipment)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<StandardInput>(emptyForm)
  const [detailStandard, setDetailStandard] = useState<StandardRecord | null>(null)
  const [search, setSearch] = useState("")
  const [organizationFilter, setOrganizationFilter] = useState<StandardsOrganization | "all">("all")
  const [tagFilter, setTagFilter] = useState("all")

  const tags = useMemo(
    () => Array.from(new Set(standards.flatMap((standard) => standard.tags))).sort(),
    [standards]
  )
  const counts = useMemo(
    () =>
      Object.fromEntries(
        organizations.map((organization) => [
          organization,
          standards.filter((standard) => standard.organization === organization).length,
        ])
      ) as Record<StandardsOrganization, number>,
    [standards]
  )
  const filteredStandards = useMemo(() => {
    const query = search.trim().toLowerCase()
    return standards.filter((standard) => {
      const equipmentNames = standard.relatedEquipment
        .map((id) => equipment.find((item) => item.id === id)?.name ?? "")
        .join(" ")
      return (
        (organizationFilter === "all" || standard.organization === organizationFilter) &&
        (tagFilter === "all" || standard.tags.includes(tagFilter)) &&
        (!query ||
          [
            standard.organization,
            standard.reference,
            standard.title,
            standard.summary,
            standard.notes,
            standard.tags.join(" "),
            equipmentNames,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query))
      )
    })
  }, [equipment, organizationFilter, search, standards, tagFilter])

  const openCreate = (organization: StandardsOrganization = "IEC") => {
    setEditingId(null)
    setForm({ ...emptyForm, organization, tags: [], relatedEquipment: [] })
    setDialogOpen(true)
  }

  const openEdit = (standard: StandardRecord) => {
    setEditingId(standard.id)
    setForm(standardToInput(standard))
    setDialogOpen(true)
  }

  const saveStandard = () => {
    if (!form.reference.trim() || !form.title.trim() || !form.summary.trim()) {
      toast.error("Reference, title, and summary are required")
      return
    }
    if (editingId) {
      updateStandard(editingId, form)
      toast.success("Standard updated")
    } else {
      createStandard(form)
      toast.success("Standard added")
    }
    setDialogOpen(false)
  }

  const removeStandard = (standard: StandardRecord) => {
    if (!window.confirm(`Delete ${standard.reference}?`)) return
    deleteStandard(standard.id)
    if (detailStandard?.id === standard.id) setDetailStandard(null)
    toast.success("Standard deleted")
  }

  const toggleEquipment = (id: string) => {
    setForm((current) => ({
      ...current,
      relatedEquipment: current.relatedEquipment.includes(id)
        ? current.relatedEquipment.filter((equipmentId) => equipmentId !== id)
        : [...current.relatedEquipment, id],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Engineering Standards</h2>
          <p className="text-sm text-muted-foreground">{standards.length} locally saved references</p>
        </div>
        <Button onClick={() => openCreate()}><Plus className="mr-2 h-4 w-4" />Add Standard</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {organizations.map((organization) => (
          <button
            key={organization}
            onClick={() => setOrganizationFilter(organizationFilter === organization ? "all" : organization)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              organizationFilter === organization ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
          >
            <p className="truncate text-sm font-semibold">{organization}</p>
            <p className="mt-1 text-xs text-muted-foreground">{counts[organization]} references</p>
          </button>
        ))}
      </div>

      {standards.length > 0 && (
        <div className="grid gap-3 md:grid-cols-[1fr_220px_200px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search references, summaries, notes, tags, or equipment..." />
          </div>
          <Select value={organizationFilter} onValueChange={(value) => setOrganizationFilter(value as StandardsOrganization | "all")}>
            <SelectTrigger aria-label="Filter organization"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              {organizations.map((organization) => <SelectItem key={organization} value={organization}>{organization}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger aria-label="Filter tag"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {tags.map((tag) => <SelectItem key={tag} value={tag}>#{tag}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {standards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <BookMarked className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No standards saved</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Build a searchable index of engineering standards and company requirements.
              </p>
            </div>
            <div className="flex max-w-xl flex-wrap justify-center gap-2">
              {starterStandardCategories.map((category) => (
                <Badge key={category} variant="secondary">{category}</Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
              <Button className="h-auto min-h-9 min-w-0 whitespace-normal px-2 py-2 text-xs leading-tight sm:h-9 sm:whitespace-nowrap sm:px-4 sm:text-sm" onClick={() => openCreate()}><Plus className="h-4 w-4" />Add First Standard</Button>
              <Button className="h-auto min-h-9 min-w-0 whitespace-normal px-2 py-2 text-xs leading-tight sm:h-9 sm:whitespace-nowrap sm:px-4 sm:text-sm" variant="outline" onClick={() => openCreate("IEC")}>Add from Category</Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredStandards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center">
            <Search className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
            <h3 className="font-semibold">No matching standards</h3>
            <p className="mt-1 text-sm text-muted-foreground">Change the search or filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredStandards.map((standard) => (
            <Card key={standard.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Badge variant="outline" className={`mb-2 ${organizationStyles[standard.organization]}`}>
                      {standard.organization}
                    </Badge>
                    <CardTitle className="text-lg">{standard.reference}</CardTitle>
                    <p className="mt-1 line-clamp-2 text-sm font-medium">{standard.title}</p>
                  </div>
                  {standard.organization === "Company Standards" ? (
                    <Building2 className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <BookMarked className="h-5 w-5 shrink-0 text-primary" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-4">
                <p className="line-clamp-4 text-sm text-muted-foreground">{standard.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {standard.tags.map((tag) => <Badge key={tag} variant="secondary">#{tag}</Badge>)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {standard.relatedEquipment.length} related equipment
                </div>
                <div className="mt-auto grid grid-cols-3 gap-2 border-t pt-3">
                  <Button size="sm" variant="outline" onClick={() => setDetailStandard(standard)}>
                    <Eye className="mr-1 h-3.5 w-3.5" />View
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(standard)}>
                    <Edit2 className="mr-1 h-3.5 w-3.5" />Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeStandard(standard)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5 text-destructive" />Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Standard" : "Add Standard"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization</label>
              <Select value={form.organization} onValueChange={(value) => setForm((current) => ({ ...current, organization: value as StandardsOrganization }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{organizations.map((organization) => <SelectItem key={organization} value={organization}>{organization}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reference</label>
              <Input value={form.reference} onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))} placeholder="IEC 60034-1:2022" />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Rotating electrical machines — Rating and performance" />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Summary</label>
              <Textarea value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} placeholder="Summarize scope, key requirements, limits, and practical application." className="min-h-32" />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Interpretation notes, clauses to review, deviations, or company guidance." className="min-h-28" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium"><Tags className="h-4 w-4" />Tags</label>
              <Input value={form.tags.join(", ")} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) }))} placeholder="motors, testing, performance" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium"><Wrench className="h-4 w-4" />Related equipment</label>
              <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                {equipment.map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-start gap-2 text-sm">
                    <Checkbox checked={form.relatedEquipment.includes(item.id)} onCheckedChange={() => toggleEquipment(item.id)} />
                    <span>{item.name}</span>
                  </label>
                ))}
                {!equipment.length && <p className="text-xs text-muted-foreground">No equipment cataloged.</p>}
              </div>
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 sm:flex sm:flex-row sm:justify-end">
            <Button className="h-auto min-h-9 min-w-0 whitespace-normal px-2 py-2 text-xs leading-tight sm:h-9 sm:whitespace-nowrap sm:px-4 sm:text-sm" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="h-auto min-h-9 min-w-0 whitespace-normal px-2 py-2 text-xs leading-tight sm:h-9 sm:whitespace-nowrap sm:px-4 sm:text-sm" onClick={saveStandard}>{editingId ? "Save Changes" : "Add Standard"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(detailStandard)} onOpenChange={(open) => { if (!open) setDetailStandard(null) }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {detailStandard && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle>{detailStandard.reference}</DialogTitle>
                  <Badge variant="outline" className={organizationStyles[detailStandard.organization]}>{detailStandard.organization}</Badge>
                </div>
                <p className="text-sm font-medium">{detailStandard.title}</p>
              </DialogHeader>
              <div className="space-y-5 py-2">
                <section>
                  <h3 className="mb-2 text-sm font-semibold">Summary</h3>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{detailStandard.summary}</p>
                </section>
                <section>
                  <h3 className="mb-2 text-sm font-semibold">Notes</h3>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{detailStandard.notes || "No notes added."}</p>
                </section>
                <section>
                  <h3 className="mb-2 text-sm font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {detailStandard.tags.map((tag) => <Badge key={tag} variant="secondary">#{tag}</Badge>)}
                    {!detailStandard.tags.length && <span className="text-sm text-muted-foreground">No tags.</span>}
                  </div>
                </section>
                <section>
                  <h3 className="mb-2 text-sm font-semibold">Related Equipment</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {detailStandard.relatedEquipment.map((id) => {
                      const item = equipment.find((equipmentItem) => equipmentItem.id === id)
                      return item ? (
                        <Button key={id} asChild variant="outline" className="justify-between">
                          <Link href="/equipment" onClick={() => selectEquipment(item.id)}>
                            <span className="truncate">{item.name}</span><ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null
                    })}
                    {!detailStandard.relatedEquipment.length && <span className="text-sm text-muted-foreground">No related equipment.</span>}
                  </div>
                </section>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailStandard(null)
                    openEdit(detailStandard)
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />Edit
                </Button>
                <Button onClick={() => setDetailStandard(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
