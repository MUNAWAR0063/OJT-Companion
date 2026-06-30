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
import { Plus, Trash2, Edit2, ArrowRight } from "lucide-react"
import { EmptyStateCard } from "@/components/shared/empty-state-card"

interface Equipment {
  id: string
  name: string
  type: string
  manufacturer?: string
  rating?: string
  location?: string
  description?: string
  notes?: string
  checklist?: { id: string; text: string; completed: boolean }[]
}

export function EquipmentLibraryNew() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: "",
    type: "transformer",
    manufacturer: "",
    rating: "",
    location: "",
    description: "",
    notes: "",
  })

  const handleOpenDialog = (equipment?: Equipment) => {
    if (equipment) {
      setEditingId(equipment.id)
      setFormData(equipment)
    } else {
      setEditingId(null)
      setFormData({
        name: "",
        type: "transformer",
        manufacturer: "",
        rating: "",
        location: "",
        description: "",
        notes: "",
      })
    }
    setOpenDialog(true)
  }

  const handleSave = () => {
    if (!formData.name?.trim()) return

    if (editingId) {
      setEquipmentList(equipmentList.map((e) => (e.id === editingId ? { ...e, ...formData } : e)))
    } else {
      setEquipmentList([
        ...equipmentList,
        {
          id: Date.now().toString(),
          name: formData.name,
          type: formData.type || "transformer",
          manufacturer: formData.manufacturer,
          rating: formData.rating,
          location: formData.location,
          description: formData.description,
          notes: formData.notes,
          checklist: [],
        },
      ])
    }
    setOpenDialog(false)
  }

  const handleDelete = (id: string) => {
    setEquipmentList(equipmentList.filter((e) => e.id !== id))
  }

  if (equipmentList.length === 0) {
    return (
      <EmptyStateCard
        icon={Plus}
        title="No equipment has been added"
        description="Start cataloging the transformers, switchgear, motors, and other equipment you encounter during your OJT."
        actionLabel="Add Equipment"
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
              Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Equipment" : "Add New Equipment"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Equipment Name</label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Synchronous Generator"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={formData.type || "transformer"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  >
                    <option value="transformer">Transformer</option>
                    <option value="generator">Generator</option>
                    <option value="motor">Motor</option>
                    <option value="switchgear">Switchgear</option>
                    <option value="ups">UPS</option>
                    <option value="relay">Protection Relay</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Manufacturer</label>
                  <Input
                    value={formData.manufacturer || ""}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="Equipment manufacturer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Rating/Capacity</label>
                  <Input
                    value={formData.rating || ""}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="e.g., 25 MVA"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Site location"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Equipment specifications and details"
                  className="min-h-24"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Maintenance history, operational notes, etc."
                  className="min-h-20"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Equipment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {equipmentList.map((equipment) => (
          <Card key={equipment.id} className="p-5 md:p-6 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base truncate">{equipment.name}</h3>
                <Badge variant="outline" className="text-xs mt-2">
                  {equipment.type}
                </Badge>
              </div>
              <div className="flex gap-1 flex-shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(equipment)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(equipment.id)}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {equipment.manufacturer && (
              <p className="text-xs text-muted-foreground mb-2">
                <span className="font-medium">Manufacturer:</span> {equipment.manufacturer}
              </p>
            )}
            {equipment.rating && (
              <p className="text-xs text-muted-foreground mb-2">
                <span className="font-medium">Rating:</span> {equipment.rating}
              </p>
            )}
            {equipment.location && (
              <p className="text-xs text-muted-foreground mb-3">
                <span className="font-medium">Location:</span> {equipment.location}
              </p>
            )}

            {equipment.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{equipment.description}</p>
            )}

            {equipment.notes && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2 italic">Note: {equipment.notes}</p>
            )}

            <Button variant="outline" className="w-full gap-1 mt-auto text-xs h-8" size="sm">
              View Details
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
