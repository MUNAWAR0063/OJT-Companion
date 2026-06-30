import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap, Box, Cpu, BatteryCharging, PanelsTopLeft, ShieldCheck } from "lucide-react"

const equipment = [
  { name: "Generator", icon: Zap, progress: 65, status: "In Progress" },
  { name: "Transformer", icon: Box, progress: 90, status: "Proficient" },
  { name: "Motor", icon: Cpu, progress: 45, status: "In Progress" },
  { name: "UPS", icon: BatteryCharging, progress: 30, status: "Foundation" },
  { name: "Switchgear", icon: PanelsTopLeft, progress: 15, status: "Foundation" },
  { name: "Protection Relay", icon: ShieldCheck, progress: 0, status: "Not started" },
]

export function EquipmentProgress() {
  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "500ms" }}
    >
      <h2 className="text-lg md:text-xl font-semibold text-foreground mb-6 md:mb-8">Equipment Competency</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        {equipment.map((eq) => (
          <div key={eq.name} className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <eq.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{eq.name}</span>
                  <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">{eq.progress}%</span>
                </div>
                <span className="text-xs text-muted-foreground">{eq.status}</span>
              </div>
            </div>
            <Progress value={eq.progress} className="h-2" />
          </div>
        ))}
      </div>
    </Card>
  )
}
