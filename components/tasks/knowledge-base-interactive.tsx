"use client"

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  Edit2,
  FileText,
  Hash,
  Link2,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownPreview } from "@/components/tasks/markdown-preview"
import { useEquipmentStore } from "@/lib/equipment-store"
import {
  useKnowledgeStore,
  type KnowledgeArticle,
  type KnowledgeArticleInput,
} from "@/lib/knowledge-store"
import { useDisciplineWorkspace } from "@/lib/discipline/use-discipline-workspace"

const defaultCategories = [
  "Power Systems",
  "Electrical Safety",
  "Instrumentation & Control",
  "Operations",
  "Maintenance",
  "Standards & Compliance",
  "Lessons Learned",
]

const starterTemplates = ["Lesson Learned", "Technical Note", "Troubleshooting", "Procedure Summary", "Safety Insight"]

const emptyForm: KnowledgeArticleInput = {
  title: "",
  category: "Power Systems",
  tags: [],
  crossReferences: [],
  relatedEquipment: [],
  relatedStandards: [],
}

function articleToForm(article: KnowledgeArticle): KnowledgeArticleInput {
  return {
    title: article.title,
    category: article.category,
    tags: article.tags,
    crossReferences: article.crossReferences,
    relatedEquipment: article.relatedEquipment,
    relatedStandards: article.relatedStandards,
  }
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  return `${Math.round(size / 1024)} KB`
}

