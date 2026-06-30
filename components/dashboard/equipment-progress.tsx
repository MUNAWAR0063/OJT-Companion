import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap, Box, Cpu, BatteryCharging, PanelsTopLeft, ShieldCheck } from "lucide-react"

const equipment = [
  { name: "Generator", icon: Zap, progress: 65, status: "Studying" },
  { name: "Transformer", icon: Box, progress: 90, status: "Mastered" },
  { name: "Motor", icon: Cpu, progress: 45, status: "Studying" },
  { name: "UPS", icon: BatteryCharging, progress: 30, status: "Started" },
  { name: "Switchgear", icon: PanelsTopLeft, progress: 15, status: "Started" },
  { name: "Protection Relay", icon: ShieldCheck, progress: 0, status: "Not started" },
]

export function EquipmentProgress() {
  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "500ms" }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-6">Equipment Progress</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {equipment.map((eq) => (
          <div key={eq.name} className="group">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <eq.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">{eq.name}</span>
                  <span className="text-xs font-semibold text-muted-foreground ml-2">{eq.progress}%</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{eq.status}</span>
              </div>
            </div>
            <Progress value={eq.progress} className="h-1.5" />
          </div>
        ))}
      </div>
    </Card>
  )
}
