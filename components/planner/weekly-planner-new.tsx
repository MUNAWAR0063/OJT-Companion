"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { EmptyStateCard } from "@/components/shared/empty-state-card"

interface Task {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  status: "not-started" | "in-progress" | "completed"
  progress: number
  category: "learning" | "engineering" | "equipment" | "deliverable"
  estimatedHours: number
  completed?: boolean
  notes?: string
}

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
}

const statusColors = {
  "not-started": "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
}

export function WeeklyPlannerNew() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    priority: "medium",
    status: "not-started",
    progress: 0,
    category: "learning",
    estimatedHours: 0,
    notes: "",
  })

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingId(task.id)
      setFormData(task)
    } else {
      setEditingId(null)
      setFormData({
        title: "",
        priority: "medium",
        status: "not-started",
        progress: 0,
        category: "learning",
        estimatedHours: 0,
        notes: "",
      })
    }
    setOpenDialog(true)
  }

  const handleSave = () => {
    if (!formData.title?.trim()) return

    if (editingId) {
      setTasks(tasks.map((t) => (t.id === editingId ? { ...t, ...formData } : t)))
    } else {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          title: formData.title,
          priority: formData.priority || "medium",
          status: formData.status || "not-started",
          progress: formData.progress || 0,
          category: formData.category || "learning",
          estimatedHours: formData.estimatedHours || 0,
          notes: formData.notes,
        },
      ])
    }
    setOpenDialog(false)
  }

  const handleDelete = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              status: !t.completed ? "completed" : "not-started",
              progress: !t.completed ? 100 : 0,
            }
          : t,
      ),
    )
  }

  if (tasks.length === 0) {
    return (
      <EmptyStateCard
        icon={Plus}
        title="No weekly plans yet"
        description="Create your first weekly task to get started with planning your learning objectives."
        actionLabel="Create Weekly Plan"
        onAction={() => handleOpenDialog()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Weekly Tasks</h3>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Task" : "Create New Task"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="deliverable">Deliverable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Estimated Hours</label>
                  <Input
                    type="number"
                    value={formData.estimatedHours || 0}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={task.completed || false}
                onCheckedChange={() => handleToggleComplete(task.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className={`font-semibold text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </h4>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(task)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                  <Badge className={`text-xs ${statusColors[task.status]}`}>{task.status}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {task.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{task.estimatedHours}h</span>
                </div>
                {task.notes && <p className="text-xs text-muted-foreground">{task.notes}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
