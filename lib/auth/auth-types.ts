export type AuthRole = "trainee" | "mentor" | "admin" | "assessor" | "supervisor"
export type AuthStatus = "anonymous" | "authenticated" | "pending-verification" | "profile-required"

export type Discipline = "Electrical Technician" | "Mechanical Technician" | "Instrument Technician" | "Operator"

export interface AuthProfile {
  fullName: string
  displayName: string
  email: string
  phoneNumber: string
  discipline: Discipline
  company: string
  program: string
  ojtBatch: string
  bio: string
  profileImage: string
  avatarPath: string
  currentSite: string
  homeBase: string
}

export interface AuthUser {
  id: string
  email: string
  role: AuthRole
  emailVerified: boolean
  profileComplete: boolean
  createdAt: string
}

export interface AuthSession {
  userId: string
  remember: boolean
  createdAt: string
  expiresAt: string
}

export interface AuthAccount {
  user: AuthUser
  profile: AuthProfile
}

export interface SignUpInput {
  fullName: string
  email: string
  password: string
  discipline: Discipline
  company: string
  program: string
  ojtBatch: string
}

export interface SignInInput {
  email: string
  password: string
  remember: boolean
}

export interface CreateProfileInput {
  profileImage: string
  displayName: string
  bio: string
  phoneNumber: string
  currentSite: string
  homeBase: string
}

export const DISCIPLINES: Discipline[] = [
  "Electrical Technician",
  "Mechanical Technician",
  "Instrument Technician",
  "Operator",
]

export const defaultAuthProfile: AuthProfile = {
  fullName: "OJT Trainee",
  displayName: "",
  email: "",
  phoneNumber: "",
  discipline: "Electrical Technician",
  company: "Medco E&P",
  program: "Operations Apprentice Development Program",
  ojtBatch: "OADP 2026",
  bio: "",
  profileImage: "",
  avatarPath: "",
  currentSite: "",
  homeBase: "",
}
