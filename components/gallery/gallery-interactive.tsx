"use client"

import { type ChangeEvent, type DragEvent, useEffect, useMemo, useRef, useState } from "react"
import {
  CalendarDays,
  Camera,
  Edit2,
  Eye,
  Image as ImageIcon,
  MapPin,
  Plus,
  Search,
  Trash2,
  Upload,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  useGalleryStore,
  type GalleryPhoto,
  type GalleryPhotoInput,
} from "@/lib/gallery-store"
import { useEquipmentStore } from "@/lib/equipment-store"
import { useJournalStore } from "@/lib/journal-store"
import { deleteModuleFile, listModuleFiles, uploadModuleFile } from "@/lib/supabase/file-storage"
import { PHOTO_GALLERY_MODULE, validateModuleFile } from "@/lib/supabase/file-validation.mjs"

const defaultCategories = [
  "Equipment",
  "Inspection",
  "Maintenance",
  "Testing",
  "Installation",
  "Safety",
  "Site Visit",
  "Failure",
  "Before & After",
  "Other",
]

const emptyForm: GalleryPhotoInput = {
  title: "",
  category: "Equipment",
  location: "",
  notes: "",
  relatedEquipment: [],
  relatedJournal: [],
}

function photoToInput(photo: GalleryPhoto): GalleryPhotoInput {
  return {
    title: photo.title,
    category: photo.category,
    location: photo.location,
    notes: photo.notes,
    relatedEquipment: photo.relatedEquipment,
    relatedJournal: photo.relatedJournal,
  }
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  return `${Math.round(size / 1024)} KB`
}

