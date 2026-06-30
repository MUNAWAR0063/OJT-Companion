"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, Image as ImageIcon, Upload } from "lucide-react"
import { useApp } from "@/lib/app-context"
import Image from "next/image"

export function GalleryInteractive() {
  const { photos, addPhoto, deletePhoto } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    tags: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddPhoto = () => {
    if (!formData.title.trim()) {
      toast.error("Photo title is required")
      return
    }
    if (!selectedFile || !preview) {
      toast.error("Please select a photo to upload")
      return
    }

    addPhoto({
      title: formData.title,
      location: formData.location,
      description: formData.description,
      tags: formData.tags.split(",").filter((t) => t.trim()),
      data: preview,
    })

    toast.success(`Photo "${formData.title}" added to gallery`)

    setFormData({
      title: "",
      location: "",
      description: "",
      tags: "",
    })
    setSelectedFile(null)
    setPreview("")
    setIsOpen(false)
  }

  if (photos.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6 py-8">
          <ImageIcon className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">No photos yet</h3>
            <p className="text-xs text-muted-foreground">Build a visual record of equipment and site visits</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="mx-auto gap-2">
                <Upload className="w-4 h-4" />
                Add Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Photo</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Photo Title*</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Main Generator Installation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-2 block">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Main Substation"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-2 block">Tags</label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="e.g., generator, installation"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add notes about this photo"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Select Photo*</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-foreground font-medium">Click to upload photo</p>
                    <p className="text-xs text-muted-foreground">or drag and drop</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                  />
                  {preview && (
                    <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden bg-secondary">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPhoto}
                  disabled={!formData.title || !preview}
                >
                  Add Photo
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
        <h2 className="text-lg font-semibold">Photo Gallery ({photos.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Photo</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium mb-2 block">Photo Title*</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Main Generator Installation"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Main Substation"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-2 block">Tags</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., generator, installation"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add notes about this photo"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Select Photo*</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-foreground font-medium">Click to upload photo</p>
                  <p className="text-xs text-muted-foreground">or drag and drop</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*"
                />
                {preview && (
                  <div className="mt-3 relative w-full h-40 rounded-lg overflow-hidden bg-secondary">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddPhoto}
                disabled={!formData.title || !preview}
              >
                Add Photo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="relative h-40 bg-secondary overflow-hidden">
              <img
                src={photo.data}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deletePhoto(photo.id)}
                className="absolute top-2 right-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3">
              <h3 className="font-semibold text-sm">{photo.title}</h3>
              {photo.location && (
                <p className="text-xs text-muted-foreground mt-1">{photo.location}</p>
              )}
              {photo.description && (
                <p className="text-xs text-foreground/80 mt-2 line-clamp-2">{photo.description}</p>
              )}
              {photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {photo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
