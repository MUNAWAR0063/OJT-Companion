"use client"

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertCircle,
  Archive,
  Camera,
  Database,
  Download,
  HardDrive,
  Languages,
  Moon,
  RefreshCcw,
  ShieldAlert,
  Sun,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "@/components/theme-provider"
import { useSettingsStore, type AppLanguage } from "@/lib/settings-store"
import { useUserProfileStore, type UserProfile } from "@/lib/user-profile-store"
import { removeProfileAvatar, uploadProfileAvatar } from "@/lib/supabase/profile-avatar"
import {
  exportAppState,
  getSupabaseStorageInfo,
  replaceAppState,
  resetAppState,
  supabaseStateStorage,
} from "@/lib/supabase/storage"

const BACKUP_KEY = "ojt-local-backups"

interface BackupEnvelope {
  app: "OJT Companion"
  version: 1
  exportedAt: string
  data: Record<string, string>
}

interface LocalBackup {
  id: string
  createdAt: string
  size: number
  payload: BackupEnvelope
}

interface StorageInfo {
  localBytes: number
  quota: number | null
  usage: number | null
  entries: Array<{ key: string; bytes: number }>
}

const storageLabels: Record<string, string> = {
  "ojt-roadmap-store": "Roadmaps",
  "ojt-weekly-planner": "Weekly Planner",
  "ojt-equipment-library": "Equipment",
  "ojt-knowledge-base": "Knowledge",
  "ojt-daily-journal": "Journal",
  "ojt-document-library": "Documents",
  "ojt-photo-gallery": "Photos",
  "ojt-standards-library": "Standards",
  "ojt-generated-reports": "Reports",
  "ojt-notification-center": "Notifications",
  "ojt-recent-searches": "Recent Searches",
  "ojt-user-profile": "User Profile",
  "ojt-settings": "Settings",
  "ojt-theme": "Theme",
  "ojt-local-backups": "Local Backups",
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "OJ"
  )
}

function isProfileDirty(profile: UserProfile, draft: UserProfile) {
  return JSON.stringify(profile) !== JSON.stringify(draft)
}

async function collectApplicationData(): Promise<BackupEnvelope> {
  return exportAppState([BACKUP_KEY])
}

async function readLocalBackups(): Promise<LocalBackup[]> {
  try {
    const value = await supabaseStateStorage.getItem(BACKUP_KEY)
    if (!value) return []
    const parsed = JSON.parse(value) as { state?: LocalBackup[] }
    return Array.isArray(parsed.state) ? parsed.state : []
  } catch {
    return []
  }
}

async function writeLocalBackups(backups: LocalBackup[]) {
  await supabaseStateStorage.setItem(BACKUP_KEY, JSON.stringify({ state: backups, version: 0 }))
}

function validateBackup(value: unknown): value is BackupEnvelope {
  if (!value || typeof value !== "object") return false
  const backup = value as Partial<BackupEnvelope>
  return (
    backup.app === "OJT Companion" &&
    backup.version === 1 &&
    Boolean(backup.data) &&
    typeof backup.data === "object" &&
    Object.entries(backup.data ?? {}).every(
      ([key, item]) => key.startsWith("ojt-") && key !== BACKUP_KEY && typeof item === "string"
    )
  )
}

