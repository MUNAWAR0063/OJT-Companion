"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cpu, Plus } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/lib/app-context"

export function EquipmentLibraryContent() {
  const { equipment } = useApp()

  if (equipment.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Cpu className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">No equipment added yet</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Start cataloging equipment from the main Equipment Library view to populate this workspace.
        </p>
        <Button asChild>
          <Link href="/equipment">
            <Plus className="mr-2 h-4 w-4" />
            Open Equipment Library
          </Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {equipment.map((item) => (
        <Card key={item.id} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.type}</p>
            </div>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {item.location || "Unspecified location"}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
