"use client"

import type { StateStorage } from "zustand/middleware"
import { supabase } from "@/lib/supabase/client"

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
  if (data.session) return data.session

  const { data: authData, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return authData.session
}

async function userId({ createSession = false } = {}) {
  if (!supabase) return null
  if (createSession) {
    const session = await ensureSupabaseSession()
    return session?.user.id ?? null
  }
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
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
      if (error) throw error
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
  const ownerId = await userId({ createSession: true })
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
  if (error) throw error

  const oldPaths = collectPaths(previous?.state)
  const newPaths = collectPaths(prepared)
  const removedPaths = [...oldPaths].filter((path) => !newPaths.has(path))
  if (removedPaths.length) await supabase.storage.from(BUCKET).remove(removedPaths)
}

export const supabaseStateStorage: StateStorage = {
  getItem: async (name) => {
    if (!supabase) return null
    const ownerId = await userId()
    if (!ownerId) return null
    const { data, error } = await supabase
      .from("app_state")
      .select("state")
      .eq("user_id", ownerId)
      .eq("storage_key", name)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return JSON.stringify(await hydrateStorageUrls(data.state))
  },

  setItem: async (name, value) => {
    const previous = writeQueues.get(name) ?? Promise.resolve()
    const next = previous.catch(() => undefined).then(() => writeState(name, value))
    writeQueues.set(name, next)
    try {
      await next
    } finally {
      if (writeQueues.get(name) === next) writeQueues.delete(name)
    }
  },

  removeItem: async (name) => {
    if (!supabase) return
    const ownerId = await userId({ createSession: true })
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
    if (error) throw error
  },
}

export async function fetchAppStateRecords() {
  if (!supabase) return []
  const ownerId = await userId({ createSession: true })
  if (!ownerId) return []
  const { data, error } = await supabase
    .from("app_state")
    .select("storage_key,state,updated_at")
    .eq("user_id", ownerId)
    .order("updated_at", { ascending: false })
  if (error) throw error
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
  if (!supabase) return
  const ownerId = await userId({ createSession: true })
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
  if (deleteError) throw deleteError

  if (rows.length) {
    const { error: insertError } = await supabase.from("app_state").insert(rows)
    if (insertError) throw insertError
  }

  const removedPaths = [...previousPaths].filter((path) => !nextPaths.has(path))
  if (removedPaths.length) await supabase.storage.from(BUCKET).remove(removedPaths)
}

export async function resetAppState() {
  if (!supabase) return
  const ownerId = await userId({ createSession: true })
  if (!ownerId) return
  const previous = await fetchAppStateRecords()
  const paths = previous.flatMap((record) => [...collectPaths(record.state)])
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths)
  const { error } = await supabase.from("app_state").delete().eq("user_id", ownerId)
  if (error) throw error
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
  const ownerId = await userId({ createSession: true })
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
