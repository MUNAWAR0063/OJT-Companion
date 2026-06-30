"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, NotebookPen } from "lucide-react"
import { useApp } from "@/lib/app-context"

export function FieldNotesInteractive() {
  const { fieldNotes, addFieldNote, deleteFieldNote } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    tags: "",
    equipment: "",
  })

  const handleAddNote = () => {
    if (!formData.title.trim()) {
      toast.error("Field note title is required")
      return
    }
    if (!formData.content.trim()) {
      toast.error("Field note content is required")
      return
    }

    addFieldNote({
      title: formData.title,
      content: formData.content,
      date: new Date(formData.date),
      tags: formData.tags.split(",").filter((t) => t.trim()),
      equipment: formData.equipment.split(",").filter((e) => e.trim()),
    })

    toast.success(`Field note "${formData.title}" added`)

    setFormData({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      tags: "",
      equipment: "",
    })
    setIsOpen(false)
  }

  if (fieldNotes.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6 py-8">
          <NotebookPen className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">No field notes yet</h3>
            <p className="text-xs text-muted-foreground">Document daily observations and learnings from the field</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="mx-auto gap-2">
                <Plus className="w-4 h-4" />
                Write Field Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Field Note</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Title*</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Generator Observation Today"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Field Notes*</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Document your observations, measurements, issues, and learnings..."
                    className="min-h-40"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Equipment Related (comma-separated)</label>
                  <Input
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    placeholder="e.g., Generator, Transformer, AVR"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Tags (comma-separated)</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., observation, troubleshooting, maintenance"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote} disabled={!formData.title || !formData.content}>
                  Save Note
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Field Notes ({fieldNotes.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Field Note</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium mb-2 block">Title*</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Generator Observation Today"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Field Notes*</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Document your observations, measurements, issues, and learnings..."
                  className="min-h-40"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Equipment Related (comma-separated)</label>
                <Input
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  placeholder="e.g., Generator, Transformer, AVR"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Tags (comma-separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., observation, troubleshooting, maintenance"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={!formData.title || !formData.content}>
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {fieldNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((note) => (
          <Card key={note.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold">{note.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(note.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteFieldNote(note.id)}
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-foreground/80 mb-3 line-clamp-2">{note.content}</p>

            {note.equipment.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Equipment:</p>
                <div className="flex flex-wrap gap-1.5">
                  {note.equipment.map((eq) => (
                    <span key={eq} className="px-2 py-1 bg-blue-500/10 text-blue-700 text-xs rounded">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
