import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

const documents = [
  { name: "Generator O&M Manual.pdf", meta: "12.4 MB · opened 1h ago" },
  { name: "Transformer Test Report T-2.pdf", meta: "3.1 MB · opened 3h ago" },
  { name: "Protection Relay Settings Guide.pdf", meta: "8.7 MB · opened yesterday" },
  { name: "Switchgear Single Line Diagram.pdf", meta: "1.2 MB · opened 2 days ago" },
]

export function RecentDocuments() {
  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "700ms" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-foreground">Recent Standards</h2>
        <Button variant="ghost" size="sm" className="text-xs h-8 text-primary hover:text-primary">
          View all
        </Button>
      </div>
      <div className="space-y-2">
        {documents.map((doc) => (
          <button
            key={doc.name}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors duration-200 hover:bg-secondary/60"
          >
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-destructive" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
              <p className="text-[11px] text-muted-foreground">{doc.meta}</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}
