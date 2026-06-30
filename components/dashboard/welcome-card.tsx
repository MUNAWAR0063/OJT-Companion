import { Card } from "@/components/ui/card"
import { MapPin, CalendarDays, Plane } from "lucide-react"

const details = [
  { icon: Plane, label: "Current OJT Trip", value: "Trip 2 of 4" },
  { icon: CalendarDays, label: "Current Week", value: "Week 6 of 18" },
  { icon: MapPin, label: "Current Site", value: "Ras Tanura Power Plant" },
]

export function WelcomeCard() {
  return (
    <Card className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up relative border-l-2 border-l-primary">
      <p className="text-sm font-medium text-muted-foreground">Good Morning,</p>
      <h2 className="text-2xl md:text-3xl font-bold mb-5 text-balance text-foreground">Salman</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {details.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold truncate text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
