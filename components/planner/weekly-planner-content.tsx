"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, tabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  GripVertical,
  Trash2,
  Edit2,
  Plus,
  Filter,
  Search,
} from "lucide-react"
import { useState } from "react"

interface WeeklyTask {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  status: "not-started" | "in-progress" | "completed"
  progress: number
  category: "learning" | "engineering" | "equipment" | "deliverable"
  estimatedHours: number
  completionDate?: string
  notes?: string
  completed?: boolean
}

interface WeekData {
  weekNumber: number
  trip: string
  site: string
  startDate: string
  endDate: string
  overallProgress: number
  tasks: WeeklyTask[]
  reflection?: string
  lessonsLearned?: string[]
  questions?: string[]
}

// Mock data for multiple weeks
const mockWeeks: WeekData[] = [
  {
    weekNumber: 6,
    trip: "Trip 2 of 4",
    site: "Ras Tanura Power Plant",
    startDate: "Nov 18, 2024",
    endDate: "Nov 24, 2024",
    overallProgress: 58,
    tasks: [
      {
        id: "1",
        title: "Generator construction & operating principles",
        priority: "high",
        status: "completed",
        progress: 100,
        category: "learning",
        estimatedHours: 6,
        completionDate: "Nov 20, 2024",
        notes: "Covered excitation systems and synchronous operation",
      },
      {
        id: "2",
        title: "Synchronous generator field testing",
        priority: "high",
        status: "in-progress",
        progress: 75,
        category: "engineering",
        estimatedHours: 8,
        notes: "Performing nameplate verification",
      },
      {
        id: "3",
        title: "Safety procedures documentation",
        priority: "high",
        status: "in-progress",
        progress: 60,
        category: "deliverable",
        estimatedHours: 4,
      },
      {
        id: "4",
        title: "Transformer oil analysis interpretation",
        priority: "medium",
        status: "not-started",
        progress: 0,
        category: "learning",
        estimatedHours: 3,
      },
      {
        id: "5",
        title: "UPS system backup testing",
        priority: "medium",
        status: "not-started",
        progress: 0,
        category: "equipment",
        estimatedHours: 5,
      },
      {
        id: "6",
        title: "Protection relay settings review",
        priority: "medium",
        status: "not-started",
        progress: 0,
        category: "engineering",
        estimatedHours: 6,
      },
    ],
    reflection: "Strong week of foundational knowledge on generators. Ready to move to protection systems.",
    lessonsLearned: ["Excitation affects voltage stability", "Always verify nameplate data before testing"],
    questions: ["How do brushless exciters compare to traditional systems?"],
  },
  {
    weekNumber: 7,
    trip: "Trip 2 of 4",
    site: "Ras Tanura Power Plant",
    startDate: "Nov 25, 2024",
    endDate: "Dec 1, 2024",
    overallProgress: 45,
    tasks: [
      {
        id: "7",
        title: "Protection relay fundamentals",
        priority: "high",
        status: "in-progress",
        progress: 40,
        category: "learning",
        estimatedHours: 8,
      },
      {
        id: "8",
        title: "Switchgear maintenance procedures",
        priority: "high",
        status: "not-started",
        progress: 0,
        category: "deliverable",
        estimatedHours: 4,
      },
    ],
    reflection: "",
    lessonsLearned: [],
    questions: [],
  },
]

const statusColors = {
  "not-started": "bg-muted text-muted-foreground",
  "in-progress": "bg-warning/10 text-warning-foreground border border-warning/30",
  completed: "bg-primary/10 text-primary-foreground border border-primary/30",
}

const priorityColors = {
  high: "bg-destructive/10 text-destructive-foreground",
  medium: "bg-warning/10 text-warning-foreground",
  low: "bg-secondary/10 text-foreground",
}

const categoryColors = {
  learning: "bg-blue-100 text-blue-900",
  engineering: "bg-purple-100 text-purple-900",
  equipment: "bg-orange-100 text-orange-900",
  deliverable: "bg-green-100 text-green-900",
}

