"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { MapPin, CalendarDays, Trash2, Edit2, Plus } from "lucide-react"
import { EmptyStateCard } from "@/components/shared/empty-state-card"

interface JournalEntry {
  id: string
  title: string
  location: string
  date: string
  summary: string
  tags: string[]
  checklist?: { id: string; text: string; completed: boolean }[]
}

export function TeamContentNew() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    title: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    summary: "",
    tags: [],
    checklist: [],
  })
  const [tagInput, setTagInput] = useState("")

  const handleOpenDialog = (entry?: JournalEntry) => {
    if (entry) {
      setEditingId(entry.id)
      setFormData(entry)
    } else {
      setEditingId(null)
      setFormData({
        title: "",
        location: "",
        date: new Date().toISOString().split("T")[0],
        summary: "",
        tags: [],
        checklist: [],
      })
    }
    setTagInput("")
    setOpenDialog(true)
  }

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    })
  }

  const handleSave = () => {
    if (!formData.title?.trim() || !formData.location?.trim() || !formData.summary?.trim()) return

    if (editingId) {
      setEntries(entries.map((e) => (e.id === editingId ? { ...e, ...formData } : e)))
    } else {
      setEntries([
        ...entries,
        {
          id: Date.now().toString(),
          title: formData.title,
          location: formData.location,
          date: formData.date || new Date().toISOString().split("T")[0],
          summary: formData.summary,
          tags: formData.tags || [],
          checklist: formData.checklist || [],
        },
      ])
    }
    setOpenDialog(false)
  }

  const handleDelete = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const handleToggleChecklistItem = (entryId: string, itemId: string) => {
    setEntries(
      entries.map((e) =>
        e.id === entryId
          ? {
              ...e,
              checklist: (e.checklist || []).map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item,
              ),
            }
          : e,
      ),
    )
  }

  if (entries.length === 0) {
    return (
      <EmptyStateCard
        icon={Plus}
        title="No journal entries"
        description="Start documenting your field observations and learning experiences."
        actionLabel="Create Journal"
        onAction={() => handleOpenDialog()}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              New Field Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Field Note" : "Create Field Note"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Entry title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Site location"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={formData.date || ""}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Observations</label>
                <Textarea
                  value={formData.summary || ""}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Document your field observations..."
                  className="min-h-32"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    placeholder="Add tag and press Enter"
                  />
                  <Button onClick={handleAddTag} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="text-xs cursor-pointer">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {entries.map((entry, index) => (
          <Card
            key={entry.id}
            className="p-6 md:p-8 hover:shadow-lg transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4 gap-2">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <CalendarDays className="w-4 h-4" />
                    {entry.date}
                  </span>
                </div>
                <h3 className="font-semibold text-base md:text-lg leading-snug text-balance">{entry.title}</h3>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(entry)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MapPin className="w-5 h-5 shrink-0" />
              {entry.location}
            </p>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">{entry.summary}</p>

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {entry.checklist && entry.checklist.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Checklist</p>
                {entry.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(entry.id, item.id)}
                      className="rounded border-border"
                    />
                    <span className={`text-xs ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
