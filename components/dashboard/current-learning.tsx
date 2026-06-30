import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Cpu, ArrowRight } from "lucide-react"

const topics = [
  "Excitation & AVR systems",
  "Synchronization procedures",
  "Cooling & lubrication monitoring",
]

export function CurrentLearning() {
  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "300ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Current Learning</h2>
        <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          In Progress
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Cpu className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Synchronous Generator</h3>
          <p className="text-xs text-muted-foreground">11 kV · 25 MVA · Brushless excitation</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Study completion</span>
          <span className="font-semibold text-foreground">65%</span>
        </div>
        <Progress value={65} className="h-2" />
      </div>

      <ul className="space-y-2 mb-5">
        {topics.map((topic) => (
          <li key={topic} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            {topic}
          </li>
        ))}
      </ul>

      <Button variant="outline" className="w-full bg-transparent transition-all duration-300 hover:scale-[1.02]">
        Continue Studying
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </Card>
  )
}
