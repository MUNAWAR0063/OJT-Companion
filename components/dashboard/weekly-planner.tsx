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
  active: { icon: Clock, className: "text-warning" },
  todo: { icon: Circle, className: "text-muted-foreground/50" },
}

export function WeeklyPlanner() {
  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "400ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Weekly Learning Plan</h2>
        <span className="text-xs font-medium text-muted-foreground">Week 6</span>
      </div>
      <div className="space-y-2.5">
        {plan.map((item) => {
          const config = statusConfig[item.status as keyof typeof statusConfig]
          return (
            <div
              key={item.day}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors duration-200 ${
                item.status === "active" ? "bg-secondary/60" : "hover:bg-secondary/40"
              }`}
            >
              <div className="w-8 text-center flex-shrink-0 pt-0.5">
                <span className="text-xs font-semibold text-muted-foreground">{item.day}</span>
              </div>
              <config.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.className}`} />
              <span
                className={`text-sm leading-snug flex-1 ${
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
