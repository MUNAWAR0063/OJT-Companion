"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NotebookPen } from "lucide-react"
import Link from "next/link"
import { useJournalStore } from "@/lib/journal-store"

export function RecentJournal() {
  const entries = useJournalStore((state) => state.entries)
  const latest = [...entries].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null

  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "600ms" }}
    >
      <div className="space-y-6 text-center py-8">
        <NotebookPen className="w-12 h-12 text-muted-foreground/50 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {latest ? latest.title : "No journal entries yet"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {latest
              ? `${latest.date} · ${entries.length} ${entries.length === 1 ? "entry" : "entries"} recorded`
              : "Document your daily activities, lessons, problems, and reflections."}
          </p>
        </div>
        <Link href="/team">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <NotebookPen className="w-3 h-3" />
            {latest ? "Open Daily Journal" : "Write Journal Entry"}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
