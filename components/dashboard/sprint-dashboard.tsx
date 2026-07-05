"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  CircuitBoard,
  Clock3,
  FileText,
  Images,
  MapIcon,
  NotebookPen,
  Plane,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { useDocumentStore } from "@/lib/document-store"
import { useEquipmentStore } from "@/lib/equipment-store"
import { useGalleryStore } from "@/lib/gallery-store"
import { useJournalStore } from "@/lib/journal-store"
import { useKnowledgeStore } from "@/lib/knowledge-store"
import { usePlannerStore, type PlannerPriority } from "@/lib/planner-store"
import { generateWeeklyPlansFromRoadmap } from "@/lib/roadmap-planner-integration.mjs"
import { useRoadmapStore } from "@/lib/roadmap-store"
import { useReportStore } from "@/lib/report-store"
import { useStandardsStore } from "@/lib/standards-store"
import { useWorkspaceProgress } from "@/lib/workspace-progress"
import { useDisciplineWorkspace } from "@/lib/discipline/use-discipline-workspace"

const priorityRank: Record<PlannerPriority, number> = { follow_up: 0, high: 1, medium: 2, low: 3 }

const onboardingItems = [
  "Review your Learning Roadmap",
  "Open Week 1 Planner",
  "Complete your first task",
  "Write your first Daily Journal",
  "Add your first equipment observation",
]

