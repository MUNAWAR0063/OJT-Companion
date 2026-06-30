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
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "600ms" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-foreground">Recent Field Notes</h2>
        <Button variant="ghost" size="sm" className="text-xs h-8 text-primary hover:text-primary">
          View all
        </Button>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.title}
            className="flex gap-3 p-3 rounded-xl border border-border transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:scale-[1.01]"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <NotebookPen className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground truncate">{entry.title}</h3>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">{entry.time}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{entry.excerpt}</p>
              <span className="inline-block mt-1.5 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {entry.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
