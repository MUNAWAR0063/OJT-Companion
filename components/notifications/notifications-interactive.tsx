"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  BookOpen,
  CalendarClock,
  Check,
  CheckCheck,
  ClipboardCheck,
  Clock3,
  NotebookPen,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  useNotificationStore,
  type AppNotification,
  type NotificationType,
} from "@/lib/notification-store"

const notificationConfig: Record<
  NotificationType,
  { label: string; icon: typeof Bell; color: string }
> = {
  reminder: {
    label: "Reminder",
    icon: Bell,
    color: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  "incomplete-checklist": {
    label: "Incomplete Checklist",
    icon: ClipboardCheck,
    color: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  "weekly-deadline": {
    label: "Weekly Deadline",
    icon: CalendarClock,
    color: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  },
  "journal-reminder": {
    label: "Journal Reminder",
    icon: NotebookPen,
    color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  },
  "learning-reminder": {
    label: "Learning Reminder",
    icon: BookOpen,
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
}

const reminderDestinations = [
  { value: "/", label: "Dashboard" },
  { value: "/calendar", label: "Weekly Planner" },
  { value: "/learning/roadmap", label: "Learning Roadmap" },
  { value: "/equipment", label: "Equipment Library" },
  { value: "/tasks", label: "Knowledge Base" },
  { value: "/team", label: "Daily Journal" },
  { value: "/documents", label: "Documents" },
  { value: "/reports", label: "Reports" },
]

export function NotificationsInteractive() {
  const router = useRouter()
  const notifications = useNotificationStore((state) => state.notifications)
  const createReminder = useNotificationStore((state) => state.createReminder)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"all" | "unread">("all")
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [href, setHref] = useState("/")

  const unreadCount = notifications.filter((notification) => !notification.read).length
  const filteredNotifications = notifications.filter(
    (notification) =>
      (statusFilter === "all" || !notification.read) &&
      (typeFilter === "all" || notification.type === typeFilter)
  )

  const openReminder = () => {
    const defaultDue = new Date(Date.now() + 60 * 60 * 1000)
    defaultDue.setMinutes(defaultDue.getMinutes() - defaultDue.getTimezoneOffset())
    setTitle("")
    setMessage("")
    setDueAt(defaultDue.toISOString().slice(0, 16))
    setHref("/")
    setDialogOpen(true)
  }

  const saveReminder = () => {
    if (!title.trim() || !message.trim() || !dueAt) {
      toast.error("Title, message, and reminder time are required")
      return
    }
    const dueDate = new Date(dueAt)
    if (Number.isNaN(dueDate.getTime())) {
      toast.error("Enter a valid reminder time")
      return
    }
    createReminder({
      title: title.trim(),
      message: message.trim(),
      href,
      dueAt: dueDate.toISOString(),
    })
    setDialogOpen(false)
    toast.success("Reminder scheduled")
  }

  const openNotification = (notification: AppNotification) => {
    markAsRead(notification.id)
    router.push(notification.href)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Notification History</p>
            <p className="mt-2 text-3xl font-semibold">{notifications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Unread</p>
            <p className="mt-2 text-3xl font-semibold">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex h-full items-center justify-center p-5">
            <Button onClick={openReminder} className="w-full">
              <Plus className="mr-2 h-4 w-4" />Create Reminder
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="grid gap-2 sm:grid-cols-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "unread")}>
            <SelectTrigger className="sm:w-44" aria-label="Filter read status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All notifications</SelectItem>
              <SelectItem value="unread">Unread only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as NotificationType | "all")}>
            <SelectTrigger className="sm:w-56" aria-label="Filter notification type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(Object.keys(notificationConfig) as NotificationType[]).map((type) => (
                <SelectItem key={type} value={type}>{notificationConfig[type].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <Bell className="h-11 w-11 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No notifications yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Reminders, deadlines, incomplete checklist alerts, and learning prompts will appear here.
              </p>
            </div>
            <Button onClick={openReminder}><Plus className="mr-2 h-4 w-4" />Create Reminder</Button>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No notifications match these filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const config = notificationConfig[notification.type]
            const Icon = config.icon
            const isScheduled =
              notification.dueAt && new Date(notification.dueAt).getTime() > Date.now()
            return (
              <Card
                key={notification.id}
                className={`transition-colors hover:bg-muted/30 ${notification.read ? "opacity-70" : "border-primary/30"}`}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`rounded-lg border p-2.5 ${config.color}`}><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{notification.title}</h3>
                      <Badge variant="outline" className={config.color}>{config.label}</Badge>
                      {!notification.read && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                      {isScheduled && <Badge variant="secondary">Scheduled</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      {notification.dueAt && (
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          Due {new Date(notification.dueAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    {!notification.read && (
                      <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                        <Check className="mr-1 h-4 w-4" />Read
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openNotification(notification)}>
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Reminder</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Review protection relay notes" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What should you remember to do?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reminder time</label>
              <Input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Open when selected</label>
              <Select value={href} onValueChange={setHref}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {reminderDestinations.map((destination) => (
                    <SelectItem key={destination.value} value={destination.value}>{destination.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveReminder}><Bell className="mr-2 h-4 w-4" />Schedule Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
