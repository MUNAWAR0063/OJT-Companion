"use client"

import { type ChangeEvent, type FormEvent, useMemo, useRef, useState } from "react"
import {
  AlertCircle,
  Bell,
  BookOpen,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Copy,
  Database,
  FileText,
  Gauge,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageCircle,
  MonitorCheck,
  Search,
  Send,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  User,
  Wifi,
} from "lucide-react"
import { toast } from "sonner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type IssueForm = {
  subject: string
  category: string
  description: string
  priority: string
  page: string
  steps: string
  expectedResult: string
  actualResult: string
}

const initialIssueForm: IssueForm = {
  subject: "",
  category: "",
  description: "",
  priority: "",
  page: "",
  steps: "",
  expectedResult: "",
  actualResult: "",
}

const quickActions = [
  {
    id: "faq",
    title: "Frequently Asked Questions",
    description: "Find answers for common trainee questions.",
    icon: HelpCircle,
    href: "#faq",
  },
  {
    id: "guides",
    title: "User Guide",
    description: "Open step-by-step workspace documentation.",
    icon: BookOpen,
    href: "#user-guide",
  },
  {
    id: "bug",
    title: "Report a Bug",
    description: "Submit an issue with screenshots and details.",
    icon: Bug,
    href: "#report-issue",
  },
  {
    id: "contact",
    title: "Contact Administrator",
    description: "Reach the OJT support administrator.",
    icon: Mail,
    href: "#contact-support",
  },
  {
    id: "status",
    title: "System Status",
    description: "Review application service availability.",
    icon: MonitorCheck,
    href: "#system-status",
  },
]

const faqs = [
  {
    category: "Getting Started",
    question: "How should I start using OJT Companion?",
    answer: "Create your learning roadmap, add your first weekly planner entry, then record field notes and evidence as your OJT activities progress.",
    relatedPages: ["Dashboard", "Learning Roadmap", "Weekly Planner"],
    lastUpdated: "2026-06-26",
  },
  {
    category: "Login",
    question: "What should I do if I cannot log in?",
    answer: "Check your registered email, confirm your password, and contact the administrator if your account is locked or has not been activated.",
    relatedPages: ["Login", "Profile"],
    lastUpdated: "2026-06-25",
  },
  {
    category: "Dashboard",
    question: "Why does my dashboard look empty?",
    answer: "The dashboard only shows records you have created. Add roadmap, planner, equipment, journal, knowledge, or document data to populate it.",
    relatedPages: ["Dashboard", "Weekly Planner"],
    lastUpdated: "2026-06-28",
  },
  {
    category: "Weekly Planner",
    question: "How do completed tasks affect my progress?",
    answer: "Completed weekly objectives contribute to learning hours, completed tasks, and the shared competency progress summary.",
    relatedPages: ["Weekly Planner", "Competencies"],
    lastUpdated: "2026-06-30",
  },
  {
    category: "Learning Roadmap",
    question: "How is the current trip and week calculated?",
    answer: "The app uses the selected roadmap start date and week sequence to derive the current trip and active week.",
    relatedPages: ["Learning Roadmap", "Dashboard"],
    lastUpdated: "2026-06-29",
  },
  {
    category: "Competencies",
    question: "Why is competency progress different from one module progress?",
    answer: "Competency progress is derived from all active workspace modules, not one isolated page, so it reflects the broader OJT evidence set.",
    relatedPages: ["Competencies", "Dashboard"],
    lastUpdated: "2026-07-01",
  },
  {
    category: "Equipment Library",
    question: "What evidence should I add to equipment records?",
    answer: "Add equipment details, principles of operation, maintenance notes, checklist progress, related standards, photos, and documents.",
    relatedPages: ["Equipment Library", "Standards", "Gallery"],
    lastUpdated: "2026-06-27",
  },
  {
    category: "Field Notes",
    question: "What makes a useful field note?",
    answer: "A useful note includes the activity, observation, lesson learned, questions, safety concerns, and any related equipment or photos.",
    relatedPages: ["Field Notes", "Gallery"],
    lastUpdated: "2026-06-24",
  },
  {
    category: "Knowledge Base",
    question: "How should I organize technical articles?",
    answer: "Use clear titles, categories, tags, summaries, references, and links to related equipment or standards.",
    relatedPages: ["Knowledge Base", "Standards"],
    lastUpdated: "2026-06-24",
  },
  {
    category: "Reports",
    question: "What information is included in generated reports?",
    answer: "Reports summarize planner progress, competency evidence, field notes, knowledge records, documents, and selected workspace activity.",
    relatedPages: ["Reports", "Competencies"],
    lastUpdated: "2026-06-23",
  },
  {
    category: "Profile",
    question: "Where can I update my trainee profile?",
    answer: "Open Settings or Profile options from the app shell to update identity, training details, preferences, and account information.",
    relatedPages: ["Settings", "Profile"],
    lastUpdated: "2026-06-20",
  },
  {
    category: "Password",
    question: "How do I reset my password?",
    answer: "Use the password reset option from authentication or contact the administrator if password reset email delivery fails.",
    relatedPages: ["Login", "Settings"],
    lastUpdated: "2026-06-20",
  },
  {
    category: "Notifications",
    question: "Why am I not receiving reminders?",
    answer: "Check notification settings, browser permission, and whether there are active planner items or system events that trigger reminders.",
    relatedPages: ["Notifications", "Settings"],
    lastUpdated: "2026-06-22",
  },
]

