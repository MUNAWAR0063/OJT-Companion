import type { ComponentType, SVGProps } from "react"

interface FeatureCardProps {
  title: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <article className="group flex min-h-32 gap-4 rounded-xl border border-border/80 bg-card/60 p-5 shadow-lg shadow-black/15 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card/80">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </article>
  )
}
