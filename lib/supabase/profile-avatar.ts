"use client"

import { supabase } from "@/lib/supabase/client"
import { getAuthenticatedUser } from "@/lib/supabase/file-storage"
import {
  PROFILE_MODULE,
  USER_FILES_BUCKET,
  profileAvatarPath,
  validateModuleFile,
} from "@/lib/supabase/file-validation.mjs"

const PROFILE_SCOPE_KEY = "default"
const SIGNED_URL_SECONDS = 60 * 60

interface ProfileData {
  avatar_path?: string
  [key: string]: unknown
}

export interface ProfileAvatarResult {
  avatarPath: string
  signedUrl: string
}

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

async function loadProfileData(userId: string): Promise<ProfileData> {
  const client = ensureSupabase()
  const { data, error } = await client
    .from("user_module_data")
    .select("data")
    .eq("user_id", userId)
    .eq("module", PROFILE_MODULE)
    .eq("scope_key", PROFILE_SCOPE_KEY)
    .maybeSingle()

  if (error) throw normalizeError(error, "Could not load profile data")
  return data?.data && typeof data.data === "object" ? (data.data as ProfileData) : {}
}

async function saveProfileData(userId: string, data: ProfileData) {
  const client = ensureSupabase()
  const { error } = await client.from("user_module_data").upsert(
    {
      user_id: userId,
      module: PROFILE_MODULE,
      scope_key: PROFILE_SCOPE_KEY,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,module,scope_key" }
  )

  if (error) throw normalizeError(error, "Could not save profile data")
}

async function signedUrlForPath(path: string) {
  const client = ensureSupabase()
  const { data, error } = await client.storage.from(USER_FILES_BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS)
  if (error) throw normalizeError(error, "Could not create profile photo URL")
  return data?.signedUrl ?? ""
}

export async function loadProfileAvatar(): Promise<ProfileAvatarResult | null> {
  const user = await getAuthenticatedUser()
  const profileData = await loadProfileData(user.id)
  const avatarPath = typeof profileData.avatar_path === "string" ? profileData.avatar_path : ""
  if (!avatarPath) return null

  return {
    avatarPath,
    signedUrl: await signedUrlForPath(avatarPath),
  }
}

export async function uploadProfileAvatar(file: File, previousAvatarPath?: string): Promise<ProfileAvatarResult> {
  const validation = validateModuleFile({
    module: PROFILE_MODULE,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  })
  if (!validation.ok) throw new Error(validation.message)

  const client = ensureSupabase()
  const user = await getAuthenticatedUser()
  const path = profileAvatarPath({
    userId: user.id,
    timestamp: Date.now(),
    fileName: file.name,
  })

  const { error: uploadError } = await client.storage.from(USER_FILES_BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  })
  if (uploadError) throw normalizeError(uploadError, "Profile photo upload failed")

  try {
    const existingData = await loadProfileData(user.id)
    await saveProfileData(user.id, {
      ...existingData,
      avatar_path: path,
    })
  } catch (error) {
    await client.storage.from(USER_FILES_BUCKET).remove([path])
    throw error
  }

  if (previousAvatarPath && previousAvatarPath !== path) {
    await client.storage.from(USER_FILES_BUCKET).remove([previousAvatarPath])
  }

  return {
    avatarPath: path,
    signedUrl: await signedUrlForPath(path),
  }
}

export async function removeProfileAvatar(avatarPath?: string) {
  const client = ensureSupabase()
  const user = await getAuthenticatedUser()
  const existingData = await loadProfileData(user.id)
  const currentAvatarPath =
    avatarPath || (typeof existingData.avatar_path === "string" ? existingData.avatar_path : "")

  if (currentAvatarPath) {
    const { error } = await client.storage.from(USER_FILES_BUCKET).remove([currentAvatarPath])
    if (error) throw normalizeError(error, "Could not delete profile photo")
  }

  await saveProfileData(user.id, {
    ...existingData,
    avatar_path: "",
  })
}
