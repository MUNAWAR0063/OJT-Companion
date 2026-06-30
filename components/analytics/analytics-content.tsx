"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, BookOpen, CheckCircle, Clock, Target, ArrowUpRight } from "lucide-react"
import { useState } from "react"

const stats = [
  { title: "Competencies Met", value: "12/30", change: "+3", trend: "up", icon: CheckCircle },
  { title: "Topics Studied", value: "48", change: "+12", trend: "up", icon: BookOpen },
  { title: "Field Hours", value: "96", subtitle: "hrs", change: "+18", trend: "up", icon: Clock },
  { title: "Program Progress", value: "33", subtitle: "%", change: "+6%", trend: "up", icon: Target },
]

const monthlyData = [
  { month: "Week 1", tasks: 32, projects: 8 },
  { month: "Week 2", tasks: 45, projects: 9 },
  { month: "Week 3", tasks: 52, projects: 10 },
  { month: "Week 4", tasks: 61, projects: 11 },
  { month: "Week 5", tasks: 58, projects: 12 },
  { month: "Week 6", tasks: 72, projects: 12 },
]

export function AnalyticsContent() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const maxTasks = Math.max(...monthlyData.map((d) => d.tasks))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ animationDelay: `${index * 100}ms` }}
            className={`bg-card text-foreground p-4 transition-all duration-500 ease-out animate-slide-in-up cursor-pointer ${
              hoveredCard === index ? "scale-105 shadow-2xl" : "shadow-lg"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-xs font-medium opacity-90">{stat.title}</h3>
              </div>
              <div
                className={`w-6 h-6 rounded-full bg-primary flex items-center justify-center transition-transform duration-300 ${
                  hoveredCard === index ? "rotate-45" : ""
                }`}
              >
                <ArrowUpRight className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-2">
              {stat.value}
              {stat.subtitle && <span className="text-base font-normal ml-1">{stat.subtitle}</span>}
            </p>
            <div className="flex items-center gap-1.5 text-xs opacity-80">
              {stat.trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-danger" />
              )}
              <span className={stat.trend === "up" ? "text-success" : "text-danger"}>{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-6">Weekly Learning Volume</h3>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div
                key={data.month}
                className="space-y-2 animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{data.month}</span>
                  <span className="text-muted-foreground">{data.tasks} notes</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(data.tasks / maxTasks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-6">Competency Areas</h3>
          <div className="space-y-4">
            {[
              { name: "Power Systems", count: 5, color: "bg-primary" },
              { name: "Instrumentation & Control", count: 3, color: "bg-info" },
              { name: "Electrical Safety", count: 3, color: "bg-warning" },
              { name: "Maintenance & Reliability", count: 1, color: "bg-success" },
            ].map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:shadow-md transition-all duration-300 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-2xl font-bold text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
