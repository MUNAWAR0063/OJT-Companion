import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NotebookPen } from "lucide-react"

const entries = [
  {
    title: "Transformer differential protection observation",
    excerpt: "Noted 87T relay pickup settings during commissioning test on T-2 main transformer.",
    tag: "Transformer",
    time: "2h ago",
  },
  {
    title: "Generator load rejection test",
    excerpt: "Recorded frequency overshoot and AVR response during partial load rejection.",
    tag: "Generator",
    time: "Yesterday",
  },
  {
    title: "UPS battery autonomy check",
    excerpt: "Measured backup runtime at 80% load; logged cell voltages for the bank.",
    tag: "UPS",
    time: "2 days ago",
  },
]

export function RecentJournal() {
  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "600ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Recent Field Notes</h2>
        <Button variant="ghost" size="sm" className="text-xs h-8 text-primary hover:text-primary">
          View all
        </Button>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.title}
            className="flex gap-3 p-4 rounded-lg border border-border transition-all duration-300 hover:shadow-md hover:border-primary/30"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <NotebookPen className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2">{entry.title}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 ml-2">{entry.time}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{entry.excerpt}</p>
              <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {entry.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
