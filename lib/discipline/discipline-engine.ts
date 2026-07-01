import type { Discipline as AuthDiscipline } from "@/lib/auth/auth-types"

export type DisciplineCode = "general" | "electrical" | "mechanical" | "instrument" | "operator"
export type WorkspaceDiscipline = Exclude<DisciplineCode, "general">

export interface DisciplineOption {
  code: WorkspaceDiscipline
  label: AuthDiscipline
}

export interface DisciplineEntity {
  discipline?: DisciplineCode
  category?: string
  tags?: string[]
  title?: string
  name?: string
}

export const DISCIPLINE_OPTIONS: DisciplineOption[] = [
  { code: "electrical", label: "Electrical Technician" },
  { code: "mechanical", label: "Mechanical Technician" },
  { code: "instrument", label: "Instrument Technician" },
  { code: "operator", label: "Operator" },
]

export const GLOBAL_CONTENT = [
  "HSE",
  "General Safety",
  "PTW",
  "LOTO",
  "Emergency Response",
  "Golden Rules",
  "Stop Work Authority",
  "PPE",
  "General Orientation",
]

const equipmentCatalog: Record<WorkspaceDiscipline, string[]> = {
  electrical: [
    "Motor",
    "Generator",
    "Transformer",
    "UPS",
    "Battery Charger",
    "Switchgear",
    "Protection Relay",
    "MCC",
    "VFD",
    "CT",
    "PT",
    "Cable",
    "Grounding System",
  ],
  mechanical: [
    "Pump",
    "Compressor",
    "Gas Turbine",
    "Steam Turbine",
    "Heat Exchanger",
    "Valve",
    "Gearbox",
    "Mechanical Seal",
    "Bearing",
    "Coupling",
    "Pressure Vessel",
  ],
  instrument: [
    "Pressure Transmitter",
    "Temperature Transmitter",
    "Flow Transmitter",
    "Level Transmitter",
    "Control Valve",
    "Positioner",
    "PLC",
    "DCS",
    "ESD",
    "Fire & Gas",
    "Analyzer",
  ],
  operator: [
    "Separator",
    "KO Drum",
    "Pig Launcher",
    "Pig Receiver",
    "Filter",
    "Tank",
    "Pipeline",
    "Utility System",
    "Gas Processing Unit",
  ],
}

const knowledgeTopics: Record<WorkspaceDiscipline, string[]> = {
  electrical: ["Motor", "Generator", "Protection Relay", "Transformer", "UPS", "Grounding", "Synchronization"],
  mechanical: ["Pump", "Compressor", "Lubrication", "Alignment", "Rotating Equipment"],
  instrument: ["Calibration", "PLC", "DCS", "Control Valve", "Loop Checking"],
  operator: ["PFD", "Startup", "Shutdown", "Process Safety", "Operation Philosophy"],
}

export function disciplineLabelToCode(value: string | null | undefined): WorkspaceDiscipline {
  const normalized = (value ?? "").trim().toLowerCase()
  if (normalized.includes("mechanical")) return "mechanical"
  if (normalized.includes("instrument")) return "instrument"
  if (normalized.includes("operator")) return "operator"
  return "electrical"
}

export function disciplineCodeToLabel(code: WorkspaceDiscipline): AuthDiscipline {
  return DISCIPLINE_OPTIONS.find((option) => option.code === code)?.label ?? "Electrical Technician"
}

export function getDisciplineEquipment(code: WorkspaceDiscipline) {
  return equipmentCatalog[code]
}

export function getDisciplineKnowledgeTopics(code: WorkspaceDiscipline) {
  return [...GLOBAL_CONTENT, ...knowledgeTopics[code]]
}

export function inferEntityDiscipline(entity: DisciplineEntity): DisciplineCode {
  if (entity.discipline) return entity.discipline
  const haystack = [entity.category, entity.title, entity.name, ...(entity.tags ?? [])].join(" ").toLowerCase()
  if (GLOBAL_CONTENT.some((item) => haystack.includes(item.toLowerCase()))) return "general"

  for (const [code, equipment] of Object.entries(equipmentCatalog) as Array<[WorkspaceDiscipline, string[]]>) {
    if (equipment.some((item) => haystack.includes(item.toLowerCase()))) return code
  }

  for (const [code, topics] of Object.entries(knowledgeTopics) as Array<[WorkspaceDiscipline, string[]]>) {
    if (topics.some((item) => haystack.includes(item.toLowerCase()))) return code
  }

  return "general"
}

export function isVisibleForDiscipline(entity: DisciplineEntity, activeDiscipline: WorkspaceDiscipline) {
  const entityDiscipline = inferEntityDiscipline(entity)
  return entityDiscipline === "general" || entityDiscipline === activeDiscipline
}

export function filterForDiscipline<T extends DisciplineEntity>(items: T[], activeDiscipline: WorkspaceDiscipline) {
  return items.filter((item) => isVisibleForDiscipline(item, activeDiscipline))
}

export function getWorkspaceConfiguration(activeDiscipline: WorkspaceDiscipline) {
  return {
    discipline: activeDiscipline,
    label: disciplineCodeToLabel(activeDiscipline),
    globalContent: GLOBAL_CONTENT,
    equipment: equipmentCatalog[activeDiscipline],
    knowledgeTopics: getDisciplineKnowledgeTopics(activeDiscipline),
    competencyUnits: [
      ...GLOBAL_CONTENT.map((item) => `${item} competency`),
      ...knowledgeTopics[activeDiscipline].map((item) => `${item} technical competency`),
    ],
    roadmapFocus: knowledgeTopics[activeDiscipline],
  }
}
