export const DEFAULT_SCOPE_KEY = "default"
export const WEEKLY_PLANNER_MODULE = "weekly_planner"
export const WEEKLY_PLANNER_META_SCOPE = "__meta"
export const PROFILE_MODULE = "profile"

export const STORAGE_MODULES = {
  "ojt-roadmap-store": "roadmap",
  "ojt-weekly-planner": WEEKLY_PLANNER_MODULE,
  "ojt-equipment-library": "equipment",
  "ojt-knowledge-base": "knowledge_base",
  "ojt-daily-journal": "daily_journal",
  "ojt-document-library": "documents",
  "ojt-photo-gallery": "gallery",
  "ojt-standards-library": "standards",
  "ojt-generated-reports": "reports",
  "ojt-notification-center": "notifications",
  "ojt-recent-searches": "recent_searches",
  "ojt-user-profile": PROFILE_MODULE,
  "ojt-settings": "settings",
  "ojt-theme": "theme",
  "ojt-local-backups": "local_backups",
}

const MODULE_STORAGE_KEYS = Object.fromEntries(
  Object.entries(STORAGE_MODULES).map(([storageKey, module]) => [module, storageKey])
)

export function moduleForStorageKey(storageKey) {
  return STORAGE_MODULES[storageKey] ?? storageKey.replace(/^ojt-/, "").replace(/-/g, "_")
}

export function storageKeyForModule(module) {
  return MODULE_STORAGE_KEYS[module] ?? `ojt-${String(module).replace(/_/g, "-")}`
}

export function weeklyPlannerScopeKey(week) {
  const weekNumber = Number.isFinite(Number(week?.weekNumber)) ? Number(week.weekNumber) : 0
  const paddedWeek = String(Math.max(0, weekNumber)).padStart(2, "0")
  return `week:${paddedWeek}:${week?.id ?? "unknown"}`
}

export function parsePersistedValue(value) {
  return JSON.parse(value)
}

export function serializePersistedValue(value) {
  return JSON.stringify(value)
}

export function rowsForPersistedState(storageKey, persisted) {
  const module = moduleForStorageKey(storageKey)
  if (module !== WEEKLY_PLANNER_MODULE) {
    if (module === PROFILE_MODULE) {
      const avatarPath = persisted?.state?.profile?.avatarPath
      return [
        {
          module,
          scope_key: DEFAULT_SCOPE_KEY,
          data: {
            ...persisted,
            avatar_path: typeof avatarPath === "string" ? avatarPath : "",
          },
        },
      ]
    }

    return [{ module, scope_key: DEFAULT_SCOPE_KEY, data: persisted }]
  }

  const state = persisted?.state ?? {}
  const weeks = Array.isArray(state.weeks) ? state.weeks : []
  return [
    {
      module,
      scope_key: WEEKLY_PLANNER_META_SCOPE,
      data: {
        version: persisted?.version ?? 0,
        selectedWeekId: state.selectedWeekId ?? null,
      },
    },
    ...weeks.map((week) => ({
      module,
      scope_key: weeklyPlannerScopeKey(week),
      data: week,
    })),
  ]
}

export function persistedStateFromRows(storageKey, rows) {
  const module = moduleForStorageKey(storageKey)
  if (module !== WEEKLY_PLANNER_MODULE) {
    const row = rows.find((item) => item.module === module && item.scope_key === DEFAULT_SCOPE_KEY)
    return row ? row.data : null
  }

  const moduleRows = rows.filter((item) => item.module === module)
  if (!moduleRows.length) return null

  const meta = moduleRows.find((item) => item.scope_key === WEEKLY_PLANNER_META_SCOPE)?.data ?? {}
  const weeks = moduleRows
    .filter((item) => item.scope_key !== WEEKLY_PLANNER_META_SCOPE)
    .map((item) => item.data)
    .filter(Boolean)
    .sort((left, right) => {
      const weekDiff = (Number(left.weekNumber) || 0) - (Number(right.weekNumber) || 0)
      return weekDiff || String(left.createdAt ?? "").localeCompare(String(right.createdAt ?? ""))
    })

  return {
    state: {
      weeks,
      selectedWeekId: weeks.some((week) => week.id === meta.selectedWeekId)
        ? meta.selectedWeekId
        : weeks[0]?.id ?? null,
    },
    version: Number.isFinite(Number(meta.version)) ? Number(meta.version) : 0,
  }
}

export function moduleRowsToLegacyRecords(rows) {
  const grouped = new Map()
  rows.forEach((row) => {
    const storageKey = storageKeyForModule(row.module)
    grouped.set(storageKey, [...(grouped.get(storageKey) ?? []), row])
  })

  return Array.from(grouped.entries()).flatMap(([storageKey, moduleRows]) => {
    const state = persistedStateFromRows(storageKey, moduleRows)
    if (!state) return []
    const updatedAt = moduleRows
      .map((row) => row.updated_at)
      .filter(Boolean)
      .sort((left, right) => String(right).localeCompare(String(left)))[0]
    return [
      {
        storage_key: storageKey,
        state,
        updated_at: updatedAt ?? new Date(0).toISOString(),
      },
    ]
  })
}
