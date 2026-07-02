export const ROADMAP_GROUPS = ["A", "B"]
export const ROADMAP_DISCIPLINES = ["Operator", "Instrument", "Mechanical", "Electrical", "HSE"]
export const ROADMAP_PHASES = ["foundation", "operation", "advanced"]
export const ROADMAP_CATEGORIES = ["safety", "technical", "operation", "review", "maintenance"]

const CATEGORY_ORDER = ["safety", "technical", "operation", "review"]

const SITE_CONTEXT = {
  Grissik: {
    label: "production-heavy exposure",
    checklist: "Compare finding against production operating limits",
  },
  Sokka: {
    label: "system/process variation",
    checklist: "Compare finding against alternate site process configuration",
  },
}

const DIFFICULTY_BY_PHASE = {
  foundation: "basic",
  operation: "intermediate",
  advanced: "advanced",
}

const DEFAULT_CHECKLISTS = {
  safety: ["Identify site hazard", "Verify PPE and permit boundary", "Record control measure"],
  technical: ["Trace equipment or drawing reference", "Validate tag or signal in the field", "Record technical evidence"],
  operation: ["Observe operating condition", "Confirm SOP or normal limit", "Discuss finding with mentor"],
  maintenance: ["Review maintenance requirement", "Observe execution or inspection step", "Record follow-up action"],
  review: ["Compare with previous site or week", "Summarize lesson in Daily Journal", "List open questions"],
}

const commonCompetencies = {
  foundation: [
    ["safety", "Safety induction"],
    ["safety", "PPE and hazard identification"],
    ["technical", "Facility walkthrough"],
    ["technical", "PFD and P&ID introduction"],
    ["review", "Equipment tagging review"],
  ],
  operation: [
    ["safety", "PTW and LOTO field practice"],
    ["operation", "SOP verification"],
    ["technical", "System understanding walkthrough"],
    ["review", "Operating limit comparison"],
  ],
  advanced: [
    ["safety", "Advanced job safety review"],
    ["operation", "Performance analysis review"],
    ["maintenance", "Maintenance execution review"],
    ["review", "Site contrast assessment"],
  ],
}

const disciplineTopics = {
  Operator: {
    foundation: [
      ["technical", "PFD process flow tracing"],
      ["review", "GA drawing verification"],
    ],
    operation: [
      ["operation", "SOP start and stop system"],
      ["operation", "Alarm recognition from DCS"],
      ["review", "Equipment inspection log review"],
      ["technical", "Trend analysis NOL versus SOL"],
      ["technical", "Alarm history review"],
      ["technical", "Loop tracing"],
    ],
    advanced: [
      ["operation", "SOP execution in real operation"],
      ["technical", "Process optimization exposure"],
      ["technical", "Process inefficiency analysis"],
      ["review", "Equipment performance comparison"],
    ],
  },
  Instrument: {
    foundation: [["technical", "Instrument identification from P&ID"]],
    operation: [
      ["technical", "Sensor to transmitter tracing"],
      ["maintenance", "Basic calibration introduction"],
      ["operation", "Valve stroking observation"],
      ["operation", "DCS monitoring"],
      ["maintenance", "Loop checking"],
      ["technical", "I/O mapping"],
    ],
    advanced: [
      ["maintenance", "Loop calibration execution"],
      ["technical", "Fault detection"],
      ["maintenance", "Calibration certification tasks"],
      ["review", "CMMS update"],
    ],
  },
  Mechanical: {
    foundation: [["technical", "Equipment cross-section introduction"]],
    operation: [
      ["maintenance", "Tool usage and assembly/disassembly"],
      ["maintenance", "Lubrication basic practice"],
      ["maintenance", "Lubrication system execution"],
      ["technical", "Equipment condition monitoring"],
    ],
    advanced: [
      ["maintenance", "Alignment and vibration check introduction"],
      ["maintenance", "Preventive maintenance execution"],
      ["technical", "Failure analysis"],
      ["review", "Maintenance planning execution"],
    ],
  },
  Electrical: {
    foundation: [["technical", "SLD introduction and field matching"]],
    operation: [
      ["operation", "Breaker operation"],
      ["maintenance", "IR test introduction"],
      ["safety", "PTW and LOTO practice"],
      ["technical", "Motor control system"],
      ["technical", "Protection system study"],
    ],
    advanced: [
      ["maintenance", "Transformer inspection"],
      ["maintenance", "Relay testing"],
      ["technical", "Load analysis"],
      ["review", "Trip event analysis"],
    ],
  },
  HSE: {
    foundation: [
      ["safety", "Golden Rules verification"],
      ["safety", "Emergency response introduction"],
    ],
    operation: [
      ["safety", "PTW audit"],
      ["safety", "JSA facilitation"],
      ["review", "Incident observation follow-up"],
    ],
    advanced: [
      ["safety", "Risk assessment leadership"],
      ["operation", "Emergency drill evaluation"],
      ["review", "HSE performance improvement"],
    ],
  },
}

