"use client"

export const LOCAL_AUTH_SESSION_KEY = "ojt-local-auth-session"

function storageCandidates(storage = globalThis) {
  return [storage.localStorage, storage.sessionStorage].filter(Boolean)
}

export function isStoredSessionValid(result, now = Date.now()) {
  const expiresAt = result?.session?.expiresAt
  return typeof expiresAt === "string" && new Date(expiresAt).getTime() > now
}

export function saveLocalAuthSession(result, storage = globalThis) {
  clearLocalAuthSession(storage)
  const target = result?.session?.remember === false ? storage.sessionStorage : storage.localStorage
  if (!target) return
  target.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(result))
}

export function getStoredLocalAuthSession(storage = globalThis, now = Date.now()) {
  for (const candidate of storageCandidates(storage)) {
    const raw = candidate.getItem(LOCAL_AUTH_SESSION_KEY)
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      if (isStoredSessionValid(parsed, now)) return parsed
      candidate.removeItem(LOCAL_AUTH_SESSION_KEY)
    } catch {
      candidate.removeItem(LOCAL_AUTH_SESSION_KEY)
    }
  }
  return null
}

export function clearLocalAuthSession(storage = globalThis) {
  for (const candidate of storageCandidates(storage)) {
    candidate.removeItem(LOCAL_AUTH_SESSION_KEY)
  }
}
