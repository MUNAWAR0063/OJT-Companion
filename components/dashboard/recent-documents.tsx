import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import Link from "next/link"

export function RecentDocuments() {
  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "700ms" }}
    >
      <div className="space-y-6 text-center py-8">
        <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">No documents uploaded</h3>
          <p className="text-xs text-muted-foreground">Upload diagrams, datasheets, and standards for field reference</p>
        </div>
        <Link href="/documents">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <FileText className="w-3 h-3" />
            Upload Document
          </Button>
        </Link>
      </div>
    </Card>
  )
}
