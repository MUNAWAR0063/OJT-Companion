"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, CalendarDays, MoreHorizontal } from "lucide-react"

const journalEntries = [
  {
    title: "Transformer tap-changer inspection",
    location: "Substation A — 33/11kV",
    date: "Nov 27, 2024",
    week: "Week 6",
    summary:
      "Observed on-load tap changer operation and recorded oil temperature readings. Noted the importance of Buchholz relay alarms during switching.",
    tags: ["Power Systems", "Field Observation"],
  },
  {
    title: "Control room DCS handover",
    location: "Central Control Room",
    date: "Nov 26, 2024",
    week: "Week 6",
    summary:
      "Shadowed the shift handover. Learned how alarms are prioritized and how trends are used to spot abnormal process conditions early.",
    tags: ["Instrumentation", "Operations"],
  },
  {
    title: "Permit to work walkthrough",
    location: "Process Area 2",
    date: "Nov 25, 2024",
    week: "Week 5",
    summary:
      "Reviewed isolation and LOTO procedure before maintenance on a 415V MCC. Reinforced the hierarchy of energy isolation steps.",
    tags: ["Electrical Safety", "LOTO"],
  },
  {
    title: "Cable termination practice",
    location: "Workshop",
    date: "Nov 22, 2024",
    week: "Week 5",
    summary:
      "Hands-on practice glanding and terminating armoured cable. Understood the role of correct gland selection for hazardous areas.",
    tags: ["Installation", "Hands-on"],
  },
]

export function TeamContent() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {journalEntries.map((entry, index) => (
          <Card
            key={entry.title}
            className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">
                    {entry.week}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {entry.date}
                  </span>
                </div>
                <h3 className="font-semibold text-lg leading-snug text-balance">{entry.title}</h3>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">Entry options</span>
              </Button>
            </div>

            <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4 shrink-0" />
              {entry.location}
            </p>

            <p className="text-[15px] text-muted-foreground leading-relaxed reading-width mb-4">{entry.summary}</p>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
