"use client"

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { ensureSupabaseSession, supabaseStateStorage } from "@/lib/supabase/storage"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

interface ThemeProviderProps {
  children: ReactNode
  attribute?: "class"
  defaultTheme?: Theme
  enableSystem?: boolean
  storageKey?: string
}

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => undefined,
})

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

async function readPersistedTheme(storageKey: string) {
  const value = await supabaseStateStorage.getItem(storageKey)
  if (!value) return null
  const parsed = JSON.parse(value) as { state?: { theme?: Theme } }
  const theme = parsed.state?.theme
  return theme === "light" || theme === "dark" || theme === "system" ? theme : null
}

async function writePersistedTheme(storageKey: string, theme: Theme) {
  await supabaseStateStorage.setItem(storageKey, JSON.stringify({ state: { theme }, version: 0 }))
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  enableSystem = true,
  storageKey = "ojt-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    defaultTheme === "system" ? "dark" : defaultTheme
  )

  useEffect(() => {
    let active = true

    async function hydrateTheme() {
      try {
        await ensureSupabaseSession()
        const persistedTheme = await readPersistedTheme(storageKey)
        if (active && persistedTheme) setThemeState(persistedTheme)
      } catch (error) {
        console.error("Theme data source failed to initialize", error)
      }
    }

    void hydrateTheme()

    return () => {
      active = false
    }
  }, [storageKey])

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const resolve = () => {
      const nextResolvedTheme = theme === "system" && enableSystem ? systemTheme() : theme === "light" ? "light" : "dark"
      setResolvedTheme(nextResolvedTheme)
      applyTheme(nextResolvedTheme)
    }

    resolve()
    media.addEventListener("change", resolve)
    return () => media.removeEventListener("change", resolve)
  }, [enableSystem, theme])

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    void writePersistedTheme(storageKey, nextTheme)
  }, [storageKey])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
