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
import { Plus, Trash2, Edit2 } from "lucide-react"
import { EmptyStateCard } from "@/components/shared/empty-state-card"

interface Article {
  id: string
  topic: string
  category: string
  description: string
  importance: "core" | "medium" | "optional"
  mastered: boolean
}

const importanceColors = {
  core: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  optional: "bg-blue-100 text-blue-800",
}

export function TasksContentNew() {
  const [articles, setArticles] = useState<Article[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Article>>({
    topic: "",
    category: "Power Systems",
    description: "",
    importance: "medium",
    mastered: false,
  })

  const handleOpenDialog = (article?: Article) => {
    if (article) {
      setEditingId(article.id)
      setFormData(article)
    } else {
      setEditingId(null)
      setFormData({
        topic: "",
        category: "Power Systems",
        description: "",
        importance: "medium",
        mastered: false,
      })
    }
    setOpenDialog(true)
  }

  const handleSave = () => {
    if (!formData.topic?.trim() || !formData.description?.trim()) return

    if (editingId) {
      setArticles(articles.map((a) => (a.id === editingId ? { ...a, ...formData } : a)))
    } else {
      setArticles([
        ...articles,
        {
          id: Date.now().toString(),
          topic: formData.topic,
          category: formData.category || "Power Systems",
          description: formData.description,
          importance: formData.importance || "medium",
          mastered: formData.mastered || false,
        },
      ])
    }
    setOpenDialog(false)
  }

  const handleDelete = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id))
  }

  const handleToggleMastered = (id: string) => {
    setArticles(articles.map((a) => (a.id === id ? { ...a, mastered: !a.mastered } : a)))
  }

  if (articles.length === 0) {
    return (
      <EmptyStateCard
        icon={Plus}
        title="No knowledge articles yet"
        description="Create your first article to document technical concepts and learning outcomes from your training."
        actionLabel="Create Article"
        onAction={() => handleOpenDialog()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Create Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Article" : "Create Knowledge Article"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Topic</label>
                <Input
                  value={formData.topic || ""}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., Switchgear protection & relay coordination"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={formData.category || "Power Systems"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  >
                    <option>Power Systems</option>
                    <option>Electrical Safety</option>
                    <option>Instrumentation & Control</option>
                    <option>Documentation</option>
                    <option>Operations</option>
                    <option>Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Importance</label>
                  <select
                    value={formData.importance || "medium"}
                    onChange={(e) => setFormData({ ...formData, importance: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  >
                    <option value="core">Core</option>
                    <option value="medium">Medium</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Document what you learned about this topic..."
                  className="min-h-32"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.mastered || false}
                  onChange={(e) => setFormData({ ...formData, mastered: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Mark as mastered</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Article</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {articles.map((article) => (
          <Card
            key={article.id}
            className={`p-5 md:p-6 transition-all cursor-pointer hover:shadow-md ${article.mastered ? "opacity-60" : ""}`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm md:text-base ${article.mastered ? "line-through" : ""}`}>
                    {article.topic}
                  </h3>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(article)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {article.category}
                </Badge>
                <Badge className={`text-xs ${importanceColors[article.importance]}`}>{article.importance}</Badge>
              </div>

              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{article.description}</p>

              {article.mastered && (
                <div className="pt-2 border-t border-border">
                  <span className="text-xs font-medium text-green-600">✓ Proficient</span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleMastered(article.id)}
                className="w-full text-xs h-8 mt-2"
              >
                {article.mastered ? "Mark as Learning" : "Mark Proficient"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
