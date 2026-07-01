"use client"

import {
  LayoutDashboard,
  GraduationCap,
  Map,
  CalendarRange,
  NotebookPen,
  Zap,
  LifeBuoy,
  CircuitBoard,
  BookOpen,
  BookMarked,
  FileText,
  Images,
  BarChart3,
  TrendingUp,
  FileBarChart,
  Bell,
  Settings,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebarState } from "@/lib/sidebar-state"
import { ThemedLogo } from "@/components/ThemedLogo"

type NavLeaf = {
  icon: typeof LayoutDashboard
  label: string
  href: string
  badge?: string
}

type NavGroup = {
  icon: typeof LayoutDashboard
  label: string
  children: NavLeaf[]
}

type NavEntry = NavLeaf | NavGroup

const isGroup = (entry: NavEntry): entry is NavGroup => "children" in entry

const navEntries: NavEntry[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CalendarRange, label: "Weekly Planner", href: "/calendar" },
  {
    icon: GraduationCap,
    label: "Learning",
    children: [
      { icon: Map, label: "Learning Roadmap", href: "/learning/roadmap" },
      { icon: NotebookPen, label: "Daily Journal", href: "/team" },
    ],
  },
  {
    icon: Zap,
    label: "Engineering",
    children: [
      { icon: CircuitBoard, label: "Equipment Library", href: "/equipment" },
      { icon: BookOpen, label: "Knowledge Base", href: "/tasks" },
      { icon: BookMarked, label: "Standards Library", href: "/standards" },
      { icon: FileText, label: "Documents", href: "/documents" },
      { icon: Images, label: "Photo Gallery", href: "/gallery" },
    ],
  },
  {
    icon: BarChart3,
    label: "Progress",
    children: [
      { icon: TrendingUp, label: "Competency", href: "/competencies" },
      { icon: FileBarChart, label: "Reports", href: "/reports" },
    ],
  },
  { icon: Bell, label: "Notification Center", href: "/notifications" },
  { icon: LifeBuoy, label: "Help & Support", href: "/help" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

interface SidebarProps {
  variant?: "responsive" | "drawer"
  onNavigate?: () => void
}

export function Sidebar({ variant = "responsive", onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { expanded, collapsed, desktop, toggleExpanded, setExpanded } = useSidebarState()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const isDrawer = variant === "drawer"
  const isExpanded = isDrawer || expanded
  const canCollapse = !isDrawer && !desktop

  // Determine which group (if any) contains the active route so it starts expanded.
  const activeGroup = navEntries.find(
    (entry) => isGroup(entry) && entry.children.some((child) => child.href === pathname),
  )?.label

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navEntries.forEach((entry) => {
      if (isGroup(entry)) initial[entry.label] = entry.label === activeGroup
    })
    return initial
  })

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))

  const openGroup = (label: string) => {
    if (!isDrawer && collapsed) {
      setExpanded(true)
      setOpenGroups((prev) => ({ ...prev, [label]: true }))
      return
    }

    toggleGroup(label)
  }

  const labelClassName = cn(
    "min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-out",
    isExpanded ? "max-w-44 opacity-100" : "max-w-0 opacity-0 -translate-x-1"
  )

  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        "bg-card text-card-foreground transition-[width,box-shadow] duration-300 ease-out",
        isDrawer
          ? "relative flex h-full w-[280px] flex-col border-r border-border p-4"
          : cn(
              "fixed left-0 top-0 z-40 hidden h-screen flex-col overflow-x-hidden border-r border-border p-3 md:flex",
              isExpanded ? "w-[280px]" : "w-[72px]",
            ),
        !isDrawer && isExpanded && !desktop && "shadow-2xl shadow-black/20"
      )}
      data-expanded={isExpanded}
    >
      <div className="mb-4 flex min-h-20 items-center gap-2">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn(
            "group flex min-w-0 flex-1 items-center rounded-lg transition-colors hover:bg-secondary/60",
            isExpanded ? "justify-start gap-3 p-4" : "h-12 justify-center p-2"
          )}
          aria-label="Go to dashboard"
        >
          <div className={cn(
            "flex flex-shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105",
            isExpanded ? "h-12 w-12" : "h-10 w-10"
          )}>
            <ThemedLogo alt="OJT Companion logo" className="h-full w-full" />
          </div>
          <div className={cn("flex flex-col leading-tight", labelClassName)}>
            <span className="truncate text-base font-semibold text-foreground">OJT Companion</span>
            <span className="truncate text-sm text-muted-foreground">OADP 2026</span>
          </div>
        </Link>
        {canCollapse && (
          <button
            type="button"
            onClick={toggleExpanded}
            className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
            aria-label={isExpanded ? "Collapse navigation" : "Expand navigation"}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <p className={cn("px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground", labelClassName)}>
          Navigation
        </p>
        <nav className="space-y-1.5">
          {navEntries.map((entry) => {
            if (!isGroup(entry)) {
              const isActive = pathname === entry.href
              return (
                <Link
                  key={entry.label}
                  href={entry.href}
                  onClick={onNavigate}
                  onMouseEnter={() => setHoveredItem(entry.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  aria-current={isActive ? "page" : undefined}
                  title={!isDrawer && !isExpanded ? entry.label : undefined}
                  className={cn(
                    "relative flex min-h-11 w-full items-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isExpanded ? "gap-3 px-3" : "justify-center px-0",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 before:absolute before:left-0 before:top-2 before:h-7 before:w-1 before:rounded-r-full before:bg-primary-foreground/80"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    hoveredItem === entry.label && !isActive && isExpanded && "translate-x-1",
                  )}
                >
                  <entry.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn("text-sm", labelClassName)}>{entry.label}</span>
                </Link>
              )
            }

            const isOpen = openGroups[entry.label]
            const hasActiveChild = entry.children.some((child) => child.href === pathname)

            return (
              <div key={entry.label}>
                <button
                  type="button"
                  onClick={() => openGroup(entry.label)}
                  onMouseEnter={() => setHoveredItem(entry.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  aria-expanded={isOpen}
                  title={!isDrawer && !isExpanded ? entry.label : undefined}
                  className={cn(
                    "relative flex min-h-11 w-full items-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isExpanded ? "gap-3 px-3" : "justify-center px-0",
                    hasActiveChild && !isOpen
                      ? "text-foreground bg-secondary/60"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    hasActiveChild && "before:absolute before:left-0 before:top-2 before:h-7 before:w-1 before:rounded-r-full before:bg-primary",
                    hoveredItem === entry.label && isExpanded && "translate-x-1",
                  )}
                >
                  <entry.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn("text-sm", labelClassName)}>{entry.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-[transform,opacity] duration-300",
                      isExpanded ? "ml-auto opacity-100" : "hidden opacity-0",
                      isOpen ? "rotate-180" : "rotate-0"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out",
                    isOpen
                      ? cn(
                          isExpanded
                            ? "mt-1 grid-rows-[1fr] opacity-100"
                            : "mt-0 grid-rows-[0fr] opacity-0"
                        )
                      : "mt-0 grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="mt-1 ml-3.5 pl-3 border-l border-border space-y-1">
                      {entry.children.map((child) => {
                        const isActive = pathname === child.href
                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={onNavigate}
                            onMouseEnter={() => setHoveredItem(child.label)}
                            onMouseLeave={() => setHoveredItem(null)}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                              "relative flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                              hoveredItem === child.label && !isActive && "translate-x-1",
                            )}
                          >
                            <child.icon className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm">{child.label}</span>
                            {child.badge && (
                              <span
                                className={cn(
                                  "ml-auto text-xs font-semibold px-2 py-1 rounded-full",
                                  isActive
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : "bg-primary text-primary-foreground",
                                )}
                              >
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
