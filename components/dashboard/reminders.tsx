"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HardHat } from "lucide-react"

export function Reminders() {
  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "500ms" }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-6">Upcoming</h2>
      <div className="space-y-4">
        <div className="bg-secondary/40 border border-border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <h3 className="font-semibold text-foreground mb-1">Substation Walkthrough</h3>
          <p className="text-sm text-muted-foreground mb-4">Today · 02:00 pm — with field supervisor</p>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30">
            <HardHat className="w-4 h-4 mr-2" />
            View Briefing
          </Button>
        </div>
        <div className="bg-secondary/40 border border-border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <h3 className="font-semibold text-foreground mb-1">Weekly Report Due</h3>
          <p className="text-sm text-muted-foreground">Friday · Submit Week 6 learning summary</p>
        </div>
      </div>
    </Card>
  )
}
