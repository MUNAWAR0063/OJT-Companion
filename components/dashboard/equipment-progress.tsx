import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"

export function EquipmentProgress() {
  return (
    <Card
      className="p-6 md:p-8 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "500ms" }}
    >
      <div className="space-y-6 text-center py-8">
        <Zap className="w-12 h-12 text-muted-foreground/50 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">No equipment cataloged yet</h3>
          <p className="text-xs text-muted-foreground">Start building your equipment library to track competency progress</p>
        </div>
        <Link href="/equipment">
          <Button className="h-8 text-xs gap-2 mx-auto">
            <Zap className="w-3 h-3" />
            Add Equipment
          </Button>
        </Link>
      </div>
    </Card>
  )
}
