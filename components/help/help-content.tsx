"use client"

import { type ChangeEvent, type FormEvent, useMemo, useRef, useState } from "react"
import {
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { userGuides, type UserGuide } from "@/lib/user-guides"

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
    answer: "Login can fail because of a wrong password, inactive account, or network interruption. Reset your password, confirm your registered email, and contact the administrator if access remains blocked.",
    relatedPages: ["Login", "Profile"],
    lastUpdated: "2026-07-05",
  },
  {
    category: "Dashboard",
    question: "Why does my dashboard look empty?",
    answer: "A new workspace, missing roadmap, or empty planner can leave the dashboard blank. Create a roadmap or weekly plan, then add field notes, equipment records, knowledge articles, or documents.",
    relatedPages: ["Dashboard", "Weekly Planner"],
    lastUpdated: "2026-07-05",
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
  {
    category: "Troubleshooting",
    question: "Why is my data not saving?",
    answer: "Saving can fail when browser storage is unavailable, your session has expired, or synchronization is interrupted. Refresh the page, confirm you are signed in, and retry the save action before submitting an issue report.",
    relatedPages: ["Application Settings", "Report Issue"],
    lastUpdated: "2026-07-05",
  },
  {
    category: "Troubleshooting",
    question: "Why is my progress not updating?",
    answer: "Progress may not update when source records are incomplete, a planner task is unsaved, or module data is inactive. Confirm that records are saved and tasks or milestones have a completed status.",
    relatedPages: ["Competencies", "Weekly Planner"],
    lastUpdated: "2026-07-05",
  },
  {
    category: "Troubleshooting",
    question: "How do I resolve synchronization problems?",
    answer: "Synchronization can fail because of an offline connection, expired authentication, or degraded database service. Check System Status, reconnect to the network, and sign in again if needed.",
    relatedPages: ["System Status", "Login"],
    lastUpdated: "2026-07-05",
  },
  {
    category: "Troubleshooting",
    question: "What should I do when the application is slow?",
    answer: "Large uploads, many open browser tabs, or low device memory can reduce performance. Close unused tabs, reduce screenshot size, and retry after the browser has cleared pending work.",
    relatedPages: ["Report Issue", "Gallery"],
    lastUpdated: "2026-07-05",
  },
]

const announcements = [
  {
    title: "Responsive form layouts improved",
    date: "2026-07-06",
    category: "UI Updates",
    description: "Equipment, knowledge, standards, documents, and gallery forms now use compact paired fields on mobile screens.",
  },
  {
    title: "Notification center layout refined",
    date: "2026-07-06",
    category: "UI Updates",
    description: "Notification statistics, filters, and history actions now use balanced responsive layouts on mobile devices.",
  },
  {
    title: "Help Center mobile cards optimized",
    date: "2026-07-06",
    category: "UI Updates",
    description: "Quick Actions and System Status now use two-column mobile layouts with clearer spacing and visible status badges.",
  },
  {
    title: "Troubleshooting guidance moved into FAQ",
    date: "2026-07-06",
    category: "Help Center",
    description: "Common login, saving, progress, synchronization, dashboard, and performance solutions are now available directly in FAQ.",
  },
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
    description: "The new support center includes searchable FAQ and troubleshooting guidance, issue reporting, system status, and feedback.",
  },
]

const FAQS_PER_PAGE = 5
const ANNOUNCEMENTS_PER_PAGE = 4

