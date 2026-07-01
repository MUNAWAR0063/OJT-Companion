import { Card } from "@/components/ui/card"
import { NotebookPen, Cpu, BookOpen, Upload } from "lucide-react"
import Link from "next/link"

const actions = [
  { label: "New Journal Entry", icon: NotebookPen, href: "/team" },
  { label: "Equipment Log", icon: Cpu, href: "/equipment" },
  { label: "Add Lesson Learned", icon: BookOpen, href: "/tasks" },
  { label: "Add Standard", icon: Upload, href: "/standards" },
]

export function QuickActions() {
  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "800ms" }}
    >
      <h2 className="text-lg md:text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center justify-center gap-2 p-4 md:p-5 rounded-lg border border-border text-center transition-all duration-300 hover:border-primary/40 hover:bg-secondary/50 hover:scale-[1.03]"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-primary/10 flex items-center justify-center">
              <action.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <span className="text-xs md:text-sm font-medium text-foreground line-clamp-2">{action.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  )
}
