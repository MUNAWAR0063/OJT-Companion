"use client"

import { isSupabaseConfigured, supabase } from "@/lib/supabase/client"
import type { AuthProfile, AuthSession, AuthUser, CreateProfileInput, SignInInput, SignUpInput } from "@/lib/auth/auth-types"
import { defaultAuthProfile } from "@/lib/auth/auth-types"
import { clearLocalAuthSession, getStoredLocalAuthSession, saveLocalAuthSession } from "@/lib/auth/local-auth-session.mjs"

export interface AuthResult {
  user: AuthUser
  profile: AuthProfile
  session: AuthSession | null
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function mapSession(userId: string, remember = true): AuthSession {
  const now = Date.now()
  const days = remember ? 30 : 1
  return {
    userId,
    remember,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + days * 24 * 60 * 60 * 1000).toISOString(),
  }
}

function createProfile(input: SignUpInput): AuthProfile {
  const email = normalizeEmail(input.email)
  return {
    ...defaultAuthProfile,
    fullName: input.fullName.trim(),
    displayName: input.fullName.trim(),
    email,
    discipline: input.discipline,
    company: input.company.trim() || defaultAuthProfile.company,
    program: input.program.trim() || defaultAuthProfile.program,
    ojtBatch: input.ojtBatch.trim() || defaultAuthProfile.ojtBatch,
  }
}

function createLocalProfile(email: string): AuthProfile {
  const normalizedEmail = normalizeEmail(email)
  return {
    ...defaultAuthProfile,
    fullName: normalizedEmail.split("@")[0] || defaultAuthProfile.fullName,
    displayName: "",
    email: normalizedEmail,
  }
}

function mapUser(id: string, email: string, emailVerified: boolean, profileComplete: boolean): AuthUser {
  return {
    id,
    email: normalizeEmail(email),
    role: "trainee",
    emailVerified,
    profileComplete,
    createdAt: new Date().toISOString(),
  }
}

function createLocalAuthResult(email: string, remember = true): AuthResult {
  const normalizedEmail = normalizeEmail(email)
  const userId = `local-${normalizedEmail}`
  const profile = createLocalProfile(normalizedEmail)

  return {
    user: mapUser(userId, normalizedEmail, true, true),
    profile,
    session: mapSession(userId, remember),
  }
}

function metadataProfile(email: string, metadata: Record<string, unknown>): AuthProfile {
  return {
    ...defaultAuthProfile,
    fullName: typeof metadata.fullName === "string" ? metadata.fullName : defaultAuthProfile.fullName,
    displayName: typeof metadata.displayName === "string" ? metadata.displayName : "",
    email: normalizeEmail(email),
    phoneNumber: typeof metadata.phoneNumber === "string" ? metadata.phoneNumber : "",
    discipline:
      metadata.discipline === "Mechanical Technician" ||
      metadata.discipline === "Instrument Technician" ||
      metadata.discipline === "Operator"
        ? metadata.discipline
        : "Electrical Technician",
    company: typeof metadata.company === "string" ? metadata.company : defaultAuthProfile.company,
    program: typeof metadata.program === "string" ? metadata.program : defaultAuthProfile.program,
    ojtBatch: typeof metadata.ojtBatch === "string" ? metadata.ojtBatch : defaultAuthProfile.ojtBatch,
    bio: typeof metadata.bio === "string" ? metadata.bio : "",
    profileImage: typeof metadata.profileImage === "string" ? metadata.profileImage : "",
    currentSite: typeof metadata.currentSite === "string" ? metadata.currentSite : "",
    homeBase: typeof metadata.homeBase === "string" ? metadata.homeBase : "",
  }
}

function ensureAuthBackend() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Authentication backend is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.")
  }
  return supabase
}

export const authAdapter = {
  async signUp(input: SignUpInput): Promise<AuthResult> {
    if (!isSupabaseConfigured || !supabase) {
      const profile = createProfile(input)
      const userId = `local-${profile.email}`
      return {
        user: mapUser(userId, profile.email, true, true),
        profile,
        session: mapSession(userId, true),
      }
    }

    const client = ensureAuthBackend()
    const profile = createProfile(input)
    const { data, error } = await client.auth.signUp({
      email: profile.email,
      password: input.password,
      options: {
        data: {
          ...profile,
          role: "trainee",
          profileComplete: false,
        },
      },
    })

    if (error) throw error
    if (!data.user) throw new Error("Account could not be created")

    return {
      user: mapUser(data.user.id, profile.email, Boolean(data.user.email_confirmed_at), false),
      profile,
      session: data.session ? mapSession(data.user.id, true) : null,
    }
  },

  async signIn(input: SignInInput): Promise<AuthResult> {
    if (!isSupabaseConfigured || !supabase) {
      const result = createLocalAuthResult(input.email, input.remember)
      saveLocalAuthSession(result)
      return result
    }

    const client = ensureAuthBackend()
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizeEmail(input.email),
      password: input.password,
    })

    if (error) throw error
    if (!data.user || !data.session) throw new Error("Account not found")

    const profile = metadataProfile(data.user.email ?? input.email, data.user.user_metadata)
    return {
      user: mapUser(
        data.user.id,
        data.user.email ?? input.email,
        Boolean(data.user.email_confirmed_at),
        data.user.user_metadata.profileComplete === true
      ),
      profile,
      session: mapSession(data.user.id, input.remember),
    }
  },

  async getSession(): Promise<AuthResult | null> {
    if (!isSupabaseConfigured || !supabase) return getStoredLocalAuthSession() as AuthResult | null
    const { data } = await supabase.auth.getSession()
    if (!data.session?.user) return null

    const user = data.session.user
    if ((user as { is_anonymous?: boolean }).is_anonymous) return null
    const profile = metadataProfile(user.email ?? "", user.user_metadata)
    return {
      user: mapUser(user.id, user.email ?? "", Boolean(user.email_confirmed_at), user.user_metadata.profileComplete === true),
      profile,
      session: mapSession(user.id),
    }
  },

  async updateProfile(user: AuthUser, profile: AuthProfile) {
    if (!isSupabaseConfigured || !supabase) return

    const client = ensureAuthBackend()
    const { error } = await client.auth.updateUser({
      email: normalizeEmail(profile.email),
      data: {
        ...profile,
        role: user.role,
        profileComplete: user.profileComplete,
      },
    })
    if (error) throw error
  },

  async signOut() {
    clearLocalAuthSession()
    if (supabase) await supabase.auth.signOut()
  },

  completeProfile(user: AuthUser, profile: AuthProfile, input: CreateProfileInput): AuthResult {
    const nextProfile = {
      ...profile,
      profileImage: input.profileImage,
      displayName: input.displayName.trim() || profile.fullName,
      bio: input.bio.trim(),
      phoneNumber: input.phoneNumber.trim(),
      currentSite: input.currentSite.trim(),
      homeBase: input.homeBase.trim(),
    }
    return {
      user: { ...user, emailVerified: true, profileComplete: true },
      profile: nextProfile,
      session: null,
    }
  },
}
