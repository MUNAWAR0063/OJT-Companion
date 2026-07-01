import assert from "node:assert/strict"
import test from "node:test"
import {
  DEFAULT_SCOPE_KEY,
  moduleForStorageKey,
  moduleRowsToLegacyRecords,
  persistedStateFromRows,
  rowsForPersistedState,
  storageKeyForModule,
  WEEKLY_PLANNER_META_SCOPE,
  WEEKLY_PLANNER_MODULE,
} from "../lib/supabase/module-data-storage.mjs"

const plannerState = {
  state: {
    selectedWeekId: "week-b",
    weeks: [
      {
        id: "week-b",
        weekNumber: 2,
        title: "Second Week",
        reflection: "",
        objectives: [],
        progress: 0,
        createdAt: "2026-07-08T00:00:00.000Z",
        updatedAt: "2026-07-08T00:00:00.000Z",
      },
      {
        id: "week-a",
        weekNumber: 1,
        title: "First Week",
        reflection: "",
        objectives: [],
        progress: 100,
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
    ],
  },
  version: 0,
}

test("maps existing persist keys to user_module_data modules", () => {
  assert.equal(moduleForStorageKey("ojt-weekly-planner"), "weekly_planner")
  assert.equal(moduleForStorageKey("ojt-daily-journal"), "daily_journal")
  assert.equal(moduleForStorageKey("ojt-user-profile"), "profile")
  assert.equal(storageKeyForModule("knowledge_base"), "ojt-knowledge-base")
  assert.equal(storageKeyForModule("profile"), "ojt-user-profile")
})

test("stores non-weekly modules as one default scoped row", () => {
  const rows = rowsForPersistedState("ojt-knowledge-base", { state: { articles: [] }, version: 0 })

  assert.equal(rows.length, 1)
  assert.equal(rows[0].module, "knowledge_base")
  assert.equal(rows[0].scope_key, DEFAULT_SCOPE_KEY)
})

test("stores profile avatar path at the profile row top level", () => {
  const rows = rowsForPersistedState("ojt-user-profile", {
    state: {
      profile: {
        fullName: "OJT Trainee",
        profileImage: "",
        avatarPath: "user-123/profile/avatar-1720000000000.png",
      },
    },
    version: 0,
  })

  assert.equal(rows.length, 1)
  assert.equal(rows[0].module, "profile")
  assert.equal(rows[0].data.avatar_path, "user-123/profile/avatar-1720000000000.png")
})

test("stores weekly planner by module and week-based scope keys", () => {
  const rows = rowsForPersistedState("ojt-weekly-planner", plannerState)

  assert.equal(rows[0].module, WEEKLY_PLANNER_MODULE)
  assert.equal(rows[0].scope_key, WEEKLY_PLANNER_META_SCOPE)
  assert.deepEqual(
    rows.slice(1).map((row) => row.scope_key),
    ["week:02:week-b", "week:01:week-a"]
  )
})

test("rebuilds weekly planner persisted state after refresh from module rows", () => {
  const rows = rowsForPersistedState("ojt-weekly-planner", plannerState).map((row) => ({
    ...row,
    updated_at: "2026-07-09T00:00:00.000Z",
  }))

  const rebuilt = persistedStateFromRows("ojt-weekly-planner", rows)

  assert.equal(rebuilt.state.selectedWeekId, "week-b")
  assert.deepEqual(rebuilt.state.weeks.map((week) => week.id), ["week-a", "week-b"])
})

test("converts user_module_data rows back to legacy backup records", () => {
  const rows = [
    ...rowsForPersistedState("ojt-weekly-planner", plannerState),
    ...rowsForPersistedState("ojt-knowledge-base", { state: { articles: [{ id: "a1" }] }, version: 0 }),
  ].map((row) => ({
    ...row,
    updated_at: "2026-07-09T00:00:00.000Z",
  }))

  const records = moduleRowsToLegacyRecords(rows)

  assert.deepEqual(records.map((record) => record.storage_key).sort(), [
    "ojt-knowledge-base",
    "ojt-weekly-planner",
  ])
  assert.equal(records.find((record) => record.storage_key === "ojt-weekly-planner").state.state.weeks.length, 2)
})
