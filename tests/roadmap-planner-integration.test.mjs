import assert from "node:assert/strict"
import test from "node:test"
import {
  generateWeeklyPlansFromRoadmap,
  getWeekStatus,
  recalculateRoadmapProgress,
  recalculateWeekProgress,
  updateObjectiveStatus,
} from "../lib/roadmap-planner-integration.mjs"

const roadmap = {
  id: "roadmap-1",
  createdAt: "2026-07-01T00:00:00.000Z",
  weeks: [
    {
      id: "week-1",
      weekNumber: 1,
      title: "Week 1",
      reflection: "",
      objectives: [
        {
          id: "objective-1",
          title: "Objective 1",
          status: "not-started",
          checklist: [
            { id: "check-1", text: "First", done: true },
            { id: "check-2", text: "Second", done: false },
          ],
        },
      ],
    },
    {
      id: "week-2",
      weekNumber: 2,
      title: "Week 2",
      reflection: "",
      objectives: [
        {
          id: "objective-2",
          title: "Objective 2",
          status: "completed",
          checklist: [{ id: "check-3", text: "Done", done: true }],
        },
      ],
    },
  ],
}

test("generateWeeklyPlansFromRoadmap projects roadmap weeks with link metadata", () => {
  const plans = generateWeeklyPlansFromRoadmap(roadmap)

  assert.equal(plans.length, 2)
  assert.equal(plans[0].linkedRoadmapId, "roadmap-1")
  assert.equal(plans[0].linkedWeekId, "week-1")
  assert.equal(plans[0].objectives[0].roadmapId, "roadmap-1")
  assert.equal(plans[0].objectives[0].roadmapWeekId, "week-1")
})

test("progress is recalculated from objective checklist completion", () => {
  assert.equal(recalculateWeekProgress(roadmap.weeks[0]), 50)
  assert.equal(recalculateWeekProgress(roadmap.weeks[1]), 100)
  assert.equal(recalculateRoadmapProgress(roadmap), 75)
  assert.equal(getWeekStatus(roadmap.weeks[0]), "in-progress")
  assert.equal(getWeekStatus(roadmap.weeks[1]), "completed")
})

test("updateObjectiveStatus moves checklist completion with the status", () => {
  const done = updateObjectiveStatus(roadmap.weeks[0].objectives[0], "completed")
  assert.equal(done.progress, 100)
  assert.equal(done.checklist.every((item) => item.done), true)

  const todo = updateObjectiveStatus(done, "not-started")
  assert.equal(todo.progress, 0)
  assert.equal(todo.checklist.some((item) => item.done), false)
})
