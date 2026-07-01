"use client"

import { Card } from "@/components/ui/card"
import { MapPin, CalendarDays, Plane } from "lucide-react"
import { getProfileDisplayName, useUserProfileStore } from "@/lib/user-profile-store"
import { usePlannerStore } from "@/lib/planner-store"
import { useEquipmentStore } from "@/lib/equipment-store"
import { useKnowledgeStore } from "@/lib/knowledge-store"
import { useJournalStore } from "@/lib/journal-store"
import { useDocumentStore } from "@/lib/document-store"
import { useGalleryStore } from "@/lib/gallery-store"
import { useStandardsStore } from "@/lib/standards-store"

export function WelcomeCard() {
  const profile = useUserProfileStore((state) => state.profile)
  const userName = getProfileDisplayName(profile)
  const weeklyPlans = usePlannerStore((state) => state.weeks)
  const equipment = useEquipmentStore((state) => state.equipment)
  const knowledgeArticles = useKnowledgeStore((state) => state.articles)
  const journalEntries = useJournalStore((state) => state.entries)
  const documents = useDocumentStore((state) => state.documents)
  const galleryPhotos = useGalleryStore((state) => state.photos)
  const standards = useStandardsStore((state) => state.standards)
  const currentWeek = weeklyPlans.length > 0 ? weeklyPlans[weeklyPlans.length - 1].weekNumber : 0
  const totalWeeks = 18

  const details = [
    { icon: Plane, label: "Weekly Plans Created", value: `${weeklyPlans.length} weeks` },
    { icon: CalendarDays, label: "Current Progress", value: `Week ${currentWeek}/${totalWeeks}` },
    { icon: MapPin, label: "Data Collected", value: `${equipment.length + knowledgeArticles.length + journalEntries.length + documents.length + galleryPhotos.length + standards.length} items` },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"

  return (
    <Card className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up relative border-l-2 border-l-primary">
      <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">{greeting}</p>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-balance text-foreground">{userName}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {details.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
              <p className="text-sm font-semibold truncate text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
