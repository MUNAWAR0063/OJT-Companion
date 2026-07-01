import { BookOpen, CalendarDays, CircuitBoard, ShieldCheck } from "lucide-react"

export const landingFeatures = [
  {
    title: "Competency Tracking",
    description:
      "Track your learning progress, competency achievements, and operational readiness throughout the program.",
    icon: ShieldCheck,
  },
  {
    title: "Weekly Planner",
    description:
      "Plan weekly tasks, learning activities, mentoring sessions, and development targets with ease.",
    icon: CalendarDays,
  },
  {
    title: "Equipment Library",
    description:
      "Access equipment information, technical documents, operating procedures, and supporting references in one place.",
    icon: CircuitBoard,
  },
  {
    title: "Knowledge Base",
    description:
      "Explore engineering standards, best practices, training materials, and operational insights to support work performance.",
    icon: BookOpen,
  },
] as const
