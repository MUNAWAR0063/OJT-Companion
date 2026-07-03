import assert from "node:assert/strict"
import test from "node:test"
import {
  buildCurrentRoadmapChecklistNotification,
  getCurrentOjtWeek,
  reconcileRoadmapChecklistNotifications,
} from "../lib/notification-policy.mjs"

const makeWeek = (weekNumber, done) => ({
  weekNumber,
  objectives: [
    {
      checklist: [{ id: `w${weekNumber}-item`, done }],
    },
  ],
})

test("getCurrentOjtWeek clamps the week to the configured OJT window", () => {
  assert.equal(getCurrentOjtWeek("2026-07-01", 18, new Date("2026-06-20")), 1)
  assert.equal(getCurrentOjtWeek("2026-07-01", 18, new Date("2026-07-01")), 1)
  assert.equal(getCurrentOjtWeek("2026-07-01", 18, new Date("2026-07-08")), 2)
  assert.equal(getCurrentOjtWeek("2026-07-01", 18, new Date("2027-01-01")), 18)
  assert.equal(getCurrentOjtWeek("2026-07-01", 16, new Date("2026-10-28")), 18)
})

test("buildCurrentRoadmapChecklistNotification only reports the active week", () => {
  const notification = buildCurrentRoadmapChecklistNotification({
    roadmap: {
      id: "roadmap-1",
      startDate: "2026-07-01",
      weeks: [makeWeek(1, true), makeWeek(2, false), makeWeek(3, false)],
    },
    now: new Date("2026-07-01"),
    fallbackTotalWeeks: 18,
  })

  assert.equal(notification, null)

  const weekTwoNotification = buildCurrentRoadmapChecklistNotification({
    roadmap: {
      id: "roadmap-1",
      startDate: "2026-07-01",
      weeks: [makeWeek(1, true), makeWeek(2, false), makeWeek(3, false)],
    },
    now: new Date("2026-07-08"),
    fallbackTotalWeeks: 18,
  })

  assert.equal(weekTwoNotification.weekNumber, 2)
  assert.equal(weekTwoNotification.fingerprint, "roadmap-checklist-roadmap-1-week-2")
  assert.equal(weekTwoNotification.message, "Week 2 of 18: 1 checklist item is incomplete.")
})

test("buildCurrentRoadmapChecklistNotification supports the full 18 week OJT window", () => {
  const weekEighteenNotification = buildCurrentRoadmapChecklistNotification({
    roadmap: {
      id: "roadmap-18",
      startDate: "2026-07-01",
      weeks: Array.from({ length: 18 }, (_, index) => makeWeek(index + 1, index !== 17)),
    },
    now: new Date("2026-10-28"),
    fallbackTotalWeeks: 16,
  })

  assert.equal(weekEighteenNotification.weekNumber, 18)
  assert.equal(weekEighteenNotification.fingerprint, "roadmap-checklist-roadmap-18-week-18")
  assert.equal(weekEighteenNotification.message, "Week 18 of 18: 1 checklist item is incomplete.")
})

test("reconcileRoadmapChecklistNotifications removes stale roadmap checklist notifications", () => {
  const active = {
    fingerprint: "roadmap-checklist-roadmap-1-week-2",
    type: "roadmap-checklist",
  }
  const reconciled = reconcileRoadmapChecklistNotifications(
    [
      { fingerprint: "roadmap-checklist-old-item", title: "Incomplete Roadmap Checklist" },
      { fingerprint: "roadmap-checklist-roadmap-1-week-2", type: "roadmap-checklist" },
      { fingerprint: "journal-checklist-1", type: "incomplete-checklist" },
    ],
    active
  )

  assert.deepEqual(
    reconciled.map((notification) => notification.fingerprint),
    ["roadmap-checklist-roadmap-1-week-2", "journal-checklist-1"]
  )
})
