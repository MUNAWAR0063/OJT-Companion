"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

const initialObjectives = [
  { id: 1, text: "Review generator excitation system principles", done: true },
  { id: 2, text: "Observe transformer tap-changer operation on site", done: true },
  { id: 3, text: "Study motor protection relay settings (ANSI 49/51)", done: false },
  { id: 4, text: "Document UPS battery bank inspection findings", done: false },
  { id: 5, text: "Read switchgear interlocking sequence manual", done: false },
]

export function TodaysFocus() {
  const [objectives, setObjectives] = useState(initialObjectives)
  const completed = objectives.filter((o) => o.done).length

  const toggle = (id: number) =>
    setObjectives((prev) => prev.map((o) => (o.id === id ? { ...o, done: !o.done } : o)))

  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "200ms" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-foreground">Today&apos;s Focus</h2>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {completed}/{objectives.length} done
        </span>
      </div>
      <div className="space-y-1">
        {objectives.map((obj) => (
          <label
            key={obj.id}
            htmlFor={`obj-${obj.id}`}
            className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-secondary/60"
          >
            <Checkbox id={`obj-${obj.id}`} checked={obj.done} onCheckedChange={() => toggle(obj.id)} className="mt-0.5" />
            <span
              className={`text-sm leading-relaxed transition-colors ${
                obj.done ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {obj.text}
            </span>
          </label>
        ))}
      </div>
    </Card>
  )
}
