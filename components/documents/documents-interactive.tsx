"use client"

import { type ChangeEvent, type DragEvent, useMemo, useRef, useState } from "react"
import {
  Download,
  Edit2,
  Eye,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Link2,
  Plus,
  Search,
  Trash2,
  Upload,
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
import {
  useDocumentStore,
  type DocumentInput,
  type DocumentRecord,
  type LocalDocumentFile,
} from "@/lib/document-store"
import { useEquipmentStore } from "@/lib/equipment-store"
import { useKnowledgeStore } from "@/lib/knowledge-store"

const defaultCategories = [
  "Standard",
  "Manual",
  "Datasheet",
  "Single-Line Diagram",
  "Procedure",
  "Drawing",
  "Report",
  "Certificate",
  "Other",
]

const emptyForm: DocumentInput = {
  title: "",
  description: "",
  category: "Standard",
  tags: [],
  relatedEquipment: [],
  relatedKnowledge: [],
}

function recordToInput(document: DocumentRecord): DocumentInput {
  return {
    title: document.title,
    description: document.description,
    category: document.category,
    tags: document.tags,
    relatedEquipment: document.relatedEquipment,
    relatedKnowledge: document.relatedKnowledge,
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function documentIcon(type: string) {
  if (type.startsWith("image/")) return FileImage
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv")) return FileSpreadsheet
  if (type.includes("pdf") || type.startsWith("text/")) return FileText
  return File
}

function canPreview(type: string) {
  return type.startsWith("image/") || type === "application/pdf" || type.startsWith("text/")
}

export function DocumentsInteractive() {
  const documents = useDocumentStore((state) => state.documents)
  const createDocument = useDocumentStore((state) => state.createDocument)
  const updateDocument = useDocumentStore((state) => state.updateDocument)
  const deleteDocument = useDocumentStore((state) => state.deleteDocument)
  const equipment = useEquipmentStore((state) => state.equipment)
  const articles = useKnowledgeStore((state) => state.articles)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DocumentInput>(emptyForm)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewDocument, setPreviewDocument] = useState<DocumentRecord | null>(null)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = useMemo(
    () => Array.from(new Set([...defaultCategories, ...documents.map((document) => document.category)])).sort(),
    [documents]
  )
  const tags = useMemo(
    () => Array.from(new Set(documents.flatMap((document) => document.tags))).sort(),
    [documents]
  )
  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase()
    return documents.filter((document) => {
      const equipmentNames = document.relatedEquipment
        .map((id) => equipment.find((item) => item.id === id)?.name ?? "")
        .join(" ")
      const articleNames = document.relatedKnowledge
        .map((id) => articles.find((article) => article.id === id)?.title ?? "")
        .join(" ")
      return (
        (categoryFilter === "all" || document.category === categoryFilter) &&
        (tagFilter === "all" || document.tags.includes(tagFilter)) &&
        (!query ||
          [
            document.title,
            document.description,
            document.category,
            document.file.name,
            document.tags.join(" "),
            equipmentNames,
            articleNames,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query))
      )
    })
  }, [articles, categoryFilter, documents, equipment, search, tagFilter])

  const openUpload = () => {
    setEditingId(null)
    setForm({ ...emptyForm, tags: [], relatedEquipment: [], relatedKnowledge: [] })
    setSelectedFile(null)
    setDialogOpen(true)
  }

  const openEdit = (document: DocumentRecord) => {
    setEditingId(document.id)
    setForm(recordToInput(document))
    setSelectedFile(null)
    setDialogOpen(true)
  }

  const validateFile = (file: File) => {
    if (file.size > 1024 * 1024) {
      toast.error(`${file.name} exceeds the 1 MB local file limit`)
      return false
    }
    const currentBytes = documents.reduce((total, document) => total + document.file.size, 0)
    if (currentBytes + file.size > 2 * 1024 * 1024) {
      toast.error("The 2 MB local document storage budget has been reached")
      return false
    }
    return true
  }

  const chooseFile = (file: File | undefined) => {
    if (!file || !validateFile(file)) return
    setSelectedFile(file)
    setForm((current) => ({
      ...current,
      title: current.title || file.name.replace(/\.[^.]+$/, ""),
    }))
  }

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    chooseFile(event.target.files?.[0])
    event.target.value = ""
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    chooseFile(event.dataTransfer.files?.[0])
  }

  const readFile = (file: File) =>
    new Promise<LocalDocumentFile>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Invalid file result"))
          return
        }
        resolve({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          dataUrl: reader.result,
        })
      }
      reader.onerror = () => reject(reader.error ?? new Error("File read failed"))
      reader.readAsDataURL(file)
    })

  const saveDocument = async () => {
    if (!form.title.trim() || !form.category) {
      toast.error("Title and category are required")
      return
    }
    if (editingId) {
      updateDocument(editingId, form)
      toast.success("Document updated")
      setDialogOpen(false)
      return
    }
    if (!selectedFile) {
      toast.error("Select a file to upload")
      return
    }
    try {
      const file = await readFile(selectedFile)
      createDocument(form, file)
      toast.success("Document uploaded")
      setDialogOpen(false)
    } catch {
      toast.error("The selected file could not be read")
    }
  }

  const removeDocument = (document: DocumentRecord) => {
    if (!window.confirm(`Delete "${document.title}"?`)) return
    deleteDocument(document.id)
    if (previewDocument?.id === document.id) setPreviewDocument(null)
    toast.success("Document deleted")
  }

  const toggleRelation = (field: "relatedEquipment" | "relatedKnowledge", id: string) => {
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
          <h2 className="text-xl font-semibold">Document Library</h2>
          <p className="text-sm text-muted-foreground">{documents.length} browser-local documents</p>
        </div>
        <Button onClick={openUpload}><Upload className="mr-2 h-4 w-4" />Upload Document</Button>
      </div>

      {documents.length > 0 && (
        <div className="grid gap-3 md:grid-cols-[1fr_220px_200px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search documents, tags, equipment, or knowledge..." />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger aria-label="Filter category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
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

      {documents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <FileText className="h-11 w-11 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No documents uploaded</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Upload standards, diagrams, manuals, and datasheets for browser-local field reference.
              </p>
            </div>
            <Button onClick={openUpload}><Upload className="mr-2 h-4 w-4" />Upload Document</Button>
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center">
            <Search className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
            <h3 className="font-semibold">No matching documents</h3>
            <p className="mt-1 text-sm text-muted-foreground">Change the search or filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((document) => {
            const Icon = documentIcon(document.file.type)
            return (
              <Card key={document.id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Badge variant="secondary" className="mb-2">{document.category}</Badge>
                      <CardTitle className="line-clamp-2 text-lg">{document.title}</CardTitle>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-4">
                  {document.description && <p className="line-clamp-3 text-sm text-muted-foreground">{document.description}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {document.tags.map((tag) => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="truncate">{document.file.name}</p>
                    <p>{formatFileSize(document.file.size)} · {new Date(document.createdAt).toLocaleDateString()}</p>
                    <p>{document.relatedEquipment.length} equipment · {document.relatedKnowledge.length} knowledge links</p>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                    <Button variant="outline" onClick={() => setPreviewDocument(document)} disabled={!canPreview(document.file.type)}>
                      <Eye className="mr-2 h-4 w-4" />{canPreview(document.file.type) ? "Preview" : "No Preview"}
                    </Button>
                    <Button asChild variant="outline">
                      <a href={document.file.dataUrl} download={document.file.name}><Download className="mr-2 h-4 w-4" />Download</a>
                    </Button>
                    <Button variant="ghost" onClick={() => openEdit(document)}><Edit2 className="mr-2 h-4 w-4" />Edit</Button>
                    <Button variant="ghost" onClick={() => removeDocument(document)}><Trash2 className="mr-2 h-4 w-4 text-destructive" />Delete</Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Document" : "Upload Document"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {!editingId && (
              <div className="sm:col-span-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Drop a file here or click to browse</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF, images, text, Office files, and engineering documents · 1 MB maximum</p>
                  {selectedFile && <p className="mt-3 text-sm text-primary">{selectedFile.name} · {formatFileSize(selectedFile.size)}</p>}
                </div>
                <input ref={fileInputRef} type="file" className="sr-only" onChange={handleFileInput} />
              </div>
            )}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Generator maintenance manual" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <Input value={form.tags.join(", ")} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) }))} placeholder="generator, maintenance, IEC" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Purpose, revision, applicability, and field notes" />
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
              <label className="flex items-center gap-2 text-sm font-medium"><Link2 className="h-4 w-4" />Knowledge relation</label>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                {articles.map((article) => (
                  <label key={article.id} className="flex cursor-pointer items-start gap-2 text-sm">
                    <Checkbox checked={form.relatedKnowledge.includes(article.id)} onCheckedChange={() => toggleRelation("relatedKnowledge", article.id)} />
                    <span>{article.title}</span>
                  </label>
                ))}
                {!articles.length && <p className="text-xs text-muted-foreground">No knowledge articles created.</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveDocument}>{editingId ? "Save Changes" : "Upload Document"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewDocument)} onOpenChange={(open) => { if (!open) setPreviewDocument(null) }}>
        <DialogContent className="h-[90vh] max-w-5xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>{previewDocument?.title}</DialogTitle>
          </DialogHeader>
          {previewDocument?.file.type.startsWith("image/") ? (
            <div className="flex h-[calc(90vh-10rem)] items-center justify-center overflow-auto rounded-lg bg-muted/40 p-4">
              <img src={previewDocument.file.dataUrl} alt={previewDocument.title} className="max-h-full max-w-full object-contain" />
            </div>
          ) : previewDocument && canPreview(previewDocument.file.type) ? (
            <iframe src={previewDocument.file.dataUrl} title={previewDocument.title} className="h-[calc(90vh-10rem)] w-full rounded-lg border" />
          ) : null}
          {previewDocument && (
            <DialogFooter>
              <Button asChild><a href={previewDocument.file.dataUrl} download={previewDocument.file.name}><Download className="mr-2 h-4 w-4" />Download</a></Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
