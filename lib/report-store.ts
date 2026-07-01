"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { supabaseStateStorage } from "@/lib/supabase/storage"

export type ReportType = "weekly" | "trip" | "equipment" | "knowledge"

export interface GeneratedReport {
  id: string
  type: ReportType
  title: string
  subtitle: string
  markdown: string
  createdAt: string
}

interface ReportStore {
  reports: GeneratedReport[]
  createReport: (input: Omit<GeneratedReport, "id" | "createdAt">) => GeneratedReport
  deleteReport: (id: string) => void
}

const makeId = () => Math.random().toString(36).slice(2, 10)

export const useReportStore = create<ReportStore>()(
  persist(
    (set) => ({
      reports: [],

      createReport: (input) => {
        const report: GeneratedReport = {
          ...input,
          id: makeId(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ reports: [report, ...state.reports] }))
        return report
      },

      deleteReport: (id) =>
        set((state) => ({ reports: state.reports.filter((report) => report.id !== id) })),
    }),
    {
      name: "ojt-generated-reports",
      storage: createJSONStorage(() => supabaseStateStorage),
    }
  )
)