export function GalleryInteractive() {
  const photos = useGalleryStore((state) => state.photos)
  const createPhoto = useGalleryStore((state) => state.createPhoto)
  const updatePhoto = useGalleryStore((state) => state.updatePhoto)
  const deletePhoto = useGalleryStore((state) => state.deletePhoto)
  const equipment = useEquipmentStore((state) => state.equipment)
  const journalEntries = useJournalStore((state) => state.entries)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<GalleryPhotoInput>(emptyForm)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState("")
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    listModuleFiles(PHOTO_GALLERY_MODULE)
      .then((files) => {
        if (!active) return
        setFileUrls(Object.fromEntries(files.map((file) => [file.file_path, file.signedUrl])))
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Could not load photo previews"
        toast.error(message)
      })
    return () => {
      active = false
    }
  }, [photos])

  const categories = useMemo(
    () => Array.from(new Set([...defaultCategories, ...photos.map((photo) => photo.category)])).sort(),
    [photos]
  )
  const filteredPhotos = useMemo(() => {
    const query = search.trim().toLowerCase()
    return photos.filter((photo) => {
      const equipmentNames = photo.relatedEquipment
        .map((id) => equipment.find((item) => item.id === id)?.name ?? "")
        .join(" ")
      const journalNames = photo.relatedJournal
        .map((id) => journalEntries.find((entry) => entry.id === id)?.title ?? "")
        .join(" ")
      return (
        (categoryFilter === "all" || photo.category === categoryFilter) &&
        (!query ||
          [photo.title, photo.category, photo.location, photo.notes, equipmentNames, journalNames]
            .join(" ")
            .toLowerCase()
            .includes(query))
      )
    })
  }, [categoryFilter, equipment, journalEntries, photos, search])

  const openUpload = () => {
    setEditingId(null)
    setForm({ ...emptyForm, relatedEquipment: [], relatedJournal: [] })
    setSelectedImage(null)
    setSelectedImageUrl("")
    setDialogOpen(true)
  }

  const openEdit = (photo: GalleryPhoto) => {
    setEditingId(photo.id)
    setForm(photoToInput(photo))
    setSelectedImage(null)
    setSelectedImageUrl("")
    setDialogOpen(true)
  }

  const readImage = (file: File) => {
    const validation = validateModuleFile({
      module: PHOTO_GALLERY_MODULE,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    })
    if (!validation.ok) {
      toast.error(validation.message)
      return
    }
    if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl)
    setSelectedImage(file)
    setSelectedImageUrl(URL.createObjectURL(file))
    setForm((current) => ({
      ...current,
      title: current.title || file.name.replace(/\.[^.]+$/, ""),
    }))
  }

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) readImage(file)
    event.target.value = ""
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) readImage(file)
  }

  const savePhoto = async () => {
    if (!form.title.trim() || !form.category) {
      toast.error("Title and category are required")
      return
    }
    if (editingId) {
      updatePhoto(editingId, form)
      toast.success("Photo updated")
    } else {
      if (!selectedImage) {
        toast.error("Select a photo to upload")
        return
      }
      setUploading(true)
      try {
        const id = crypto.randomUUID()
        const file = await uploadModuleFile({
          file: selectedImage,
          module: PHOTO_GALLERY_MODULE,
          scopeKey: id,
        })
        createPhoto(
          form,
          {
            name: file.file_name,
            type: file.mime_type,
            size: file.size_bytes,
            bucket: file.bucket,
            filePath: file.file_path,
          },
          id
        )
        setFileUrls((current) => ({ ...current, [file.file_path]: selectedImageUrl }))
        toast.success("Photo added to gallery")
      } catch (error) {
        const message = error instanceof Error ? error.message : "Photo upload failed"
        toast.error(message)
        return
      } finally {
        setUploading(false)
      }
    }
    setDialogOpen(false)
  }

  const removePhoto = async (photo: GalleryPhoto) => {
    if (!window.confirm(`Delete "${photo.title}"?`)) return
    try {
      await deleteModuleFile(photo.image.filePath)
      deletePhoto(photo.id)
      setFileUrls((current) => {
        const next = { ...current }
        delete next[photo.image.filePath]
        return next
      })
      if (previewPhoto?.id === photo.id) setPreviewPhoto(null)
      toast.success("Photo deleted")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Photo could not be deleted"
      toast.error(message)
    }
  }

  const toggleRelation = (field: "relatedEquipment" | "relatedJournal", id: string) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(id)
        ? current[field].filter((relationId) => relationId !== id)
        : [...current[field], id],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Photo Gallery</h2>
          <p className="text-sm text-muted-foreground">{photos.length} Supabase photos</p>
        </div>
        <Button onClick={openUpload}><Upload className="mr-2 h-4 w-4" />Upload Photo</Button>
      </div>

      {photos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search photos, notes, equipment, or journal entries..." />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger aria-label="Filter category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {photos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <ImageIcon className="h-11 w-11 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No photos yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Build a visual engineering record connected to equipment and daily journal entries.
              </p>
            </div>
            <Button onClick={openUpload}><Camera className="mr-2 h-4 w-4" />Add First Photo</Button>
          </CardContent>
        </Card>
      ) : filteredPhotos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center">
            <Search className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
            <h3 className="font-semibold">No matching photos</h3>
            <p className="mt-1 text-sm text-muted-foreground">Change the search or category filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
              <button
                onClick={() => setPreviewPhoto(photo)}
                className="relative block aspect-[4/3] w-full overflow-hidden bg-muted text-left"
                aria-label={`Preview ${photo.title}`}
              >
                <img
                  src={fileUrls[photo.image.filePath] ?? ""}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <Eye className="h-7 w-7 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <Badge className="absolute left-3 top-3">{photo.category}</Badge>
              </button>
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold">{photo.title}</h3>
                  {photo.location && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{photo.location}</p>}
                </div>
                {photo.notes && <p className="line-clamp-3 text-sm text-muted-foreground">{photo.notes}</p>}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{photo.relatedEquipment.length} equipment</span><span>·</span><span>{photo.relatedJournal.length} journal links</span>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t pt-3">
                  <Button size="sm" variant="outline" onClick={() => setPreviewPhoto(photo)}><Eye className="mr-1 h-3.5 w-3.5" />View</Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(photo)}><Edit2 className="mr-1 h-3.5 w-3.5" />Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => void removePhoto(photo)}><Trash2 className="mr-1 h-3.5 w-3.5 text-destructive" />Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Photo" : "Upload Photo"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {!editingId && (
              <div className="sm:col-span-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`cursor-pointer overflow-hidden rounded-lg border-2 border-dashed transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  {selectedImage ? (
                    <div className="grid gap-4 p-3 sm:grid-cols-[180px_1fr] sm:items-center">
                      <img src={selectedImageUrl} alt="Upload preview" className="aspect-[4/3] w-full rounded-md object-cover" />
                      <div><p className="font-medium">{selectedImage.name}</p><p className="mt-1 text-sm text-muted-foreground">{formatBytes(selectedImage.size)} · Click to replace</p></div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Drop an image here or click to browse</p>
                      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WebP - 5 MB maximum</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFileInput} />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Transformer inspection" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Location</label>
              <Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Plant, substation, workshop, or site" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Describe what the photo shows, why it matters, and any observations." className="min-h-28" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium"><Wrench className="h-4 w-4" />Equipment relation</label>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                {equipment.map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-start gap-2 text-sm">
                    <Checkbox checked={form.relatedEquipment.includes(item.id)} onCheckedChange={() => toggleRelation("relatedEquipment", item.id)} />
                    <span>{item.name}</span>
                  </label>
                ))}
                {!equipment.length && <p className="text-xs text-muted-foreground">No equipment cataloged.</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium"><CalendarDays className="h-4 w-4" />Journal relation</label>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                {journalEntries.map((entry) => (
                  <label key={entry.id} className="flex cursor-pointer items-start gap-2 text-sm">
                    <Checkbox checked={form.relatedJournal.includes(entry.id)} onCheckedChange={() => toggleRelation("relatedJournal", entry.id)} />
                    <span>{entry.date} · {entry.title}</span>
                  </label>
                ))}
                {!journalEntries.length && <p className="text-xs text-muted-foreground">No journal entries created.</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => void savePhoto()} disabled={uploading}>{editingId ? "Save Changes" : uploading ? "Uploading..." : "Add Photo"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewPhoto)} onOpenChange={(open) => { if (!open) setPreviewPhoto(null) }}>
        <DialogContent className="max-h-[95vh] max-w-5xl overflow-y-auto p-0">
          {previewPhoto && (
            <>
              <div className="flex max-h-[72vh] min-h-[320px] items-center justify-center bg-black">
                <img src={fileUrls[previewPhoto.image.filePath] ?? ""} alt={previewPhoto.title} className="max-h-[72vh] max-w-full object-contain" />
              </div>
              <div className="space-y-4 p-6">
                <DialogHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle>{previewPhoto.title}</DialogTitle>
                    <Badge>{previewPhoto.category}</Badge>
                  </div>
                </DialogHeader>
                {previewPhoto.location && <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{previewPhoto.location}</p>}
                {previewPhoto.notes && <p className="whitespace-pre-wrap text-sm">{previewPhoto.notes}</p>}
                <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Related equipment</p>
                    <div className="flex flex-wrap gap-2">
                      {previewPhoto.relatedEquipment.map((id) => {
                        const item = equipment.find((equipmentItem) => equipmentItem.id === id)
                        return item ? <Badge key={id} variant="secondary">{item.name}</Badge> : null
                      })}
                      {!previewPhoto.relatedEquipment.length && <span className="text-sm text-muted-foreground">None</span>}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Related journal entries</p>
                    <div className="flex flex-wrap gap-2">
                      {previewPhoto.relatedJournal.map((id) => {
                        const entry = journalEntries.find((journalEntry) => journalEntry.id === id)
                        return entry ? <Badge key={id} variant="outline">{entry.date} · {entry.title}</Badge> : null
                      })}
                      {!previewPhoto.relatedJournal.length && <span className="text-sm text-muted-foreground">None</span>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPreviewPhoto(null)
                      openEdit(previewPhoto)
                    }}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />Edit
                  </Button>
                  <Button onClick={() => setPreviewPhoto(null)}>Close</Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
