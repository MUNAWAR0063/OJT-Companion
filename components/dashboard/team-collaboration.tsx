"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Zap, Gauge, ShieldCheck, Cpu } from "lucide-react"

const entries = [
  {
    title: "Switchgear Protection Relays",
    category: "Power Systems",
    status: "Reviewed",
    statusColor: "bg-primary/15 text-primary",
    icon: Zap,
    iconColor: "bg-primary/15 text-primary",
  },
  {
    title: "Flow & Pressure Instrumentation",
    category: "Instrumentation & Control",
    status: "Studying",
    statusColor: "bg-amber-500/15 text-amber-500",
    icon: Gauge,
    iconColor: "bg-amber-500/15 text-amber-500",
  },
  {
    title: "Hazardous Area Classification",
    category: "Electrical Safety",
    status: "Studying",
    statusColor: "bg-amber-500/15 text-amber-500",
    icon: ShieldCheck,
    iconColor: "bg-sky-500/15 text-sky-500",
  },
  {
    title: "PLC & DCS Architecture",
    category: "Automation",
    status: "Draft",
    statusColor: "bg-muted text-muted-foreground",
    icon: Cpu,
    iconColor: "bg-indigo-500/15 text-indigo-400",
  },
]

export function TeamCollaboration() {
  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "600ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Recent Knowledge Entries</h2>
        <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 bg-transparent">
          <Plus className="w-4 h-4 mr-1" />
          New Entry
        </Button>
      </div>
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={entry.title}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-all duration-300 cursor-pointer group"
            style={{ animationDelay: `${650 + index * 100}ms` }}
          >
            <div
              className={`${entry.iconColor} w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
            >
              <entry.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{entry.title}</p>
              <p className="text-xs text-muted-foreground truncate">{entry.category}</p>
            </div>
            <span
              className={`${entry.statusColor} text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300 group-hover:scale-105 whitespace-nowrap`}
            >
              {entry.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
