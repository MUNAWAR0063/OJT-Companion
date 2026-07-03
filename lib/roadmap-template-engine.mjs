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

function uc({ code, title, category, phase, subjects, activities }) {
  return { code, title, category, phase, subjects, activities }
}

const commonExcelCompetencies = [
  uc({
    code: "G1",
    title: "General safety rules",
    category: "safety",
    phase: "foundation",
    subjects: [
      "Safety culture and safety rules",
      "Mandatory PPE",
      "Hazard identification and risk awareness",
      "Safety observation and behavior-based safety",
    ],
    activities: [
      "Attend site safety induction",
      "Identify hazards during field walkthrough",
      "Demonstrate correct use of PPE",
      "Attend toolbox meeting",
      "Participate in safety observation",
    ],
  }),
  uc({
    code: "G2",
    title: "Facility overview",
    category: "technical",
    phase: "foundation",
    subjects: [
      "Main process of oil and gas system",
      "Utilities system",
      "Safety system",
      "Site layout and hazardous areas",
    ],
    activities: [
      "Conduct facility walkthrough",
      "Review plot plan and layout drawing",
      "Learn PFD and P&ID then follow the process path physically",
      "Identify major process equipment",
      "Demonstrate safe access route and escape paths",
    ],
  }),
  uc({
    code: "UC1",
    title: "Risk assessment, control, and mitigation",
    category: "safety",
    phase: "operation",
    subjects: ["Hazards, risk, consequences, controls, and mitigation"],
    activities: [
      "Develop JSA",
      "Identify hazards for field activities",
      "Assess risk and define control measures",
      "Observe hazardous area classification drawing",
      "Practice portable gas detector use",
    ],
  }),
  uc({
    code: "UC2",
    title: "Permit to work",
    category: "safety",
    phase: "operation",
    subjects: ["Permit type, isolation, authorization, field verification"],
    activities: [
      "Observe permit preparation and approval",
      "Review Class A/B, cold work, and hot work permits",
      "Attend PJSM",
      "Identify hazards related to maintenance work",
      "Participate in permit verification in the field",
    ],
  }),
  uc({
    code: "UC3",
    title: "Emergency response",
    category: "safety",
    phase: "operation",
    subjects: ["Alarm signals, evacuation route, muster point, and basic fire response"],
    activities: [
      "Participate in emergency drill",
      "Observe evacuation route and muster point",
      "Demonstrate use of firefighting equipment",
      "Review ERP and TRP documents",
    ],
  }),
  uc({
    code: "UC4",
    title: "Environmental awareness",
    category: "review",
    phase: "advanced",
    subjects: ["Oil spill, hydrocarbon leak, emissions, produced water, and hazardous waste"],
    activities: [
      "Practice waste segregation",
      "Demonstrate spill kit use",
      "Attend environmental inspection",
      "Observe waste sampling points",
      "Practice how to take environmental samples",
    ],
  }),
  uc({
    code: "UC5",
    title: "Process safety information",
    category: "operation",
    phase: "advanced",
    subjects: ["Layer of protection, safety critical elements, shutdown hierarchy, alarm system, MOC"],
    activities: [
      "Review past site or industry incident and capture lessons learned",
      "Identify safety barriers and SCE in the facility",
      "Monitor process parameters and compare SOL versus NOL",
      "Simulate process upset scenario",
      "Review MOC documentation and change briefing",
    ],
  }),
]

