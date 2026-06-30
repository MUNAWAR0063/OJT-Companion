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
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {journalEntries.map((entry, index) => (
          <Card
            key={entry.title}
            className="p-6 md:p-8 hover:shadow-lg transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4 gap-2">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {entry.week}
                  </Badge>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <CalendarDays className="w-4 h-4" />
                    {entry.date}
                  </span>
                </div>
                <h3 className="font-semibold text-base md:text-lg leading-snug text-balance">{entry.title}</h3>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9">
                <MoreHorizontal className="w-5 h-5" />
                <span className="sr-only">Entry options</span>
              </Button>
            </div>

            <p className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MapPin className="w-5 h-5 shrink-0" />
              {entry.location}
            </p>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">{entry.summary}</p>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
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
