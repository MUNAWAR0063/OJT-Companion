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

test("generated checklists are built from Excel UC activities and vary across weeks", () => {
  const roadmap = generateRoadmap({
    discipline: "Electrical Technician",
    group: "A",
    startDate: "2026-07-01",
    seed: "electrical-a",
  })
  const checklistTexts = roadmap.weeks.flatMap((week) =>
    week.objectives.flatMap((objective) => objective.checklist)
  )
  const week4Checklist = roadmap.weeks[3].objectives.flatMap((objective) => objective.checklist)
  const week5Checklist = roadmap.weeks[4].objectives.flatMap((objective) => objective.checklist)

  assert.ok(checklistTexts.some((item) => item.includes("SLD")))
  assert.ok(checklistTexts.some((item) => item.includes("relay") || item.includes("IR test")))
  assert.ok(checklistTexts.some((item) => item.includes("LOTO")))
  assert.ok(checklistTexts.some((item) => item.includes("Transformer") || item.includes("transformer")))
  assert.notDeepEqual(week4Checklist, week5Checklist)
  assert.ok(roadmap.weeks.flatMap((week) => week.objectives).every((objective) => objective.code))
})

test("generated roadmap only uses selected discipline and common competencies", () => {
  for (const discipline of ["Operator", "Instrument", "Mechanical", "Electrical"]) {
    const roadmap = generateRoadmap({
      discipline,
      group: "A",
      startDate: "2026-07-01",
      seed: `${discipline.toLowerCase()}-strict`,
    })
    const disciplines = new Set(
      roadmap.weeks.flatMap((week) => week.objectives.map((objective) => objective.discipline))
    )

    assert.deepEqual(disciplines, new Set([discipline, "Common"]))
  }
})

test("selected discipline competency units are completed once per site", () => {
  const expectedCodesByDiscipline = {
    Operator: ["UC1", "UC2", "UC3", "UC4", "UC5"],
    Instrument: ["UC1", "UC2", "UC3", "UC4", "UC5"],
    Mechanical: ["UC1", "UC2", "UC3", "UC4", "UC5"],
    Electrical: ["E1", "E2", "E3", "E4", "E5"],
    HSE: ["G1", "G2", "UC1", "UC2", "UC3", "UC4", "UC5"],
  }

  for (const [discipline, expectedCodes] of Object.entries(expectedCodesByDiscipline)) {
    const roadmap = generateRoadmap({
      discipline,
      group: "A",
      startDate: "2026-07-01",
      seed: `${discipline.toLowerCase()}-site-coverage`,
    })

    for (const site of ["Grissik", "Sokka"]) {
      const actualCodes = new Set(
        roadmap.weeks
          .filter((week) => week.location === site)
          .flatMap((week) =>
            week.objectives
              .filter((objective) => objective.discipline === discipline)
              .map((objective) => objective.code)
          )
      )

      assert.deepEqual(actualCodes, new Set(expectedCodes), `${discipline} coverage at ${site}`)
    }
  }
})

test("electrical roadmap follows the focused 9-week site block example", () => {
  const roadmap = generateRoadmap({
    discipline: "Electrical Technician",
    group: "A",
    startDate: "2026-07-01",
    seed: "electrical-focused-block",
  })
  const expectedBlock = [
    ["G1", "G2"],
    ["UC1", "UC2"],
    ["UC3", "UC4", "UC5"],
    ["E1"],
    ["E2"],
    ["E3"],
    ["E4"],
    ["E5"],
    ["RECAP"],
  ]

  assert.deepEqual(
    roadmap.weeks.slice(0, 9).map((week) => week.objectives.map((objective) => objective.code)),
    expectedBlock
  )
  assert.deepEqual(
    roadmap.weeks.slice(9, 18).map((week) => week.objectives.map((objective) => objective.code)),
    expectedBlock
  )
  assert.ok(roadmap.weeks[6].objectives[0].title.includes("Transformer"))
})

test("non-electrical disciplines focus one competency at a time in weeks 4 to 8", () => {
  for (const discipline of ["Operator", "Instrument", "Mechanical"]) {
    const roadmap = generateRoadmap({
      discipline,
      group: "B",
      startDate: "2026-07-01",
      seed: `${discipline.toLowerCase()}-focused-block`,
    })

    assert.deepEqual(
      roadmap.weeks.slice(3, 8).map((week) =>
        week.objectives
          .filter((objective) => objective.discipline === discipline)
          .map((objective) => objective.code)
      ),
      [["UC1"], ["UC2"], ["UC3"], ["UC4"], ["UC5"]]
    )
    assert.ok(roadmap.weeks.slice(3, 8).every((week) => week.objectives.length === 1))
  }
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