const disciplineExcelCompetencies = {
  Operator: [
    uc({
      code: "UC1",
      title: "Technical drawings",
      category: "technical",
      phase: "foundation",
      subjects: ["PFD", "P&ID", "C&E", "GA drawing", "Drawing symbols and standards"],
      activities: [
        "Trace the PFD process flow path and explain each process unit in sequence",
        "Identify physical equipment corresponding to P&ID tags",
        "Identify process causes and automatic effects in C&E logic",
        "Verify equipment positions using GA drawing",
        "Interpret drawing symbols and standards during field observation",
      ],
    }),
    uc({
      code: "UC2",
      title: "Operate equipment",
      category: "operation",
      phase: "operation",
      subjects: ["Equipment identification and function", "Operating procedure", "Performance and abnormal condition"],
      activities: [
        "Learn equipment list and system description",
        "Locate and identify equipment in the field",
        "Practice SOP, operating manual, or POPM step-by-step",
        "Review start-up and shutdown procedures",
        "Record operational data in log sheets and identify abnormal conditions",
      ],
    }),
    uc({
      code: "UC3",
      title: "Process monitoring and control",
      category: "technical",
      phase: "operation",
      subjects: ["Process overview", "Control system", "Alarm history", "Loop component tracing", "Process trends"],
      activities: [
        "Monitor parameters and compare real-time values with NOL",
        "Read process graphics and instrumentation symbols",
        "Practice acknowledging alarms and reviewing alarm history",
        "Trace loop components from sensor to final element",
        "Review historical and real-time process trends with an operator",
      ],
    }),
    uc({
      code: "UC4",
      title: "Analyze equipment and system performance",
      category: "review",
      phase: "advanced",
      subjects: ["Operating KPI", "Abnormal condition", "Mass and energy balance", "Pre/post maintenance comparison"],
      activities: [
        "Record actual operating data and compare with normal operating range",
        "Evaluate system balance and identify operational inefficiencies",
        "Identify patterns indicating equipment deterioration",
        "Determine possible causes of abnormal readings",
        "Compare pre-maintenance versus post-maintenance performance data",
      ],
    }),
    uc({
      code: "UC5",
      title: "Managing plant and equipment shutdown/start-up",
      category: "operation",
      phase: "advanced",
      subjects: ["Plant monitoring", "Stable operation", "Start-up and shutdown", "Safety devices"],
      activities: [
        "Monitor plant through DCS and routine field inspection",
        "Follow SOP for facility, system, or equipment start-up and shutdown",
        "Perform visual inspection for leaks, vibration, abnormal noise, and overheating",
        "Verify condition of relief valves and alarms",
        "Apply PTW and identify operational hazards",
      ],
    }),
  ],
  Instrument: [
    uc({
      code: "UC1",
      title: "Technical drawings",
      category: "technical",
      phase: "foundation",
      subjects: ["PFD", "P&ID", "C&E", "GA drawing", "Instrument data sheet"],
      activities: [
        "Trace instrument tag from P&ID to field location",
        "Verify instrument specification against actual process condition",
        "Identify physical equipment corresponding to drawing tags",
        "Observe control room alarm response related to C&E logic",
        "Interpret drawing symbols and standards during field observation",
      ],
    }),
    uc({
      code: "UC2",
      title: "Sensing devices, transducer, control valve assembly and actuating devices",
      category: "technical",
      phase: "operation",
      subjects: ["Measurement and instrumentation", "Sensing devices", "Transmitter configuration", "Control valve assembly"],
      activities: [
        "Review instrument data sheet and specifications",
        "Trace sensing devices from process to control system",
        "Observe signal conversion from sensor to transmitter",
        "Calibrate sensing devices or transmitter",
        "Perform valve stroking test when possible",
      ],
    }),
    uc({
      code: "UC3",
      title: "DCS / PLC",
      category: "operation",
      phase: "operation",
      subjects: ["CPU", "I/O module", "PSU", "Communication module", "Logic and alarms"],
      activities: [
        "Review system architecture diagram",
        "Identify AI, AO, DI, and DO modules",
        "Trace wiring from field instruments to I/O cards",
        "Check I/O signals on DCS and simulate signal when possible",
        "Review alarm history, trends, and C&E diagrams",
      ],
    }),
    uc({
      code: "UC4",
      title: "Analyze equipment performance",
      category: "review",
      phase: "advanced",
      subjects: ["Efficiency", "Reliability", "Availability", "Throughput", "Recurring equipment issues"],
      activities: [
        "Review datasheets and design specifications for critical equipment",
        "Compare actual operating conditions with design data",
        "Generate trends for critical equipment",
        "Review maintenance history and recurring equipment issues",
        "Prepare equipment performance report and suggest improvement actions",
      ],
    }),
    uc({
      code: "UC5",
      title: "Preventive maintenance",
      category: "maintenance",
      phase: "advanced",
      subjects: ["PM planning", "Work order system", "Calibration", "Loop check", "CMMS update"],
      activities: [
        "Prepare a simple maintenance plan for selected instruments",
        "Perform transmitter calibration and document results",
        "Adjust instruments to meet accuracy or tolerance",
        "Perform loop checking from field to control room",
        "Update maintenance logs in CMMS and analyze historical trends",
      ],
    }),
  ],
  Mechanical: [
    uc({
      code: "UC1",
      title: "Technical drawings",
      category: "technical",
      phase: "foundation",
      subjects: ["PFD", "P&ID", "C&E", "GA drawing", "Cross-sectional drawing"],
      activities: [
        "Analyze mechanical cross-sectional drawing for pump or compressor",
        "Identify internal parts and match drawing with actual equipment",
        "Identify physical equipment corresponding to P&ID tags",
        "Verify equipment position using GA drawing",
        "Interpret drawing symbols and standards during field observation",
      ],
    }),
    uc({
      code: "UC2",
      title: "Hand tools and power tools",
      category: "maintenance",
      phase: "operation",
      subjects: ["Hand tools", "Power tools", "Safety practices", "Tool maintenance"],
      activities: [
        "Identify workshop tools and select correct tool for the task",
        "Conduct pre-use safety checks on tools",
        "Practice safe working posture and positioning",
        "Use torque wrench for correct tightening",
        "Assemble or disassemble mechanical component",
      ],
    }),
    uc({
      code: "UC3",
      title: "Perform equipment lubrication",
      category: "operation",
      phase: "operation",
      subjects: ["Lubrication system", "Lubrication tools", "Lubricant selection", "Waste disposal"],
      activities: [
        "Practice refilling and maintaining lubrication tools",
        "Apply lubrication chart and SOP during lubrication",
        "Select appropriate lubricant for specific equipment",
        "Identify abnormal findings during lubrication",
        "Record lubricant type and quantity in maintenance records",
      ],
    }),
    uc({
      code: "UC4",
      title: "Analyze equipment performance",
      category: "review",
      phase: "advanced",
      subjects: ["Efficiency", "Reliability", "Availability", "Throughput", "Recurring equipment issues"],
      activities: [
        "Review datasheets and design specifications for critical equipment",
        "Compare actual operating condition with design data",
        "Generate trends for critical equipment",
        "Review maintenance history and recurring equipment issues",
        "Prepare equipment performance report and suggest improvement actions",
      ],
    }),
    uc({
      code: "UC5",
      title: "Preventive maintenance",
      category: "maintenance",
      phase: "advanced",
      subjects: ["PM planning", "Alignment", "Vibration", "Bearing", "Filter and preservation"],
      activities: [
        "Prepare and execute simple PM task under supervision",
        "Perform machine alignment using dial indicator or laser tool",
        "Check vibration level and bearing condition",
        "Perform flange alignment and gasket installation",
        "Update maintenance logs in CMMS and analyze historical trends",
      ],
    }),
  ],
  Electrical: [
    uc({
      code: "E1",
      title: "Technical drawings",
      category: "technical",
      phase: "foundation",
      subjects: ["PFD", "P&ID", "C&E", "GA drawing", "Single line diagram"],
      activities: [
        "Identify each SLD symbol and notation",
        "Match SLD with actual field equipment",
        "Trace power flow using SLD during field walkthrough",
        "Identify physical equipment corresponding to P&ID tags",
        "Interpret drawing symbols and standards during field observation",
      ],
    }),
    uc({
      code: "E2",
      title: "Power generation and distribution system",
      category: "operation",
      phase: "operation",
      subjects: ["Synchronization", "Load sharing", "AVR", "Breaker", "Relay", "Grounding", "UPS"],
      activities: [
        "Practice synchronization under supervision",
        "Read plant SLD and trace power flow from generation to end users",
        "Perform breaker open, close, and trip checks",
        "Test and calibrate relay then verify grounding system integrity",
        "Conduct IR test and inspect transformer oil or emergency generator/UPS alarms",
      ],
    }),
    uc({
      code: "E3",
      title: "Electrical motor",
      category: "maintenance",
      phase: "operation",
      subjects: ["Motor component", "Insulation", "Control schematic", "Protection", "Alignment"],
      activities: [
        "Inspect motor bearing, lubrication condition, and cooling system",
        "Conduct DOL and star-delta starting then monitor current and voltage drop",
        "Trace motor control schematic wiring",
        "Test overload relay setting and protection devices in MCC",
        "Perform IR test and record vibration level",
      ],
    }),
    uc({
      code: "E4",
      title: "Transformer",
      category: "maintenance",
      phase: "advanced",
      subjects: ["Core", "Windings", "Insulation", "Tap changer", "Cooling system", "Relay testing"],
      activities: [
        "Inspect transformer parts, accessories, breather, and cooling method",
        "Verify earthing connection and grounding resistance",
        "Monitor load, voltage, temperature, and daily operating parameters",
        "Conduct turns ratio test, IR test, polarity and phase relationship verification",
        "Conduct relay testing and analyze trip events",
      ],
    }),
    uc({
      code: "E5",
      title: "Electrical safety",
      category: "safety",
      phase: "advanced",
      subjects: ["Shock", "Arc flash", "PPE", "LOTO", "Grounding", "Energized work"],
      activities: [
        "Conduct electrical hazard identification walkthrough",
        "Select PPE for different voltage levels and inspect PPE before use",
        "Apply LOTO on panels and verify zero voltage before work",
        "Prepare JSA and identify control measures for electrical hazards",
        "Inspect grounding connection and measure resistance",
      ],
    }),
  ],
}