export function SettingsContent() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const profile = useUserProfileStore((state) => state.profile)
  const updateProfile = useUserProfileStore((state) => state.updateProfile)
  const language = useSettingsStore((state) => state.language)
  const setLanguage = useSettingsStore((state) => state.setLanguage)
  const [profileDraft, setProfileDraft] = useState<UserProfile>(profile)
  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof UserProfile, string>>>({})
  const [backups, setBackups] = useState<LocalBackup[]>([])
  const [storage, setStorage] = useState<StorageInfo>({
    localBytes: 0,
    quota: null,
    usage: null,
    entries: [],
  })
  const [resetOpen, setResetOpen] = useState(false)
  const [resetConfirmation, setResetConfirmation] = useState("")
  const [profileImageUploading, setProfileImageUploading] = useState(false)
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setProfileDraft(profile)
  }, [profile])

  const draftDisplayName = profileDraft.displayName.trim() || profileDraft.fullName
  const initials = useMemo(() => getInitials(draftDisplayName), [draftDisplayName])
  const hasUnsavedProfileChanges = useMemo(
    () => isProfileDirty(profile, profileDraft),
    [profile, profileDraft]
  )

  const refreshStorage = async () => {
    const info = await getSupabaseStorageInfo()
    setStorage({
      localBytes: info.bytes,
      quota: null,
      usage: null,
      entries: info.entries.sort((a, b) => b.bytes - a.bytes),
    })
  }

  useEffect(() => {
    void readLocalBackups().then(setBackups)
    void refreshStorage()
  }, [])

  const validateProfile = () => {
    const errors: Partial<Record<keyof UserProfile, string>> = {}

    if (!profileDraft.fullName.trim()) errors.fullName = "Full name is required"
    if (!profileDraft.discipline.trim()) errors.discipline = "Discipline is required"
    if (profileDraft.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileDraft.email.trim())) {
      errors.email = "Enter a valid email address"
    }

    setProfileErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveProfile = () => {
    if (!validateProfile()) {
      toast.error("Review the highlighted profile fields")
      return
    }

    updateProfile({
      ...profileDraft,
      fullName: profileDraft.fullName.trim(),
      displayName: profileDraft.displayName.trim(),
      email: profileDraft.email.trim(),
      phoneNumber: profileDraft.phoneNumber.trim(),
      discipline: profileDraft.discipline.trim(),
      company: profileDraft.company.trim(),
      program: profileDraft.program.trim(),
      ojtBatch: profileDraft.ojtBatch.trim(),
      bio: profileDraft.bio.trim(),
    })
    setProfileErrors({})
    toast.success("Profile changes saved")
  }

  const resetProfileDraft = () => {
    setProfileDraft(profile)
    setProfileErrors({})
    toast.info("Profile changes reset")
  }

  const updateProfileDraft = (key: keyof UserProfile, value: string) => {
    setProfileDraft((current) => ({ ...current, [key]: value }))
    setProfileErrors((current) => ({ ...current, [key]: undefined }))
  }

  const uploadProfileImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setProfileImageUploading(true)
    try {
      const avatar = await uploadProfileAvatar(file, profileDraft.avatarPath)
      const nextProfile = {
        ...profileDraft,
        avatarPath: avatar.avatarPath,
        profileImage: avatar.signedUrl,
      }
      setProfileDraft(nextProfile)
      updateProfile(nextProfile)
      toast.success("Profile picture updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile picture could not be uploaded")
    } finally {
      setProfileImageUploading(false)
    }
  }

  const clearProfileImage = async () => {
    if (!profileDraft.avatarPath && !profileDraft.profileImage) return

    setProfileImageUploading(true)
    try {
      await removeProfileAvatar(profileDraft.avatarPath)
      const nextProfile = { ...profileDraft, avatarPath: "", profileImage: "" }
      setProfileDraft(nextProfile)
      updateProfile(nextProfile)
      toast.success("Profile picture removed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile picture could not be removed")
    } finally {
      setProfileImageUploading(false)
    }
  }

  const exportBackup = async () => {
    const backup = await collectApplicationData()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `ojt-companion-backup-${backup.exportedAt.slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success("Backup exported")
  }

  const createLocalBackup = async () => {
    const payload = await collectApplicationData()
    const serialized = JSON.stringify(payload)
    const backup: LocalBackup = {
      id: Math.random().toString(36).slice(2, 10),
      createdAt: payload.exportedAt,
      size: new Blob([serialized]).size,
      payload,
    }
    const next = [backup, ...backups].slice(0, 3)
    try {
      await writeLocalBackups(next)
      setBackups(next)
      void refreshStorage()
      toast.success("Local backup created")
    } catch {
      toast.error("Not enough browser storage. Export a backup file instead.")
    }
  }

  const restoreBackup = async (backup: BackupEnvelope) => {
    try {
      await replaceAppState(backup.data)
      await writeLocalBackups(backups)
      toast.success("Backup restored. Reloading application...")
      window.setTimeout(() => window.location.reload(), 500)
    } catch {
      toast.error("The backup could not be restored because browser storage is full")
    }
  }

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!validateBackup(parsed)) {
        toast.error("This is not a valid OJT Companion backup")
        return
      }
      if (
        !window.confirm(
          `Import backup from ${new Date(parsed.exportedAt).toLocaleString()}? Current application data will be replaced.`
        )
      ) {
        return
      }
      void restoreBackup(parsed)
    } catch {
      toast.error("The backup file could not be read")
    }
  }

  const deleteLocalBackup = (id: string) => {
    const next = backups.filter((backup) => backup.id !== id)
    void writeLocalBackups(next)
      .then(() => {
        setBackups(next)
        void refreshStorage()
      })
      .catch(() => toast.error("Backup could not be deleted"))
  }

  const resetApplication = async () => {
    try {
      await resetAppState()
      setResetOpen(false)
      toast.success("Application data reset. Reloading...")
      window.setTimeout(() => window.location.reload(), 500)
    } catch {
      toast.error("Application data could not be reset")
    }
  }

  const quotaPercentage =
    storage.quota && storage.usage
      ? Math.min(100, Math.round((storage.usage / storage.quota) * 100))
      : 0

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />Personal Settings
            </CardTitle>
            {hasUnsavedProfileChanges && (
              <Badge variant="outline" className="w-fit border-warning/40 text-warning">
                Unsaved changes
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center">
            <Avatar className="h-24 w-24 border border-border">
              <AvatarImage src={profileDraft.profileImage || undefined} alt={draftDisplayName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="font-medium">{draftDisplayName}</p>
                <p className="text-sm text-muted-foreground">{profileDraft.discipline || "No discipline set"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={profileImageUploading}
                  onClick={() => profileImageInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />Upload Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={profileImageUploading}
                  onClick={() => profileImageInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={profileImageUploading || (!profileDraft.avatarPath && !profileDraft.profileImage)}
                  onClick={() => void clearProfileImage()}
                >
                  <X className="mr-2 h-4 w-4" />Remove
                </Button>
              </div>
              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="sr-only"
                aria-label="Upload profile picture"
                onChange={uploadProfileImage}
              />
              <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, or WEBP. Maximum file size: 5 MB.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {([
              ["fullName", "Full Name", "OJT Trainee"],
              ["displayName", "Preferred Display Name", "Name shown in the header"],
              ["discipline", "Discipline", "Electrical Engineering Trainee"],
              ["company", "Company", "Medco E&P"],
              ["program", "Program", "Operations Apprentice Development Program"],
              ["ojtBatch", "OJT Batch", "OADP 2026"],
              ["email", "Email", "name@example.com"],
              ["phoneNumber", "Phone Number", "+62 ..."],
            ] as Array<[keyof UserProfile, string, string]>).map(([key, label, placeholder]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type={key === "email" ? "email" : "text"}
                  value={profileDraft[key]}
                  onChange={(event) => updateProfileDraft(key, event.target.value)}
                  placeholder={placeholder}
                  aria-invalid={Boolean(profileErrors[key])}
                  readOnly={key === "discipline"}
                  className={key === "discipline" ? "bg-muted/50 text-muted-foreground" : undefined}
                />
                {key === "discipline" && (
                  <p className="text-xs text-muted-foreground">
                    Discipline is locked after registration because it defines your workspace content.
                  </p>
                )}
                {profileErrors[key] && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />{profileErrors[key]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileDraft.bio}
              onChange={(event) => updateProfileDraft("bio", event.target.value)}
              placeholder="Short professional summary, learning focus, or OJT goals"
              className="min-h-28"
            />
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Updates synchronize with the header and profile cards immediately after saving.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={!hasUnsavedProfileChanges} onClick={resetProfileDraft}>
                Reset
              </Button>
              <Button type="button" disabled={!hasUnsavedProfileChanges} onClick={saveProfile}>
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {resolvedTheme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Color theme</Label>
            <Select value={theme ?? "dark"} onValueChange={setTheme}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">System mode follows your operating-system preference.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Languages className="h-5 w-5 text-primary" />Language</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Application language</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as AppLanguage)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="th">Thai</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Sets the document language used by the application.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Archive className="h-5 w-5 text-primary" />Backup, Import & Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" onClick={() => void createLocalBackup()}><Archive className="mr-2 h-4 w-4" />Local Backup</Button>
            <Button variant="outline" onClick={() => void exportBackup()}><Download className="mr-2 h-4 w-4" />Export JSON</Button>
            <Button variant="outline" onClick={() => importInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Import JSON</Button>
            <input ref={importInputRef} type="file" accept="application/json,.json" className="sr-only" onChange={importBackup} />
          </div>
          <p className="text-sm text-muted-foreground">
            Backups include every OJT Companion module and preference. Up to three local snapshots are retained.
          </p>
          {backups.length > 0 && (
            <div className="divide-y rounded-lg border">
              {backups.map((backup) => (
                <div key={backup.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{new Date(backup.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(backup.size)} - {Object.keys(backup.payload.data).length} data stores
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (window.confirm("Restore this local backup and replace current application data?")) void restoreBackup(backup.payload)
                  }}><RefreshCcw className="mr-2 h-3.5 w-3.5" />Restore</Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteLocalBackup(backup.id)} aria-label="Delete backup">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2"><HardDrive className="h-5 w-5 text-primary" />Storage Information</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => void refreshStorage()}><RefreshCcw className="mr-2 h-4 w-4" />Refresh</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Application Local Data</p>
              <p className="mt-1 text-xl font-semibold">{formatBytes(storage.localBytes)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Browser Usage</p>
              <p className="mt-1 text-xl font-semibold">{storage.usage === null ? "Unavailable" : formatBytes(storage.usage)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Estimated Quota</p>
              <p className="mt-1 text-xl font-semibold">{storage.quota === null ? "Unavailable" : formatBytes(storage.quota)}</p>
            </div>
          </div>
          {storage.quota !== null && storage.usage !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Browser storage used</span><span>{quotaPercentage}%</span></div>
              <Progress value={quotaPercentage} />
            </div>
          )}
          <div className="divide-y rounded-lg border">
            {storage.entries.map((entry) => (
              <div key={entry.key} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span>{storageLabels[entry.key] ?? entry.key}</span>
                <Badge variant="outline">{formatBytes(entry.bytes)}</Badge>
              </div>
            ))}
            {!storage.entries.length && <p className="p-5 text-center text-sm text-muted-foreground">No application data stored.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="h-5 w-5" />Reset Application</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-2xl text-sm text-muted-foreground">
            Permanently removes all local roadmaps, plans, equipment, articles, journal entries, files, reports, reminders, backups, and preferences.
          </p>
          <Button variant="destructive" onClick={() => {
            setResetConfirmation("")
            setResetOpen(true)
          }}>Reset Application</Button>
        </CardContent>
      </Card>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset all application data?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. Export a backup first if you may need this data later.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reset-confirmation">Type RESET to continue</Label>
              <Input id="reset-confirmation" value={resetConfirmation} onChange={(event) => setResetConfirmation(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={resetConfirmation !== "RESET"} onClick={() => void resetApplication()}>
              <Database className="mr-2 h-4 w-4" />Delete All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
