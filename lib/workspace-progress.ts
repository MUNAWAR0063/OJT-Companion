"use client"

import { useMemo } from "react"
import { getDocumentProgress, getEquipmentProgress, getJournalProgress, getKnowledgeProgress } from "@/lib/dashboard-metrics"
import { useDocumentStore } from "@/lib/document-store"
import { useEquipmentStore } from "@/lib/equipment-store"
import { useGalleryStore } from "@/lib/gallery-store"
import { useJournalStore } from "@/lib/journal-store"
import { useKnowledgeStore } from "@/lib/knowledge-store"
import { getPlannerProgress, usePlannerStore } from "@/lib/planner-store"
import { getRoadmapProgress, useRoadmapStore, type RoadmapItem } from "@/lib/roadmap-store"
import { useStandardsStore } from "@/lib/standards-store"
import { useDisciplineWorkspace } from "@/lib/discipline/use-discipline-workspace"

export type CompetencyStatus = "completed" | "in-progress" | "not-started"

export interface CompetencyTimelineEvent {
  label: string
  date: string | null
  detail: string
}

export interface WorkspaceCompetency {
  id: string
  title: string
  category: string
  description: string
  progress: number
  status: CompetencyStatus
  lastUpdated: string | null
  learningObjectives: string[]
  requiredEvidence: string[]
  uploadedEvidence: string[]
  assessorFeedback: string
  timeline: CompetencyTimelineEvent[]
  recordCount: number
}

export interface WorkspaceProgressSummary {
  hasData: boolean
  overallProgress: number
  completedCompetencies: number
  inProgressCompetencies: number
  notStartedCompetencies: number
  totalCompetencies: number
  remainingCompetencies: number
  currentLevel: string
  currentTrip: string | null
  currentWeek: string | null
  learningHours: number
  equipmentMastered: number
  knowledgeArticlesCreated: number
  fieldNotesCreated: number
  completedWeeklyTasks: number
  completedMilestones: number
  activeModuleCount: number
  competencies: WorkspaceCompetency[]
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : 0
}

function statusFromProgress(progress: number): CompetencyStatus {
  if (progress >= 100) return "completed"
  if (progress > 0) return "in-progress"
  return "not-started"
}

function latestDate(dates: Array<string | null | undefined>) {
  return dates.filter(Boolean).sort((a, b) => b!.localeCompare(a!))[0] ?? null
}

function currentRoadmapWeek(roadmap: RoadmapItem | null) {
  if (!roadmap?.weeks.length) return null
  const start = new Date(`${roadmap.startDate}T00:00:00`).getTime()
  const elapsed = Math.floor((Date.now() - start) / (7 * 24 * 60 * 60 * 1000))
  const index = Math.min(Math.max(elapsed, 0), roadmap.weeks.length - 1)
  return roadmap.weeks[index]
}

function competency(input: Omit<WorkspaceCompetency, "status">): WorkspaceCompetency {
  return {
    ...input,
    status: statusFromProgress(input.progress),
  }
}

