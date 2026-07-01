import type { DocumentRecord } from "@/lib/document-store"
import type { EquipmentRecord } from "@/lib/equipment-store"
import { equipmentSectionLabels } from "@/lib/equipment-store"
import type { JournalEntry } from "@/lib/journal-store"
import type { KnowledgeArticle } from "@/lib/knowledge-store"
import type { PlannerWeek } from "@/lib/planner-store"
import type { RoadmapItem, RoadmapTrip } from "@/lib/roadmap-store"
import type { StandardRecord } from "@/lib/standards-store"

const generatedLine = () => `Generated: ${new Date().toLocaleString()}`

export interface ReportProfileContext {
  fullName: string
  discipline: string
  company: string
  ojtBatch: string
}

const profileBlock = (profile?: ReportProfileContext) =>
  profile
    ? `**User Name:** ${profile.fullName || "Not recorded"}  
**Discipline:** ${profile.discipline || "Not recorded"}  
**Company:** ${profile.company || "Not recorded"}  
**Batch:** ${profile.ojtBatch || "Not recorded"}  

`
    : ""

export function weeklyReportMarkdown(week: PlannerWeek, journals: JournalEntry[], profile?: ReportProfileContext) {
  const relatedJournals = journals.filter((entry) => {
    const entryDate = new Date(`${entry.date}T00:00:00`).getTime()
    const weekStart = new Date(week.createdAt).getTime()
    return entryDate >= weekStart && entryDate < weekStart + 7 * 24 * 60 * 60 * 1000
  })
  return `# Weekly Report — Week ${week.weekNumber}

## ${week.title}

${generatedLine()}

${profileBlock(profile)}
**Completion:** ${week.progress}%  
**Objectives:** ${week.objectives.length}  
**Estimated Hours:** ${week.objectives.reduce((total, objective) => total + objective.estimatedHours, 0)}

## Objectives

${week.objectives.map((objective) => `### ${objective.title}

- Priority: ${objective.priority}
- Status: ${objective.status}
- Progress: ${objective.progress}%
- Equipment: ${objective.equipment.join(", ") || "None"}
- Estimated hours: ${objective.estimatedHours}

${objective.description || "No description."}

${objective.checklist.map((item) => `- [${item.done ? "x" : " "}] ${item.text}`).join("\n")}

${objective.notes ? `**Notes:** ${objective.notes}` : ""}`).join("\n\n")}

## Weekly Reflection

${week.reflection || "No reflection recorded."}

## Journal Entries

${relatedJournals.length ? relatedJournals.map((entry) => `### ${entry.date} — ${entry.title}

${entry.dailyActivities || "No activities recorded."}

**Lessons learned:** ${entry.lessonsLearned || "None recorded."}
`).join("\n") : "No journal entries matched this week."}
`
}

export function tripReportMarkdown(roadmap: RoadmapItem, trip: RoadmapTrip, profile?: ReportProfileContext) {
  const weeks = roadmap.weeks.filter((week) => week.tripId === trip.id)
  const progress = weeks.length
    ? Math.round(weeks.reduce((total, week) => total + week.progress, 0) / weeks.length)
    : 0
  return `# Trip Report — ${trip.name}

${generatedLine()}

${profileBlock(profile)}
**Roadmap:** ${roadmap.title}  
**Trip:** ${trip.tripNumber}  
**Location:** ${trip.location}  
**Focus:** ${trip.focus}  
**Completion:** ${progress}%

## Description

${trip.description || "No description recorded."}

## Weeks

${weeks.length ? weeks.map((week) => `### Week ${week.weekNumber} — ${week.title}

**Progress:** ${week.progress}%

${week.objectives.map((objective) => `- ${objective.title}: ${objective.progress}% (${objective.status})`).join("\n")}

**Reflection:** ${week.reflection || "No reflection recorded."}`).join("\n\n") : "No weeks assigned to this trip."}
`
}

export function equipmentReportMarkdown(
  equipment: EquipmentRecord,
  standards: StandardRecord[],
  documents: DocumentRecord[],
  profile?: ReportProfileContext
) {
  const relatedStandards = standards.filter((standard) => standard.relatedEquipment.includes(equipment.id))
  const relatedDocuments = documents.filter((document) => document.relatedEquipment.includes(equipment.id))
  return `# Equipment Report — ${equipment.name}

${generatedLine()}

${profileBlock(profile)}
**Category:** ${equipment.category}  
**Manufacturer:** ${equipment.manufacturer || "Not recorded"}  
**Model:** ${equipment.model || "Not recorded"}  
**Rating:** ${equipment.rating || "Not recorded"}  
**Location:** ${equipment.location || "Not recorded"}  
**Workspace Completion:** ${equipment.progress}%

${Object.entries(equipmentSectionLabels).map(([key, label]) => `## ${label}

${equipment.sections[key as keyof typeof equipmentSectionLabels] || "Not documented."}`).join("\n\n")}

## Checklist

${equipment.checklist.length ? equipment.checklist.map((item) => `- [${item.done ? "x" : " "}] ${item.text}`).join("\n") : "No checklist items."}

## Related Standards

${relatedStandards.length ? relatedStandards.map((standard) => `- ${standard.reference}: ${standard.title}`).join("\n") : "No related standards."}

## Related Documents

${relatedDocuments.length ? relatedDocuments.map((document) => `- ${document.title} (${document.category})`).join("\n") : "No related documents."}
`
}

export function knowledgeReportMarkdown(
  article: KnowledgeArticle,
  equipment: EquipmentRecord[],
  standards: StandardRecord[],
  documents: DocumentRecord[],
  profile?: ReportProfileContext
) {
  const relatedEquipment = equipment.filter((item) => article.relatedEquipment.includes(item.id))
  const relatedDocuments = documents.filter((document) => document.relatedKnowledge.includes(article.id))
  const relatedStandards = standards.filter((standard) =>
    article.relatedStandards.some(
      (reference) => standard.reference.toLowerCase() === reference.toLowerCase()
    )
  )
  return `# Knowledge Report — ${article.title}

${generatedLine()}

${profileBlock(profile)}
**Category:** ${article.category}  
**Tags:** ${article.tags.join(", ") || "None"}  
**Last Updated:** ${new Date(article.updatedAt).toLocaleString()}

## Article

${article.content}

## Checklist

${article.checklist.length ? article.checklist.map((item) => `- [${item.done ? "x" : " "}] ${item.text}`).join("\n") : "No checklist items."}

## Related Equipment

${relatedEquipment.length ? relatedEquipment.map((item) => `- ${item.name} (${item.category})`).join("\n") : "No related equipment."}

## Related Standards

${article.relatedStandards.length ? article.relatedStandards.map((reference) => `- ${reference}`).join("\n") : "No related standards."}

${relatedStandards.length ? `\nMatched library records: ${relatedStandards.map((standard) => standard.title).join(", ")}` : ""}

## Related Documents

${relatedDocuments.length ? relatedDocuments.map((document) => `- ${document.title} (${document.category})`).join("\n") : "No related documents."}
`
}
