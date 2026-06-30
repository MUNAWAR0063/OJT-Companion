"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, Zap } from "lucide-react"
import { useApp, type Equipment } from "@/lib/app-context"

export function EquipmentLibraryInteractive() {
  const { equipment, addEquipment, deleteEquipment } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    manufacturer: "",
    rating: "",
    location: "",
    description: "",
    notes: "",
  })

  const handleAddEquipment = () => {
    if (formData.name && formData.type) {
      addEquipment({
        name: formData.name,
        type: formData.type,
        manufacturer: formData.manufacturer,
        rating: formData.rating,
        location: formData.location,
        description: formData.description,
        notes: formData.notes,
        documents: [],
        photos: [],
        lessonsLearned: [],
      })

      setFormData({
        name: "",
        type: "",
        manufacturer: "",
        rating: "",
        location: "",
        description: "",
        notes: "",
      })
      setIsOpen(false)
    }
  }

  if (equipment.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6 py-8">
          <Zap className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">No equipment cataloged</h3>
            <p className="text-xs text-muted-foreground">Start building your equipment library by adding items you study</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="mx-auto gap-2">
                <Plus className="w-4 h-4" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Equipment</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Equipment Name*</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Synchronous Generator"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Type*</label>
                  <Input
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Generator, Transformer, Motor"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-2 block">Manufacturer</label>
                    <Input
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="e.g., Siemens"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-2 block">Rating</label>
                    <Input
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      placeholder="e.g., 25 MVA"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Main Substation"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add details about this equipment"
                    className="min-h-24"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Initial Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add your observations and notes"
                    className="min-h-20"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEquipment} disabled={!formData.name || !formData.type}>
                  Add Equipment
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
        <h2 className="text-lg font-semibold">Equipment Library ({equipment.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Equipment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium mb-2 block">Equipment Name*</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Synchronous Generator"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Type*</label>
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., Generator, Transformer, Motor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Manufacturer</label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g., Siemens"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-2 block">Rating</label>
                  <Input
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="e.g., 25 MVA"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Substation"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add details about this equipment"
                  className="min-h-24"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Initial Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add your observations and notes"
                  className="min-h-20"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEquipment} disabled={!formData.name || !formData.type}>
                Add Equipment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map((eq) => (
          <Card key={eq.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{eq.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{eq.type}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteEquipment(eq.id)}
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {eq.manufacturer && (
              <p className="text-xs text-muted-foreground mb-2">
                <span className="font-medium">Mfr:</span> {eq.manufacturer}
              </p>
            )}
            {eq.rating && (
              <p className="text-xs text-muted-foreground mb-2">
                <span className="font-medium">Rating:</span> {eq.rating}
              </p>
            )}
            {eq.location && (
              <p className="text-xs text-muted-foreground mb-3">
                <span className="font-medium">Location:</span> {eq.location}
              </p>
            )}

            {eq.description && (
              <p className="text-xs text-foreground/80 mb-3 line-clamp-2">{eq.description}</p>
            )}

            {eq.notes && (
              <div className="bg-secondary/50 rounded p-2 text-xs mb-3">
                <p className="font-medium mb-1">Notes</p>
                <p className="text-muted-foreground line-clamp-2">{eq.notes}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