export function useWorkspaceProgress(): WorkspaceProgressSummary {
  const workspace = useDisciplineWorkspace()
  const roadmaps = useRoadmapStore((state) => state.roadmaps)
  const selectedRoadmapId = useRoadmapStore((state) => state.selectedRoadmapId)
  const plannerWeeks = usePlannerStore((state) => state.weeks)
  const allEquipment = useEquipmentStore((state) => state.equipment)
  const allArticles = useKnowledgeStore((state) => state.articles)
  const equipment = useMemo(() => workspace.filter(allEquipment), [allEquipment, workspace])
  const articles = useMemo(() => workspace.filter(allArticles), [allArticles, workspace])
  const journalEntries = useJournalStore((state) => state.entries)
  const documents = useDocumentStore((state) => state.documents)
  const photos = useGalleryStore((state) => state.photos)
  const standards = useStandardsStore((state) => state.standards)

  return useMemo(() => {
    const roadmap = roadmaps.find((item) => item.id === selectedRoadmapId) ?? roadmaps[0] ?? null
    const roadmapWeek = currentRoadmapWeek(roadmap)
    const roadmapTrip = roadmapWeek ? roadmap?.trips.find((trip) => trip.id === roadmapWeek.tripId) ?? null : null

    const plannerObjectives = plannerWeeks.flatMap((week) => week.objectives)
    const roadmapObjectives = roadmaps.flatMap((item) => item.weeks.flatMap((week) => week.objectives))
    const roadmapWeeks = roadmaps.flatMap((item) => item.weeks)
    const completedWeeklyTasks = plannerObjectives.filter((objective) => objective.status === "completed").length
    const completedMilestones =
      roadmapObjectives.filter((objective) => objective.status === "completed").length +
      roadmapWeeks.filter((week) => week.progress >= 100).length
    const learningHours = plannerObjectives
      .filter((objective) => objective.status === "completed")
      .reduce((total, objective) => total + objective.estimatedHours, 0)

    const roadmapProgress = average(roadmaps.map(getRoadmapProgress))
    const plannerProgress = getPlannerProgress(plannerWeeks)
    const equipmentProgress = getEquipmentProgress(equipment)
    const knowledgeProgress = getKnowledgeProgress(articles)
    const journalProgress = getJournalProgress(journalEntries)
    const standardsProgress = average([
      getDocumentProgress(documents),
      average(
        standards.map((standard) => {
          const requirements = [
            standard.reference.trim().length > 0,
            standard.title.trim().length > 0,
            standard.summary.trim().length > 0,
            standard.notes.trim().length > 0,
            standard.tags.length > 0,
            standard.relatedEquipment.length > 0,
          ]
          return Math.round((requirements.filter(Boolean).length / requirements.length) * 100)
        })
      ),
    ].filter((value) => value > 0))
    const galleryProgress = average(
      photos.map((photo) => {
        const requirements = [
          photo.title.trim().length > 0,
          photo.category.trim().length > 0,
          photo.image.dataUrl.length > 0,
          photo.notes.trim().length > 0,
          photo.relatedEquipment.length + photo.relatedJournal.length > 0,
        ]
        return Math.round((requirements.filter(Boolean).length / requirements.length) * 100)
      })
    )

    const competencies: WorkspaceCompetency[] = [
      competency({
        id: "weekly-planner",
        title: "Weekly Planning and Task Execution",
        category: "Planning",
        description: "Progress from weekly plans, objectives, checklist completion, status changes, and estimated learning hours.",
        progress: plannerWeeks.length ? plannerProgress : 0,
        lastUpdated: latestDate(plannerWeeks.map((week) => week.updatedAt)),
        learningObjectives: ["Create weekly objectives", "Complete planned tasks", "Track learning hours", "Reflect on weekly progress"],
        requiredEvidence: ["At least one weekly plan", "Objectives with status", "Completed checklist items", "Estimated hours where available"],
        uploadedEvidence: plannerWeeks.map((week) => `Week ${week.weekNumber}: ${week.title}`),
        assessorFeedback: "Assessor feedback is recorded through weekly review notes and generated reports when available.",
        timeline: plannerWeeks
          .map((week) => ({
            label: `Week ${week.weekNumber} updated`,
            date: week.updatedAt,
            detail: `${week.progress}% complete with ${week.objectives.length} objectives`,
          }))
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6),
        recordCount: plannerWeeks.length,
      }),
      competency({
        id: "learning-roadmap",
        title: "Learning Roadmap Milestones",
        category: "Roadmap",
        description: "Progress from roadmap trips, weekly milestones, objective completion, and roadmap reflections.",
        progress: roadmaps.length ? roadmapProgress : 0,
        lastUpdated: latestDate(roadmaps.map((item) => item.createdAt)),
        learningObjectives: ["Create an OJT roadmap", "Progress through trips", "Complete roadmap objectives", "Document weekly reflections"],
        requiredEvidence: ["Roadmap", "Trips", "Weekly objectives", "Completed roadmap checklists"],
        uploadedEvidence: roadmaps.map((item) => item.title),
        assessorFeedback: "Roadmap review feedback can be captured in reflections and reports.",
        timeline: roadmapWeeks
          .map((week) => ({
            label: `Roadmap Week ${week.weekNumber}`,
            date: roadmaps.find((item) => item.weeks.some((entry) => entry.id === week.id))?.createdAt ?? null,
            detail: `${week.title} is ${week.progress}% complete`,
          }))
          .slice(0, 6),
        recordCount: roadmaps.length,
      }),
      competency({
        id: "equipment-library",
        title: "Equipment Familiarization",
        category: "Engineering",
        description: "Progress from cataloged equipment, completed study sections, checklists, photos, and documents.",
        progress: equipment.length ? equipmentProgress : 0,
        lastUpdated: latestDate(equipment.map((item) => item.updatedAt)),
        learningObjectives: ["Catalog site equipment", "Document working principles", "Complete inspection checklists", "Attach equipment evidence"],
        requiredEvidence: ["Equipment records", "Completed engineering sections", "Checklist items", "Photos or documents"],
        uploadedEvidence: equipment.map((item) => item.name),
        assessorFeedback: "Assessor feedback can reference completed equipment records and attached evidence.",
        timeline: equipment
          .map((item) => ({
            label: item.name,
            date: item.updatedAt,
            detail: `${item.category} workspace is ${item.progress}% complete`,
          }))
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6),
        recordCount: equipment.length,
      }),
      competency({
        id: "field-notes",
        title: "Field Observation and Reflection",
        category: "Documentation",
        description: "Progress from daily journal entries, reflections, problems, questions, photos, attachments, and follow-up checklists.",
        progress: journalEntries.length ? journalProgress : 0,
        lastUpdated: latestDate(journalEntries.map((entry) => entry.updatedAt)),
        learningObjectives: ["Record daily activities", "Capture lessons learned", "Document problems and questions", "Complete reflection checklists"],
        requiredEvidence: ["Daily journal entries", "Lessons learned", "Reflection notes", "Attachments or photos where useful"],
        uploadedEvidence: journalEntries.map((entry) => `${entry.date}: ${entry.title}`),
        assessorFeedback: "Assessor feedback can be cross-referenced from journal reflections and weekly reports.",
        timeline: journalEntries
          .map((entry) => ({
            label: entry.title,
            date: entry.updatedAt,
            detail: `${entry.date} field note updated`,
          }))
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6),
        recordCount: journalEntries.length,
      }),
      competency({
        id: "knowledge-base",
        title: "Technical Knowledge Development",
        category: "Knowledge",
        description: "Progress from knowledge articles, markdown content, tags, cross-references, related equipment, and checklists.",
        progress: articles.length ? knowledgeProgress : 0,
        lastUpdated: latestDate(articles.map((article) => article.updatedAt)),
        learningObjectives: ["Create technical articles", "Document concepts", "Link related standards", "Complete article checklists"],
        requiredEvidence: ["Knowledge articles", "Technical content", "Tags", "Cross-references or related equipment"],
        uploadedEvidence: articles.map((article) => article.title),
        assessorFeedback: "Assessor feedback can be captured by reviewing article completeness and linked evidence.",
        timeline: articles
          .map((article) => ({
            label: article.title,
            date: article.updatedAt,
            detail: `${article.category} article updated`,
          }))
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6),
        recordCount: articles.length,
      }),
      competency({
        id: "standards-documents",
        title: "Standards and Document Control",
        category: "Compliance",
        description: "Progress from engineering documents and standards library records linked to equipment and knowledge.",
        progress: documents.length || standards.length ? standardsProgress : 0,
        lastUpdated: latestDate([...documents.map((document) => document.updatedAt), ...standards.map((standard) => standard.updatedAt)]),
        learningObjectives: ["Upload reference documents", "Catalog relevant standards", "Summarize requirements", "Link standards to equipment"],
        requiredEvidence: ["Uploaded documents", "Standards records", "Summaries or notes", "Equipment or knowledge links"],
        uploadedEvidence: [...documents.map((document) => document.title), ...standards.map((standard) => standard.reference)],
        assessorFeedback: "Assessor feedback can validate whether evidence meets site and engineering requirements.",
        timeline: [
          ...documents.map((document) => ({
            label: document.title,
            date: document.updatedAt,
            detail: `${document.category} document updated`,
          })),
          ...standards.map((standard) => ({
            label: standard.reference,
            date: standard.updatedAt,
            detail: `${standard.organization} standard updated`,
          })),
        ]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6),
        recordCount: documents.length + standards.length,
      }),
      competency({
        id: "project-gallery",
        title: "Visual Evidence and Site Gallery",
        category: "Evidence",
        description: "Progress from project gallery photos, notes, locations, and links to equipment or journal entries.",
        progress: photos.length ? galleryProgress : 0,
        lastUpdated: latestDate(photos.map((photo) => photo.updatedAt)),
        learningObjectives: ["Capture site photos", "Annotate observations", "Link photos to equipment", "Build visual evidence"],
        requiredEvidence: ["Uploaded photos", "Photo notes", "Location context", "Equipment or journal links"],
        uploadedEvidence: photos.map((photo) => photo.title),
        assessorFeedback: "Assessor feedback can review whether visual evidence supports competency claims.",
        timeline: photos
          .map((photo) => ({
            label: photo.title,
            date: photo.updatedAt,
            detail: `${photo.category} photo evidence updated`,
          }))
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6),
        recordCount: photos.length,
      }),
    ]

    const activeCompetencies = competencies.filter((item) => item.recordCount > 0)
    const hasData = activeCompetencies.length > 0
    const completedCompetencies = activeCompetencies.filter((item) => item.status === "completed").length
    const inProgressCompetencies = activeCompetencies.filter((item) => item.status === "in-progress").length
    const notStartedCompetencies = competencies.length - completedCompetencies - inProgressCompetencies
    const overallProgress = hasData ? average(activeCompetencies.map((item) => item.progress)) : 0
    const equipmentMastered = equipment.filter((item) => item.progress >= 100).length

    const currentLevel =
      overallProgress >= 90
        ? "Independent Practice"
        : overallProgress >= 65
          ? "Supervised Practice"
          : overallProgress >= 35
            ? "Developing Trainee"
            : hasData
              ? "Foundation"
              : "Not Started"

    return {
      hasData,
      overallProgress,
      completedCompetencies,
      inProgressCompetencies,
      notStartedCompetencies,
      totalCompetencies: competencies.length,
      remainingCompetencies: competencies.length - completedCompetencies,
      currentLevel,
      currentTrip: roadmapTrip ? `Trip ${roadmapTrip.tripNumber}: ${roadmapTrip.name}` : null,
      currentWeek: roadmapWeek ? `Week ${roadmapWeek.weekNumber}: ${roadmapWeek.title}` : null,
      learningHours,
      equipmentMastered,
      knowledgeArticlesCreated: articles.length,
      fieldNotesCreated: journalEntries.length,
      completedWeeklyTasks,
      completedMilestones,
      activeModuleCount: activeCompetencies.length,
      competencies,
    }
  }, [articles, documents, equipment, journalEntries, photos, plannerWeeks, roadmaps, selectedRoadmapId, standards])
}
