import assert from "node:assert/strict"
import test from "node:test"
import {
  createFollowUpAction,
  linkFollowUpToWeeklyPlanner,
  resolveWeekFromJournalDate,
  syncWeeklyTaskStatus,
  updateFollowUpStatus,
} from "../lib/follow-up-integration.mjs"

const roadmap = {
  id: "roadmap-1",
  startDate: "2026-07-01",
  weeks: [
    { id: "week-1", weekNumber: 1 },
    { id: "week-2", weekNumber: 2 },
    { id: "week-3", weekNumber: 3 },
  ],
}

test("resolveWeekFromJournalDate maps a journal date to the roadmap week", () => {
  assert.equal(resolveWeekFromJournalDate(roadmap, "2026-07-01").id, "week-1")
  assert.equal(resolveWeekFromJournalDate(roadmap, "2026-07-08").id, "week-2")
  assert.equal(resolveWeekFromJournalDate(roadmap, "2026-07-15").id, "week-3")
})

test("createFollowUpAction and linkFollowUpToWeeklyPlanner create linked todo objective", () => {
  const action = createFollowUpAction({
    id: "follow-1",
    journalEntryId: "journal-1",
    title: "Ask mentor about relay settings",
    dueWeekId: "week-2",
    weeklyObjectiveId: "objective-1",
    now: new Date("2026-07-08T00:00:00.000Z"),
  })
  const objective = linkFollowUpToWeeklyPlanner({
    action,
    journalEntryTitle: "Relay inspection",
    journalDate: "2026-07-08",
  })

  assert.equal(action.priority, "follow_up")
  assert.equal(action.status, "not-started")
  assert.equal(objective.id, "objective-1")
  assert.equal(objective.priority, "follow_up")
  assert.equal(objective.status, "not-started")
  assert.equal(objective.source, "daily_journal")
  assert.equal(objective.checklist[0].id, "follow-1")
})

test("follow-up and weekly task status helpers mirror completion", () => {
  const action = updateFollowUpStatus({ id: "follow-1" }, true, new Date("2026-07-08T00:00:00.000Z"))
  assert.equal(action.status, "completed")

  const objective = syncWeeklyTaskStatus(
    { status: "not-started", checklist: [{ id: "follow-1", done: false }] },
    true
  )
  assert.equal(objective.status, "completed")
  assert.equal(objective.checklist[0].done, true)
})
