"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, ArrowRight } from "lucide-react"

const focusAreas = ["Switchgear & Protection", "Power Distribution", "Earthing Systems"]

export function MobileAppCard() {
  return (
    <Card
      className="bg-foreground text-background p-4 transition-all duration-500 hover:shadow-2xl animate-slide-in-up overflow-hidden relative group"
      style={{ animationDelay: "900ms" }}
    >
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 200 60"
          preserveAspectRatio="none"
          style={{ height: "100px" }}
        >
          <path
            d="M0,30 Q25,15 50,30 T100,30 T150,30 T200,30 L200,60 L0,60 Z"
            fill="oklch(0.63 0.16 250)"
            opacity="0.3"
          />
          <path d="M0,40 Q25,25 50,40 T100,40 T150,40 T200,40 L200,60 L0,60 Z" fill="oklch(0.63 0.16 250)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5" />
          <span className="text-xs font-medium opacity-70">Current Phase · Week 6 of 18</span>
        </div>
        <h2 className="text-xl font-bold mb-1">Substation Systems</h2>
        <p className="text-xs opacity-80 mb-4">Core focus areas for this rotation</p>

        <div className="flex flex-col gap-2 mb-4">
          {focusAreas.map((area) => (
            <div key={area} className="flex items-center gap-2 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-background/70" />
              {area}
            </div>
          ))}
        </div>

        <Button
          variant="secondary"
          className="w-full h-10 bg-background text-foreground hover:bg-background/90 transition-all duration-300 hover:scale-105 gap-2"
        >
          View Phase Plan
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
