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
import { Plus, Trash2, Download, FileText } from "lucide-react"
import { EmptyStateCard } from "@/components/shared/empty-state-card"

interface Document {
  id: string
  title: string
  type: string
  category: string
  uploadDate: string
  description?: string
  fileName?: string
}

export function DocumentsContentNew() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState<Partial<Document>>({
    title: "",
    type: "diagram",
    category: "Power Systems",
    uploadDate: new Date().toISOString().split("T")[0],
    description: "",
  })

  const handleOpenDialog = () => {
    setFormData({
      title: "",
      type: "diagram",
      category: "Power Systems",
      uploadDate: new Date().toISOString().split("T")[0],
      description: "",
    })
    setOpenDialog(true)
  }

  const handleSave = () => {
    if (!formData.title?.trim()) return

    setDocuments([
      ...documents,
      {
        id: Date.now().toString(),
        title: formData.title,
        type: formData.type || "diagram",
        category: formData.category || "Power Systems",
        uploadDate: formData.uploadDate || new Date().toISOString().split("T")[0],
        description: formData.description,
        fileName: `${formData.title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      },
    ])
    setOpenDialog(false)
  }

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id))
  }

  if (documents.length === 0) {
    return (
      <EmptyStateCard
        icon={Plus}
        title="No documents uploaded"
        description="Upload single-line diagrams, datasheets, procedures, and engineering standards for quick reference."
        actionLabel="Upload Document"
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
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Document Title</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Single-line diagram - Ras Tanura Plant"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Document Type</label>
                  <select
                    value={formData.type || "diagram"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  >
                    <option value="diagram">Single-line Diagram</option>
                    <option value="datasheet">Datasheet</option>
                    <option value="procedure">Procedure</option>
                    <option value="standard">Standard</option>
                    <option value="manual">Manual</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={formData.category || "Power Systems"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  >
                    <option>Power Systems</option>
                    <option>Instrumentation</option>
                    <option>Safety</option>
                    <option>Operations</option>
                    <option>Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Document details and relevance"
                  className="min-h-24"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Upload Document</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-5 md:p-6 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-sm md:text-base line-clamp-2">{doc.title}</h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(doc.id)}
                className="h-8 w-8 p-0 text-destructive flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {doc.type}
              </Badge>
              <Badge className="text-xs bg-blue-100 text-blue-800">{doc.category}</Badge>
            </div>

            {doc.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{doc.description}</p>}

            <p className="text-xs text-muted-foreground mb-3">Uploaded: {doc.uploadDate}</p>

            <Button variant="outline" className="w-full gap-2 mt-auto text-xs h-8" size="sm">
              <Download className="w-3 h-3" />
              Download
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
