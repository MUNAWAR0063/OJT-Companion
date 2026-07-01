"use client"

import type { StateStorage } from "zustand/middleware"
import { isLocalAuthFallbackEnabled, supabase } from "@/lib/supabase/client"
import { getStoredLocalAuthSession } from "@/lib/auth/local-auth-session.mjs"

const BUCKET = "ojt-attachments"
const writeQueues = new Map<string, Promise<void>>()

export interface AppStateRecord {
  storage_key: string
  state: unknown
  updated_at: string
}

export interface SupabaseStorageInfo {
  bytes: number
  entries: Array<{ key: string; bytes: number; updatedAt: string }>
}

export async function ensureSupabaseSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

async function userId() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  if (!user || (user as { is_anonymous?: boolean }).is_anonymous) return null
  return user.id
}

function localOwnerId() {
  const result = getStoredLocalAuthSession() as { user?: { id?: string } } | null
  return result?.user?.id ?? null
}

function localStateKey(ownerId: string, name: string) {
  return `ojt-local-state:${ownerId}:${name}`
}

function localStorageAvailable() {
  return typeof window !== "undefined" ? window.localStorage : null
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

function toError(error: unknown, fallback: string) {
  return error instanceof Error ? error : new Error(`${fallback}: ${errorMessage(error)}`)
}

function collectPaths(value: unknown, paths = new Set<string>()) {
  if (!value || typeof value !== "object") return paths
  if (Array.isArray(value)) {
    value.forEach((item) => collectPaths(item, paths))
    return paths
  }
  const record = value as Record<string, unknown>
  if (typeof record.storagePath === "string") paths.add(record.storagePath)
  Object.values(record).forEach((item) => collectPaths(item, paths))
  return paths
}

function serializedSize(value: unknown) {
  return new Blob([JSON.stringify(value ?? null)]).size
}

async function prepareForStorage(
  value: unknown,
  ownerId: string,
  storageKey: string
): Promise<unknown> {
  if (!value || typeof value !== "object") return value
  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => prepareForStorage(item, ownerId, storageKey)))
  }
  const record = value as Record<string, unknown>
  if (typeof record.dataUrl === "string" && typeof record.name === "string") {
    if (typeof record.storagePath === "string") {
      return { ...record, dataUrl: "" }
    }
    if (record.dataUrl.startsWith("data:")) {
      const safeName = record.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const path = `${ownerId}/${storageKey}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`
      const blob = await fetch(record.dataUrl).then((response) => response.blob())
      const { error } = await supabase!.storage.from(BUCKET).upload(path, blob, {
        contentType: typeof record.type === "string" ? record.type : blob.type,
        upsert: false,
      })
      if (error) throw toError(error, "Attachment upload failed")
      return { ...record, dataUrl: "", storagePath: path }
    }
  }
  const entries = await Promise.all(
    Object.entries(record).map(async ([key, item]) => [
      key,
      await prepareForStorage(item, ownerId, storageKey),
    ])
  )
  return Object.fromEntries(entries)
}

async function hydrateStorageUrls(value: unknown): Promise<unknown> {
  if (!supabase || !value || typeof value !== "object") return value
  if (Array.isArray(value)) return Promise.all(value.map(hydrateStorageUrls))
  const record = value as Record<string, unknown>
  if (typeof record.storagePath === "string") {
    const { data } = await supabase!.storage.from(BUCKET).createSignedUrl(record.storagePath, 86_400)
    return { ...record, dataUrl: data?.signedUrl ?? "" }
  }
  const entries = await Promise.all(
    Object.entries(record).map(async ([key, item]) => [key, await hydrateStorageUrls(item)])
  )
  return Object.fromEntries(entries)
}

