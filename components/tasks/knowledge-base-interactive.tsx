"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, BookOpen, Star } from "lucide-react"
import { useApp } from "@/lib/app-context"

export function KnowledgeBaseInteractive() {
  const { articles, addArticle, deleteArticle, updateArticle } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    importance: "medium" as "core" | "medium" | "optional",
  })
  const [tagInput, setTagInput] = useState("")

  const handleAddArticle = () => {
    if (!formData.title.trim()) {
      toast.error("Article title is required")
      return
    }
    if (!formData.content.trim()) {
      toast.error("Article content is required")
      return
    }
    if (!formData.category.trim()) {
      toast.error("Article category is required")
      return
    }

    addArticle({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags.split(",").filter((t) => t.trim()),
      importance: formData.importance,
      mastered: false,
    })

    toast.success(`Article "${formData.title}" added to knowledge base`)

    setFormData({
      title: "",
      content: "",
      category: "",
      tags: "",
      importance: "medium",
    })
    setIsOpen(false)
  }

  if (articles.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6 py-8">
          <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Knowledge Base Empty</h3>
            <p className="text-xs text-muted-foreground">Create articles to capture technical knowledge and lessons learned</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="mx-auto gap-2">
                <Plus className="w-4 h-4" />
                Add Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Knowledge Article</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Title*</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Generator Excitation Systems"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-2 block">Category*</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Power Systems"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-2 block">Importance</label>
                    <select
                      value={formData.importance}
                      onChange={(e) => setFormData({ ...formData, importance: e.target.value as "core" | "medium" | "optional" })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                    >
                      <option value="core">Core Competency</option>
                      <option value="medium">Medium Priority</option>
                      <option value="optional">Optional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Tags (comma-separated)</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., generator, avr, field-winding"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Content*</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your technical notes, observations, and key learnings..."
                    className="min-h-40"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddArticle}
                  disabled={!formData.title || !formData.content || !formData.category}
                >
                  Create Article
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    )
  }

  const categories = [...new Set(articles.map((a) => a.category))]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Knowledge Base ({articles.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Knowledge Article</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium mb-2 block">Title*</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Generator Excitation Systems"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Category*</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Power Systems"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-2 block">Importance</label>
                  <select
                    value={formData.importance}
                    onChange={(e) => setFormData({ ...formData, importance: e.target.value as "core" | "medium" | "optional" })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                  >
                    <option value="core">Core Competency</option>
                    <option value="medium">Medium Priority</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Tags (comma-separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., generator, avr, field-winding"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Content*</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your technical notes, observations, and key learnings..."
                  className="min-h-40"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddArticle}
                disabled={!formData.title || !formData.content || !formData.category}
              >
                Create Article
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles
              .filter((a) => a.category === category)
              .map((article) => (
                <Card key={article.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{article.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        {article.importance === "core" && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">Core</span>
                        )}
                        {article.importance === "medium" && (
                          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-700 text-xs rounded font-medium">Medium</span>
                        )}
                        {article.importance === "optional" && (
                          <span className="px-2 py-1 bg-gray-500/10 text-gray-700 text-xs rounded font-medium">Optional</span>
                        )}
                        {article.mastered && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <Star className="w-3 h-3 fill-green-600" />
                            Mastered
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteArticle(article.id)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-xs text-foreground/80 mb-3 line-clamp-3">{article.content}</p>

                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateArticle(article.id, {
                          mastered: !article.mastered,
                        })
                      }
                      className="w-full text-xs"
                    >
                      {article.mastered ? "Mark as Learning" : "Mark as Mastered"}
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
