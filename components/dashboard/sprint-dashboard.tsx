"use client"

import { useMemo } from "react"
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
      <CardContent className="flex h-full flex-col p-5">
        <div className="w-fit rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="mt-4 font-semibold">{title}</h3>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {count} {count === 1 ? countLabel : pluralLabel}
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mt-4 w-fit">
          <Link href={href}>Open <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function SprintDashboard() {
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
      <Card className="overflow-hidden border-primary/20">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_260px] md:items-center md:p-8">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-primary" />Today&apos;s Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {focusItems.length ? focusItems.map(({ objective, week }) => (
              <div key={objective.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{objective.title}</p>
                  <p className="text-xs text-muted-foreground">Week {week.weekNumber} · {objective.estimatedHours}h estimated</p>
                </div>
                <Badge variant={objective.priority === "high" ? "default" : "secondary"}>{objective.priority}</Badge>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm font-medium">No pending objectives</p>
                <p className="mt-1 text-xs text-muted-foreground">Add work in the Weekly Planner.</p>
              </div>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href="/calendar">Open Weekly Planner</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-5 sm:grid-cols-2">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2 text-primary"><Plane className="h-5 w-5" /></div>
                {currentTrip && <Badge variant="secondary">Trip {currentTrip.tripNumber}</Badge>}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Trip</p>
                <h3 className="mt-1 text-lg font-semibold">{currentTrip?.name ?? "No active trip"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{currentTrip?.location ?? "Create a roadmap to calculate the current trip."}</p>
              </div>
              <Button asChild size="sm" variant="ghost" className="-ml-3"><Link href="/learning/roadmap">View roadmap <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2 text-primary"><Clock3 className="h-5 w-5" /></div>
                {currentWeek && <Badge variant="outline">{currentWeek.progress}%</Badge>}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Week</p>
                <h3 className="mt-1 text-lg font-semibold">{currentWeek ? `Week ${currentWeek.weekNumber}` : "No active week"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{currentWeek?.title ?? "Create a roadmap to calculate the current week."}</p>
              </div>
              <Progress value={currentWeek?.progress ?? 0} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