async function writeState(name: string, value: string) {
  if (!supabase) return
  const ownerId = await userId()
  if (!ownerId) return
  const parsed = JSON.parse(value) as unknown
  const prepared = await prepareForStorage(parsed, ownerId, name)
  const { data: previous } = await supabase
    .from("app_state")
    .select("state")
    .eq("user_id", ownerId)
    .eq("storage_key", name)
    .maybeSingle()
  const { error } = await supabase.from("app_state").upsert(
    {
      user_id: ownerId,
      storage_key: name,
      state: prepared,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,storage_key" }
  )
  if (error) throw toError(error, "Application data save failed")

  const oldPaths = collectPaths(previous?.state)
  const newPaths = collectPaths(prepared)
  const removedPaths = [...oldPaths].filter((path) => !newPaths.has(path))
  if (removedPaths.length) await supabase.storage.from(BUCKET).remove(removedPaths)
}

export const supabaseStateStorage: StateStorage = {
  getItem: async (name) => {
    if (!supabase && isLocalAuthFallbackEnabled) {
      const ownerId = localOwnerId()
      const storage = localStorageAvailable()
      return ownerId && storage ? storage.getItem(localStateKey(ownerId, name)) : null
    }
    if (!supabase) return null
    const ownerId = await userId()
    if (!ownerId) return null
    const { data, error } = await supabase
      .from("app_state")
      .select("state")
      .eq("user_id", ownerId)
      .eq("storage_key", name)
      .maybeSingle()
    if (error) throw toError(error, "Application data load failed")
    if (!data) return null
    return JSON.stringify(await hydrateStorageUrls(data.state))
  },

  setItem: async (name, value) => {
    if (!supabase && isLocalAuthFallbackEnabled) {
      const ownerId = localOwnerId()
      const storage = localStorageAvailable()
      try {
        if (ownerId && storage) storage.setItem(localStateKey(ownerId, name), value)
      } catch (error) {
        console.error("Application data save failed", toError(error, "Browser storage write failed"))
      }
      return
    }
    if (!supabase) return
    const previous = writeQueues.get(name) ?? Promise.resolve()
    const next = previous.catch(() => undefined).then(() => writeState(name, value))
    writeQueues.set(name, next)
    try {
      await next
    } catch (error) {
      console.error("Application data save failed", toError(error, "Supabase storage write failed"))
    } finally {
      if (writeQueues.get(name) === next) writeQueues.delete(name)
    }
  },

  removeItem: async (name) => {
    if (!supabase && isLocalAuthFallbackEnabled) {
      const ownerId = localOwnerId()
      const storage = localStorageAvailable()
      if (ownerId && storage) storage.removeItem(localStateKey(ownerId, name))
      return
    }
    if (!supabase) return
    const ownerId = await userId()
    if (!ownerId) return
    const { data } = await supabase
      .from("app_state")
      .select("state")
      .eq("user_id", ownerId)
      .eq("storage_key", name)
      .maybeSingle()
    const paths = [...collectPaths(data?.state)]
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths)
    const { error } = await supabase
      .from("app_state")
      .delete()
      .eq("user_id", ownerId)
      .eq("storage_key", name)
    if (error) throw toError(error, "Application data delete failed")
  },
}

export async function fetchAppStateRecords() {
  if (!supabase && isLocalAuthFallbackEnabled) {
    const ownerId = localOwnerId()
    const storage = localStorageAvailable()
    if (!ownerId || !storage) return []
    const prefix = localStateKey(ownerId, "")
    return Array.from({ length: storage.length }, (_, index) => storage.key(index))
      .filter((key): key is string => Boolean(key?.startsWith(prefix)))
      .map((key) => ({
        storage_key: key.slice(prefix.length),
        state: JSON.parse(storage.getItem(key) ?? "null") as unknown,
        updated_at: new Date().toISOString(),
      }))
  }
  if (!supabase) return []
  const ownerId = await userId()
  if (!ownerId) return []
  const { data, error } = await supabase
    .from("app_state")
    .select("storage_key,state,updated_at")
    .eq("user_id", ownerId)
    .order("updated_at", { ascending: false })
  if (error) throw toError(error, "Application data records load failed")
  return (data ?? []) as AppStateRecord[]
}

