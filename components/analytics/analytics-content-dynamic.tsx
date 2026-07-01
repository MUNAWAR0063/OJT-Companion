"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  GraduationCap,
  Layers3,
  Search,
  Target,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWorkspaceProgress, type CompetencyStatus, type WorkspaceCompetency } from "@/lib/workspace-progress"
import {
  COMPETENCY_PAGE_SIZE,
  filterCompetencies,
  formatCompetencyDate,
  getVisibleCompetencies,
} from "@/lib/competencies-utils.mjs"

const statusLabels: Record<CompetencyStatus, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  "not-started": "Not Started",
}

const statusClasses: Record<CompetencyStatus, string> = {
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "in-progress": "border-primary/30 bg-primary/10 text-primary",
  "not-started": "border-muted-foreground/20 bg-muted text-muted-foreground",
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string
  value: string | number
  detail?: string
  icon: typeof Target
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
        </div>
      </div>
    </Card>
  )
}

function CompetencyDetail({ competency }: { competency: WorkspaceCompetency }) {
  const sections = [
    { title: "Learning Objectives", items: competency.learningObjectives },
    { title: "Required Evidence", items: competency.requiredEvidence },
    { title: "Uploaded Evidence", items: competency.uploadedEvidence },
  ]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">{competency.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{competency.category}</Badge>
          <Badge className={statusClasses[competency.status]}>{statusLabels[competency.status]}</Badge>
          <Badge variant="secondary">{competency.progress}% complete</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-muted-foreground">{competency.progress}%</span>
        </div>
        <Progress value={competency.progress} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className="rounded-lg border p-4">
            <h4 className="text-sm font-semibold">{section.title}</h4>
            {section.items.length ? (
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {section.items.slice(0, 6).map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No evidence linked yet.</p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="text-sm font-semibold">Assessor Feedback</h4>
        <p className="mt-2 text-sm text-muted-foreground">{competency.assessorFeedback}</p>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="text-sm font-semibold">Progress Timeline</h4>
        {competency.timeline.length ? (
          <div className="mt-3 space-y-3">
            {competency.timeline.map((event) => (
              <div key={`${event.label}-${event.date ?? "none"}`} className="flex gap-3 text-sm">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">{event.label}</p>
                  <p className="text-muted-foreground">{event.detail}</p>
                  <p className="text-xs text-muted-foreground">{formatCompetencyDate(event.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No timeline events yet.</p>
        )}
      </div>
    </div>
  )
}

export function AnalyticsContentDynamic() {
  const summary = useWorkspaceProgress()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [sort, setSort] = useState("updated-desc")
  const [page, setPage] = useState(1)
  const [selectedCompetency, setSelectedCompetency] = useState<WorkspaceCompetency | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(summary.competencies.map((competency) => competency.category))).sort(),
    [summary.competencies]
  )

  const visibleCompetencies = useMemo(
    () => getVisibleCompetencies(summary.competencies, { query, category, status }, sort, page, COMPETENCY_PAGE_SIZE),
    [category, page, query, sort, status, summary.competencies]
  )
  const filteredCompetencies = visibleCompetencies.filtered as WorkspaceCompetency[]
  const pagedCompetencies = visibleCompetencies.pagination.items as WorkspaceCompetency[]
  const pagination = visibleCompetencies.pagination
  const hasActiveFilters = Boolean(query.trim()) || category !== "all" || status !== "all"

  useEffect(() => {
    setPage(1)
  }, [category, query, sort, status])

  useEffect(() => {
    setSelectedCompetency((current) => {
      if (!current) return null
      return summary.competencies.find((competency) => competency.id === current.id) ?? null
    })
  }, [summary.competencies])

  if (!summary.hasData) {
    return (
      <Card className="p-8 text-center md:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Target className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">No progress data yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Add workspace data in the Weekly Planner, Learning Roadmap, Equipment Library, Field Notes, Knowledge Base,
          Standard Documents, or Project Gallery to calculate competency progress.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/20">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-primary">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Competency Progress</span>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-5xl font-bold">{summary.overallProgress}%</span>
              <span className="pb-1 text-sm text-muted-foreground">{summary.currentLevel}</span>
            </div>
            <Progress value={summary.overallProgress} className="mt-5 h-3" />
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <p>{summary.currentTrip ?? "No active trip"}</p>
              <p>{summary.currentWeek ?? "No active week"}</p>
            </div>
          </div>
          <div className="rounded-xl bg-muted/50 p-5">
            <p className="text-sm font-medium">Competencies</p>
            <p className="mt-2 text-3xl font-semibold">{summary.completedCompetencies} completed</p>
            <p className="text-xs text-muted-foreground">{summary.remainingCompetencies} remaining across active workspace modules</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Competencies" value={summary.totalCompetencies} detail={`${summary.activeModuleCount} active modules`} icon={Layers3} />
        <MetricCard title="Completed" value={summary.completedCompetencies} detail="Fully evidenced competencies" icon={CheckCircle2} />
        <MetricCard title="In Progress" value={summary.inProgressCompetencies} detail="Active workspace progress" icon={BarChart3} />
        <MetricCard title="Not Started" value={summary.notStartedCompetencies} detail="No source records yet" icon={Clock3} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Learning Hours" value={`${summary.learningHours}h`} icon={CalendarCheck2} />
        <MetricCard title="Equipment Mastered" value={summary.equipmentMastered} icon={Database} />
        <MetricCard title="Knowledge Articles" value={summary.knowledgeArticlesCreated} icon={BookOpen} />
        <MetricCard title="Field Notes" value={summary.fieldNotesCreated} icon={FileText} />
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search competencies"
              className="pl-9"
              placeholder="Search competencies"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full" aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full" aria-label="Sort competencies">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated-desc">Recently Updated</SelectItem>
              <SelectItem value="progress-desc">Highest Progress</SelectItem>
              <SelectItem value="progress-asc">Lowest Progress</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="status-asc">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Showing {filteredCompetencies.length ? (pagination.page - 1) * pagination.pageSize + 1 : 0}-
            {Math.min(pagination.page * pagination.pageSize, filteredCompetencies.length)} of {filteredCompetencies.length}
          </span>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("")
                setCategory("all")
                setStatus("all")
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </Card>

      {filteredCompetencies.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pagedCompetencies.map((competency) => (
          <Card key={competency.id} className="flex min-h-[260px] flex-col p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{competency.category}</p>
                <h3 className="mt-1 text-lg font-semibold leading-tight">{competency.title}</h3>
              </div>
              <Badge className={statusClasses[competency.status]}>{statusLabels[competency.status]}</Badge>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{competency.description}</p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{competency.progress}%</span>
              </div>
              <Progress value={competency.progress} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{competency.recordCount} source {competency.recordCount === 1 ? "record" : "records"}</span>
              <span>Updated {formatCompetencyDate(competency.lastUpdated)}</span>
            </div>
            <Button className="mt-auto" variant="outline" onClick={() => setSelectedCompetency(competency)}>
              View Detail
            </Button>
          </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No competencies match your filters</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Adjust the search, category, or status filters to see matching competency records.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={() => {
              setQuery("")
              setCategory("all")
              setStatus("all")
            }}
          >
            Reset filters
          </Button>
        </Card>
      )}

      {pagination.pageCount > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pageCount}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={pagination.page >= pagination.pageCount}
            onClick={() => setPage((current) => Math.min(pagination.pageCount, current + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}

      <Dialog open={Boolean(selectedCompetency)} onOpenChange={(open) => !open && setSelectedCompetency(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          {selectedCompetency ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCompetency.title}</DialogTitle>
                <DialogDescription>
                  Last updated {formatCompetencyDate(selectedCompetency.lastUpdated)}
                </DialogDescription>
              </DialogHeader>
              <CompetencyDetail competency={selectedCompetency} />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
