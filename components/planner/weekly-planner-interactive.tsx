"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, Edit, Check, Circle } from "lucide-react"
import { useApp, type WeeklyPlan, type WeeklyObjective } from "@/lib/app-context"

export function WeeklyPlannerInteractive() {
  const { weeklyPlans, addWeeklyPlan, updateWeeklyPlan, deleteWeeklyPlan } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    weekNumber: (weeklyPlans.length + 1).toString(),
    tripNumber: 1,
    tripName: "",
    location: "",
    objectives: [] as Partial<WeeklyObjective>[],
  })
  const [objectiveInput, setObjectiveInput] = useState("")

  const handleAddObjective = () => {
    if (objectiveInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [
          ...prev.objectives,
          {
            id: Math.random().toString(36).substr(2, 9),
            title: objectiveInput,
            description: "",
            priority: "medium" as const,
            status: "not-started" as const,
            checklist: [],
            equipment: [],
            notes: "",
            progress: 0,
          },
        ],
      }))
      setObjectiveInput("")
    }
  }

  const handleRemoveObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }))
  }

  const handleCreateWeek = async () => {
    if (!formData.tripName.trim()) {
      toast.error("Trip name is required")
      return
    }
    if (!formData.location.trim()) {
      toast.error("Location is required")
      return
    }
    if (formData.objectives.length === 0) {
      toast.error("Add at least one objective")
      return
    }

    setIsLoading(true)

    try {
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 7)

      addWeeklyPlan({
        weekNumber: parseInt(formData.weekNumber),
        startDate,
        endDate,
        tripNumber: formData.tripNumber,
        tripName: formData.tripName,
        location: formData.location,
        objectives: formData.objectives as WeeklyObjective[],
      })

      toast.success(`Week ${formData.weekNumber} plan created successfully`)

      setFormData({
        weekNumber: (weeklyPlans.length + 2).toString(),
        tripNumber: 1,
        tripName: "",
        location: "",
        objectives: [],
      })
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (weeklyPlans.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6 py-8">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">No weekly plans created</h3>
            <p className="text-xs text-muted-foreground">Create your first weekly plan to start tracking objectives</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="mx-auto gap-2">
                <Plus className="w-4 h-4" />
                Create Weekly Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Weekly Plan</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-2 block">Week Number</label>
                    <Input
                      type="number"
                      value={formData.weekNumber}
                      onChange={(e) => setFormData({ ...formData, weekNumber: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-2 block">Trip Number</label>
                    <Input
                      type="number"
                      value={formData.tripNumber}
                      onChange={(e) => setFormData({ ...formData, tripNumber: parseInt(e.target.value) })}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Trip Name</label>
                  <Input
                    value={formData.tripName}
                    onChange={(e) => setFormData({ ...formData, tripName: e.target.value })}
                    placeholder="e.g., Generator Inspection"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Ras Tanura Power Plant"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block">Weekly Objectives</label>
                  <div className="space-y-2">
                    {formData.objectives.map((obj, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-secondary rounded text-sm">
                        <span>{obj.title}</span>
                        <button
                          onClick={() => handleRemoveObjective(i)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Input
                      value={objectiveInput}
                      onChange={(e) => setObjectiveInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddObjective()}
                      placeholder="Add an objective"
                      className="text-sm"
                    />
                    <Button size="sm" onClick={handleAddObjective}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWeek} disabled={!formData.tripName || !formData.location || formData.objectives.length === 0 || isLoading}>
                  {isLoading ? "Creating..." : "Create Plan"}
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
        <h2 className="text-lg font-semibold">Weekly Plans ({weeklyPlans.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Week
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Weekly Plan</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Week Number</label>
                  <Input
                    type="number"
                    value={formData.weekNumber}
                    onChange={(e) => setFormData({ ...formData, weekNumber: e.target.value })}
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-2 block">Trip Number</label>
                  <Input
                    type="number"
                    value={formData.tripNumber}
                    onChange={(e) => setFormData({ ...formData, tripNumber: parseInt(e.target.value) })}
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Trip Name</label>
                <Input
                  value={formData.tripName}
                  onChange={(e) => setFormData({ ...formData, tripName: e.target.value })}
                  placeholder="e.g., Generator Inspection"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Ras Tanura Power Plant"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block">Weekly Objectives</label>
                <div className="space-y-2">
                  {formData.objectives.map((obj, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-secondary rounded text-sm">
                      <span>{obj.title}</span>
                      <button
                        onClick={() => handleRemoveObjective(i)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  <Input
                    value={objectiveInput}
                    onChange={(e) => setObjectiveInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddObjective()}
                    placeholder="Add an objective"
                    className="text-sm"
                  />
                  <Button size="sm" onClick={handleAddObjective}>
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWeek} disabled={!formData.tripName || !formData.location || formData.objectives.length === 0 || isLoading}>
                {isLoading ? "Creating..." : "Create Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {weeklyPlans.map((plan) => {
          const completedCount = plan.objectives.filter((obj) => obj.status === "completed").length
          const progressPercent = Math.round((completedCount / plan.objectives.length) * 100) || 0

          return (
            <Card key={plan.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold">Week {plan.weekNumber}: {plan.tripName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.location}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    deleteWeeklyPlan(plan.id)
                    toast.success(`Week ${plan.weekNumber} deleted`)
                  }}
                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span>Progress: {completedCount}/{plan.objectives.length}</span>
                  <span className="font-semibold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {plan.objectives.map((obj) => (
                  <div key={obj.id} className="flex items-center gap-2 p-2 rounded bg-secondary/50 text-sm">
                    {obj.status === "completed" ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={obj.status === "completed" ? "line-through text-muted-foreground" : ""}>{obj.title}</span>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