const statuses = [
  { name: "Application", value: "Operational", icon: MonitorCheck },
  { name: "Database", value: "Operational", icon: Database },
  { name: "Storage", value: "Operational", icon: Server },
  { name: "Authentication", value: "Operational", icon: ShieldCheck },
  { name: "Network", value: "Operational", icon: Wifi },
  { name: "Version", value: "v.1.2.1", icon: Settings },
  { name: "Deployment Date", value: "2026-07-01", icon: Clock3 },
  { name: "Last Sync", value: "Local workspace", icon: Gauge },
]

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
  const [selectedGuide, setSelectedGuide] = useState<UserGuide | null>(null)
  const [issueForm, setIssueForm] = useState<IssueForm>(initialIssueForm)
  const [screenshotName, setScreenshotName] = useState("")
  const [issueErrors, setIssueErrors] = useState<Partial<Record<keyof IssueForm, string>>>({})
  const [rating, setRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  const [faqPage, setFaqPage] = useState(1)
  const [announcementPage, setAnnouncementPage] = useState(1)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const normalizedQuery = query.trim().toLowerCase()

  const filteredFaqs = useMemo(() => {
    if (!normalizedQuery) return faqs
    return faqs.filter((faq) =>
      [faq.category, faq.question, faq.answer, faq.relatedPages.join(" ")].some((item) => includesQuery(item, normalizedQuery))
    )
  }, [normalizedQuery])

  const faqPageCount = Math.max(1, Math.ceil(filteredFaqs.length / FAQS_PER_PAGE))
  const currentFaqPage = Math.min(faqPage, faqPageCount)
  const paginatedFaqs = filteredFaqs.slice(
    (currentFaqPage - 1) * FAQS_PER_PAGE,
    currentFaqPage * FAQS_PER_PAGE
  )

  const filteredGuides = useMemo(() => {
    if (!normalizedQuery) return userGuides
    return userGuides.filter((guide) =>
      [
        guide.title,
        guide.description,
        ...guide.sections.flatMap((section) => [section.heading, ...section.steps]),
        ...guide.tips,
      ].some((item) => includesQuery(item, normalizedQuery))
    )
  }, [normalizedQuery])

  const filteredAnnouncements = useMemo(() => {
    if (!normalizedQuery) return announcements
    return announcements.filter((announcement) =>
      [announcement.title, announcement.category, announcement.description].some((item) => includesQuery(item, normalizedQuery))
    )
  }, [normalizedQuery])

  const announcementPageCount = Math.max(1, Math.ceil(filteredAnnouncements.length / ANNOUNCEMENTS_PER_PAGE))
  const currentAnnouncementPage = Math.min(announcementPage, announcementPageCount)
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentAnnouncementPage - 1) * ANNOUNCEMENTS_PER_PAGE,
    currentAnnouncementPage * ANNOUNCEMENTS_PER_PAGE
  )

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
    ? filteredFaqs.length + filteredGuides.length + filteredAnnouncements.length
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
            onChange={(event) => {
              setQuery(event.target.value)
              setFaqPage(1)
              setAnnouncementPage(1)
            }}
          />
        </div>
        {searchResults !== null ? (
          <p className="mt-3 text-sm text-muted-foreground">{searchResults} matching support results</p>
        ) : null}
      </section>

      <section aria-labelledby="quick-actions" className="space-y-4">
        <SectionHeader title="Quick Actions" description="Jump directly to common support tasks." />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
          {quickActions.map((action) => (
            <Card key={action.id} className="group flex min-w-0 flex-col p-3 transition-all hover:border-primary/40 hover:shadow-md sm:p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary sm:mb-4 sm:h-11 sm:w-11">
                <action.icon className="h-5 w-5" />
              </div>
              <h3 id="quick-actions" className="break-words text-sm font-semibold sm:text-base">{action.title}</h3>
              <p className="mt-2 flex-1 text-xs text-muted-foreground sm:text-sm">{action.description}</p>
              <Button asChild className="mt-4 w-full" variant="outline">
                <a href={action.href}>Open</a>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-x-8 gap-y-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-8 xl:contents">
          <section id="faq" className="space-y-4 scroll-mt-24 xl:col-start-1 xl:row-start-1">
            <SectionHeader title="Frequently Asked Questions" description="Searchable answers by workspace area." />
            <Card className="p-4 md:p-6">
              {filteredFaqs.length ? (
                <>
                  <Accordion type="single" collapsible className="w-full">
                    {paginatedFaqs.map((faq) => (
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
                  {faqPageCount > 1 ? (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {currentFaqPage} of {faqPageCount}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={currentFaqPage === 1}
                          onClick={() => setFaqPage(currentFaqPage - 1)}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: faqPageCount }, (_, index) => {
                          const page = index + 1
                          return (
                            <Button
                              key={page}
                              type="button"
                              size="sm"
                              variant={page === currentFaqPage ? "default" : "outline"}
                              className="min-w-9"
                              onClick={() => setFaqPage(page)}
                              aria-label={`Open FAQ page ${page}`}
                              aria-current={page === currentFaqPage ? "page" : undefined}
                            >
                              {page}
                            </Button>
                          )
                        })}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={currentFaqPage === faqPageCount}
                          onClick={() => setFaqPage(currentFaqPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="p-6 text-center text-sm text-muted-foreground">No FAQ results match your search.</p>
              )}
            </Card>
          </section>

          <section id="user-guide" className="space-y-4 scroll-mt-24 xl:col-start-1 xl:row-start-2">
            <SectionHeader title="User Guide" description="Practical documentation for trainee workflows." />
            <div className="grid gap-4 md:grid-cols-2">
              {filteredGuides.map((guide) => (
                <Card key={guide.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{guide.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{guide.description}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">{guide.readingTime} read</span>
                        <Button type="button" size="sm" variant="outline" onClick={() => setSelectedGuide(guide)}>
                          Open Guide
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <Dialog
            open={selectedGuide !== null}
            onOpenChange={(open) => {
              if (!open) setSelectedGuide(null)
            }}
          >
            <DialogContent className="flex h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:h-[min(85vh,760px)] sm:max-w-3xl">
              {selectedGuide ? (
                <>
                  <DialogHeader className="border-b px-5 py-5 pr-14 text-left sm:px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <BookOpen className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <DialogTitle className="text-xl leading-tight sm:text-2xl">
                            {selectedGuide.title}
                          </DialogTitle>
                          <Badge variant="secondary">{selectedGuide.readingTime} read</Badge>
                        </div>
                        <DialogDescription className="leading-relaxed">
                          {selectedGuide.description}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <ScrollArea className="min-h-0 flex-1">
                    <div className="space-y-8 px-5 py-6 sm:px-6">
                      {selectedGuide.sections.map((section, sectionIndex) => (
                        <section key={section.heading} aria-labelledby={`${selectedGuide.id}-section-${sectionIndex}`}>
                          <h3
                            id={`${selectedGuide.id}-section-${sectionIndex}`}
                            className="text-base font-semibold tracking-tight sm:text-lg"
                          >
                            {sectionIndex + 1}. {section.heading}
                          </h3>
                          <ol className="mt-4 space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {section.steps.map((step) => (
                              <li key={step} className="list-decimal pl-1 marker:font-medium marker:text-foreground">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </section>
                      ))}

                      <section
                        className="rounded-xl border border-primary/20 bg-primary/5 p-4"
                        aria-labelledby={`${selectedGuide.id}-tips`}
                      >
                        <h3 id={`${selectedGuide.id}-tips`} className="flex items-center gap-2 font-semibold">
                          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                          Practical tips
                        </h3>
                        <ul className="mt-3 space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                          {selectedGuide.tips.map((tip) => (
                            <li key={tip} className="list-disc pl-1">{tip}</li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  </ScrollArea>

                  <DialogFooter className="border-t bg-background px-5 py-4 sm:px-6">
                    <DialogClose asChild>
                      <Button type="button" className="min-h-11 sm:min-h-9">Close Guide</Button>
                    </DialogClose>
                  </DialogFooter>
                </>
              ) : null}
            </DialogContent>
          </Dialog>

        </div>

        <aside className="space-y-8 xl:contents">
          <section id="contact-support" className="space-y-4 scroll-mt-24 xl:col-start-2 xl:row-start-1">
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

          <section id="system-status" className="space-y-4 scroll-mt-24 xl:col-start-2 xl:row-start-2">
            <SectionHeader title="System Status" description="Current operational status." />
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
              {statuses.map((status) => (
                <Card key={status.name} className="flex min-w-0 flex-col items-start justify-between gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-md bg-primary/10 p-2 text-primary">
                      <status.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium">{status.name}</p>
                      <p className="break-words text-xs text-muted-foreground">{status.value}</p>
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

      <section id="announcements" className="space-y-4 scroll-mt-24">
        <SectionHeader title="Recent Announcements" description="Maintenance, updates, known issues, and feature releases." />
        {filteredAnnouncements.length ? (
          <Card className="p-5 md:p-6">
            <div className="space-y-5">
              {paginatedAnnouncements.map((announcement) => (
                <div key={announcement.title} className="relative border-l border-border pl-5">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{announcement.category}</Badge>
                    <time className="text-xs text-muted-foreground">{announcement.date}</time>
                  </div>
                  <h3 className="mt-2 font-semibold">{announcement.title}</h3>
                  <p className="mt-1 max-w-5xl text-sm leading-relaxed text-muted-foreground">{announcement.description}</p>
                </div>
              ))}
            </div>
            {announcementPageCount > 1 ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {currentAnnouncementPage} of {announcementPageCount}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={currentAnnouncementPage === 1}
                    onClick={() => setAnnouncementPage(currentAnnouncementPage - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: announcementPageCount }, (_, index) => {
                    const page = index + 1
                    return (
                      <Button
                        key={page}
                        type="button"
                        size="sm"
                        variant={page === currentAnnouncementPage ? "default" : "outline"}
                        className="min-w-9"
                        onClick={() => setAnnouncementPage(page)}
                        aria-label={`Open announcement page ${page}`}
                        aria-current={page === currentAnnouncementPage ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    )
                  })}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={currentAnnouncementPage === announcementPageCount}
                    onClick={() => setAnnouncementPage(currentAnnouncementPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        ) : (
          <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
            No announcements match your search.
          </Card>
        )}
      </section>

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