const guides = [
  ["Getting Started", "Set up your trainee workspace, roadmap, planner, and evidence flow.", "5 min"],
  ["Creating Weekly Planner", "Plan weekly objectives, estimate hours, and track task completion.", "6 min"],
  ["Building Learning Roadmap", "Structure OJT trips, weeks, objectives, and milestones.", "7 min"],
  ["Managing Competencies", "Understand how competency evidence and progress are calculated.", "6 min"],
  ["Equipment Library", "Catalog equipment details, checklists, photos, and related standards.", "8 min"],
  ["Generating Reports", "Create progress reports for mentors, assessors, and administrators.", "4 min"],
  ["Using Search", "Find records across modules using keywords, categories, and linked evidence.", "3 min"],
  ["Application Settings", "Manage theme, language, profile, storage, backup, import, and export.", "5 min"],
].map(([title, description, readingTime]) => ({ title, description, readingTime }))

const announcements = [
  {
    title: "Competency progress calculation updated",
    date: "2026-07-01",
    category: "System Updates",
    description: "Competency progress now reads real workspace data from planner, roadmap, equipment, notes, knowledge, documents, and gallery records.",
  },
  {
    title: "Scheduled maintenance window",
    date: "2026-07-06",
    category: "Maintenance Schedule",
    description: "Support services may be intermittently unavailable during database maintenance from 18:00 to 19:00.",
  },
  {
    title: "Known issue with large screenshots",
    date: "2026-06-30",
    category: "Known Issues",
    description: "Very large screenshots can take longer to attach on low-bandwidth networks. Compress images before upload if needed.",
  },
  {
    title: "Help Center released",
    date: "2026-06-29",
    category: "Feature Releases",
    description: "The new support center includes searchable FAQ, issue reporting, system status, troubleshooting, and feedback.",
  },
]

const troubleshooting = [
  {
    problem: "Cannot Login",
    causes: ["Wrong password", "Inactive account", "Network interruption"],
    solution: "Reset your password, confirm your registered email, and contact the administrator if access remains blocked.",
    relatedDocumentation: "Login FAQ",
  },
  {
    problem: "Data Not Saving",
    causes: ["Browser storage unavailable", "Session expired", "Sync interrupted"],
    solution: "Refresh the page, confirm you are signed in, and retry the save action before submitting an issue report.",
    relatedDocumentation: "Application Settings",
  },
  {
    problem: "Progress Not Updating",
    causes: ["No completed source records", "Unsaved planner task", "Inactive module data"],
    solution: "Check that records are saved and tasks or milestones have a completed status.",
    relatedDocumentation: "Managing Competencies",
  },
  {
    problem: "Dashboard Empty",
    causes: ["New workspace", "No roadmap selected", "No planner objectives"],
    solution: "Create a roadmap or weekly plan, then add field notes, equipment records, or knowledge articles.",
    relatedDocumentation: "Getting Started",
  },
  {
    problem: "Sync Problems",
    causes: ["Offline connection", "Authentication expired", "Database service degraded"],
    solution: "Check system status, reconnect to the network, and sign in again if needed.",
    relatedDocumentation: "System Status",
  },
  {
    problem: "Slow Performance",
    causes: ["Large uploads", "Many open browser tabs", "Low device memory"],
    solution: "Close unused tabs, reduce screenshot size, and retry after the browser has cleared pending work.",
    relatedDocumentation: "Report a Bug",
  },
]