export async function exportAppState(excludedKeys: string[] = []) {
  const records = await fetchAppStateRecords()
  const excluded = new Set(excludedKeys)
  const data: Record<string, string> = {}
  for (const record of records) {
    if (excluded.has(record.storage_key)) continue
    data[record.storage_key] = JSON.stringify(await hydrateStorageUrls(record.state))
  }
  return {
    app: "OJT Companion" as const,
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    data,
  }
}

export async function replaceAppState(data: Record<string, string>) {
  if (!supabase && isLocalAuthFallbackEnabled) {
    const ownerId = localOwnerId()
    const storage = localStorageAvailable()
    if (!ownerId || !storage) return
    const prefix = localStateKey(ownerId, "")
    Array.from({ length: storage.length }, (_, index) => storage.key(index))
      .filter((key): key is string => Boolean(key?.startsWith(prefix)))
      .forEach((key) => storage.removeItem(key))
    Object.entries(data).forEach(([storageKey, value]) => {
      storage.setItem(localStateKey(ownerId, storageKey), value)
    })
    return
  }
  if (!supabase) return
  const ownerId = await userId()
  if (!ownerId) return
  const previous = await fetchAppStateRecords()
  const previousPaths = new Set<string>()
  previous.forEach((record) => collectPaths(record.state, previousPaths))

  const rows = await Promise.all(
    Object.entries(data).map(async ([storageKey, value]) => ({
      user_id: ownerId,
      storage_key: storageKey,
      state: await prepareForStorage(JSON.parse(value) as unknown, ownerId, storageKey),
      updated_at: new Date().toISOString(),
    }))
  )
  const nextPaths = new Set<string>()
  rows.forEach((row) => collectPaths(row.state, nextPaths))

  const { error: deleteError } = await supabase.from("app_state").delete().eq("user_id", ownerId)
  if (deleteError) throw toError(deleteError, "Application data replace failed")

  if (rows.length) {
    const { error: insertError } = await supabase.from("app_state").insert(rows)
    if (insertError) throw toError(insertError, "Application data import failed")
  }

  const removedPaths = [...previousPaths].filter((path) => !nextPaths.has(path))
  if (removedPaths.length) await supabase.storage.from(BUCKET).remove(removedPaths)
}

export async function resetAppState() {
  if (!supabase && isLocalAuthFallbackEnabled) {
    const ownerId = localOwnerId()
    const storage = localStorageAvailable()
    if (!ownerId || !storage) return
    const prefix = localStateKey(ownerId, "")
    Array.from({ length: storage.length }, (_, index) => storage.key(index))
      .filter((key): key is string => Boolean(key?.startsWith(prefix)))
      .forEach((key) => storage.removeItem(key))
    return
  }
  if (!supabase) return
  const ownerId = await userId()
  if (!ownerId) return
  const previous = await fetchAppStateRecords()
  const paths = previous.flatMap((record) => [...collectPaths(record.state)])
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths)
  const { error } = await supabase.from("app_state").delete().eq("user_id", ownerId)
  if (error) throw toError(error, "Application data reset failed")
}

export async function getSupabaseStorageInfo(): Promise<SupabaseStorageInfo> {
  const records = await fetchAppStateRecords()
  const entries = records.map((record) => ({
    key: record.storage_key,
    bytes: serializedSize(record.state),
    updatedAt: record.updated_at,
  }))
  return {
    bytes: entries.reduce((total, entry) => total + entry.bytes, 0),
    entries,
  }
}

export async function subscribeToAppStateChanges(onChange: (storageKey: string) => void) {
  if (!supabase) return () => undefined
  const ownerId = await userId()
  if (!ownerId) return () => undefined

  const channel = supabase
    .channel(`app_state:${ownerId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "app_state",
        filter: `user_id=eq.${ownerId}`,
      },
      (payload) => {
        const record = (payload.new || payload.old) as { storage_key?: string }
        if (record.storage_key) onChange(record.storage_key)
      }
    )
    .subscribe()

  return () => {
    void supabase?.removeChannel(channel)
  }
}
