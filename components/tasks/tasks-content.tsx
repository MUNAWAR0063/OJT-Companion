"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, FolderTree, Tag, CalendarDays } from "lucide-react"
import { useState } from "react"

const entries = [
  {
    id: 1,
    title: "Switchgear protection & relay coordination",
    category: "Power Systems",
    importance: "Core",
    updated: "Nov 24, 2024",
    mastered: false,
    tags: ["Protection", "11kV"],
  },
  {
    id: 2,
    title: "Hazardous area classification (Zones 0/1/2)",
    category: "Electrical Safety",
    importance: "Core",
    updated: "Nov 25, 2024",
    mastered: false,
    tags: ["ATEX", "Safety"],
  },
  {
    id: 3,
    title: "4-20mA loop signal fundamentals",
    category: "Instrumentation & Control",
    importance: "Medium",
    updated: "Nov 23, 2024",
    mastered: true,
    tags: ["Signals", "Field"],
  },
  {
    id: 4,
    title: "Reading single line diagrams (SLD)",
    category: "Documentation",
    importance: "Medium",
    updated: "Nov 26, 2024",
    mastered: false,
    tags: ["Drawings"],
  },
  {
    id: 5,
    title: "Motor starting methods (DOL, Star-Delta, VFD)",
    category: "Power Systems",
    importance: "Core",
    updated: "Nov 24, 2024",
    mastered: false,
    tags: ["Motors", "Drives"],
  },
  {
    id: 6,
    title: "Earthing & bonding in process plants",
    category: "Electrical Safety",
    importance: "Medium",
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

      <div className="grid gap-4">
        {filteredEntries.map((entry, index) => (
          <Card
            key={entry.id}
            className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              <Checkbox checked={entry.mastered} className="mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className={`font-semibold text-foreground ${entry.mastered ? "line-through opacity-60" : ""}`}>
                    {entry.title}
                  </h3>
                  <Badge
                    variant={entry.importance === "Core" ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {entry.importance}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FolderTree className="w-4 h-4" />
                    {entry.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    Updated {entry.updated}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
