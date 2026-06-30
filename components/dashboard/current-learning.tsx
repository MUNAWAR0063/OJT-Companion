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
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "300ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Focus Equipment</h2>
        <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full whitespace-nowrap">
          In Progress
        </span>
      </div>

      <div className="flex items-start gap-4 mb-6 p-4 rounded-lg bg-secondary/30">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Cpu className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">Synchronous Generator</h3>
          <p className="text-xs text-muted-foreground mt-1">11 kV · 25 MVA · Brushless excitation</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground font-medium">Study completion</span>
          <span className="font-semibold text-foreground">65%</span>
        </div>
        <Progress value={65} className="h-2" />
      </div>

      <ul className="space-y-2.5 mb-6">
        {topics.map((topic) => (
          <li key={topic} className="flex items-center gap-3 text-sm text-muted-foreground">
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
