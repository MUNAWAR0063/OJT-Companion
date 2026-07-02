import assert from "node:assert/strict"
import test from "node:test"
import {
  buildTrips,
  generateRoadmap,
  generateVariation,
  getDisciplineTemplate,
  getPhaseByWeek,
  parseTemplateRows,
} from "../lib/roadmap-template-engine.mjs"

test("buildTrips applies Group A and Group B site rotation", () => {
  assert.deepEqual(
    buildTrips("A").map((trip) => trip.location),
    ["Grissik", "Grissik", "Grissik", "Sokka", "Sokka", "Sokka"]
  )
  assert.deepEqual(
    buildTrips("B").map((trip) => trip.location),
    ["Sokka", "Sokka", "Sokka", "Grissik", "Grissik", "Grissik"]
  )
})

test("getPhaseByWeek follows the 18-week phase mapping rule", () => {
  assert.equal(getPhaseByWeek(1), "foundation")
  assert.equal(getPhaseByWeek(3), "foundation")
  assert.equal(getPhaseByWeek(4), "operation")
  assert.equal(getPhaseByWeek(12), "operation")
  assert.equal(getPhaseByWeek(13), "advanced")
  assert.equal(getPhaseByWeek(18), "advanced")
})

test("generateRoadmap creates 6 trips, 18 weeks, site context, and varied weekly tasks", () => {
  const roadmap = generateRoadmap({
    discipline: "Instrument Technician",
    group: "B",
    startDate: "2026-07-01",
    seed: "instrument-b",
  })

  assert.equal(roadmap.discipline, "Instrument")
  assert.equal(roadmap.group, "B")
  assert.equal(roadmap.trips.length, 6)
  assert.equal(roadmap.weeks.length, 18)
  assert.equal(roadmap.weeks[0].location, "Sokka")
  assert.equal(roadmap.weeks[17].location, "Grissik")
  assert.equal(roadmap.weeks[0].phase, "foundation")
  assert.equal(roadmap.weeks[3].phase, "operation")
  assert.equal(roadmap.weeks[11].phase, "operation")
  assert.equal(roadmap.weeks[12].phase, "advanced")
  assert.ok(roadmap.weeks.every((week) => week.objectives.length > 0))
  assert.ok(roadmap.weeks.flatMap((week) => week.objectives).every((task) => task.source === "roadmap"))
  assert.ok(roadmap.weeks.every((week) => week.variationSeed.includes(`week-${week.weekNumber}`)))
  assert.ok(roadmap.weeks[9].objectives.every((task) => task.siteContrast.includes("Compare Grissik and Sokka")))
})

test("generateVariation mixes required categories and changes sequence by seed", () => {
  const template = getDisciplineTemplate("Operator")
  const first = generateVariation({
    seed: "operator-a-week-4",
    weekNumber: 4,
    site: "Grissik",
    phase: "operation",
    discipline: "Operator",
    template,
  })
  const second = generateVariation({
    seed: "operator-a-week-5",
    weekNumber: 5,
    site: "Grissik",
    phase: "operation",
    discipline: "Operator",
    template,
  })

  assert.deepEqual(
    new Set(first.map((task) => task.category)),
    new Set(["safety", "technical", "operation", "review"])
  )
  assert.notDeepEqual(
    first.map((task) => `${task.category}:${task.title}`),
    second.map((task) => `${task.category}:${task.title}`)
  )
  assert.ok(first.every((task) => task.difficulty === "intermediate"))
})

test("parseTemplateRows loads Excel-converted category rows without duplicate task titles", () => {
  const registry = parseTemplateRows([
    {
      discipline: "Electrical",
      phase: "foundation",
      category: "safety",
      competency_text: "Electrical safety and LOTO",
    },
    {
      discipline: "Electrical",
      phase: "foundation",
      category: "safety",
      competency_text: "Electrical safety and LOTO",
    },
    {
      discipline: "Electrical",
      phase: "foundation",
      category: "technical",
      competency_text: "Single line diagram reading",
    },
  ])
  const template = getDisciplineTemplate("Electrical Technician", registry)
  const electricalOnly = template.foundation.filter((task) => task.discipline === "Electrical")

  assert.equal(electricalOnly.length, 2)
  assert.deepEqual(
    electricalOnly.map((task) => task.title),
    ["Electrical safety and LOTO", "Single line diagram reading"]
  )
  assert.equal(electricalOnly[0].category, "safety")
  assert.equal(electricalOnly[1].category, "technical")
})
