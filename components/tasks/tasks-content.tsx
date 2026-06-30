"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { KnowledgeCard } from "@/components/cards/knowledge-card"
import { Search, Filter, CalendarDays } from "lucide-react"
import { useState } from "react"

const entries = [
  {
    id: 1,
    title: "Switchgear protection & relay coordination",
    category: "Power Systems",
    importance: "core",
    description: "Understanding protection systems and relay coordination in switchgear design and operation.",
    updated: "Nov 24, 2024",
    mastered: false,
    tags: ["Protection", "11kV"],
  },
  {
    id: 2,
    title: "Hazardous area classification (Zones 0/1/2)",
    category: "Electrical Safety",
    importance: "core",
    description: "ATEX directive compliance and hazardous area classifications for equipment selection.",
    updated: "Nov 25, 2024",
    mastered: false,
    tags: ["ATEX", "Safety"],
  },
  {
    id: 3,
    title: "4-20mA loop signal fundamentals",
    category: "Instrumentation & Control",
    importance: "medium",
    description: "Industrial standard signal transmission and instrumentation loop basics.",
    updated: "Nov 23, 2024",
    mastered: true,
    tags: ["Signals", "Field"],
  },
  {
    id: 4,
    title: "Reading single line diagrams (SLD)",
    category: "Documentation",
    importance: "medium",
    description: "Interpreting electrical single line diagrams and technical drawings.",
    updated: "Nov 26, 2024",
    mastered: false,
    tags: ["Drawings"],
  },
  {
    id: 5,
    title: "Motor starting methods (DOL, Star-Delta, VFD)",
    category: "Power Systems",
    importance: "core",
    description: "Comparison of motor starting techniques and variable frequency drive applications.",
    updated: "Nov 24, 2024",
    mastered: false,
    tags: ["Motors", "Drives"],
  },
  {
    id: 6,
    title: "Earthing & bonding in process plants",
    category: "Electrical Safety",
    importance: "medium",
    description: "Proper earthing and bonding practices for industrial plant safety systems.",
    updated: "Nov 27, 2024",
    mastered: false,
    tags: ["Earthing"],
  },
]

export function TasksContent() {
  const [filter, setFilter] = useState("all")

  const filteredEntries =
    filter === "all"
      ? entries
      : filter === "mastered"
        ? entries.filter((t) => t.mastered)
        : entries.filter((t) => !t.mastered)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search knowledge entries..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Category
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <CalendarDays className="w-4 h-4" />
            Date
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm">
          All ({entries.length})
        </Button>
        <Button variant={filter === "learning" ? "default" : "outline"} onClick={() => setFilter("learning")} size="sm">
          Learning ({entries.filter((t) => !t.mastered).length})
        </Button>
        <Button
          variant={filter === "mastered" ? "default" : "outline"}
          onClick={() => setFilter("mastered")}
          size="sm"
        >
          Mastered ({entries.filter((t) => t.mastered).length})
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntries.map((entry, index) => (
          <KnowledgeCard
            key={entry.id}
            topic={entry.title}
            category={entry.category}
            description={entry.description}
            importance={entry.importance as "core" | "medium" | "optional"}
            mastered={entry.mastered}
            delay={index * 50}
          />
        ))}
      </div>
    </div>
  )
}
