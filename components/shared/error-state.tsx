import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this page. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="p-10 md:p-16 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mb-5">
        <AlertCircle className="w-7 h-7 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2 text-balance">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed text-pretty mb-6">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </Card>
  )
}
