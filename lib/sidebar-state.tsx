"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

type SidebarMode = "mobile" | "tablet" | "desktop"
type SidebarPreference = "expanded" | "collapsed"

interface SidebarState {
  mode: SidebarMode
  expanded: boolean
  collapsed: boolean
  mobile: boolean
  tablet: boolean
  desktop: boolean
  mobileOpen: boolean
  sidebarWidth: number
  setExpanded: (expanded: boolean) => void
  toggleExpanded: () => void
  setMobileOpen: (open: boolean) => void
  closeMobile: () => void
}

const SIDEBAR_STORAGE_KEY = "ojt-sidebar-preference"
const EXPANDED_WIDTH = 280
const COLLAPSED_WIDTH = 72

const SidebarStateContext = createContext<SidebarState | null>(null)

function getMode(width: number): SidebarMode {
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  return "desktop"
}

function getStoredPreference(): SidebarPreference | null {
  if (typeof window === "undefined") return null

  const value = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
  return value === "expanded" || value === "collapsed" ? value : null
}

function getDefaultExpanded(mode: SidebarMode, preference: SidebarPreference | null) {
  if (mode === "desktop") return true
  if (mode === "tablet") return preference === "expanded"
  return false
}

export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SidebarMode>("desktop")
  const [tabletExpanded, setTabletExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const syncMode = () => {
      const nextMode = getMode(window.innerWidth)
      const nextPreference = getStoredPreference()

      setMode(nextMode)
      setTabletExpanded(getDefaultExpanded(nextMode, nextPreference))
      if (nextMode !== "mobile") setMobileOpen(false)
    }

    syncMode()
    window.addEventListener("resize", syncMode)

    return () => window.removeEventListener("resize", syncMode)
  }, [])

  const setExpanded = useCallback(
    (nextExpanded: boolean) => {
      if (mode === "desktop") {
        return
      }

      if (mode === "mobile") {
        return
      }

      const nextPreference: SidebarPreference = nextExpanded ? "expanded" : "collapsed"
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, nextPreference)
      setTabletExpanded(nextExpanded)
    },
    [mode],
  )

  const toggleExpanded = useCallback(() => {
    setExpanded(!tabletExpanded)
  }, [tabletExpanded, setExpanded])

  const updateMobileOpen = useCallback(
    (open: boolean) => {
      setMobileOpen(mode === "mobile" ? open : false)
    },
    [mode],
  )

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
  }, [])

  const desktop = mode === "desktop"
  const tablet = mode === "tablet"
  const mobile = mode === "mobile"
  const effectiveExpanded = desktop || (tablet && tabletExpanded)
  const sidebarWidth = mobile ? 0 : effectiveExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH

  const value = useMemo<SidebarState>(
    () => ({
      mode,
      expanded: effectiveExpanded,
      collapsed: !effectiveExpanded,
      mobile,
      tablet,
      desktop,
      mobileOpen,
      sidebarWidth,
      setExpanded,
      toggleExpanded,
      setMobileOpen: updateMobileOpen,
      closeMobile,
    }),
    [
      mode,
      effectiveExpanded,
      mobile,
      tablet,
      desktop,
      mobileOpen,
      sidebarWidth,
      setExpanded,
      toggleExpanded,
      updateMobileOpen,
      closeMobile,
    ],
  )

  const style = {
    "--app-sidebar-width": `${sidebarWidth}px`,
  } as CSSProperties

  return (
    <SidebarStateContext.Provider value={value}>
      <div
        data-sidebar-mode={mode}
        data-sidebar-state={effectiveExpanded ? "expanded" : "collapsed"}
        style={style}
      >
        {children}
      </div>
    </SidebarStateContext.Provider>
  )
}

export function useSidebarState() {
  const context = useContext(SidebarStateContext)

  if (!context) {
    throw new Error("useSidebarState must be used within SidebarStateProvider")
  }

  return context
}