export function KnowledgeBaseInteractive() {
  const workspace = useDisciplineWorkspace()
  const allArticles = useKnowledgeStore((state) => state.articles)
  const articles = useMemo(() => workspace.filter(allArticles), [allArticles, workspace])
  const selectedArticleId = useKnowledgeStore((state) => state.selectedArticleId)
  const createArticle = useKnowledgeStore((state) => state.createArticle)
  const updateArticle = useKnowledgeStore((state) => state.updateArticle)
  const updateContent = useKnowledgeStore((state) => state.updateContent)
  const deleteArticle = useKnowledgeStore((state) => state.deleteArticle)
  const selectArticle = useKnowledgeStore((state) => state.selectArticle)
  const addChecklistItem = useKnowledgeStore((state) => state.addChecklistItem)
  const toggleChecklistItem = useKnowledgeStore((state) => state.toggleChecklistItem)
  const deleteChecklistItem = useKnowledgeStore((state) => state.deleteChecklistItem)
  const addAttachment = useKnowledgeStore((state) => state.addAttachment)
  const deleteAttachment = useKnowledgeStore((state) => state.deleteAttachment)
  const allEquipment = useEquipmentStore((state) => state.equipment)
  const equipment = useMemo(() => workspace.filter(allEquipment), [allEquipment, workspace])
  const selectEquipment = useEquipmentStore((state) => state.selectEquipment)

  const selectedArticle = articles.find((article) => article.id === selectedArticleId) ?? null
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<KnowledgeArticleInput>(emptyForm)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")
  const [draft, setDraft] = useState(() => selectedArticle?.content ?? "")
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving...">("Saved")
  const [checklistInput, setChecklistInput] = useState("")
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSave = useRef<{ id: string; content: string } | null>(null)

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (pendingSave.current) {
        useKnowledgeStore.getState().updateContent(pendingSave.current.id, pendingSave.current.content)
      }
    },
    []
  )

  const categories = useMemo(
    () => Array.from(new Set([...workspace.configuration.knowledgeTopics, ...defaultCategories, ...articles.map((article) => article.category)])).sort(),
    [articles, workspace.configuration.knowledgeTopics]
  )
  const tags = useMemo(
    () => Array.from(new Set(articles.flatMap((article) => article.tags))).sort(),
    [articles]
  )
  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase()
    return articles.filter(
      (article) =>
        (categoryFilter === "all" || article.category === categoryFilter) &&
        (tagFilter === "all" || article.tags.includes(tagFilter)) &&
        (!query ||
          article.title.toLowerCase().includes(query) ||
          article.category.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          article.relatedStandards.some((standard) => standard.toLowerCase().includes(query)))
    )
  }, [articles, categoryFilter, search, tagFilter])

  const flushDraft = () => {
    if (!selectedArticle || draft === selectedArticle.content) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    updateContent(selectedArticle.id, draft)
    pendingSave.current = null
    setSaveStatus("Saved")
  }

  const openArticle = (article: KnowledgeArticle) => {
    flushDraft()
    setDraft(article.content)
    setSaveStatus("Saved")
    selectArticle(article.id)
  }

  const changeDraft = (content: string) => {
    if (!selectedArticle) return
    setDraft(content)
    setSaveStatus("Saving...")
    if (saveTimer.current) clearTimeout(saveTimer.current)
    const articleId = selectedArticle.id
    pendingSave.current = { id: articleId, content }
    saveTimer.current = setTimeout(() => {
      updateContent(articleId, content)
      pendingSave.current = null
      setSaveStatus("Saved")
    }, 500)
  }

  const backToLibrary = () => {
    flushDraft()
    selectArticle(null)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, tags: [], crossReferences: [], relatedEquipment: [], relatedStandards: [] })
    setDialogOpen(true)
  }

  const openEdit = (article: KnowledgeArticle) => {
    setEditingId(article.id)
    setForm(articleToForm(article))
    setDialogOpen(true)
  }

  const saveArticle = () => {
    if (!form.title.trim() || !form.category.trim()) {
      toast.error("Title and category are required")
      return
    }
    if (editingId) {
      updateArticle(editingId, form)
      toast.success("Article updated")
    } else {
      const article = createArticle(form)
      setDraft(article.content)
      toast.success("Article created")
    }
    setDialogOpen(false)
  }

  const removeArticle = (article: KnowledgeArticle) => {
    if (!window.confirm(`Delete "${article.title}" and its attachments?`)) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    pendingSave.current = null
    deleteArticle(article.id)
    toast.success("Article deleted")
  }

  const toggleReference = (field: "crossReferences" | "relatedEquipment", id: string) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(id)
        ? current[field].filter((item) => item !== id)
        : [...current[field], id],
    }))
  }

  const addChecklist = () => {
    if (!selectedArticle || !checklistInput.trim()) return
    addChecklistItem(selectedArticle.id, checklistInput)
    setChecklistInput("")
  }

  const handleAttachments = (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedArticle) return
    const files = Array.from(event.target.files ?? [])
    let queuedBytes = articles.reduce(
      (total, article) => total + article.attachments.reduce((sum, attachment) => sum + attachment.size, 0),
      0
    )
    files.forEach((file) => {
      if (file.size > 1024 * 1024) {
        toast.error(`${file.name} exceeds the 1 MB local attachment limit`)
        return
      }
      if (queuedBytes + file.size > 2 * 1024 * 1024) {
        toast.error("The 2 MB knowledge-base attachment budget has been reached")
        return
      }
      queuedBytes += file.size
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result !== "string") return
        addAttachment(selectedArticle.id, {
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
      {selectedArticle ? (
        <>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="space-y-3">
              <Button variant="ghost" className="-ml-3" onClick={backToLibrary}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Knowledge Base
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold">{selectedArticle.title}</h2>
                  <Badge>{selectedArticle.category}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {selectedArticle.tags.map((tag) => <Badge key={tag} variant="secondary">#{tag}</Badge>)}
                  <span className="text-xs text-muted-foreground">
                    Updated {new Date(selectedArticle.updatedAt).toLocaleString()} · {saveStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openEdit(selectedArticle)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit details
              </Button>
              <Button variant="outline" onClick={() => removeArticle(selectedArticle)}>
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <Card>
              <Tabs defaultValue="write">
                <CardHeader className="border-b pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-base">Markdown article</CardTitle>
                    <TabsList>
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <TabsContent value="write" className="m-0">
                  <Textarea
                    value={draft}
                    onChange={(event) => changeDraft(event.target.value)}
                    className="min-h-[620px] resize-y rounded-none border-0 font-mono text-sm focus-visible:ring-0"
                    placeholder="# Article title&#10;&#10;Write Markdown here..."
                    aria-label="Markdown editor"
                  />
                </TabsContent>
                <TabsContent value="preview" className="m-0">
                  <CardContent className="min-h-[620px] p-6">
                    <MarkdownPreview content={draft} articles={articles} onSelectArticle={(id) => {
                      const article = articles.find((item) => item.id === id)
                      if (article) openArticle(article)
                    }} />
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Link2 className="h-4 w-4" /> Cross references</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {selectedArticle.crossReferences.length ? selectedArticle.crossReferences.map((id) => {
                    const article = articles.find((item) => item.id === id)
                    return article ? (
                      <button key={id} onClick={() => openArticle(article)} className="flex w-full items-center justify-between rounded-md border p-2 text-left text-sm hover:bg-muted">
                        <span className="truncate">{article.title}</span><ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : null
                  }) : <p className="text-sm text-muted-foreground">No linked articles.</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Wrench className="h-4 w-4" /> Related equipment</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {selectedArticle.relatedEquipment.length ? selectedArticle.relatedEquipment.map((id) => {
                    const item = equipment.find((equipmentItem) => equipmentItem.id === id)
                    return item ? (
                      <Button key={id} asChild variant="outline" className="w-full justify-between">
                        <Link href="/equipment" onClick={() => selectEquipment(item.id)}>
                          <span className="truncate">{item.name}</span><ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    ) : null
                  }) : <p className="text-sm text-muted-foreground">No related equipment.</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" /> Related standards</CardTitle></CardHeader>
                <CardContent>
                  {selectedArticle.relatedStandards.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.relatedStandards.map((standard) => <Badge key={standard} variant="outline">{standard}</Badge>)}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No standards referenced.</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CheckCircle2 className="h-4 w-4" /> Checklist</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={checklistInput}
                      onChange={(event) => setChecklistInput(event.target.value)}
                      onKeyDown={(event) => { if (event.key === "Enter") addChecklist() }}
                      placeholder="Review action"
                    />
                    <Button size="icon" onClick={addChecklist} aria-label="Add checklist item"><Plus className="h-4 w-4" /></Button>
                  </div>
                  {selectedArticle.checklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <Checkbox className="mt-0.5" checked={item.done} onCheckedChange={() => toggleChecklistItem(selectedArticle.id, item.id)} />
                      <span className={`flex-1 text-sm ${item.done ? "text-muted-foreground line-through" : ""}`}>{item.text}</span>
                      <button onClick={() => deleteChecklistItem(selectedArticle.id, item.id)} aria-label={`Delete ${item.text}`}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                  {!selectedArticle.checklist.length && <p className="text-sm text-muted-foreground">No checklist items.</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2"><Paperclip className="h-4 w-4" /> Attachments</span>
                    <Button asChild size="sm" variant="outline">
                      <label className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" /> Add
                        <input type="file" multiple className="sr-only" onChange={handleAttachments} />
                      </label>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedArticle.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 rounded-md border p-2">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(attachment.size)}</p>
                      </div>
                      <a href={attachment.dataUrl} download={attachment.name} aria-label={`Download ${attachment.name}`}><Download className="h-4 w-4" /></a>
                      <button onClick={() => deleteAttachment(selectedArticle.id, attachment.id)} aria-label={`Delete ${attachment.name}`}><Trash2 className="h-4 w-4 text-destructive" /></button>
                    </div>
                  ))}
                  {!selectedArticle.attachments.length && <p className="text-sm text-muted-foreground">No attachments.</p>}
                  <p className="text-xs text-muted-foreground">Local only: 1 MB per file, 2 MB total.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">Personal engineering wiki</h2>
              <p className="text-sm text-muted-foreground">
                {articles.length} articles for {workspace.configuration.label}
              </p>
            </div>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Create Article</Button>
          </div>

          {articles.length > 0 && (
            <div className="grid gap-3 md:grid-cols-[1fr_220px_200px]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search titles, content, tags, or standards..." />
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

          {articles.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Create your first engineering note</h3>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Capture lessons learned, troubleshooting notes, procedures, and field observations.
                  </p>
                </div>
                <div className="flex max-w-xl flex-wrap justify-center gap-2">
                  {starterTemplates.map((template) => (
                    <Badge key={template} variant="secondary">{template}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
                  <Button className="h-auto min-h-9 min-w-0 whitespace-normal px-2 py-2 text-xs leading-tight sm:h-9 sm:whitespace-nowrap sm:px-4 sm:text-sm" onClick={openCreate}><Plus className="h-4 w-4" />Create Article</Button>
                  <Button className="h-auto min-h-9 min-w-0 whitespace-normal px-2 py-2 text-xs leading-tight sm:h-9 sm:whitespace-nowrap sm:px-4 sm:text-sm" variant="outline" onClick={() => console.log("Use Template clicked")}>Use Template</Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredArticles.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-14 text-center"><Search className="mx-auto mb-3 h-9 w-9 text-muted-foreground" /><h3 className="font-semibold">No matching articles</h3><p className="mt-1 text-sm text-muted-foreground">Change the search or filters.</p></CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="flex flex-col transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Badge variant="secondary" className="mb-2">{article.category}</Badge>
                        <CardTitle className="line-clamp-2 text-lg">{article.title}</CardTitle>
                      </div>
                      <BookOpen className="h-5 w-5 shrink-0 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col space-y-4">
                    <p className="line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">{article.content.replace(/[#*`>\[\]]/g, "")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.map((tag) => <Badge key={tag} variant="outline"><Hash className="mr-1 h-3 w-3" />{tag}</Badge>)}
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                      <span>{article.crossReferences.length} links · {article.attachments.length} files</span>
                      <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" variant="outline" onClick={() => openArticle(article)}>Open Article<ArrowRight className="ml-2 h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(article)} aria-label={`Edit ${article.title}`}><Edit2 className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => removeArticle(article)} aria-label={`Delete ${article.title}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Article Details" : "Create Knowledge Article"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Generator excitation systems" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <Input value={form.tags.join(", ")} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) }))} placeholder="generator, avr, protection" />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Related standards</label>
              <Textarea value={form.relatedStandards.join("\n")} onChange={(event) => setForm((current) => ({ ...current, relatedStandards: event.target.value.split("\n") }))} placeholder={"One standard per line\nIEC 60034\nIEEE 421.5"} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cross references</label>
              <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                {articles.filter((article) => article.id !== editingId).map((article) => (
                  <label key={article.id} className="flex cursor-pointer items-start gap-2 text-sm">
                    <Checkbox checked={form.crossReferences.includes(article.id)} onCheckedChange={() => toggleReference("crossReferences", article.id)} />
                    <span>{article.title}</span>
                  </label>
                ))}
                {!articles.filter((article) => article.id !== editingId).length && <p className="text-xs text-muted-foreground">Create another article to link it.</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Related equipment</label>
              <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                {equipment.map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-start gap-2 text-sm">
                    <Checkbox checked={form.relatedEquipment.includes(item.id)} onCheckedChange={() => toggleReference("relatedEquipment", item.id)} />
                    <span>{item.name}</span>
                  </label>
                ))}
                {!equipment.length && <p className="text-xs text-muted-foreground">No equipment cataloged.</p>}
              </div>
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 sm:flex sm:flex-row sm:justify-end">
            <Button className="h-auto min-h-9 min-w-0 whitespace-normal px-2 py-2 text-xs leading-tight sm:h-9 sm:whitespace-nowrap sm:px-4 sm:text-sm" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="h-auto min-h-9 min-w-0 whitespace-normal px-2 py-2 text-xs leading-tight sm:h-9 sm:whitespace-nowrap sm:px-4 sm:text-sm" onClick={saveArticle}>{editingId ? "Save Changes" : "Create Article"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
