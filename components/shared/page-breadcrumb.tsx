"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageBreadcrumbProps {
  items?: BreadcrumbItem[]
}

const pathToLabel: Record<string, string> = {
  "": "Dashboard",
  learning: "Learning",
  roadmap: "Learning Roadmap",
  calendar: "Weekly Goals",
  team: "Field Notes",
  tasks: "Knowledge Base",
  equipment: "Equipment Library",
  documents: "Standards & Documentation",
  gallery: "Project Gallery",
  analytics: "Competencies",
  reports: "Reports",
  settings: "Settings",
}

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (!items) {
    items = [
      { label: "Dashboard", href: "/" },
      ...segments.map((segment, index) => ({
        label: pathToLabel[segment] || segment.replace(/-/g, " "),
        href: index === segments.length - 1 ? undefined : `/${segments.slice(0, index + 1).join("/")}`,
      })),
    ]
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
