import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

export function LearningProgress() {
  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "100ms" }}
    >
      <div className="space-y-6 text-center py-12">
        <TrendingUp className="w-14 h-14 text-muted-foreground/40 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">No competency data yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Start creating weekly plans, logging equipment studies, and capturing knowledge to track your competency progress
          </p>
        </div>
        <Link href="/calendar">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <TrendingUp className="w-3 h-3" />
            Get Started
          </Button>
        </Link>
      </div>
    </Card>
  )
}
