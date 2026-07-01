const DAY_MS = 24 * 60 * 60 * 1000

function localDateMs(value) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime()
}

export function resolveWeekFromJournalDate(roadmap, journalDate, now = new Date()) {
  if (!roadmap || !Array.isArray(roadmap.weeks) || !roadmap.weeks.length) return null
  const start = localDateMs(roadmap.startDate)
  const target = localDateMs(journalDate)
  if (start !== null && target !== null) {
    const weekNumber = Math.floor((target - start) / (7 * DAY_MS)) + 1
    const matched = roadmap.weeks.find((week) => Number(week.weekNumber) === weekNumber)
    if (matched) return matched
  }

  const currentTarget = localDateMs(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  )
  if (start !== null && currentTarget !== null) {
    const currentWeekNumber = Math.floor((currentTarget - start) / (7 * DAY_MS)) + 1
    return roadmap.weeks.find((week) => Number(week.weekNumber) === currentWeekNumber) ?? roadmap.weeks[0]
  }
  return roadmap.weeks[0]
}

export function createFollowUpAction({ id, journalEntryId, title, dueWeekId, weeklyObjectiveId, now = new Date() }) {
  const timestamp = now.toISOString()
  return {
    id,
    journalEntryId,
    weeklyObjectiveId,
    title: title.trim(),
    status: "not-started",
    priority: "follow_up",
    dueWeekId,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function linkFollowUpToWeeklyPlanner({ action, journalEntryTitle, journalDate }) {
  return {
    id: action.weeklyObjectiveId,
    title: action.title,
    description: `Follow-up from Daily Journal: ${journalEntryTitle || journalDate}`,
    priority: "follow_up",
    status: action.status,
    checklist: [{ id: action.id, text: action.title, done: action.status === "completed" }],
    equipment: [],
    notes: `Journal entry: ${action.journalEntryId}`,
    source: "daily_journal",
    journalEntryId: action.journalEntryId,
    journalChecklistItemId: action.id,
    dueWeekId: action.dueWeekId,
  }
}

export function updateFollowUpStatus(action, completed, now = new Date()) {
  return {
    ...action,
    status: completed ? "completed" : "not-started",
    updatedAt: now.toISOString(),
  }
}

export function syncWeeklyTaskStatus(objective, completed) {
  return {
    ...objective,
    status: completed ? "completed" : "not-started",
    checklist: (objective.checklist ?? []).map((item) => ({ ...item, done: completed })),
  }
}