function CountWidget({
  title,
  count,
  countLabel,
  href,
  icon: Icon,
}: {
  title: string
  count: number
  countLabel: string
  href: string
  icon: typeof CircuitBoard
}) {
  const pluralLabel = countLabel.endsWith("y")
    ? `${countLabel.slice(0, -1)}ies`
    : `${countLabel}s`

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="flex h-full min-w-0 flex-col p-3 sm:p-5">
        <div className="w-fit rounded-lg bg-primary/10 p-1.5 text-primary sm:p-2">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <h3 className="mt-3 text-sm font-semibold sm:mt-4 sm:text-base">{title}</h3>
          <p className="mt-1 text-lg font-semibold leading-tight tracking-tight sm:mt-2 sm:text-2xl">
            {count} {count === 1 ? countLabel : pluralLabel}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mt-3 w-fit px-3 sm:mt-4">
          <Link href={href}>Open <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function SprintDashboard() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const workspace = useDisciplineWorkspace()
  const progressSummary = useWorkspaceProgress()
  const roadmaps = useRoadmapStore((state) => state.roadmaps)
  const selectedRoadmapId = useRoadmapStore((state) => state.selectedRoadmapId)
  const storedPlannerWeeks = usePlannerStore((state) => state.weeks)
  const selectedPlannerWeekId = usePlannerStore((state) => state.selectedWeekId)
  const allEquipment = useEquipmentStore((state) => state.equipment)
  const allArticles = useKnowledgeStore((state) => state.articles)
  const equipment = useMemo(() => workspace.filter(allEquipment), [allEquipment, workspace])
  const articles = useMemo(() => workspace.filter(allArticles), [allArticles, workspace])
  const journalEntries = useJournalStore((state) => state.entries)
  const documents = useDocumentStore((state) => state.documents)
  const galleryPhotos = useGalleryStore((state) => state.photos)
  const standards = useStandardsStore((state) => state.standards)
  const reports = useReportStore((state) => state.reports)

  const roadmap = roadmaps.find((item) => item.id === selectedRoadmapId) ?? roadmaps[0] ?? null
  const plannerWeeks = useMemo(
    () => (roadmap ? generateWeeklyPlansFromRoadmap(roadmap) : storedPlannerWeeks) as typeof storedPlannerWeeks,
    [roadmap, storedPlannerWeeks]
  )

  const currentWeek = useMemo(() => {
    if (!roadmap?.weeks.length) return null
    const start = new Date(`${roadmap.startDate}T00:00:00`).getTime()
    const elapsed = Math.floor((Date.now() - start) / (7 * 24 * 60 * 60 * 1000))
    const index = Math.min(Math.max(elapsed, 0), roadmap.weeks.length - 1)
    return roadmap.weeks[index]
  }, [roadmap])
  const currentTrip = currentWeek
    ? roadmap?.trips.find((trip) => trip.id === currentWeek.tripId) ?? null
    : null

  const focusItems = useMemo(() => {
    const focusWeek =
      plannerWeeks.find((week) => week.weekNumber === currentWeek?.weekNumber) ??
      plannerWeeks.find((week) => week.id === selectedPlannerWeekId) ??
      null
    const relevantWeeks = focusWeek ? [focusWeek] : plannerWeeks
    return relevantWeeks
        .flatMap((week) =>
          week.objectives
            .filter((objective) => objective.status !== "completed")
            .map((objective) => ({ objective, week }))
        )
        .sort(
          (a, b) =>
            priorityRank[a.objective.priority] - priorityRank[b.objective.priority] ||
            a.week.weekNumber - b.week.weekNumber
        )
        .slice(0, 4)
  }, [currentWeek?.weekNumber, plannerWeeks, selectedPlannerWeekId])

  const currentWeekNumber = currentWeek?.weekNumber ?? 1
  const currentFocus = currentWeek
    ? `Week ${currentWeek.weekNumber} - ${currentWeek.title}`
    : "Week 1 - Foundation at Grissik"

  useEffect(() => {
    setShowOnboarding(window.localStorage.getItem("ojt-onboarding-dismissed") !== "true")
  }, [])

  const dismissOnboarding = () => {
    window.localStorage.setItem("ojt-onboarding-dismissed", "true")
    setShowOnboarding(false)
  }

  const activities = useMemo(() => {
    const items = [
      ...roadmaps.map((item) => ({
        id: `roadmap-${item.id}`,
        title: item.title,
        description: "Roadmap",
        date: item.createdAt,
        href: "/learning/roadmap",
        icon: MapIcon,
      })),
      ...plannerWeeks.map((week) => ({
        id: `week-${week.id}`,
        title: week.title,
        description: `Planner week ${week.weekNumber}`,
        date: week.updatedAt,
        href: "/calendar",
        icon: CalendarCheck2,
      })),
      ...equipment.map((item) => ({
        id: `equipment-${item.id}`,
        title: item.name,
        description: item.category,
        date: item.updatedAt,
        href: "/equipment",
        icon: CircuitBoard,
      })),
      ...articles.map((article) => ({
        id: `knowledge-${article.id}`,
        title: article.title,
        description: article.category,
        date: article.updatedAt,
        href: "/tasks",
        icon: BookOpen,
      })),
      ...journalEntries.map((entry) => ({
        id: `journal-${entry.id}`,
        title: entry.title,
        description: "Daily Journal",
        date: entry.updatedAt,
        href: "/team",
        icon: NotebookPen,
      })),
      ...documents.map((document) => ({
        id: `document-${document.id}`,
        title: document.title,
        description: document.category,
        date: document.updatedAt,
        href: "/documents",
        icon: FileText,
      })),
      ...galleryPhotos.map((photo) => ({
        id: `photo-${photo.id}`,
        title: photo.title,
        description: photo.category,
        date: photo.updatedAt,
        href: "/gallery",
        icon: Images,
      })),
      ...standards.map((standard) => ({
        id: `standard-${standard.id}`,
        title: standard.reference,
        description: standard.organization,
        date: standard.updatedAt,
        href: "/standards",
        icon: BookOpen,
      })),
      ...reports.map((report) => ({
        id: `report-${report.id}`,
        title: report.title,
        description: "Generated Report",
        date: report.createdAt,
        href: "/reports",
        icon: FileText,
      })),
    ]
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  }, [articles, documents, equipment, galleryPhotos, journalEntries, plannerWeeks, reports, roadmaps, standards])

  return (
    <div className="space-y-6 md:space-y-8">
      {showOnboarding && (
        <Card>
          <CardContent className="grid gap-5 p-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Welcome to OJT Companion</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete these steps to start your OJT learning journey.
                </p>
              </div>
              <div className="space-y-2">
                {onboardingItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 sm:flex-row lg:flex-col">
              <Button asChild>
                <Link href="/learning/roadmap">Start Roadmap</Link>
              </Button>
              <Button variant="outline" onClick={dismissOnboarding}>Dismiss</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden border-primary/20">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_312px] md:items-center md:p-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Overall Progress</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-bold">{progressSummary.overallProgress}%</span>
              <span className="pb-1 text-sm text-muted-foreground">
                Learning Roadmap completion
              </span>
            </div>
            <Progress value={progressSummary.overallProgress} className="mt-5 h-3" />
          </div>
          <div className="rounded-xl bg-muted/50 p-5">
            <p className="text-sm font-medium">Learning Roadmap</p>
            <p className="mt-2 text-lg font-semibold">
              {roadmap?.title ?? "No roadmap selected"}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Overall progress is calculated only from Learning Roadmap completion.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />Today&apos;s Focus
                </CardTitle>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {currentFocus}
                </p>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-8 shrink-0 px-2 sm:px-3">
                <Link href="/team">Journal</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {focusItems.length ? focusItems.map(({ objective, week }) => (
              <div key={objective.id} className="rounded-lg border px-3 py-2.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium sm:text-base">{objective.title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge variant={objective.priority === "high" ? "default" : "secondary"}>
                        {objective.priority.replace("_", " ")} priority
                      </Badge>
                      <Badge variant="outline">Week {week.weekNumber}</Badge>
                      <Badge variant="outline">{objective.estimatedHours}h estimated</Badge>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="h-8 justify-self-end px-3">
                    <Link href="/calendar">Continue Task</Link>
                  </Button>
                </div>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm font-medium">No pending objectives</p>
                <p className="mt-1 text-xs text-muted-foreground">Add work in the Weekly Planner.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <Card>
            <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-1.5 text-primary sm:p-2"><Plane className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                {currentTrip && <Badge variant="secondary">Trip {currentTrip.tripNumber}</Badge>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground sm:text-sm">Current Trip</p>
                <h3 className="mt-1 text-base font-semibold leading-tight sm:text-lg">{currentTrip?.name ?? "No active trip"}</h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{currentTrip?.location ?? "Create a roadmap to calculate the current trip."}</p>
              </div>
              <Button asChild size="sm" variant="ghost" className="-ml-3 px-3 text-xs sm:text-sm"><Link href="/learning/roadmap">View roadmap <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:ml-2" /></Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-1.5 text-primary sm:p-2"><Clock3 className="h-4 w-4 sm:h-5 sm:w-5" /></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground sm:text-sm">Current Week</p>
                <h3 className="mt-1 text-base font-semibold leading-tight sm:text-lg">{currentWeek ? `Week ${currentWeek.weekNumber}` : "No active week"}</h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{currentWeek?.title ?? "Create a roadmap to calculate the current week."}</p>
              </div>
              <Button asChild size="sm" variant="outline" className="w-full px-2 text-xs sm:text-sm">
                <Link href="/calendar">Continue Week {currentWeekNumber}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <CountWidget title="Equipment" count={equipment.length} countLabel="equipment item" href="/equipment" icon={CircuitBoard} />
        <CountWidget title="Knowledge" count={articles.length} countLabel="article" href="/tasks" icon={BookOpen} />
        <CountWidget title="Journal" count={journalEntries.length} countLabel="entry" href="/team" icon={NotebookPen} />
        <CountWidget title="Documents" count={documents.length} countLabel="document" href="/documents" icon={FileText} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <QuickActions />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5 text-primary" />Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length ? (
              <div className="divide-y">
                {activities.map((item) => (
                  <Link key={item.id} href={item.href} className="flex items-center gap-3 py-3 transition-colors hover:text-primary">
                    <div className="rounded-md bg-muted p-2"><item.icon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </time>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No activity yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Your workspace changes will appear here automatically.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
