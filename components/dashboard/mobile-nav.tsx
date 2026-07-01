"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { useSidebarState } from "@/lib/sidebar-state"

export function MobileNav() {
  const { mobileOpen, setMobileOpen, closeMobile } = useSidebarState()

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 hover:bg-secondary transition-all duration-300 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] max-w-[85vw] gap-0 p-0 md:hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation menu</SheetTitle>
          <SheetDescription>Primary OJT Companion navigation</SheetDescription>
        </SheetHeader>
        <Sidebar variant="drawer" onNavigate={closeMobile} />
      </SheetContent>
    </Sheet>
  )
}