disciplineExcelCompetencies.HSE = commonExcelCompetencies

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
  const subjects = Array.isArray(entry?.subjects)
    ? entry.subjects.map((item) => String(item).trim()).filter(Boolean)
    : []
  const activities = Array.isArray(entry?.activities)
    ? entry.activities.map((item) => String(item).trim()).filter(Boolean)
    : []
  const generatedChecklist = activities.length
    ? activities
    : subjects.length
      ? subjects.map((subject) => `Explain and verify ${subject}`)
      : DEFAULT_CHECKLISTS[category]

  return {
    code: String(entry?.code ?? "").trim(),
    title,
    category,
    phase: entry?.phase ?? phase,
    discipline: entry?.discipline ? normalizeTemplateDiscipline(entry.discipline) : discipline,
    subjects,
    activities,
    description: String(
      entry?.description ??
        `${toTitleCase(phase)} ${category} competency from Excel UC${entry?.code ? ` ${entry.code}` : ""}: ${title}.`
    ).trim(),
    priority: entry?.priority ?? (category === "safety" || phase === "foundation" ? "high" : "medium"),
    checklist:
      Array.isArray(entry?.checklist) && entry.checklist.length
        ? entry.checklist
        : generatedChecklist,
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
    ROADMAP_PHASES.map((phase) => [
      phase,
      normalizeTemplatePhase(
        commonExcelCompetencies.filter((entry) => entry.phase === phase),
        phase,
        "Common"
      ),
    ])
  )

  for (const [discipline, entries] of Object.entries(disciplineExcelCompetencies)) {
    registry[discipline] = Object.fromEntries(
      ROADMAP_PHASES.map((phase) => [
        phase,
        normalizeTemplatePhase(
          entries.filter((entry) => entry.phase === phase),
          phase,
          discipline
        ),
      ])
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
      : [{
          code: row?.code,
          title: row?.competency_text ?? row?.title,
          category,
          discipline,
          subjects: row?.subjects,
          activities: row?.activities,
        }]

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

function buildExcelChecklist(task, { site, phase, seed }) {
  const subjects = Array.isArray(task.subjects) ? task.subjects : []
  const activities = Array.isArray(task.activities) && task.activities.length ? task.activities : task.checklist
  const activityLimit = activities.length
  const selectedActivities = seededShuffle(activities, `${seed}:activity:${task.code}:${task.title}`).slice(0, activityLimit)
  const selectedSubject = seededShuffle(subjects, `${seed}:subject:${task.code}:${task.title}`)[0]
  const checklist = []

  if (selectedSubject) {
    checklist.push(`Explain requirement: ${selectedSubject}`)
  }

  const activityPrefix = task.code === "RECAP" ? "Review activity" : `Execute from Excel UC ${task.code || "-"}`
  checklist.push(...selectedActivities.map((activity) => `${activityPrefix}: ${activity}`))
  checklist.push(`Capture ${site} evidence: tag number, reading, drawing reference, or mentor confirmation`)
  checklist.push(SITE_CONTEXT[site]?.checklist ?? "Record site-specific observation")

  const seen = new Set()
  return checklist.filter((item) => {
    const key = item.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getCategoryPool(template, phase, category, selectedDiscipline) {
  const exact = template[phase].filter(
    (task) =>
      task.category === category &&
      (task.discipline === selectedDiscipline || task.discipline === "Common")
  )
  if (exact.length) return exact

  const disciplineFallback = template[phase].filter((task) => task.discipline === selectedDiscipline)
  const commonFallback = template[phase].filter((task) => task.discipline === "Common")
  const fallback = disciplineFallback.length ? disciplineFallback : commonFallback

  return fallback.map((task) => ({
    ...task,
    category,
    title: `${toTitleCase(category)} focus: ${task.title}`,
    description: `${task.description} This task is scheduled as a ${category} focus while staying within the ${selectedDiscipline} competency set.`,
  }))
}

function hasExactCategory(template, phase, category, selectedDiscipline) {
  return template[phase].some(
    (task) =>
      task.category === category &&
      (task.discipline === selectedDiscipline || task.discipline === "Common")
  )
}

function buildScheduledTask({ task, phase, weekNumber, site, seed }) {
  const siteContext = SITE_CONTEXT[site]?.label ?? "site-specific exposure"
  const contrast =
    weekNumber >= 10
      ? "Compare Grissik and Sokka context for the same competency."
      : `Build baseline competency in ${site}.`

  return {
    ...task,
    title: `${task.title} - ${site}`,
    description: `${task.description} ${toTitleCase(site)} context: ${siteContext}.`,
    category: task.category,
    difficulty: DIFFICULTY_BY_PHASE[phase],
    siteContext,
    siteContrast: contrast,
    variationSeed: seed,
    checklist: buildExcelChecklist(task, { site, phase, seed }),
    source: "roadmap",
  }
}

function taskForCategory({ category, selectedDiscipline, phase, weekNumber, site, seed, template }) {
  const categoryPool = getCategoryPool(template, phase, category, selectedDiscipline)
  const preferred = categoryPool.filter(
    (task) => task.discipline === selectedDiscipline
  )
  const pool = preferred.length ? preferred : categoryPool
  const [task] = seededShuffle(pool, `${seed}:${category}:${weekNumber}`)

  return buildScheduledTask({ task, phase, weekNumber, site, seed })
}

function getDisciplineCoverageCompetencies(template, discipline) {
  const seen = new Set()
  return ROADMAP_PHASES.flatMap((phase) => template[phase] ?? [])
    .filter((task) => task.discipline === discipline)
    .filter((task) => {
      const key = `${task.code || task.title}:${task.discipline}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return Boolean(task.code || task.title)
    })
}

function findCompetencyByCode(template, discipline, code) {
  return ROADMAP_PHASES.flatMap((phase) => template[phase] ?? []).find(
    (task) => task.discipline === discipline && task.code === code
  )
}

function buildRecapCompetency(discipline, site) {
  return {
    code: "RECAP",
    title: `${discipline} site learning recap`,
    category: "review",
    phase: "advanced",
    discipline: "Common",
    subjects: [
      "Completed site competency evidence",
      "Mentor feedback and open gaps",
      "Site comparison points",
    ],
    activities: [
      `Summarize completed ${discipline} competencies at ${site}`,
      "Check checklist evidence and mentor confirmation for each completed topic",
      "List weak points that need follow-up practice",
      "Compare this site context with the previous or next site",
    ],
    description: `Recap and consolidate completed ${discipline} learning at ${site}.`,
    priority: "medium",
    checklist: [],
    equipment: [],
    estimatedHours: 3,
    notes: "Use this week to consolidate evidence, reflection, and follow-up items before moving to the next block.",
  }
}

function getFocusedSiteBlockTasks({ template, discipline, siteWeekIndex, site }) {
  const sharedDiscipline = discipline === "HSE" ? "HSE" : "Common"
  const sharedSchedule = [
    ["G1", "G2"],
    ["UC1", "UC2"],
    ["UC3", "UC4", "UC5"],
  ]

  if (siteWeekIndex < sharedSchedule.length) {
    return sharedSchedule[siteWeekIndex]
      .map((code) => findCompetencyByCode(template, sharedDiscipline, code))
      .filter(Boolean)
  }

  if (siteWeekIndex >= 3 && siteWeekIndex <= 7) {
    const disciplineCompetencies = getDisciplineCoverageCompetencies(template, discipline)
    if (!disciplineCompetencies.length) return []
    return [disciplineCompetencies[(siteWeekIndex - 3) % disciplineCompetencies.length]]
  }

  return [buildRecapCompetency(discipline, site)]
}

export function generateVariation({ seed, weekNumber, site, phase, discipline, template, registry, requiredCompetency }) {
  const categorySeed = `${seed}:categories`
  const availableCategories = [
    ...CATEGORY_ORDER,
    ...(hasExactCategory(template, phase, "maintenance", discipline) ? ["maintenance"] : []),
  ]
  const rotated = seededShuffle(availableCategories, categorySeed)
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
    })
  )
  const requiredTask = requiredCompetency
    ? buildScheduledTask({
        task: requiredCompetency,
        phase,
        weekNumber,
        site,
        seed: `${seed}:site-coverage:${requiredCompetency.code || requiredCompetency.title}`,
      })
    : null

  const requiredCoverageKey = requiredTask?.code && requiredTask.discipline === discipline
    ? `${requiredTask.discipline}:${requiredTask.code}`.toLowerCase()
    : ""
  const seen = new Set()
  return [requiredTask, ...tasks].filter((task) => {
    if (!task) return false
    const coverageKey = task.code && task.discipline === discipline
      ? `${task.discipline}:${task.code}`.toLowerCase()
      : ""
    if (coverageKey && coverageKey === requiredCoverageKey && seen.has(`coverage:${coverageKey}`)) {
      return false
    }
    if (coverageKey && coverageKey === requiredCoverageKey) {
      seen.add(`coverage:${coverageKey}`)
    }
    const key = `${task.category}:${task.title}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function generateWeeklyPlanner({ trips, template, discipline, group, registry, roadmapSeed }) {
  const siteWeekIndex = new Map()

  return Array.from({ length: 18 }, (_, index) => {
    const weekNumber = index + 1
    const trip = trips[Math.min(Math.floor(index / 3), trips.length - 1)]
    const site = trip.site ?? trip.location
    const phase = getPhaseByWeek(weekNumber)
    const variationSeed = `${roadmapSeed}:${discipline}:${group}:trip-${trip.tripNumber}:week-${weekNumber}`
    const currentSiteIndex = siteWeekIndex.get(site) ?? 0
    siteWeekIndex.set(site, currentSiteIndex + 1)
    const focusedTasks = getFocusedSiteBlockTasks({ template, discipline, siteWeekIndex: currentSiteIndex, site })
    const tasks = focusedTasks.length
      ? focusedTasks.map((task) =>
          buildScheduledTask({
            task,
            phase,
            weekNumber,
            site,
            seed: `${variationSeed}:focus:${task.code || task.title}`,
          })
        )
      : generateVariation({
          seed: variationSeed,
          weekNumber,
          site,
          phase,
          discipline,
          template,
          registry,
        })

    return {
      weekNumber,
      title: `Week ${weekNumber} - ${toTitleCase(phase)} at ${site}`,
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
