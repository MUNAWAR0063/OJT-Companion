import assert from "node:assert/strict"
import test from "node:test"
import { getRoadmapOverallProgress } from "../lib/roadmap-progress.mjs"

test("returns zero when the Learning Roadmap has no progress data", () => {
  assert.equal(getRoadmapOverallProgress(null), 0)
  assert.equal(getRoadmapOverallProgress({ weeks: [] }), 0)
})

test("calculates Overall Progress only from Learning Roadmap weeks", () => {
  const roadmap = {
    weeks: [{ progress: 25 }, { progress: 75 }],
    equipment: [{ progress: 100 }],
    knowledge: [{ progress: 0 }],
    documents: Array.from({ length: 20 }),
  }

  assert.equal(getRoadmapOverallProgress(roadmap), 50)

  const changedNonRoadmapData = {
    ...roadmap,
    equipment: [],
    knowledge: Array.from({ length: 50 }, () => ({ progress: 100 })),
    documents: [],
  }
  assert.equal(getRoadmapOverallProgress(changedNonRoadmapData), 50)
})

test("reaches 100 percent when every roadmap week is complete", () => {
  assert.equal(
    getRoadmapOverallProgress({
      weeks: [{ progress: 100 }, { progress: 100 }, { progress: 100 }],
    }),
    100
  )
})
