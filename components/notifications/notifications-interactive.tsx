"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/app-context"
import { Calendar, BookOpen, Zap, FileText, Image, BarChart3, NotebookPen, AlertCircle } from "lucide-react"

type ActivityType = "plan" | "equipment" | "article" | "document" | "photo" | "report" | "fieldnote"

interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: Date
  icon: React.ReactNode
}

export function NotificationsInteractive() {
  const { weeklyPlans, equipment, articles, documents, photos, reports, fieldNotes } = useApp()

  // Generate activity feed from all sources
  const activities: Activity[] = [
    ...weeklyPlans.map((plan) => ({
      id: plan.id,
      type: "plan" as const,
      title: `Weekly Plan: Week ${plan.weekNumber}`,
      description: `${plan.tripName} at ${plan.location} (${plan.objectives.length} objectives)`,
      timestamp: plan.startDate,
      icon: <Calendar className="w-5 h-5" />,
    })),
    ...equipment.map((eq) => ({
      id: eq.id,
      type: "equipment" as const,
      title: "Equipment Added",
      description: `${eq.name} (${eq.type})`,
      timestamp: new Date(), // Equipment doesn't have timestamps, using current
      icon: <Zap className="w-5 h-5" />,
    })),
    ...articles.map((article) => ({
      id: article.id,
      type: "article" as const,
      title: "Knowledge Article",
      description: `${article.title} - ${article.category}`,
      timestamp: new Date(), // Articles don't have timestamps
      icon: <BookOpen className="w-5 h-5" />,
    })),
    ...documents.map((doc) => ({
      id: doc.id,
      type: "document" as const,
      title: "Document Uploaded",
      description: `${doc.name} (${doc.category})`,
      timestamp: doc.uploadedAt,
      icon: <FileText className="w-5 h-5" />,
    })),
    ...photos.map((photo) => ({
      id: photo.id,
      type: "photo" as const,
      title: "Photo Added",
      description: `${photo.title}${photo.location ? ` at ${photo.location}` : ""}`,
      timestamp: new Date(), // Photos don't have timestamps
      icon: <Image className="w-5 h-5" />,
    })),
    ...reports.map((report) => ({
      id: report.id,
      type: "report" as const,
      title: "Report Generated",
      description: report.title,
      timestamp: report.generatedAt,
      icon: <BarChart3 className="w-5 h-5" />,
    })),
    ...fieldNotes.map((note) => ({
      id: note.id,
      type: "fieldnote" as const,
      title: "Field Note",
      description: note.title,
      timestamp: new Date(note.date),
      icon: <NotebookPen className="w-5 h-5" />,
    })),
  ]

  // Sort by most recent first
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const getActivityColor = (type: ActivityType) => {
    const colors = {
      plan: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      equipment: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      article: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      document: "bg-green-500/10 text-green-700 dark:text-green-400",
      photo: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
      report: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      fieldnote: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
    }
    return colors[type]
  }

  const getActivityBadge = (type: ActivityType) => {
    const badges = {
      plan: "Weekly Plan",
      equipment: "Equipment",
      article: "Knowledge",
      document: "Document",
      photo: "Photo",
      report: "Report",
      fieldnote: "Field Note",
    }
    return badges[type]
  }

  if (activities.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6 py-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">No activity yet</h3>
            <p className="text-xs text-muted-foreground">
              Your activities will appear here as you create weekly plans, add equipment, documents, and more
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-lg mt-0.5 ${getActivityColor(activity.type)}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">{activity.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {getActivityBadge(activity.type)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
