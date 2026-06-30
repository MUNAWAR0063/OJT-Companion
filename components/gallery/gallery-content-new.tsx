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
import { Plus, Trash2, Image as ImageIcon } from "lucide-react"
import { EmptyStateCard } from "@/components/shared/empty-state-card"

interface Photo {
  id: string
  title: string
  uploadDate: string
  location?: string
  tags: string[]
  description?: string
}

export function GalleryContentNew() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState<Partial<Photo>>({
    title: "",
    uploadDate: new Date().toISOString().split("T")[0],
    location: "",
    tags: [],
    description: "",
  })
  const [tagInput, setTagInput] = useState("")

  const handleOpenDialog = () => {
    setFormData({
      title: "",
      uploadDate: new Date().toISOString().split("T")[0],
      location: "",
      tags: [],
      description: "",
    })
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
    if (!formData.title?.trim()) return

    setPhotos([
      ...photos,
      {
        id: Date.now().toString(),
        title: formData.title,
        uploadDate: formData.uploadDate || new Date().toISOString().split("T")[0],
        location: formData.location,
        tags: formData.tags || [],
        description: formData.description,
      },
    ])
    setOpenDialog(false)
  }

  const handleDelete = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id))
  }

  if (photos.length === 0) {
    return (
      <EmptyStateCard
        icon={Plus}
        title="No photos uploaded"
        description="Capture and annotate photos of installations, equipment, and field conditions to document your learning."
        actionLabel="Upload Photo"
        onAction={handleOpenDialog}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Upload Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Photo Title</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Transformer installation - Plant A"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Where was it taken?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Upload Date</label>
                  <Input
                    type="date"
                    value={formData.uploadDate || ""}
                    onChange={(e) => setFormData({ ...formData, uploadDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's in the photo and why it's important..."
                  className="min-h-24"
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
              <Button onClick={handleSave}>Upload Photo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {photos.map((photo) => (
          <Card key={photo.id} className="p-5 md:p-6 hover:shadow-md transition-shadow flex flex-col">
            <div className="w-full h-40 bg-gradient-to-br from-muted to-muted-foreground rounded-md mb-4 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>

            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm md:text-base line-clamp-2 flex-1">{photo.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(photo.id)}
                className="h-8 w-8 p-0 text-destructive flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {photo.location && (
              <p className="text-xs text-muted-foreground mb-2">
                <span className="font-medium">Location:</span> {photo.location}
              </p>
            )}

            <p className="text-xs text-muted-foreground mb-3">
              <span className="font-medium">Uploaded:</span> {photo.uploadDate}
            </p>

            {photo.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{photo.description}</p>}

            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
                {photo.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
