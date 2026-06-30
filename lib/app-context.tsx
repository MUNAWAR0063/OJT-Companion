"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export interface WeeklyPlan {
  id: string
  weekNumber: number
  startDate: Date
  endDate: Date
  tripNumber: number
  tripName: string
  location: string
  objectives: WeeklyObjective[]
  reflection?: string
  createdAt: Date
}

export interface WeeklyObjective {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  status: "not-started" | "in-progress" | "completed"
  checklist: ChecklistItem[]
  equipment: string[]
  notes: string
  progress: number
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Equipment {
  id: string
  name: string
  type: string
  manufacturer: string
  rating: string
  location: string
  description: string
  notes: string
  documents: string[]
  photos: string[]
  lessonsLearned: string[]
  createdAt: Date
}

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  importance: "core" | "medium" | "optional"
  mastered: boolean
  createdAt: Date
}

export interface FieldNote {
  id: string
  title: string
  content: string
  date: Date
  tags: string[]
  equipment: string[]
  createdAt: Date
}

export interface Document {
  id: string
  name: string
  type: string
  category: string
  description: string
  size: number
  uploadedAt: Date
  data: string // base64 encoded
}

export interface PhotoGallery {
  id: string
  title: string
  location: string
  tags: string[]
  description: string
  data: string // base64 encoded
  createdAt: Date
}

export interface AppReport {
  id: string
  title: string
  weekRange: string
  generatedAt: Date
  summary: string
}

interface AppContextType {
  // User data
  userName: string
  setUserName: (name: string) => void
  
  // Weekly plans
  weeklyPlans: WeeklyPlan[]
  addWeeklyPlan: (plan: Omit<WeeklyPlan, "id" | "createdAt">) => void
  updateWeeklyPlan: (id: string, plan: Partial<WeeklyPlan>) => void
  deleteWeeklyPlan: (id: string) => void
  
  // Equipment
  equipment: Equipment[]
  addEquipment: (eq: Omit<Equipment, "id" | "createdAt">) => void
  updateEquipment: (id: string, eq: Partial<Equipment>) => void
  deleteEquipment: (id: string) => void
  
  // Knowledge base
  articles: KnowledgeArticle[]
  addArticle: (article: Omit<KnowledgeArticle, "id" | "createdAt">) => void
  updateArticle: (id: string, article: Partial<KnowledgeArticle>) => void
  deleteArticle: (id: string) => void
  
  // Field notes
  fieldNotes: FieldNote[]
  addFieldNote: (note: Omit<FieldNote, "id" | "createdAt">) => void
  updateFieldNote: (id: string, note: Partial<FieldNote>) => void
  deleteFieldNote: (id: string) => void
  
  // Documents
  documents: Document[]
  addDocument: (doc: Omit<Document, "id">) => void
  deleteDocument: (id: string) => void
  
  // Photos
  photos: PhotoGallery[]
  addPhoto: (photo: Omit<PhotoGallery, "id" | "createdAt">) => void
  deletePhoto: (id: string) => void
  
  // Reports
  reports: AppReport[]
  generateReport: (weekRange: string) => void
  
