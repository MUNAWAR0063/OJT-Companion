import { Card } from "@/components/ui/card"
import { NotebookPen, Cpu, BookOpen, Upload } from "lucide-react"
import Link from "next/link"

const actions = [
  { label: "New Field Note", icon: NotebookPen, href: "/team" },
  { label: "Equipment Log", icon: Cpu, href: "/equipment" },
  { label: "Add Lesson Learned", icon: BookOpen, href: "/tasks" },
  { label: "Upload Standard", icon: Upload, href: "/documents" },
]

export function QuickActions() {
  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "800ms" }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-5">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border text-center transition-all duration-300 hover:border-primary/40 hover:bg-secondary/50 hover:scale-[1.03]"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <action.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  )
}
