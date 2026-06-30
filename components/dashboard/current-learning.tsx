import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export function CurrentLearning() {
  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "300ms" }}
    >
      <div className="space-y-6 text-center py-8">
        <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">No equipment selected</h3>
          <p className="text-xs text-muted-foreground">Add equipment to your library to track your learning progress</p>
        </div>
        <Link href="/equipment">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <BookOpen className="w-3 h-3" />
            Go to Equipment Library
          </Button>
        </Link>
      </div>
    </Card>
  )
}