  // Stats (calculated)
  getStats: () => {
    equipmentCount: number
    articleCount: number
    fieldNoteCount: number
    documentCount: number
    photoCount: number
    completedObjectives: number
    totalObjectives: number
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("User")
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [fieldNotes, setFieldNotes] = useState<FieldNote[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [photos, setPhotos] = useState<PhotoGallery[]>([])
  const [reports, setReports] = useState<AppReport[]>([])

  const addWeeklyPlan = useCallback((plan: Omit<WeeklyPlan, "id" | "createdAt">) => {
    const newPlan: WeeklyPlan = {
      ...plan,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    setWeeklyPlans((prev) => [...prev, newPlan])
  }, [])

  const updateWeeklyPlan = useCallback((id: string, updates: Partial<WeeklyPlan>) => {
    setWeeklyPlans((prev) => prev.map((plan) => (plan.id === id ? { ...plan, ...updates } : plan)))
  }, [])

  const deleteWeeklyPlan = useCallback((id: string) => {
    setWeeklyPlans((prev) => prev.filter((plan) => plan.id !== id))
  }, [])

  const addEquipment = useCallback((eq: Omit<Equipment, "id" | "createdAt">) => {
    const newEq: Equipment = {
      ...eq,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    setEquipment((prev) => [...prev, newEq])
  }, [])

  const updateEquipment = useCallback((id: string, updates: Partial<Equipment>) => {
    setEquipment((prev) => prev.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq)))
  }, [])

  const deleteEquipment = useCallback((id: string) => {
    setEquipment((prev) => prev.filter((eq) => eq.id !== id))
  }, [])

  const addArticle = useCallback((article: Omit<KnowledgeArticle, "id" | "createdAt">) => {
    const newArticle: KnowledgeArticle = {
      ...article,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    setArticles((prev) => [...prev, newArticle])
  }, [])

  const updateArticle = useCallback((id: string, updates: Partial<KnowledgeArticle>) => {
    setArticles((prev) => prev.map((article) => (article.id === id ? { ...article, ...updates } : article)))
  }, [])

  const deleteArticle = useCallback((id: string) => {
    setArticles((prev) => prev.filter((article) => article.id !== id))
  }, [])

  const addFieldNote = useCallback((note: Omit<FieldNote, "id" | "createdAt">) => {
    const newNote: FieldNote = {
      ...note,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    setFieldNotes((prev) => [...prev, newNote])
  }, [])

  const updateFieldNote = useCallback((id: string, updates: Partial<FieldNote>) => {
    setFieldNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...updates } : note)))
  }, [])

  const deleteFieldNote = useCallback((id: string) => {
    setFieldNotes((prev) => prev.filter((note) => note.id !== id))
  }, [])

  const addDocument = useCallback((doc: Omit<Document, "id">) => {
    const newDoc: Document = {
      ...doc,
      id: Math.random().toString(36).substr(2, 9),
    }
    setDocuments((prev) => [...prev, newDoc])
  }, [])

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }, [])

  const addPhoto = useCallback((photo: Omit<PhotoGallery, "id" | "createdAt">) => {
    const newPhoto: PhotoGallery = {
      ...photo,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    }
    setPhotos((prev) => [...prev, newPhoto])
  }, [])

  const deletePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id))
  }, [])

  const generateReport = useCallback((weekRange: string) => {
    const newReport: AppReport = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Weekly Report - ${weekRange}`,
      weekRange,
      generatedAt: new Date(),
      summary: `Report generated from ${fieldNotes.length} field notes, ${equipment.length} equipment items, and ${articles.length} knowledge articles.`,
    }
    setReports((prev) => [...prev, newReport])
  }, [fieldNotes, equipment, articles])

  const getStats = useCallback(() => {
    const completedObjectives = weeklyPlans.reduce(
      (acc, plan) => acc + plan.objectives.filter((obj) => obj.status === "completed").length,
      0
    )
    const totalObjectives = weeklyPlans.reduce((acc, plan) => acc + plan.objectives.length, 0)

    return {
      equipmentCount: equipment.length,
      articleCount: articles.length,
      fieldNoteCount: fieldNotes.length,
      documentCount: documents.length,
      photoCount: photos.length,
      completedObjectives,
      totalObjectives,
    }
  }, [weeklyPlans, equipment, articles, fieldNotes, documents, photos])

  const value: AppContextType = {
    userName,
    setUserName,
    weeklyPlans,
    addWeeklyPlan,
    updateWeeklyPlan,
    deleteWeeklyPlan,
    equipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    fieldNotes,
    addFieldNote,
    updateFieldNote,
    deleteFieldNote,
    documents,
    addDocument,
    deleteDocument,
    photos,
    addPhoto,
    deletePhoto,
    reports,
    generateReport,
    getStats,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
