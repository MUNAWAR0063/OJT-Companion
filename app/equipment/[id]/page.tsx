import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Cpu, MapPin, Zap, Calendar, FileText, Edit2 } from "lucide-react"
import Link from "next/link"

interface EquipmentDetailPageProps {
  params: { id: string }
}

const equipmentData: Record<string, any> = {
  "1": {
    id: "1",
    name: "Synchronous Generator",
    category: "Generation Equipment",
    rating: "11 kV, 25 MVA",
    location: "Ras Tanura Power Plant - Unit 1",
    status: "active",
    lastInspected: "2024-06-28",
    manufacturer: "ABB",
    model: "SG-3000-11",
    commissionDate: "2015-03-15",
    nextScheduledMaintenance: "2024-12-15",
    description:
      "Three-phase synchronous generator with brushless excitation system. Used for primary power generation in Unit 1 of the power plant.",
    specs: [
      { label: "Power Output", value: "25 MVA" },
      { label: "Voltage", value: "11 kV" },
      { label: "Frequency", value: "50 Hz" },
      { label: "Speed", value: "3000 rpm" },
      { label: "Efficiency", value: "96.5%" },
      { label: "Cooling", value: "Hydrogen cooled" },
    ],
    recentActivity: [
      { date: "2024-06-28", action: "Scheduled Inspection", notes: "Routine maintenance completed" },
      { date: "2024-05-10", action: "Oil Analysis", notes: "Oil quality within acceptable limits" },
      { date: "2024-03-22", action: "Vibration Analysis", notes: "Vibration levels normal" },
    ],
  },
  "2": {
    id: "2",
    name: "Power Transformer",
    category: "Transformation Equipment",
    rating: "115/11 kV, 50 MVA",
    location: "Ras Tanura Substation - Main Bank",
    status: "active",
    lastInspected: "2024-06-20",
    manufacturer: "Siemens",
    model: "3WL-50000",
    commissionDate: "2012-06-01",
    nextScheduledMaintenance: "2024-11-20",
    description:
      "Three-winding power transformer with on-load tap changer. Provides voltage step-down from transmission to distribution level.",
    specs: [
      { label: "Power Rating", value: "50 MVA" },
      { label: "Primary Voltage", value: "115 kV" },
      { label: "Secondary Voltage", value: "11 kV" },
      { label: "Vector Group", value: "Dyn11" },
      { label: "Impedance", value: "10%" },
      { label: "Cooling", value: "ONAN/ONAF" },
    ],
    recentActivity: [
      { date: "2024-06-20", action: "DGA Test", notes: "Dissolved gas analysis completed" },
      { date: "2024-04-15", action: "Thermal Imaging", notes: "Temperature monitoring within limits" },
      { date: "2024-02-28", action: "Oil Sampling", notes: "Oil replaced due to contamination" },
    ],
  },
}

export default function EquipmentDetailPage({ params }: EquipmentDetailPageProps) {
  const equipment = equipmentData[params.id] || equipmentData["1"]

  const statusStyles = {
    active: "bg-green-100 text-green-800 border-green-200",
    standby: "bg-yellow-100 text-yellow-800 border-yellow-200",
    maintenance: "bg-red-100 text-red-800 border-red-200",
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-64">
        <PageBreadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Equipment Library", href: "/equipment" },
            { label: equipment.name },
          ]}
        />

        <Header
          title={equipment.name}
          description={equipment.description}
          actions={
            <Button className="gap-2 w-full sm:w-auto h-9 text-sm">
              <Edit2 className="w-4 h-4" />
              Edit Details
            </Button>
          }
        />

        <div className="mt-8 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Rating</p>
                  <p className="text-sm font-semibold text-foreground">{equipment.rating}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Location</p>
                  <p className="text-sm font-semibold text-foreground truncate">{equipment.location}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Last Inspected</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(equipment.lastInspected).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Badge className={`text-xs capitalize ${statusStyles[equipment.status]}`}>
                    {equipment.status}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Specifications */}
              <Card className="p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-6">Specifications</h2>
                <div className="grid grid-cols-2 gap-6">
                  {equipment.specs.map((spec: any) => (
                    <div key={spec.label}>
                      <p className="text-xs text-muted-foreground font-medium mb-1">{spec.label}</p>
                      <p className="text-sm md:text-base font-semibold text-foreground">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {equipment.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.notes}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 md:p-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Equipment Info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Category</p>
                    <p className="text-sm font-semibold text-foreground">{equipment.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Manufacturer</p>
                    <p className="text-sm font-semibold text-foreground">{equipment.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Model</p>
                    <p className="text-sm font-semibold text-foreground">{equipment.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Commission Date</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(equipment.commissionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Next Maintenance</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(equipment.nextScheduledMaintenance).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Link href="/equipment" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