function toTitleCase(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function hashString(value) {
  let hash = 2166136261
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRandom(seed) {
  let state = hashString(seed) || 1
  return () => {
    state = Math.imul(1664525, state) + 1013904223
    return (state >>> 0) / 4294967296
  }
}

function seededShuffle(items, seed) {
  const random = seededRandom(seed)
  const output = [...items]
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[output[index], output[swapIndex]] = [output[swapIndex], output[index]]
  }
  return output
}

export function normalizeDiscipline(value) {
  const normalized = String(value ?? "").trim().toLowerCase()
  if (normalized.includes("operator")) return "Operator"
  if (normalized.includes("instrument")) return "Instrument"
  if (normalized.includes("mechanical")) return "Mechanical"
  if (normalized.includes("hse") || normalized.includes("safety")) return "HSE"
  return "Electrical"
}

export function normalizeRoadmapGroup(value) {
  return String(value ?? "").trim().toUpperCase() === "B" ? "B" : "A"
}

function normalizeTemplateDiscipline(value) {
  return String(value ?? "").trim().toLowerCase() === "common" ? "Common" : normalizeDiscipline(value)
}

export function normalizeCategory(value) {
  const normalized = String(value ?? "").trim().toLowerCase()
  if (normalized === "maintenance") return "maintenance"
  if (normalized === "technical") return "technical"
  if (normalized === "operation" || normalized === "operations") return "operation"
  if (normalized === "review" || normalized === "assessment") return "review"
  return "safety"
}

export function getPhaseByWeek(weekNumber) {
  const week = Number(weekNumber)
  if (week >= 1 && week <= 3) return "foundation"
  if (week >= 4 && week <= 12) return "operation"
  return "advanced"
}

export function buildTrips(group) {
  const normalizedGroup = normalizeRoadmapGroup(group)
  const firstSite = normalizedGroup === "A" ? "Grissik" : "Sokka"
  const secondSite = normalizedGroup === "A" ? "Sokka" : "Grissik"

  return Array.from({ length: 6 }, (_, index) => {
    const tripNumber = index + 1
    const site = tripNumber <= 3 ? firstSite : secondSite
    return {
      id: `trip-${tripNumber}-${site.toLowerCase()}`,
      tripNumber,
      name: `Trip ${tripNumber} - ${site}`,
      location: site,
      site,
      focus: `${site} competency rotation`,
      description: `Three-week OJT rotation at ${site} with ${SITE_CONTEXT[site].label}.`,
    }
  })
}

function normalizeCompetency(entry, phase, discipline = "Common") {
  if (Array.isArray(entry)) {
    const [category, title] = entry
    return normalizeCompetency({ category, title }, phase, discipline)
  }

  if (typeof entry === "string") {
    return normalizeCompetency({ title: entry }, phase, discipline)
  }

  const category = normalizeCategory(entry?.category)
  const title = String(entry?.title ?? entry?.name ?? entry?.competency_text ?? "Competency task").trim()
  return {
    title,
    category,
    discipline: entry?.discipline ? normalizeTemplateDiscipline(entry.discipline) : discipline,
    description: String(entry?.description ?? `${toTitleCase(phase)} ${category} competency: ${title}.`).trim(),
    priority: entry?.priority ?? (category === "safety" || phase === "foundation" ? "high" : "medium"),
    checklist:
      Array.isArray(entry?.checklist) && entry.checklist.length
        ? entry.checklist
        : DEFAULT_CHECKLISTS[category],
    equipment: Array.isArray(entry?.equipment) ? entry.equipment : [],
    estimatedHours: Math.max(0, Number(entry?.estimatedHours ?? entry?.estimated_hours ?? (phase === "advanced" ? 4 : 3))),
    notes: String(entry?.notes ?? "Generated from Excel-imported discipline template.").trim(),
  }
}

function normalizeTemplatePhase(entries, phase, discipline = "Common") {
  const seen = new Set()
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => normalizeCompetency(entry, phase, discipline))
    .filter((entry) => {
      const key = `${entry.discipline}:${entry.category}:${entry.title}`.toLowerCase()
      if (!entry.title || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function buildDefaultRegistry() {
  const registry = {}
  registry.Common = Object.fromEntries(
    ROADMAP_PHASES.map((phase) => [phase, normalizeTemplatePhase(commonCompetencies[phase], phase, "Common")])
  )

  for (const [discipline, phases] of Object.entries(disciplineTopics)) {
    registry[discipline] = Object.fromEntries(
      ROADMAP_PHASES.map((phase) => [phase, normalizeTemplatePhase(phases[phase], phase, discipline)])
    )
  }

  return registry
}

export const DEFAULT_DISCIPLINE_TEMPLATE_REGISTRY = buildDefaultRegistry()

export function parseTemplateRows(rows) {
  const registry = {}
  for (const row of Array.isArray(rows) ? rows : []) {
    const discipline = row?.discipline ? normalizeDiscipline(row.discipline) : "Common"
    const phase = ROADMAP_PHASES.includes(row?.phase) ? row.phase : "foundation"
    const category = normalizeCategory(row?.category)
    const entries = Array.isArray(row?.competency_json)
      ? row.competency_json
      : [{ title: row?.competency_text ?? row?.title, category, discipline }]

    registry[discipline] ??= { foundation: [], operation: [], advanced: [] }
    registry[discipline][phase] = [
      ...(registry[discipline][phase] ?? []),
      ...normalizeTemplatePhase(
        entries.map((entry) => (typeof entry === "string" ? { title: entry, category, discipline } : { ...entry, category: entry?.category ?? category, discipline })),
        phase,
        discipline
      ),
    ]
  }

  for (const [discipline, phases] of Object.entries(registry)) {
    for (const phase of ROADMAP_PHASES) {
      registry[discipline][phase] = normalizeTemplatePhase(phases[phase], phase, discipline)
    }
  }

  return registry
}

export function getDisciplineTemplate(discipline, registry = DEFAULT_DISCIPLINE_TEMPLATE_REGISTRY) {
  const key = normalizeDiscipline(discipline)
  const common = registry.Common ?? DEFAULT_DISCIPLINE_TEMPLATE_REGISTRY.Common
  const selected = registry[key] ?? DEFAULT_DISCIPLINE_TEMPLATE_REGISTRY[key]

  return Object.fromEntries(
    ROADMAP_PHASES.map((phase) => [
      phase,
      normalizeTemplatePhase([...(common?.[phase] ?? []), ...(selected?.[phase] ?? [])], phase, key),
    ])
  )
}

function getRegistryPool(registry, phase) {
  return Object.entries(registry ?? DEFAULT_DISCIPLINE_TEMPLATE_REGISTRY).flatMap(([discipline, phases]) =>
    normalizeTemplatePhase(phases?.[phase], phase, discipline)
  )
}

function taskForCategory({ category, selectedDiscipline, phase, weekNumber, site, seed, template, registry }) {
  const categoryPool = [
    ...template[phase].filter((task) => task.category === category),
    ...getRegistryPool(registry, phase).filter((task) => task.category === category),
  ]

  const preferred = categoryPool.filter(
    (task) => task.discipline === selectedDiscipline || task.discipline === "Common"
  )
  const fallback = categoryPool.length ? categoryPool : template[phase]
  const pool = preferred.length ? preferred : fallback
  const [task] = seededShuffle(pool, `${seed}:${category}:${weekNumber}`)
  const siteContext = SITE_CONTEXT[site]?.label ?? "site-specific exposure"
  const contrast =
    weekNumber >= 10
      ? "Compare Grissik and Sokka context for the same competency."
      : `Build baseline competency in ${site}.`

  return {
    ...task,
    title: `${task.title} - ${site}`,
    description: `${task.description} ${toTitleCase(site)} context: ${siteContext}.`,
    category,
    difficulty: DIFFICULTY_BY_PHASE[phase],
    siteContext,
    siteContrast: contrast,
    variationSeed: seed,
    checklist: [...task.checklist, SITE_CONTEXT[site]?.checklist ?? "Record site-specific observation"],
    source: "roadmap",
  }
}

export function generateVariation({ seed, weekNumber, site, phase, discipline, template, registry }) {
  const categorySeed = `${seed}:categories`
  const rotated = seededShuffle(CATEGORY_ORDER, categorySeed)
  const orderedCategories = rotated.map((category, index) => rotated[(index + weekNumber - 1) % rotated.length])
  const tasks = orderedCategories.map((category) =>
    taskForCategory({
      category,
      selectedDiscipline: discipline,
      phase,
      weekNumber,
      site,
      seed,
      template,
      registry,
    })
  )

  const seen = new Set()
  return tasks.filter((task) => {
    const key = `${task.category}:${task.title}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function generateWeeklyPlanner({ trips, template, discipline, group, registry, roadmapSeed }) {
  return Array.from({ length: 18 }, (_, index) => {
    const weekNumber = index + 1
    const trip = trips[Math.min(Math.floor(index / 3), trips.length - 1)]
    const phase = getPhaseByWeek(weekNumber)
    const variationSeed = `${roadmapSeed}:${discipline}:${group}:trip-${trip.tripNumber}:week-${weekNumber}`
    const tasks = generateVariation({
      seed: variationSeed,
      weekNumber,
      site: trip.site ?? trip.location,
      phase,
      discipline,
      template,
      registry,
    })

    return {
      weekNumber,
      title: `Week ${weekNumber} - ${toTitleCase(phase)} at ${trip.site ?? trip.location}`,
      tripId: trip.id,
      tripName: trip.name,
      location: trip.location,
      phase,
      variationSeed,
      status: "not-started",
      progress: 0,
      objectives: tasks,
      reflection: "",
    }
  })
}

export function generateRoadmap(input = {}) {
  const discipline = normalizeDiscipline(input.discipline)
  const group = normalizeRoadmapGroup(input.group)
  const registry = input.templateRegistry ?? DEFAULT_DISCIPLINE_TEMPLATE_REGISTRY
  const template = getDisciplineTemplate(discipline, registry)
  const trips = buildTrips(group)
  const roadmapSeed = input.seed || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const weeks = generateWeeklyPlanner({ trips, template, discipline, group, registry, roadmapSeed })

  return {
    title: input.title || `${discipline} OJT Roadmap - Group ${group}`,
    traineeName: input.traineeName || "Trainee",
    companyName: input.companyName || "Company",
    startDate: input.startDate || new Date().toISOString().slice(0, 10),
    discipline,
    group,
    mode: "auto",
    variationSeed: roadmapSeed,
    trips,
    weeks,
  }
}
