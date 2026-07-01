"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  CalendarCheck2,
  CircuitBoard,
  Clock3,
  FileBarChart,
  FileText,
  Images,
  Map,
  NotebookPen,
  Search,
  ShieldCheck,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDocumentStore } from "@/lib/document-store"
import { useEquipmentStore } from "@/lib/equipment-store"
import { useGalleryStore } from "@/lib/gallery-store"
import { useJournalStore } from "@/lib/journal-store"
import { useKnowledgeStore } from "@/lib/knowledge-store"
import { usePlannerStore } from "@/lib/planner-store"
import { useReportStore } from "@/lib/report-store"
import { useRoadmapStore } from "@/lib/roadmap-store"
import { useSearchStore } from "@/lib/search-store"
import { useStandardsStore } from "@/lib/standards-store"
import { useDisciplineWorkspace } from "@/lib/discipline/use-discipline-workspace"

type SearchModule =
  | "equipment"
  | "knowledge"
  | "journal"
  | "roadmap"
  | "planner"
  | "documents"
  | "photos"
  | "reports"
  | "standards"

interface SearchResult {
  id: string
  module: SearchModule
  title: string
  description: string
  searchText: string
  tags: string[]
  href: string
  icon: typeof Search
  select?: () => void
}

const moduleLabels: Record<SearchModule, string> = {
  equipment: "Equipment",
  knowledge: "Knowledge",
  journal: "Journal",
  roadmap: "Roadmap",
  planner: "Planner",
  documents: "Documents",
  photos: "Photos",
  reports: "Reports",
  standards: "Standards",
}

interface WorkspaceSearchProps {
  variant?: "bar" | "icon"
}

