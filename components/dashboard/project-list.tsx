"use client"

import { Card } from "@/components/ui/card"
import { Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

const documents = [
  { name: "Single Line Diagram — Substation A", type: "Drawing · PDF", color: "bg-primary/15 text-primary" },
  { name: "Motor Datasheet — P-101", type: "Datasheet · PDF", color: "bg-sky-500/15 text-sky-500" },
  { name: "Hazardous Area Classification", type: "Standard · PDF", color: "bg-amber-500/15 text-amber-500" },
  { name: "Relay Coordination Study", type: "Report · DOCX", color: "bg-indigo-500/15 text-indigo-400" },
  { name: "Cable Schedule Register", type: "Sheet · XLSX", color: "bg-emerald-500/15 text-emerald-500" },
]

export function ProjectList() {
  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "700ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Documents</h2>
        <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 bg-transparent">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div
            key={doc.name}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-all duration-300 cursor-pointer group"
            style={{ animationDelay: `${800 + index * 100}ms` }}
          >
            <div
              className={`${doc.color} w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">{doc.name}</p>
              <p className="text-xs text-muted-foreground">{doc.type}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
