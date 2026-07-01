import assert from "node:assert/strict"
import test from "node:test"
import {
  filterCompetencies,
  formatCompetencyDate,
  getVisibleCompetencies,
  paginateCompetencies,
  sortCompetencies,
} from "../lib/competencies-utils.mjs"

const competencies = [
  {
    id: "equipment",
    title: "Equipment Familiarization",
    category: "Engineering",
    description: "Catalog transformers and switchgear",
    progress: 80,
    status: "in-progress",
    lastUpdated: "2026-07-01T10:00:00.000Z",
  },
  {
    id: "journal",
    title: "Field Observation",
    category: "Documentation",
    description: "Daily field notes and reflections",
    progress: 100,
    status: "completed",
    lastUpdated: "2026-06-25T10:00:00.000Z",
  },
  {
    id: "roadmap",
    title: "Learning Roadmap",
    category: "Roadmap",
    description: "Weekly milestones",
    progress: 0,
    status: "not-started",
    lastUpdated: null,
  },
]

test("filters competencies by search, category, and status without duplicating results", () => {
  const result = filterCompetencies(competencies, {
    query: "field",
    category: "Documentation",
    status: "completed",
  })

  assert.deepEqual(result.map((item) => item.id), ["journal"])
})

test("returns an empty result for unmatched search filters", () => {
  const result = filterCompetencies(competencies, { query: "does not exist" })

  assert.equal(result.length, 0)
})

test("sorts competencies by recent update and keeps undated records last", () => {
  const result = sortCompetencies(competencies, "updated-desc")

  assert.deepEqual(result.map((item) => item.id), ["equipment", "journal", "roadmap"])
})

test("sorts competencies by progress in both directions", () => {
  assert.deepEqual(sortCompetencies(competencies, "progress-desc").map((item) => item.id), [
    "journal",
    "equipment",
    "roadmap",
  ])
  assert.deepEqual(sortCompetencies(competencies, "progress-asc").map((item) => item.id), [
    "roadmap",
    "equipment",
    "journal",
  ])
})

test("paginates competencies and clamps out-of-range pages", () => {
  const first = paginateCompetencies(competencies, 1, 2)
  const overflow = paginateCompetencies(competencies, 99, 2)

  assert.equal(first.pageCount, 2)
  assert.deepEqual(first.items.map((item) => item.id), ["equipment", "journal"])
  assert.equal(overflow.page, 2)
  assert.deepEqual(overflow.items.map((item) => item.id), ["roadmap"])
})

test("combines filter, sort, and pagination for visible competency cards", () => {
  const result = getVisibleCompetencies(
    competencies,
    { query: "", category: "all", status: "all" },
    "title-asc",
    1,
    2
  )

  assert.equal(result.filtered.length, 3)
  assert.deepEqual(result.pagination.items.map((item) => item.id), ["equipment", "journal"])
})

test("formats missing or invalid competency dates as no updates", () => {
  assert.equal(formatCompetencyDate(null), "No updates yet")
  assert.equal(formatCompetencyDate("not-a-date"), "No updates yet")
})
