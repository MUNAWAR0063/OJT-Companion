"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, FileText, Download } from "lucide-react"
import { useApp } from "@/lib/app-context"

export function ReportsInteractive() {
  const { reports, generateReport, weeklyPlans, fieldNotes, equipment, articles, documents, photos, getStats } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [weekRange, setWeekRange] = useState("")

  const stats = getStats()

  const handleGenerateReport = () => {
    if (weekRange.trim()) {
      generateReport(weekRange)
      setWeekRange("")
      setIsOpen(false)
    }
  }

  const handleDownloadReport = (report: any) => {
    const content = `
# Weekly Training Report
## ${report.title}

**Generated:** ${new Date(report.generatedAt).toLocaleDateString()}
**Week Range:** ${report.weekRange}

## Summary
${report.summary}

## Statistics
- Weekly Plans: ${weeklyPlans.length}
- Equipment Cataloged: ${equipment.length}
- Field Notes: ${fieldNotes.length}
- Knowledge Articles: ${articles.length}
- Documents: ${documents.length}
- Photos: ${photos.length}
- Objectives Completed: ${stats.completedObjectives}/${stats.totalObjectives}

---
*Report generated from OJT Companion Training Application*
    `.trim()

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${report.title.replace(/\s+/g, "_")}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (reports.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6 py-8">
          <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">No reports generated</h3>
            <p className="text-xs text-muted-foreground">Generate weekly reports from your training data</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="mx-auto gap-2">
                <Plus className="w-4 h-4" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate Weekly Report</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <label className="text-xs font-medium mb-2 block">Week Range*</label>
                  <Input
                    value={weekRange}
                    onChange={(e) => setWeekRange(e.target.value)}
                    placeholder="e.g., Week 1-2 or Jan 15-21"
                  />
                </div>

                <div className="bg-secondary/50 rounded p-4 space-y-2">
                  <p className="text-xs font-medium text-foreground">Current Data Summary:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Weekly Plans: {weeklyPlans.length}</p>
                    <p>Equipment Items: {equipment.length}</p>
                    <p>Field Notes: {fieldNotes.length}</p>
                    <p>Knowledge Articles: {articles.length}</p>
                    <p>Documents: {documents.length}</p>
                    <p>Photos: {photos.length}</p>
                    <p>Objectives Completed: {stats.completedObjectives}/{stats.totalObjectives}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateReport} disabled={!weekRange.trim()}>
                  Generate Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Generated Reports ({reports.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate Weekly Report</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium mb-2 block">Week Range*</label>
                <Input
                  value={weekRange}
                  onChange={(e) => setWeekRange(e.target.value)}
                  placeholder="e.g., Week 1-2 or Jan 15-21"
                />
              </div>

              <div className="bg-secondary/50 rounded p-4 space-y-2">
                <p className="text-xs font-medium text-foreground">Current Data Summary:</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Weekly Plans: {weeklyPlans.length}</p>
                  <p>Equipment Items: {equipment.length}</p>
                  <p>Field Notes: {fieldNotes.length}</p>
                  <p>Knowledge Articles: {articles.length}</p>
                  <p>Documents: {documents.length}</p>
                  <p>Photos: {photos.length}</p>
                  <p>Objectives Completed: {stats.completedObjectives}/{stats.totalObjectives}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateReport} disabled={!weekRange.trim()}>
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(report.generatedAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDownloadReport(report)}
                className="text-primary hover:text-primary/80"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-foreground/80 mb-3 line-clamp-3">{report.summary}</p>

            <div className="bg-secondary/50 rounded p-3 text-xs space-y-1 mb-3">
              <p className="font-medium text-foreground mb-2">Report Details:</p>
              <p className="text-muted-foreground">Week Range: {report.weekRange}</p>
              <p className="text-muted-foreground">Items Analyzed: {weeklyPlans.length + equipment.length + fieldNotes.length + articles.length + documents.length + photos.length}</p>
            </div>

            <Button
              size="sm"
              className="w-full text-xs gap-2"
              onClick={() => handleDownloadReport(report)}
            >
              <Download className="w-3 h-3" />
              Download Report
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