const statuses = [
  { name: "Application", value: "Operational", icon: MonitorCheck },
  { name: "Database", value: "Operational", icon: Database },
  { name: "Storage", value: "Operational", icon: Server },
  { name: "Authentication", value: "Operational", icon: ShieldCheck },
  { name: "Network", value: "Operational", icon: Wifi },
  { name: "Version", value: "v1.0.0", icon: Settings },
  { name: "Deployment Date", value: "2026-07-01", icon: Clock3 },
  { name: "Last Sync", value: "Local workspace", icon: Gauge },
]

const searchableTroubleshooting = troubleshooting.map((item) => ({
  title: item.problem,
  description: `${item.causes.join(" ")} ${item.solution} ${item.relatedDocumentation}`,
}))

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query)
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function copyToClipboard(value: string, label: string) {
  void navigator.clipboard.writeText(value)
  toast.success(`${label} copied`)
}

export function HelpContent() {
  const [query, setQuery] = useState("")
  const [issueForm, setIssueForm] = useState<IssueForm>(initialIssueForm)
  const [screenshotName, setScreenshotName] = useState("")
  const [issueErrors, setIssueErrors] = useState<Partial<Record<keyof IssueForm, string>>>({})
  const [rating, setRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const normalizedQuery = query.trim().toLowerCase()

  const filteredFaqs = useMemo(() => {
    if (!normalizedQuery) return faqs
    return faqs.filter((faq) =>
      [faq.category, faq.question, faq.answer, faq.relatedPages.join(" ")].some((item) => includesQuery(item, normalizedQuery))
    )
  }, [normalizedQuery])

  const filteredGuides = useMemo(() => {
    if (!normalizedQuery) return guides
    return guides.filter((guide) => [guide.title, guide.description].some((item) => includesQuery(item, normalizedQuery)))
  }, [normalizedQuery])

  const filteredAnnouncements = useMemo(() => {
    if (!normalizedQuery) return announcements
    return announcements.filter((announcement) =>
      [announcement.title, announcement.category, announcement.description].some((item) => includesQuery(item, normalizedQuery))
    )
  }, [normalizedQuery])

  const filteredTroubleshooting = useMemo(() => {
    if (!normalizedQuery) return troubleshooting
    return troubleshooting.filter((item) =>
      searchableTroubleshooting.some(
        (searchable) => searchable.title === item.problem && includesQuery(`${searchable.title} ${searchable.description}`, normalizedQuery)
      )
    )
  }, [normalizedQuery])

  const updateIssueField = (field: keyof IssueForm, value: string) => {
    setIssueForm((current) => ({ ...current, [field]: value }))
    setIssueErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleScreenshot = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setScreenshotName(file?.name ?? "")
  }

  const validateIssue = () => {
    const errors: Partial<Record<keyof IssueForm, string>> = {}
    if (!issueForm.subject.trim()) errors.subject = "Subject is required."
    if (!issueForm.category) errors.category = "Category is required."
    if (!issueForm.description.trim()) errors.description = "Description is required."
    if (!issueForm.priority) errors.priority = "Priority is required."
    if (!issueForm.page.trim()) errors.page = "Page is required."
    if (!issueForm.steps.trim()) errors.steps = "Steps to reproduce are required."
    if (!issueForm.expectedResult.trim()) errors.expectedResult = "Expected result is required."
    if (!issueForm.actualResult.trim()) errors.actualResult = "Actual result is required."
    setIssueErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submitIssue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateIssue()) {
      toast.error("Complete the required issue fields")
      return
    }

    const report = {
      id: crypto.randomUUID(),
      ...issueForm,
      screenshotName,
      createdAt: new Date().toISOString(),
      status: "submitted",
    }
    const existing = JSON.parse(localStorage.getItem("ojt-support-reports") ?? "[]") as unknown[]
    localStorage.setItem("ojt-support-reports", JSON.stringify([report, ...existing]))
    setIssueForm(initialIssueForm)
    setScreenshotName("")
    fileInputRef.current?.form?.reset()
    toast.success("Issue report submitted")
  }

  const submitFeedback = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!rating) {
      toast.error("Select a support rating")
      return
    }
    const feedback = {
      id: crypto.randomUUID(),
      rating,
      comment: feedbackComment,
      createdAt: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem("ojt-support-feedback") ?? "[]") as unknown[]
    localStorage.setItem("ojt-support-feedback", JSON.stringify([feedback, ...existing]))
    setRating(0)
    setFeedbackComment("")
    toast.success("Feedback submitted")
  }

  const searchResults = normalizedQuery
    ? filteredFaqs.length + filteredGuides.length + filteredAnnouncements.length + filteredTroubleshooting.length
    : null

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm md:p-8">
        <div className="max-w-3xl">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">OADP Support Center</Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Help & Support</h1>
          <p className="mt-3 text-muted-foreground">
            Need assistance? Find answers, report issues, and contact the support team.
          </p>
        </div>
        <div className="relative mt-6 max-w-3xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search help and support content"
            className="h-14 rounded-xl pl-12 text-base"
            placeholder="How can we help you?"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {searchResults !== null ? (
          <p className="mt-3 text-sm text-muted-foreground">{searchResults} matching support results</p>
        ) : null}
      </section>

      <section aria-labelledby="quick-actions" className="space-y-4">
        <SectionHeader title="Quick Actions" description="Jump directly to common support tasks." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => (
            <Card key={action.id} className="group flex flex-col p-4 transition-all hover:border-primary/40 hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <action.icon className="h-5 w-5" />
              </div>
              <h3 id="quick-actions" className="font-semibold">{action.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{action.description}</p>
              <Button asChild className="mt-4 w-full" variant="outline">
                <a href={action.href}>Open</a>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-8">
          <section id="faq" className="space-y-4 scroll-mt-24">
            <SectionHeader title="Frequently Asked Questions" description="Searchable answers by workspace area." />
            <Card className="p-4 md:p-6">
              {filteredFaqs.length ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={`${faq.category}-${faq.question}`} value={faq.question}>
                      <AccordionTrigger className="min-h-11">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{faq.category}</Badge>
                            <span>{faq.question}</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {faq.relatedPages.map((page) => (
                            <Badge key={page} variant="secondary">{page}</Badge>
                          ))}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">Last updated {faq.lastUpdated}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="p-6 text-center text-sm text-muted-foreground">No FAQ results match your search.</p>
              )}
            </Card>
          </section>

          <section id="user-guide" className="space-y-4 scroll-mt-24">
            <SectionHeader title="User Guide" description="Practical documentation for trainee workflows." />
            <div className="grid gap-4 md:grid-cols-2">
              {filteredGuides.map((guide) => (
                <Card key={guide.title} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{guide.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{guide.description}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">{guide.readingTime} read</span>
                        <Button type="button" size="sm" variant="outline" onClick={() => toast.info(`${guide.title} guide opened`)}>
                          Open Guide
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section id="troubleshooting" className="space-y-4 scroll-mt-24">
            <SectionHeader title="Troubleshooting Center" description="Diagnose common problems before submitting a ticket." />
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTroubleshooting.map((item) => (
                <Card key={item.problem} className="p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">{item.problem}</h3>
                      <p className="mt-3 text-sm font-medium">Possible causes</p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {item.causes.map((cause) => (
                          <li key={cause}>- {cause}</li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm text-muted-foreground">{item.solution}</p>
                      <Badge className="mt-4" variant="outline">{item.relatedDocumentation}</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section id="announcements" className="space-y-4 scroll-mt-24">
            <SectionHeader title="Recent Announcements" description="Maintenance, updates, known issues, and feature releases." />
            <Card className="p-5">
              <div className="space-y-5">
                {filteredAnnouncements.map((announcement) => (
                  <div key={announcement.title} className="relative border-l border-border pl-5">
                    <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{announcement.category}</Badge>
                      <time className="text-xs text-muted-foreground">{announcement.date}</time>
                    </div>
                    <h3 className="mt-2 font-semibold">{announcement.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{announcement.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>

        <aside className="space-y-8">
          <section id="contact-support" className="space-y-4 scroll-mt-24">
            <SectionHeader title="Contact Support" description="Reach the administrator for urgent help." />
            <Card className="space-y-4 p-5">
              {[
                { icon: Mail, label: "Administrator Email", value: "salmannizarm@gmail.com" },
                { icon: MessageCircle, label: "WhatsApp", value: "+62 896 7781 8566" },
                { icon: ClipboardCheck, label: "Working Days", value: "Monday - Friday" },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <item.icon className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
              <div className="grid gap-2 pt-2">
                <Button asChild>
                  <a href="mailto:salmannizarm@gmail.com"><Send className="h-4 w-4" />Send Email</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="https://wa.me/6289677818566" target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" />Open WhatsApp
                  </a>
                </Button>
                <Button type="button" variant="outline" onClick={() => copyToClipboard("salmannizarm@gmail.com", "Email")}>
                  <Copy className="h-4 w-4" />Copy Email
                </Button>
              </div>
            </Card>
          </section>

          <section id="system-status" className="space-y-4 scroll-mt-24">
            <SectionHeader title="System Status" description="Current operational status." />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {statuses.map((status) => (
                <Card key={status.name} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                      <status.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{status.name}</p>
                      <p className="text-xs text-muted-foreground">{status.value}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">
                    {["Version", "Deployment Date", "Last Sync"].includes(status.name) ? "Info" : "Operational"}
                  </Badge>
                </Card>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section id="report-issue" className="space-y-4 scroll-mt-24">
        <SectionHeader title="Report Issue" description="Submit a detailed support report with validation and optional screenshot." />
        <Card className="p-5 md:p-6">
          <form className="grid gap-5" onSubmit={submitIssue}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={issueForm.subject} onChange={(event) => updateIssueField("subject", event.target.value)} aria-invalid={Boolean(issueErrors.subject)} />
                {issueErrors.subject ? <p className="text-xs text-destructive">{issueErrors.subject}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={issueForm.category} onValueChange={(value) => updateIssueField("category", value)}>
                  <SelectTrigger className="w-full" aria-invalid={Boolean(issueErrors.category)}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Login", "Competency", "Assessment", "Certificate", "Profile", "Password", "Notifications", "Technical Bug"].map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {issueErrors.category ? <p className="text-xs text-destructive">{issueErrors.category}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={issueForm.priority} onValueChange={(value) => updateIssueField("priority", value)}>
                  <SelectTrigger className="w-full" aria-invalid={Boolean(issueErrors.priority)}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High", "Urgent"].map((priority) => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {issueErrors.priority ? <p className="text-xs text-destructive">{issueErrors.priority}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="page">Page</Label>
                <Input id="page" placeholder="Example: Competencies" value={issueForm.page} onChange={(event) => updateIssueField("page", event.target.value)} aria-invalid={Boolean(issueErrors.page)} />
                {issueErrors.page ? <p className="text-xs text-destructive">{issueErrors.page}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="min-h-28" value={issueForm.description} onChange={(event) => updateIssueField("description", event.target.value)} aria-invalid={Boolean(issueErrors.description)} />
              {issueErrors.description ? <p className="text-xs text-destructive">{issueErrors.description}</p> : null}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="steps">Steps to Reproduce</Label>
                <Textarea id="steps" value={issueForm.steps} onChange={(event) => updateIssueField("steps", event.target.value)} aria-invalid={Boolean(issueErrors.steps)} />
                {issueErrors.steps ? <p className="text-xs text-destructive">{issueErrors.steps}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected-result">Expected Result</Label>
                <Textarea id="expected-result" value={issueForm.expectedResult} onChange={(event) => updateIssueField("expectedResult", event.target.value)} aria-invalid={Boolean(issueErrors.expectedResult)} />
                {issueErrors.expectedResult ? <p className="text-xs text-destructive">{issueErrors.expectedResult}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual-result">Actual Result</Label>
                <Textarea id="actual-result" value={issueForm.actualResult} onChange={(event) => updateIssueField("actualResult", event.target.value)} aria-invalid={Boolean(issueErrors.actualResult)} />
                {issueErrors.actualResult ? <p className="text-xs text-destructive">{issueErrors.actualResult}</p> : null}
              </div>
            </div>

            <div className="rounded-lg border border-dashed p-4">
              <Label htmlFor="screenshot" className="mb-3">Screenshot Upload</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input id="screenshot" ref={fileInputRef} type="file" accept="image/*" onChange={handleScreenshot} />
                <Badge variant="outline">{screenshotName || "No screenshot attached"}</Badge>
              </div>
            </div>

            <Button type="submit" className="w-full sm:w-fit">
              <Upload className="h-4 w-4" />Submit Issue
            </Button>
          </form>
        </Card>
      </section>

      <section id="feedback" className="space-y-4 scroll-mt-24">
        <SectionHeader title="Feedback" description="Rate the support page so administrators can improve it." />
        <Card className="p-5 md:p-6">
          <form className="space-y-5" onSubmit={submitFeedback}>
            <div>
              <Label className="mb-3">Rating</Label>
              <div className="flex gap-2" role="radiogroup" aria-label="Support page rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="rounded-md p-1 text-primary outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`${value} star rating`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                  >
                    <Star className={`h-7 w-7 ${rating >= value ? "fill-primary" : "fill-transparent"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-comment">Comment</Label>
              <Textarea id="feedback-comment" value={feedbackComment} onChange={(event) => setFeedbackComment(event.target.value)} placeholder="Share what worked or what needs improvement." />
            </div>
            <Button type="submit"><Sparkles className="h-4 w-4" />Submit Feedback</Button>
          </form>
        </Card>
      </section>
    </div>
  )
}
