import { Card } from "@/components/ui/card"
import { MapPin, CalendarDays, Plane } from "lucide-react"

const details = [
  { icon: Plane, label: "Active OJT Assignment", value: "Trip 2 of 4" },
  { icon: CalendarDays, label: "Training Progress", value: "Week 6 of 18" },
  { icon: MapPin, label: "Field Location", value: "Ras Tanura Power Plant" },
]

export function WelcomeCard() {
  return (
    <Card className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up relative border-l-2 border-l-primary">
      <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">Good Morning</p>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-balance text-foreground">Salman</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {details.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
              <p className="text-sm font-semibold truncate text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
