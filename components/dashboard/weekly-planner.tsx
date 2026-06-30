import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"

export function WeeklyPlanner() {
  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "400ms" }}
    >
      <div className="space-y-6 text-center py-8">
        <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">No weekly plan created</h3>
          <p className="text-xs text-muted-foreground">Create your weekly learning objectives and track daily progress</p>
        </div>
        <Link href="/calendar">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <Calendar className="w-3 h-3" />
            Plan This Week
          </Button>
        </Link>
      </div>
    </Card>
  )
}
