import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NotebookPen } from "lucide-react"
import Link from "next/link"

export function RecentJournal() {
  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "600ms" }}
    >
      <div className="space-y-6 text-center py-8">
        <NotebookPen className="w-12 h-12 text-muted-foreground/50 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">No field notes yet</h3>
          <p className="text-xs text-muted-foreground">Document your daily observations and learnings in the field</p>
        </div>
        <Link href="/team">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <NotebookPen className="w-3 h-3" />
            Write Field Note
          </Button>
        </Link>
      </div>
    </Card>
  )
}