export function WeeklyPlannerContent() {
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  const currentWeek = mockWeeks[selectedWeek]

  // Filter tasks
  const filteredTasks = currentWeek.tasks.filter((task) => {
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    const matchesCategory = filterCategory === "all" || task.category === filterCategory
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Week Header */}
      <Card className="p-6 md:p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-0">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Week {currentWeek.weekNumber}</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                {currentWeek.startDate} - {currentWeek.endDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                disabled={selectedWeek === 0}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(Math.min(mockWeeks.length - 1, selectedWeek + 1))}
                disabled={selectedWeek === mockWeeks.length - 1}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">OJT Assignment</p>
              <p className="font-semibold text-foreground">{currentWeek.trip}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Site Location</p>
              <p className="font-semibold text-foreground">{currentWeek.site}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Tasks</p>
              <p className="font-semibold text-foreground">{currentWeek.tasks.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Overall Progress</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${currentWeek.overallProgress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                  {currentWeek.overallProgress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[140px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full sm:w-[140px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[140px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="deliverable">Deliverable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-10 bg-secondary/50">
          <TabsTrigger value="overview" className="text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-sm">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="reflection" className="text-sm">
            Weekly Reflection
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <tabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Learning", "Engineering", "Equipment", "Deliverable"].map((category, idx) => {
              const categoryTasks = currentWeek.tasks.filter((t) => t.category === ["learning", "engineering", "equipment", "deliverable"][idx])
              const completed = categoryTasks.filter((t) => t.status === "completed").length
              return (
                <Card key={category} className="p-4 md:p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">{category} Tasks</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">
                          {completed}/{categoryTasks.length}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{
                            width: categoryTasks.length === 0 ? "0%" : `${(completed / categoryTasks.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {currentWeek.lessonsLearned && currentWeek.lessonsLearned.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Key Lessons Learned</h3>
              <ul className="space-y-2">
                {currentWeek.lessonsLearned.map((lesson, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary font-bold flex-shrink-0">•</span>
                    {lesson}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </tabsContent>

        {/* Tasks Tab */}
        <tabsContent value="tasks" className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No tasks match your filters.</p>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={`p-4 md:p-6 transition-all duration-300 cursor-pointer hover:shadow-md ${
                  expandedTask === task.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="space-y-4">
                  {/* Task Header */}
                  <div
                    className="flex items-start gap-4"
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  >
                    <Checkbox checked={task.status === "completed"} className="mt-1" />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-base leading-snug">{task.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${priorityColors[task.priority]}`}
                        >
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${statusColors[task.status]}`}
                        >
                          {task.status === "not-started"
                            ? "Not Started"
                            : task.status === "in-progress"
                              ? "In Progress"
                              : "Completed"}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right space-y-1">
                      <p className="text-sm font-semibold text-foreground">{task.progress}%</p>
                      <p className="text-xs text-muted-foreground">{task.estimatedHours}h</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 px-0.5">
                    <span className="text-xs font-medium text-muted-foreground w-8">Progress</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTask === task.id && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      {task.notes && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm text-foreground">{task.notes}</p>
                        </div>
                      )}
                      {task.completionDate && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Completion Date</p>
                          <p className="text-sm text-foreground">{task.completionDate}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-2 h-8">
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-2 h-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </tabsContent>

        {/* Reflection Tab */}
        <tabsContent value="reflection" className="space-y-6">
          <Card className="p-6 md:p-8">
            <div className="space-y-6">
              {currentWeek.reflection && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Weekly Reflection</h3>
                  <p className="text-foreground leading-relaxed">{currentWeek.reflection}</p>
                </div>
              )}

              {currentWeek.questions && currentWeek.questions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Unanswered Questions</h3>
                  <ul className="space-y-2">
                    {currentWeek.questions.map((question, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                        <span className="text-primary font-bold flex-shrink-0">?</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!currentWeek.reflection && (!currentWeek.questions || currentWeek.questions.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No reflection or questions yet. Add your weekly reflections here.</p>
                </div>
              )}
            </div>
          </Card>
        </tabsContent>
      </Tabs>
    </div>
  )
}
