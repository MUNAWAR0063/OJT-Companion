"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, FileText, Upload } from "lucide-react"
import { useApp } from "@/lib/app-context"

export function DocumentsInteractive() {
  const { documents, addDocument, deleteDocument } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleAddDocument = async () => {
    if (formData.name && selectedFile && formData.category) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string

        addDocument({
          name: formData.name,
          type: selectedFile.type,
          category: formData.category,
          description: formData.description,
          size: selectedFile.size,
          uploadedAt: new Date(),
          data: base64,
        })

        setFormData({
          name: "",
          description: "",
          category: "",
        })
        setSelectedFile(null)
        setIsOpen(false)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  if (documents.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6 py-8">
          <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">No documents uploaded</h3>
            <p className="text-xs text-muted-foreground">Upload diagrams, datasheets, and standards for field reference</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="mx-auto gap-2">
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Document Name*</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Generator Maintenance Manual"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Category*</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Manual, Datasheet, Diagram"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add notes about this document"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Select File*</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-foreground font-medium">Click to upload file</p>
                    <p className="text-xs text-muted-foreground">or drag and drop</p>
                    {selectedFile && (
                      <p className="text-xs text-primary mt-2">Selected: {selectedFile.name}</p>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddDocument}
                  disabled={!formData.name || !selectedFile || !formData.category}
                >
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    )
  }

  const categories = [...new Set(documents.map((d) => d.category))]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Documents ({documents.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium mb-2 block">Document Name*</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Generator Maintenance Manual"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Category*</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Manual, Datasheet, Diagram"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add notes about this document"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Select File*</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-foreground font-medium">Click to upload file</p>
                  <p className="text-xs text-muted-foreground">or drag and drop</p>
                  {selectedFile && (
                    <p className="text-xs text-primary mt-2">Selected: {selectedFile.name}</p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddDocument}
                disabled={!formData.name || !selectedFile || !formData.category}
              >
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents
              .filter((d) => d.category === category)
              .map((doc) => (
                <Card key={doc.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDocument(doc.id)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {doc.description && (
                    <p className="text-xs text-foreground/80 mb-3 line-clamp-2">{doc.description}</p>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = doc.data
                      link.download = doc.name
                      link.click()
                    }}
                  >
                    Download
                  </Button>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