export function WorkspaceSearch({ variant = "bar" }: WorkspaceSearchProps) {
  const router = useRouter()
  const workspace = useDisciplineWorkspace()
  const allEquipment = useEquipmentStore((state) => state.equipment)
  const selectEquipment = useEquipmentStore((state) => state.selectEquipment)
  const allArticles = useKnowledgeStore((state) => state.articles)
  const selectArticle = useKnowledgeStore((state) => state.selectArticle)
  const journalEntries = useJournalStore((state) => state.entries)
  const selectJournalEntry = useJournalStore((state) => state.selectEntry)
  const roadmaps = useRoadmapStore((state) => state.roadmaps)
  const selectRoadmap = useRoadmapStore((state) => state.setSelectedRoadmap)
  const plannerWeeks = usePlannerStore((state) => state.weeks)
  const selectPlannerWeek = usePlannerStore((state) => state.selectWeek)
  const documents = useDocumentStore((state) => state.documents)
  const photos = useGalleryStore((state) => state.photos)
  const reports = useReportStore((state) => state.reports)
  const allStandards = useStandardsStore((state) => state.standards)
  const recentSearches = useSearchStore((state) => state.recentSearches)
  const addRecentSearch = useSearchStore((state) => state.addRecentSearch)
  const removeRecentSearch = useSearchStore((state) => state.removeRecentSearch)
  const clearRecentSearches = useSearchStore((state) => state.clearRecentSearches)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [moduleFilter, setModuleFilter] = useState<SearchModule | "all">("all")
  const [tagFilter, setTagFilter] = useState("all")
  const equipment = useMemo(() => workspace.filter(allEquipment), [allEquipment, workspace])
  const articles = useMemo(() => workspace.filter(allArticles), [allArticles, workspace])
  const standards = useMemo(() => workspace.filter(allStandards), [allStandards, workspace])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [])

  const allResults = useMemo<SearchResult[]>(
    () => [
      ...equipment.map((item) => ({
        id: item.id,
        module: "equipment" as const,
        title: item.name,
        description: `${item.category}${item.location ? ` · ${item.location}` : ""}`,
        searchText: [
          item.name,
          item.category,
          item.manufacturer,
          item.model,
          item.rating,
          item.location,
          ...Object.values(item.sections),
        ].join(" "),
        tags: [],
        href: "/equipment",
        icon: CircuitBoard,
        select: () => selectEquipment(item.id),
      })),
      ...articles.map((article) => ({
        id: article.id,
        module: "knowledge" as const,
        title: article.title,
        description: article.category,
        searchText: [
          article.title,
          article.category,
          article.content,
          article.tags.join(" "),
          article.relatedStandards.join(" "),
        ].join(" "),
        tags: article.tags,
        href: "/tasks",
        icon: BookOpen,
        select: () => selectArticle(article.id),
      })),
      ...journalEntries.map((entry) => ({
        id: entry.id,
        module: "journal" as const,
        title: entry.title,
        description: entry.date,
        searchText: [
          entry.title,
          entry.date,
          entry.dailyActivities,
          entry.lessonsLearned,
          entry.problems,
          entry.questions,
          entry.reflection,
        ].join(" "),
        tags: [],
        href: "/team",
        icon: NotebookPen,
        select: () => selectJournalEntry(entry.id),
      })),
      ...roadmaps.flatMap((roadmap) => [
        {
          id: roadmap.id,
          module: "roadmap" as const,
          title: roadmap.title,
          description: `${roadmap.weeks.length} weeks · ${roadmap.trips.length} trips`,
          searchText: [
            roadmap.title,
            roadmap.traineeName,
            roadmap.companyName,
            ...roadmap.trips.flatMap((trip) => [trip.name, trip.location, trip.focus, trip.description]),
            ...roadmap.weeks.flatMap((week) => [
              week.title,
              week.reflection,
              ...week.objectives.flatMap((objective) => [objective.title, objective.description, objective.notes]),
            ]),
          ].join(" "),
          tags: [],
          href: "/learning/roadmap",
          icon: Map,
          select: () => selectRoadmap(roadmap.id),
        },
      ]),
      ...plannerWeeks.flatMap((week) => [
        {
          id: week.id,
          module: "planner" as const,
          title: `Week ${week.weekNumber}: ${week.title}`,
          description: `${week.objectives.length} objectives · ${week.progress}% complete`,
          searchText: [
            week.title,
            week.reflection,
            ...week.objectives.flatMap((objective) => [
              objective.title,
              objective.description,
              objective.notes,
              objective.priority,
              objective.status,
              objective.equipment.join(" "),
              ...objective.checklist.map((item) => item.text),
            ]),
          ].join(" "),
          tags: [],
          href: "/calendar",
          icon: CalendarCheck2,
          select: () => selectPlannerWeek(week.id),
        },
        ...week.objectives.map((objective) => ({
          id: objective.id,
          module: "planner" as const,
          title: objective.title,
          description: `Week ${week.weekNumber} · ${objective.status}`,
          searchText: [
            week.title,
            objective.title,
            objective.description,
            objective.notes,
            objective.priority,
            objective.status,
            objective.equipment.join(" "),
            ...objective.checklist.map((item) => item.text),
          ].join(" "),
          tags: [],
          href: "/calendar",
          icon: CalendarCheck2,
          select: () => selectPlannerWeek(week.id),
        })),
      ]),
      ...documents.map((document) => ({
        id: document.id,
        module: "documents" as const,
        title: document.title,
        description: `${document.category} · ${document.file.name}`,
        searchText: [
          document.title,
          document.description,
          document.category,
          document.file.name,
          document.tags.join(" "),
        ].join(" "),
        tags: document.tags,
        href: "/documents",
        icon: FileText,
      })),
      ...photos.map((photo) => ({
        id: photo.id,
        module: "photos" as const,
        title: photo.title,
        description: `${photo.category}${photo.location ? ` · ${photo.location}` : ""}`,
        searchText: [photo.title, photo.category, photo.location, photo.notes].join(" "),
        tags: [],
        href: "/gallery",
        icon: Images,
      })),
      ...reports.map((report) => ({
        id: report.id,
        module: "reports" as const,
        title: report.title,
        description: report.subtitle,
        searchText: [report.title, report.subtitle, report.type, report.markdown].join(" "),
        tags: [],
        href: "/reports",
        icon: FileBarChart,
      })),
      ...standards.map((standard) => ({
        id: standard.id,
        module: "standards" as const,
        title: `${standard.reference}: ${standard.title}`,
        description: standard.organization,
        searchText: [
          standard.organization,
          standard.reference,
          standard.title,
          standard.summary,
          standard.notes,
          standard.tags.join(" "),
        ].join(" "),
        tags: standard.tags,
        href: "/standards",
        icon: ShieldCheck,
      })),
    ],
    [
      articles,
      documents,
      equipment,
      journalEntries,
      photos,
      plannerWeeks,
      reports,
      roadmaps,
      selectArticle,
      selectEquipment,
      selectJournalEntry,
      selectPlannerWeek,
      selectRoadmap,
      standards,
    ]
  )

  const availableTags = useMemo(
    () => Array.from(new Set(allResults.flatMap((result) => result.tags))).sort(),
    [allResults]
  )

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []
    return allResults
      .filter(
        (result) =>
          (moduleFilter === "all" || result.module === moduleFilter) &&
          (tagFilter === "all" || result.tags.includes(tagFilter)) &&
          result.searchText.toLowerCase().includes(normalized)
      )
      .sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(normalized) ? 0 : 1
        const bTitle = b.title.toLowerCase().includes(normalized) ? 0 : 1
        return aTitle - bTitle || a.title.localeCompare(b.title)
      })
      .slice(0, 40)
  }, [allResults, moduleFilter, query, tagFilter])

  const chooseResult = (result: SearchResult) => {
    addRecentSearch(query || result.title)
    result.select?.()
    setOpen(false)
    router.push(result.href)
  }

  const applyRecentSearch = (recentQuery: string) => {
    setQuery(recentQuery)
    setOpen(true)
  }

  return (
    <>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="relative h-11 w-11 hover:bg-secondary transition-all duration-300 hover:scale-105"
          aria-label="Open workspace search"
        >
          <Search className="h-5 w-5" />
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mx-auto flex h-12 w-full max-w-5xl items-center gap-3 rounded-xl border border-border bg-card px-4 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open workspace search"
        >
          <Search className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1 truncate text-left">Search your workspace...</span>
          <kbd className="hidden rounded border bg-muted px-2 py-0.5 text-xs font-medium sm:inline-flex">Ctrl + K</kbd>
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl gap-0 overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Workspace Search</DialogTitle>
          </DialogHeader>
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && results[0]) chooseResult(results[0])
                }}
                className="h-11 border-0 pl-11 text-base shadow-none focus-visible:ring-0"
                placeholder="Search your workspace..."
              />
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Select value={moduleFilter} onValueChange={(value) => setModuleFilter(value as SearchModule | "all")}>
                <SelectTrigger aria-label="Filter search module"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modules</SelectItem>
                  {(Object.keys(moduleLabels) as SearchModule[]).map((module) => (
                    <SelectItem key={module} value={module}>{moduleLabels[module]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger aria-label="Filter search tag"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {availableTags.map((tag) => <SelectItem key={tag} value={tag}>#{tag}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="max-h-[62vh] overflow-y-auto p-3">
            {!query.trim() ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />Recent Searches
                  </p>
                  {recentSearches.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearRecentSearches}>Clear all</Button>
                  )}
                </div>
                {recentSearches.length ? recentSearches.map((recent) => (
                  <div key={recent.id} className="flex items-center gap-2 rounded-lg px-2 hover:bg-muted">
                    <button onClick={() => applyRecentSearch(recent.query)} className="flex-1 py-3 text-left text-sm">
                      {recent.query}
                    </button>
                    <Button size="icon" variant="ghost" onClick={() => removeRecentSearch(recent.id)} aria-label={`Remove ${recent.query}`}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )) : (
                  <div className="rounded-lg border border-dashed p-10 text-center">
                    <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">No recent searches</p>
                    <p className="mt-1 text-xs text-muted-foreground">Select a result to save the query here.</p>
                  </div>
                )}
              </div>
            ) : results.length ? (
              <div className="space-y-1">
                <p className="px-2 pb-2 text-xs text-muted-foreground">{results.length} matching results</p>
                {results.map((result, index) => (
                  <button
                    key={`${result.module}-${result.id}`}
                    onClick={() => chooseResult(result)}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    <div className="rounded-md bg-primary/10 p-2 text-primary"><result.icon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{result.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{result.description}</p>
                    </div>
                    <Badge variant="outline">{moduleLabels[result.module]}</Badge>
                    {index === 0 && <kbd className="hidden text-xs text-muted-foreground sm:block">Enter</kbd>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No results for “{query}”</p>
                <p className="mt-1 text-xs text-muted-foreground">Try another term or clear the filters.</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            <span>Enter to open the first result</span>
            <span>Esc to close · Ctrl + K to toggle</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const GlobalSearch = WorkspaceSearch
