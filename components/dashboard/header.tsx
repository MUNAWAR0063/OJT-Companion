"use client"

import { Bell, BookMarked, Info, LogOut, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileNav } from "./mobile-nav"
import Link from "next/link"
import type { ReactNode } from "react"
import { useNotificationStore } from "@/lib/notification-store"
import { getProfileDisplayName, getProfileInitials, useUserProfileStore } from "@/lib/user-profile-store"
import { WorkspaceSearch } from "@/components/search/global-search"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  title: string
  description: string
  actions?: ReactNode
}

export function Header({ title, description, actions }: HeaderProps) {
  const profile = useUserProfileStore((state) => state.profile)
  const displayName = getProfileDisplayName(profile)
  const unreadNotifications = useNotificationStore(
    (state) =>
      state.notifications.filter(
        (notification) =>
          !notification.read &&
          (!notification.dueAt || new Date(notification.dueAt).getTime() <= Date.now())
      ).length
  )
  const initials = getProfileInitials(profile)

  return (
    <header className="sticky top-0 z-30 -mx-4 space-y-6 border-b border-border/70 bg-background/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6 min-[1280px]:-mx-8 min-[1280px]:px-8">
      <div className="space-y-0">
        <div className="flex items-start justify-between gap-3 md:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-2 md:gap-3">
            <div className="pt-0.5">
              <MobileNav />
            </div>
            <div className="min-w-0 space-y-3 pt-1.5 md:pt-0">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
              <p className="reading-width hidden text-xs leading-relaxed text-muted-foreground md:block md:text-base">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5 md:gap-3">
            <WorkspaceSearch variant="icon" />
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 hover:bg-secondary transition-all duration-300 hover:scale-105"
            >
              <Link href="/standards" aria-label="Open standards library">
                <BookMarked className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 hover:bg-secondary transition-all duration-300 hover:scale-105"
            >
              <Link href="/notifications" aria-label="Open notifications">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
              </Link>
            </Button>

            <div className="flex min-w-0 items-center gap-3 border-l border-border pl-2 md:pl-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex min-w-0 items-center gap-3 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Open user profile menu"
                  >
                    <Avatar className="w-8 h-8 md:w-9 md:h-9 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
                      <AvatarImage src={profile.profileImage || undefined} alt={displayName} />
                      <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden max-w-40 text-xs sm:block">
                      <p className="truncate font-semibold text-foreground">{displayName}</p>
                      <p className="truncate text-muted-foreground text-[11px]">{profile.discipline}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile.profileImage || undefined} alt={displayName} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{displayName}</span>
                      <span className="block truncate text-xs font-normal text-muted-foreground">{profile.discipline}</span>
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings"><UserRound className="h-4 w-4" />My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help"><Info className="h-4 w-4" />About OJT Companion</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/logout"><LogOut className="h-4 w-4" />Logout</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <p className="w-full max-w-none break-normal whitespace-normal pl-[3.25rem] text-left text-xs leading-relaxed text-muted-foreground md:hidden md:pl-0">
          {description}
        </p>
      </div>

      {actions && <div className="flex flex-col sm:flex-row gap-3">{actions}</div>}
    </header>
  )
}
