export const ROADMAP_CHECKLIST_NOTIFICATION_TYPE = "roadmap-checklist"
export const DEFAULT_OJT_TOTAL_WEEKS = 18

const DAY_MS = 24 * 60 * 60 * 1000

function dateOnlyUtc(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())
  }

  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const timestamp = Date.UTC(year, month, day)
  const parsed = new Date(timestamp)
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month ||
    parsed.getUTCDate() !== day
  ) {
    return null
  }
  return timestamp
}

export function getCurrentOjtWeek(startDate, totalWeeks = DEFAULT_OJT_TOTAL_WEEKS, now = new Date()) {
  const start = dateOnlyUtc(startDate)
  const current = dateOnlyUtc(now)
  const safeTotalWeeks = Math.max(DEFAULT_OJT_TOTAL_WEEKS, Math.floor(Number(totalWeeks) || DEFAULT_OJT_TOTAL_WEEKS))
  if (start === null || current === null) return 1

  const diffDays = Math.floor((current - start) / DAY_MS)
  const week = Math.floor(diffDays / 7) + 1
  return Math.min(safeTotalWeeks, Math.max(1, week))
}

export function buildCurrentRoadmapChecklistNotification({
  roadmap,
  now = new Date(),
  fallbackStartDate,
  fallbackTotalWeeks = DEFAULT_OJT_TOTAL_WEEKS,
}) {
  if (!roadmap || !Array.isArray(roadmap.weeks) || !roadmap.weeks.length) return null

  const totalWeeks = Math.max(DEFAULT_OJT_TOTAL_WEEKS, roadmap.weeks.length || 0, fallbackTotalWeeks)
  const currentWeekNumber = getCurrentOjtWeek(roadmap.startDate || fallbackStartDate, totalWeeks, now)
  const week =
    roadmap.weeks.find((item) => Number(item.weekNumber) === currentWeekNumber) ??
    roadmap.weeks[currentWeekNumber - 1]
  if (!week) return null

  const incompleteCount = (week.objectives ?? []).reduce(
    (total, objective) =>
      total + (objective.checklist ?? []).filter((item) => !item.done).length,
    0
  )
  if (!incompleteCount) return null

  return {
    fingerprint: `roadmap-checklist-${roadmap.id}-week-${currentWeekNumber}`,
    type: ROADMAP_CHECKLIST_NOTIFICATION_TYPE,
    title: "Incomplete Roadmap Checklist",
    message: `Week ${currentWeekNumber} of ${totalWeeks}: ${incompleteCount} checklist ${
      incompleteCount === 1 ? "item is" : "items are"
    } incomplete.`,
    href: "/learning/roadmap",
    weekNumber: currentWeekNumber,
  }
}

export function isRoadmapChecklistNotification(notification) {
  return (
    notification?.type === ROADMAP_CHECKLIST_NOTIFICATION_TYPE ||
    notification?.title === "Incomplete Roadmap Checklist" ||
    String(notification?.fingerprint ?? "").startsWith("roadmap-checklist-")
  )
}

export function reconcileRoadmapChecklistNotifications(notifications, activeCandidate) {
  const activeFingerprint = activeCandidate?.fingerprint ?? null
  return notifications.filter(
    (notification) =>
      !isRoadmapChecklistNotification(notification) ||
      notification.fingerprint === activeFingerprint
  )
}

