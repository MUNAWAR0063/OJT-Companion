import { Card } from "@/components/ui/card"
import { CheckCircle2, Circle, Clock } from "lucide-react"

const plan = [
  { day: "Mon", objective: "Generator construction & operating principles", status: "done" },
  { day: "Tue", objective: "Transformer types, vector groups & cooling", status: "done" },
  { day: "Wed", objective: "Induction & synchronous motor fundamentals", status: "active" },
  { day: "Thu", objective: "UPS topologies & battery maintenance", status: "todo" },
  { day: "Fri", objective: "Switchgear & protection relay coordination", status: "todo" },
]

const statusConfig = {
  done: { icon: CheckCircle2, className: "text-primary" },
  active: { icon: Clock, className: "text-amber-500" },
  todo: { icon: Circle, className: "text-muted-foreground/50" },
}

export function WeeklyPlanner() {
  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "400ms" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-foreground">Weekly Planner</h2>
        <span className="text-xs text-muted-foreground">Week 6</span>
      </div>
      <div className="space-y-2">
        {plan.map((item) => {
          const config = statusConfig[item.status as keyof typeof statusConfig]
          return (
            <div
              key={item.day}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors duration-200 ${
                item.status === "active" ? "bg-secondary/60" : "hover:bg-secondary/40"
              }`}
            >
              <div className="w-9 text-center flex-shrink-0">
                <span className="text-xs font-semibold text-muted-foreground">{item.day}</span>
              </div>
              <config.icon className={`w-4 h-4 flex-shrink-0 ${config.className}`} />
              <span
                className={`text-sm leading-snug ${
                  item.status === "done" ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {item.objective}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
