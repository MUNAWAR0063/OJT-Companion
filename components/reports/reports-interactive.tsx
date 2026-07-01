"use client"

import { useMemo, useState } from "react"
import {
  BookOpen,
  CircuitBoard,
  Download,
  Eye,
  FileBarChart,
  FileDown,
  FileText,
  Map,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MarkdownPreview } from "@/components/tasks/markdown-preview"
import { useDocumentStore } from "@/lib/document-store"
import { useEquipmentStore } from "@/lib/equipment-store"
import { useJournalStore } from "@/lib/journal-store"
import { useKnowledgeStore } from "@/lib/knowledge-store"
import { createPdfBlob, downloadBlob, safeFilename } from "@/lib/pdf-export"
import { usePlannerStore } from "@/lib/planner-store"
import {
  equipmentReportMarkdown,
  knowledgeReportMarkdown,
  tripReportMarkdown,
  weeklyReportMarkdown,
} from "@/lib/report-generator"
import { useReportStore, type GeneratedReport, type ReportType } from "@/lib/report-store"
import { useRoadmapStore } from "@/lib/roadmap-store"
import { useStandardsStore } from "@/lib/standards-store"
import { useDisciplineWorkspace } from "@/lib/discipline/use-discipline-workspace"
import { useUserProfileStore } from "@/lib/user-profile-store"

const reportTypes: Array<{
  value: ReportType
  label: string
  description: string
  icon: typeof FileBarChart
}> = [
  { value: "weekly", label: "Weekly Report", description: "Objectives, checklist progress, hours, and reflections", icon: FileBarChart },
  { value: "trip", label: "Trip Report", description: "Roadmap trip focus, assigned weeks, and completion", icon: Map },
  { value: "equipment", label: "Equipment Report", description: "Engineering workspace, standards, and documents", icon: CircuitBoard },
  { value: "knowledge", label: "Knowledge Report", description: "Wiki article, links, checklist, and references", icon: BookOpen },
]

