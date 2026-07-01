import assert from "node:assert/strict"
import test from "node:test"
import {
  clearLocalAuthSession,
  getStoredLocalAuthSession,
  LOCAL_AUTH_SESSION_KEY,
  saveLocalAuthSession,
} from "../lib/auth/local-auth-session.mjs"

function makeStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

function makeBrowserStorage() {
  return {
    localStorage: makeStorage(),
    sessionStorage: makeStorage(),
  }
}

function makeAuthResult({ remember = true, expiresAt = "2099-01-01T00:00:00.000Z", userId = "local-user-a" } = {}) {
  return {
    user: { id: userId, email: `${userId}@example.com` },
    profile: { email: `${userId}@example.com` },
    session: { userId, remember, createdAt: "2026-07-01T00:00:00.000Z", expiresAt },
  }
}

test("remembered local login is restored after a page refresh", () => {
  const storage = makeBrowserStorage()
  const result = makeAuthResult({ remember: true })

  saveLocalAuthSession(result, storage)

  assert.deepEqual(getStoredLocalAuthSession(storage), result)
  assert.equal(storage.sessionStorage.getItem(LOCAL_AUTH_SESSION_KEY), null)
})

test("non-remembered login is scoped to session storage", () => {
  const storage = makeBrowserStorage()
  const result = makeAuthResult({ remember: false })

  saveLocalAuthSession(result, storage)

  assert.deepEqual(getStoredLocalAuthSession(storage), result)
  assert.equal(storage.localStorage.getItem(LOCAL_AUTH_SESSION_KEY), null)
})

test("expired local login is treated as logged out", () => {
  const storage = makeBrowserStorage()
  const expired = makeAuthResult({ expiresAt: "2026-01-01T00:00:00.000Z" })

  saveLocalAuthSession(expired, storage)

  assert.equal(getStoredLocalAuthSession(storage, new Date("2026-07-01T00:00:00.000Z").getTime()), null)
  assert.equal(storage.localStorage.getItem(LOCAL_AUTH_SESSION_KEY), null)
})

test("manual logout clears remembered and session-scoped logins", () => {
  const storage = makeBrowserStorage()
  storage.localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(makeAuthResult({ remember: true })))
  storage.sessionStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(makeAuthResult({ remember: false })))

  clearLocalAuthSession(storage)

  assert.equal(getStoredLocalAuthSession(storage), null)
  assert.equal(storage.localStorage.getItem(LOCAL_AUTH_SESSION_KEY), null)
  assert.equal(storage.sessionStorage.getItem(LOCAL_AUTH_SESSION_KEY), null)
})
