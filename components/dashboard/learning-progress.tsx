"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

const rings = [
  { label: "Overall Progress", target: 41, sublabel: "All trips" },
  { label: "Current Trip", target: 58, sublabel: "Trip 2 of 4" },
  { label: "Current Week", target: 72, sublabel: "Week 6 of 18" },
]

function ProgressRing({ target, label, sublabel, delay }: { target: number; label: string; sublabel: string; delay: number }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = setTimeout(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= target) {
            clearInterval(timer)
            return target
          }
          return prev + 1
        })
      }, 20)
      return () => clearInterval(timer)
    }, delay)
    return () => clearTimeout(start)
  }, [target, delay])

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="10" fill="none" className="text-muted/30" />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-all duration-300 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{progress}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  )
}

export function LearningProgress() {
  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "100ms" }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-6">Learning Progress</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {rings.map((ring, i) => (
          <ProgressRing key={ring.label} target={ring.target} label={ring.label} sublabel={ring.sublabel} delay={i * 200} />
        ))}
      </div>
    </Card>
  )
}