const typeStyles: Record<ReportType, string> = {
  weekly: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  trip: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  equipment: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  knowledge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

export function ReportsInteractive() {
  const workspace = useDisciplineWorkspace()
  const profile = useUserProfileStore((state) => state.profile)
  const reports = useReportStore((state) => state.reports)
  const createReport = useReportStore((state) => state.createReport)
  const deleteReport = useReportStore((state) => state.deleteReport)
  const weeks = usePlannerStore((state) => state.weeks)
  const roadmaps = useRoadmapStore((state) => state.roadmaps)
  const allEquipment = useEquipmentStore((state) => state.equipment)
  const allArticles = useKnowledgeStore((state) => state.articles)
  const equipment = useMemo(() => workspace.filter(allEquipment), [allEquipment, workspace])
  const articles = useMemo(() => workspace.filter(allArticles), [allArticles, workspace])
  const journals = useJournalStore((state) => state.entries)
  const documents = useDocumentStore((state) => state.documents)
  const standards = useStandardsStore((state) => state.standards)

  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [reportType, setReportType] = useState<ReportType>("weekly")
  const [targetId, setTargetId] = useState("")
  const [previewReport, setPreviewReport] = useState<GeneratedReport | null>(null)
  const [typeFilter, setTypeFilter] = useState<ReportType | "all">("all")

  const tripOptions = useMemo(
    () =>
      roadmaps.flatMap((roadmap) =>
        roadmap.trips.map((trip) => ({
          id: `${roadmap.id}:${trip.id}`,
          label: `${roadmap.title} — Trip ${trip.tripNumber}: ${trip.name}`,
        }))
      ),
    [roadmaps]
  )

  const targets = useMemo(() => {
    if (reportType === "weekly") {
      return [...weeks]
        .sort((a, b) => a.weekNumber - b.weekNumber)
        .map((week) => ({ id: week.id, label: `Week ${week.weekNumber}: ${week.title}` }))
    }
    if (reportType === "trip") return tripOptions
    if (reportType === "equipment") {
      return equipment.map((item) => ({ id: item.id, label: `${item.name} — ${item.category}` }))
    }
    return articles.map((article) => ({ id: article.id, label: `${article.title} — ${article.category}` }))
  }, [articles, equipment, reportType, tripOptions, weeks])

  const openGenerator = (type: ReportType = "weekly") => {
    setReportType(type)
    const options =
      type === "weekly"
        ? weeks
        : type === "trip"
          ? tripOptions
          : type === "equipment"
            ? equipment
            : articles
    setTargetId(options[0]?.id ?? "")
    setGeneratorOpen(true)
  }

  const changeType = (type: ReportType) => {
    setReportType(type)
    if (type === "weekly") setTargetId(weeks[0]?.id ?? "")
    if (type === "trip") setTargetId(tripOptions[0]?.id ?? "")
    if (type === "equipment") setTargetId(equipment[0]?.id ?? "")
    if (type === "knowledge") setTargetId(articles[0]?.id ?? "")
  }

  const generateReport = () => {
    if (!targetId) {
      toast.error("Select source data for this report")
      return
    }

    let input: Omit<GeneratedReport, "id" | "createdAt"> | null = null
    if (reportType === "weekly") {
      const week = weeks.find((item) => item.id === targetId)
      if (week) {
        input = {
          type: "weekly",
          title: `Weekly Report — Week ${week.weekNumber}`,
          subtitle: week.title,
          markdown: weeklyReportMarkdown(week, journals, profile),
        }
      }
    }
    if (reportType === "trip") {
      const [roadmapId, tripId] = targetId.split(":")
      const roadmap = roadmaps.find((item) => item.id === roadmapId)
      const trip = roadmap?.trips.find((item) => item.id === tripId)
      if (roadmap && trip) {
        input = {
          type: "trip",
          title: `Trip Report — ${trip.name}`,
          subtitle: roadmap.title,
          markdown: tripReportMarkdown(roadmap, trip, profile),
        }
      }
    }
    if (reportType === "equipment") {
      const item = equipment.find((entry) => entry.id === targetId)
      if (item) {
        input = {
          type: "equipment",
          title: `Equipment Report — ${item.name}`,
          subtitle: item.category,
          markdown: equipmentReportMarkdown(item, standards, documents, profile),
        }
      }
    }
    if (reportType === "knowledge") {
      const article = articles.find((entry) => entry.id === targetId)
      if (article) {
        input = {
          type: "knowledge",
          title: `Knowledge Report — ${article.title}`,
          subtitle: article.category,
          markdown: knowledgeReportMarkdown(article, equipment, standards, documents, profile),
        }
      }
    }

    if (!input) {
      toast.error("The selected source data is no longer available")
      return
    }
    const report = createReport(input)
    setGeneratorOpen(false)
    setPreviewReport(report)
    toast.success("Report generated")
  }

  const downloadMarkdown = (report: GeneratedReport) => {
    downloadBlob(
      new Blob([report.markdown], { type: "text/markdown;charset=utf-8" }),
      `${safeFilename(report.title)}.md`
    )
  }

  const downloadPdf = (report: GeneratedReport) => {
    downloadBlob(createPdfBlob(report.markdown), `${safeFilename(report.title)}.pdf`)
  }

  const removeReport = (report: GeneratedReport) => {
    if (!window.confirm(`Delete "${report.title}"?`)) return
    deleteReport(report.id)
    if (previewReport?.id === report.id) setPreviewReport(null)
    toast.success("Report deleted")
  }

  const filteredReports =
    typeFilter === "all" ? reports : reports.filter((report) => report.type === typeFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Generated Reports</h2>
          <p className="text-sm text-muted-foreground">{reports.length} saved report snapshots</p>
        </div>
        <Button onClick={() => openGenerator()}><Plus className="mr-2 h-4 w-4" />Generate Report</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {reportTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => openGenerator(type.value)}
            className="rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <type.icon className="mb-3 h-5 w-5 text-primary" />
            <p className="font-semibold">{type.label}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{type.description}</p>
          </button>
        ))}
      </div>

      {reports.length > 0 && (
        <div className="max-w-xs">
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ReportType | "all")}>
            <SelectTrigger aria-label="Filter report type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All report types</SelectItem>
              {reportTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <FileBarChart className="h-11 w-11 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No reports generated</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Generate a snapshot from your weekly, trip, equipment, or knowledge data.
              </p>
            </div>
            <Button onClick={() => openGenerator()}><Plus className="mr-2 h-4 w-4" />Generate First Report</Button>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No reports match this type.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredReports.map((report) => {
            const config = reportTypes.find((type) => type.value === report.type) ?? reportTypes[0]
            const Icon = config.icon
            return (
              <Card key={report.id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Badge variant="outline" className={`mb-2 ${typeStyles[report.type]}`}>{config.label}</Badge>
                      <CardTitle className="line-clamp-2 text-lg">{report.title}</CardTitle>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{report.subtitle}</p>
                    </div>
                    <Icon className="h-5 w-5 shrink-0 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Generated {new Date(report.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => setPreviewReport(report)}><Eye className="mr-2 h-4 w-4" />Preview</Button>
                    <Button variant="outline" onClick={() => downloadPdf(report)}><FileDown className="mr-2 h-4 w-4" />PDF</Button>
                    <Button variant="ghost" onClick={() => downloadMarkdown(report)}><Download className="mr-2 h-4 w-4" />Markdown</Button>
                    <Button variant="ghost" onClick={() => removeReport(report)}><Trash2 className="mr-2 h-4 w-4 text-destructive" />Delete</Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report type</label>
              <Select value={reportType} onValueChange={(value) => changeType(value as ReportType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source data</label>
              <Select value={targetId} onValueChange={setTargetId} disabled={!targets.length}>
                <SelectTrigger><SelectValue placeholder="Select source data" /></SelectTrigger>
                <SelectContent>
                  {targets.map((target) => <SelectItem key={target.id} value={target.id}>{target.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {!targets.length && (
              <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                No {reportTypes.find((type) => type.value === reportType)?.label.toLowerCase()} source data is available yet.
              </div>
            )}
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              Reports are generated as local snapshots. Future data changes do not modify previously generated reports.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGeneratorOpen(false)}>Cancel</Button>
            <Button onClick={generateReport} disabled={!targetId}><FileText className="mr-2 h-4 w-4" />Generate & Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewReport)} onOpenChange={(open) => { if (!open) setPreviewReport(null) }}>
        <DialogContent className="max-h-[94vh] max-w-5xl overflow-y-auto">
          {previewReport && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle>{previewReport.title}</DialogTitle>
                  <Badge variant="outline" className={typeStyles[previewReport.type]}>
                    {reportTypes.find((type) => type.value === previewReport.type)?.label}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="rounded-lg border bg-card p-5 md:p-8">
                <MarkdownPreview
                  content={previewReport.markdown}
                  articles={articles}
                  onSelectArticle={() => {}}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => downloadMarkdown(previewReport)}>
                  <Download className="mr-2 h-4 w-4" />Markdown
                </Button>
                <Button onClick={() => downloadPdf(previewReport)}>
                  <FileDown className="mr-2 h-4 w-4" />Export PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
