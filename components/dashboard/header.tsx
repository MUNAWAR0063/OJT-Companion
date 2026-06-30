"use client"

import { Search, BookMarked, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileNav } from "./mobile-nav"
import type { ReactNode } from "react"

interface HeaderProps {
  title: string
  description: string
  actions?: ReactNode
}

export function Header({ title, description, actions }: HeaderProps) {
  return (
    <header className="space-y-6 md:space-y-8 animate-slide-in-up">
      <div className="flex items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3 flex-1">
          <MobileNav />

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes, topics, documents..."
              className="pl-10 pr-3 md:pr-16 h-10 text-sm bg-card border-border transition-all duration-300 focus:shadow-lg focus:shadow-primary/10"
            />
            <kbd className="hidden md:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded border border-border">
              ⌘F
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-9 w-9"
          >
            <BookMarked className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-9 w-9"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
          </Button>

          <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-border">
            <Avatar className="w-8 h-8 md:w-9 md:h-9 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
              <AvatarImage src="/profile.jpg" alt="Salman" />
              <AvatarFallback className="text-xs font-semibold">SA</AvatarFallback>
            </Avatar>
            <div className="text-xs hidden sm:block">
              <p className="font-semibold text-foreground">Salman</p>
              <p className="text-muted-foreground text-[11px]">Electrical Engineering Trainee</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground reading-width">{description}</p>
      </div>

      {actions && <div className="flex flex-col sm:flex-row gap-3">{actions}</div>}
    </header>
  )
}
