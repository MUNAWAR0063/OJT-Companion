"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, BookOpen, CheckCircle, Clock, Target, ZapOff } from "lucide-react"
import { useApp } from "@/lib/app-context"

export function AnalyticsContentDynamic() {
  const { weeklyPlans, articles, fieldNotes, documents, photos, equipment, getStats } = useApp()
  const stats = getStats()

  const competenciesStats = [
    {
      title: "Equipment Cataloged",
      value: stats.equipmentCount.toString(),
      icon: ZapOff,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Knowledge Articles",
      value: stats.articleCount.toString(),
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Field Notes",
      value: stats.fieldNoteCount.toString(),
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Documents",
      value: stats.documentCount.toString(),
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ]

  const completionRate = stats.totalObjectives > 0 ? Math.round((stats.completedObjectives / stats.totalObjectives) * 100) : 0
  
  // Calculate current week progress (most recent week only)
  const currentWeek = weeklyPlans.length > 0 ? weeklyPlans[weeklyPlans.length - 1] : null
  const weekProgress =
    currentWeek && currentWeek.objectives.length > 0
      ? Math.round((currentWeek.objectives.filter((o) => o.status === "completed").length / currentWeek.objectives.length) * 100)
      : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {competenciesStats.map((stat, index) => (
          <Card
            key={stat.title}
            className={`p-4 transition-all duration-500 ease-out animate-slide-in-up cursor-pointer hover:shadow-lg ${
              index % 2 === 0 ? "hover:scale-105" : ""
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 ${stat.bgColor} rounded-full`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <h3 className="text-xs font-medium opacity-90">{stat.title}</h3>
              </div>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {stat.value === "0" ? "Add your first item" : "items recorded"}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-6">Weekly Plans Overview</h3>
          {weeklyPlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No weekly plans created yet</p>
              <p className="text-xs text-muted-foreground/60 mt-2">Start by creating your first weekly plan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyPlans.slice(-6).map((plan, index) => (
                <div key={plan.id} className="space-y-2 animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Week {plan.weekNumber}</span>
                    <span className="text-muted-foreground">{plan.objectives.length} objectives</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${
                          plan.objectives.length > 0
                            ? Math.round(
                                (plan.objectives.filter((o) => o.status === "completed").length /
                                  plan.objectives.length) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-6">Learning Metrics</h3>
          <div className="space-y-4">
            {[
              {
                name: "Objectives Completed",
                count: stats.completedObjectives,
                max: stats.totalObjectives,
                color: "bg-primary",
              },
              { name: "Equipment Items", count: stats.equipmentCount, max: 20, color: "bg-blue-500" },
              { name: "Knowledge Articles", count: stats.articleCount, max: 30, color: "bg-purple-500" },
              { name: "Field Notes", count: stats.fieldNoteCount, max: 50, color: "bg-green-500" },
            ].map((metric, index) => (
              <div
                key={metric.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:shadow-md transition-all duration-300 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${metric.color}`} />
                  <span className="font-medium text-sm">{metric.name}</span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {metric.count}/{metric.max}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Overall Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Objectives Completion Rate</span>
              <span className="text-2xl font-bold">{completionRate}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">This Week Progress</span>
              <span className="text-2xl font-bold">{weekProgress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${weekProgress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
