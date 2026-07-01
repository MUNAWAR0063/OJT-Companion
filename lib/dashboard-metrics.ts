import type { DocumentRecord } from "@/lib/document-store"
import type { EquipmentRecord } from "@/lib/equipment-store"
import type { JournalEntry } from "@/lib/journal-store"
import type { KnowledgeArticle } from "@/lib/knowledge-store"

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : 0

export function getKnowledgeProgress(articles: KnowledgeArticle[]) {
  return average(
    articles.map((article) => {
      const requirements = [
        article.title.trim().length > 0,
        article.category.trim().length > 0,
        article.content.trim().length > 0,
        article.tags.length > 0,
        ...article.checklist.map((item) => item.done),
      ]
      return Math.round((requirements.filter(Boolean).length / requirements.length) * 100)
    })
  )
}

export function getJournalProgress(entries: JournalEntry[]) {
  return average(
    entries.map((entry) => {
      const requirements = [
        entry.dailyActivities.trim().length > 0,
        entry.lessonsLearned.trim().length > 0,
        entry.problems.trim().length > 0,
        entry.questions.trim().length > 0,
        entry.reflection.trim().length > 0,
        ...entry.checklist.map((item) => item.done),
      ]
      return Math.round((requirements.filter(Boolean).length / requirements.length) * 100)
    })
  )
}

export function getDocumentProgress(documents: DocumentRecord[]) {
  return average(
    documents.map((document) => {
      const requirements = [
        document.title.trim().length > 0,
        document.category.trim().length > 0,
        document.file.filePath.length > 0,
        document.description.trim().length > 0,
        document.tags.length > 0,
        document.relatedEquipment.length + document.relatedKnowledge.length > 0,
      ]
      return Math.round((requirements.filter(Boolean).length / requirements.length) * 100)
    })
  )
}

export function getEquipmentProgress(equipment: EquipmentRecord[]) {
  return average(equipment.map((item) => item.progress))
}
