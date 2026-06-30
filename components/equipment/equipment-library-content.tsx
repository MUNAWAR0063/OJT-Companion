"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Cpu, Search, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface Equipment {
  id: string
  name: string
  category: string
  rating: string
  location: string
  status: "active" | "standby" | "maintenance"
  lastInspected: string
}

const mockEquipment: Equipment[] = [
  {
    id: "1",
    name: "Synchronous Generator",
    category: "Generation",
    rating: "11 kV, 25 MVA",
    location: "Ras Tanura Power Plant - Unit 1",
    status: "active",
    lastInspected: "2024-06-28",
  },
  {
    id: "2",
    name: "Power Transformer",
    category: "Transformation",
    rating: "115/11 kV, 50 MVA",
    location: "Ras Tanura Substation - Main Bank",
    status: "active",
    lastInspected: "2024-06-20",
  },
  {
    id: "3",
    name: "Vacuum Circuit Breaker",
    category: "Switchgear",
    rating: "11 kV, 1250 A",
    location: "Ras Tanura Distribution - Feeder 3",
    status: "standby",
    lastInspected: "2024-05-15",
  },
  {
    id: "4",
    name: "3-Phase Induction Motor",
    category: "Motors",
    rating: "11 kV, 500 kW",
    location: "Ras Tanura Compressor Station",
    status: "active",
    lastInspected: "2024-06-25",
  },
  {
    id: "5",
    name: "Static VAR Compensator",
    category: "Control Equipment",
    rating: "±100 MVAR",
    location: "Ras Tanura Main Grid",
    status: "active",
    lastInspected: "2024-06-22",
  },
  {
    id: "6",
    name: "UPS System",
    category: "Power Supply",
    rating: "500 kVA, 4 hours autonomy",
    location: "Control Center Building",
    status: "standby",
    lastInspected: "2024-06-01",
  },
]

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  standby: "bg-yellow-100 text-yellow-800 border-yellow-200",
  maintenance: "bg-red-100 text-red-800 border-red-200",
}

export function EquipmentLibraryContent() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEquipment = mockEquipment.filter(
    (eq) =>
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 relative w-full md:w-auto">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="gap-2 w-full md:w-auto">
          <Plus className="w-4 h-4" />
          Add Equipment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredEquipment.map((equipment) => (
          <Link key={equipment.id} href={`/equipment/${equipment.id}`}>
            <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                <div className="flex items-start gap-4 md:col-span-2 lg:col-span-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Cpu className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{equipment.name}</h3>
                    <p className="text-sm text-muted-foreground">{equipment.category}</p>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <p className="text-xs text-muted-foreground font-medium">Rating</p>
                  <p className="text-sm font-semibold text-foreground">{equipment.rating}</p>
                </div>

                <div className="hidden lg:block">
                  <p className="text-xs text-muted-foreground font-medium">Location</p>
                  <p className="text-sm font-semibold text-foreground truncate">{equipment.location}</p>
                </div>

                <div className="flex items-center justify-between gap-4 md:col-span-2 lg:col-span-1">
                  <Badge className={`text-xs capitalize ${statusColors[equipment.status]}`}>
                    {equipment.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground text-right">
                    Inspected {new Date(equipment.lastInspected).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <Card className="p-12 text-center">
          <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No equipment found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search filters</p>
        </Card>
      )}
    </div>
  )
}
