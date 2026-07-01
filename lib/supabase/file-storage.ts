"use client"

import { supabase } from "@/lib/supabase/client"
import {
  USER_FILES_BUCKET,
  validateModuleFile,
  userFilePath,
} from "@/lib/supabase/file-validation.mjs"

export interface ModuleFileRecord {
  id: string
  user_id: string
  module: ModuleFileModule
  scope_key: string
  bucket: string
  file_path: string
  file_name: string
  mime_type: string
  size_bytes: number
  created_at: string
  updated_at: string
}

export interface ModuleFileWithUrl extends ModuleFileRecord {
  signedUrl: string
}

export type ModuleFileModule = "photo-gallery" | "documents"

function ensureSupabase() {
  if (!supabase) throw new Error("Supabase is not configured.")
  return supabase
}

function normalizeError(error: unknown, fallback: string) {
  if (error instanceof Error) return error
  if (typeof error === "string") return new Error(error)
  try {
    return new Error(`${fallback}: ${JSON.stringify(error)}`)
  } catch {
    return new Error(`${fallback}: ${String(error)}`)
  }
}

export async function getAuthenticatedUser() {
  const client = ensureSupabase()
  const { data, error } = await client.auth.getUser()
  if (error) throw normalizeError(error, "Could not verify Supabase session")
  if (!data.user || (data.user as { is_anonymous?: boolean }).is_anonymous) {
    throw new Error("You must be logged in to upload files.")
  }
  return data.user
}

export async function uploadModuleFile({
  file,
  module,
  scopeKey,
}: {
  file: File
  module: ModuleFileModule
  scopeKey: string
}) {
  const validation = validateModuleFile({
    module,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  })
  if (!validation.ok) throw new Error(validation.message)

  const client = ensureSupabase()
  const user = await getAuthenticatedUser()
  const path = userFilePath({
    userId: user.id,
    module,
    timestamp: Date.now(),
    fileName: file.name,
  })
  const mimeType = file.type || "application/octet-stream"

  const { error: uploadError } = await client.storage.from(USER_FILES_BUCKET).upload(path, file, {
    contentType: mimeType,
    upsert: false,
  })
  if (uploadError) throw normalizeError(uploadError, "File upload failed")

  const { data, error: insertError } = await client
    .from("module_files")
    .insert({
      user_id: user.id,
      module,
      scope_key: scopeKey,
      bucket: USER_FILES_BUCKET,
      file_path: path,
      file_name: file.name,
      mime_type: mimeType,
      size_bytes: file.size,
    })
    .select("id,user_id,module,scope_key,bucket,file_path,file_name,mime_type,size_bytes,created_at,updated_at")
    .single()

  if (insertError || !data) {
    await client.storage.from(USER_FILES_BUCKET).remove([path])
    throw normalizeError(insertError ?? "Metadata insert failed", "File metadata save failed")
  }

  return data as ModuleFileRecord
}

export async function listModuleFiles(module: ModuleFileModule) {
  const client = ensureSupabase()
  const user = await getAuthenticatedUser()
  const { data, error } = await client
    .from("module_files")
    .select("id,user_id,module,scope_key,bucket,file_path,file_name,mime_type,size_bytes,created_at,updated_at")
    .eq("user_id", user.id)
    .eq("module", module)
    .order("created_at", { ascending: false })

  if (error) throw normalizeError(error, "Could not load files")

  const rows = (data ?? []) as ModuleFileRecord[]
  return Promise.all(
    rows.map(async (row) => {
      const { data: signed, error: signError } = await client.storage
        .from(row.bucket)
        .createSignedUrl(row.file_path, 60 * 60)
      if (signError) throw normalizeError(signError, "Could not create file preview URL")
      return { ...row, signedUrl: signed?.signedUrl ?? "" }
    })
  )
}

export async function deleteModuleFile(filePath: string) {
  const client = ensureSupabase()
  const user = await getAuthenticatedUser()
  const { data, error } = await client
    .from("module_files")
    .select("id,bucket,file_path,user_id")
    .eq("user_id", user.id)
    .eq("file_path", filePath)
    .maybeSingle()

  if (error) throw normalizeError(error, "Could not find file metadata")
  if (!data) return

  const { error: removeError } = await client.storage.from(data.bucket).remove([data.file_path])
  if (removeError) throw normalizeError(removeError, "Could not delete stored file")

  const { error: deleteError } = await client
    .from("module_files")
    .delete()
    .eq("id", data.id)
    .eq("user_id", user.id)
  if (deleteError) throw normalizeError(deleteError, "Could not delete file metadata")
}
