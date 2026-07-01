"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import Link from "next/link"
import { useDocumentStore } from "@/lib/document-store"

export function RecentDocuments() {
  const documents = useDocumentStore((state) => state.documents)
  const latest = [...documents].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null

  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "700ms" }}
    >
      <div className="space-y-6 text-center py-8">
        <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {latest ? latest.title : "No documents uploaded"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {latest
              ? `${latest.category} · ${documents.length} ${documents.length === 1 ? "document" : "documents"} available`
              : "Upload diagrams, datasheets, and standards for field reference."}
          </p>
        </div>
        <Link href="/documents">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <FileText className="w-3 h-3" />
            {latest ? "Open Documents" : "Upload Document"}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
