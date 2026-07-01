"use client"

import { createClient } from "@supabase/supabase-js"
import { localAuthFallbackEnabled } from "@/lib/auth/auth-env.mjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)
export const isLocalAuthFallbackEnabled = localAuthFallbackEnabled(isSupabaseConfigured, process.env.NODE_ENV)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
