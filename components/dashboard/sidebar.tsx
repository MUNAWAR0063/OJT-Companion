"use client"

import {
  LayoutDashboard,
  GraduationCap,
  Map,
  CalendarRange,
  NotebookPen,
  Zap,
  CircuitBoard,
  BookOpen,
  FileText,
  Images,
  BarChart3,
  TrendingUp,
  FileBarChart,
  Settings,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  {
    icon: GraduationCap,
    label: "Learning",
    children: [
      { icon: Map, label: "Learning Roadmap", href: "/learning/roadmap" },
      { icon: CalendarRange, label: "Weekly Planner", href: "/calendar" },
      { icon: NotebookPen, label: "Daily Journal", href: "/team" },
    ],
  },
  {
    icon: Zap,
    label: "Engineering",
    children: [
      { icon: CircuitBoard, label: "Equipment Library", href: "/equipment" },
      { icon: BookOpen, label: "Knowledge Base", href: "/tasks", badge: "48" },
      { icon: FileText, label: "Documents", href: "/documents" },
      { icon: Images, label: "Photo Gallery", href: "/gallery" },
    ],
  },
  {
    icon: BarChart3,
    label: "Analytics",
    children: [
      { icon: TrendingUp, label: "Learning Progress", href: "/analytics" },
      { icon: FileBarChart, label: "Reports", href: "/reports" },
    ],
  },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

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

  return (
    <aside className="fixed top-0 left-0 w-64 bg-card border-r border-border p-4 h-screen overflow-y-auto lg:block">
      <div className="flex items-center gap-2.5 mb-6 group cursor-pointer">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-foreground">OJT Companion</span>
            <span className="text-[10px] text-muted-foreground">Electrical Engineering</span>
          </div>
        </Link>
      </div>

      <div>
        <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">Navigation</p>
        <nav className="space-y-0.5">
          {navEntries.map((entry) => {
            if (!isGroup(entry)) {
              const isActive = pathname === entry.href
              return (
                <Link
                  key={entry.label}
                  href={entry.href}
                  onMouseEnter={() => setHoveredItem(entry.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    hoveredItem === entry.label && !isActive && "translate-x-1",
                  )}
                >
                  <entry.icon className="w-4 h-4" />
                  <span className="text-sm">{entry.label}</span>
                </Link>
              )
            }

            const isOpen = openGroups[entry.label]
            const hasActiveChild = entry.children.some((child) => child.href === pathname)

            return (
              <div key={entry.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(entry.label)}
                  onMouseEnter={() => setHoveredItem(entry.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  aria-expanded={isOpen}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    hasActiveChild && !isOpen
                      ? "text-foreground bg-secondary/60"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    hoveredItem === entry.label && "translate-x-1",
                  )}
                >
                  <entry.icon className="w-4 h-4" />
                  <span className="text-sm">{entry.label}</span>
                  <ChevronDown
                    className={cn(
                      "ml-auto w-4 h-4 transition-transform duration-300",
                      isOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="mt-0.5 ml-3.5 pl-3 border-l border-border space-y-0.5">
                      {entry.children.map((child) => {
                        const isActive = pathname === child.href
                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            onMouseEnter={() => setHoveredItem(child.label)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-300",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                              hoveredItem === child.label && !isActive && "translate-x-1",
                            )}
                          >
                            <child.icon className="w-4 h-4" />
                            <span className="text-sm">{child.label}</span>
                            {child.badge && (
                              <span
                                className={cn(
                                  "ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
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
