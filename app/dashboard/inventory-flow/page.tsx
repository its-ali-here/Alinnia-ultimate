"use client"

import React from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Boxes,
  Download,
  PackageMinus,
  PackagePlus,
  Plus,
  Search,
  Truck,
  Warehouse
} from "lucide-react"

// Hardcoded data mapped to specialized physical operations
const inventoryData = [
  { 
    id: "SKU-LPG-45", 
    name: "Commercial LPG Cylinders (45kg)", 
    category: "Energy",
    quantity: 450, 
    capacity: 500,
    unit: "Units",
    location: "Lahore Filling Plant", 
    status: "Optimal"
  },
  { 
    id: "SKU-EGG-L", 
    name: "Grade A Large Eggs", 
    category: "Perishables",
    quantity: 1200, 
    capacity: 5000,
    unit: "Trays",
    location: "DHA EME Hub", 
    status: "Low Stock"
  },
  { 
    id: "SKU-OS-CAN", 
    name: "Raw Canola Seeds", 
    category: "Agriculture",
    quantity: 18, 
    capacity: 20,
    unit: "Tons",
    location: "Dina Nath Storage", 
    status: "Optimal"
  },
  { 
    id: "SKU-CF-Prem", 
    name: "Premium Cattle Feed", 
    category: "Livestock",
    quantity: 45, 
    capacity: 500,
    unit: "Bags (50kg)",
    location: "Chak 156/9L Silos", 
    status: "Critical"
  },
]

const recentMovements = [
  {
    id: "TRX-8829",
    type: "Outbound",
    item: "Grade A Large Eggs",
    amount: "500 Trays",
    destination: "Local Distributors",
    time: "2 hours ago",
    status: "Completed"
  },
  {
    id: "TRX-8830",
    type: "Inbound",
    item: "Raw Canola Seeds",
    amount: "12 Tons",
    destination: "Dina Nath Storage",
    time: "5 hours ago",
    status: "Processing"
  },
  {
    id: "TRX-8831",
    type: "Transfer",
    item: "Commercial LPG Cylinders",
    amount: "50 Units",
    destination: "Site B",
    time: "Yesterday",
    status: "In Transit"
  }
]

export default function InventoryFlowPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Critical":
        return <Badge variant="destructive" className="bg-rose-500">Critical</Badge>
      case "Low Stock":
        return <Badge variant="destructive" className="bg-orange-500">Low Stock</Badge>
      case "Optimal":
        return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30">Optimal</Badge>
      case "Overstocked":
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30">Overstocked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "Inbound":
        return <PackagePlus className="h-4 w-4 text-emerald-500" />
      case "Outbound":
        return <PackageMinus className="h-4 w-4 text-orange-500" />
      case "Transfer":
        return <Truck className="h-4 w-4 text-blue-500" />
      default:
        return <Boxes className="h-4 w-4" />
    }
  }

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory Flow</h2>
            <p className="text-muted-foreground">
              Track stock levels, warehouse capacity, and transit movements across all sites.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Movement
            </Button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items in Stock</CardTitle>
              <Boxes className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14,230</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">+12.5%</span> volume this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <PackageMinus className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowDownRight className="mr-1 h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">-2</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inbound Shipments</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                Processing at 3 locations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Capacity</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <Progress value={78} className="h-2 mt-2 [&>div]:bg-amber-500" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Main Inventory Table */}
          <Card className="col-span-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Current Stock Levels</CardTitle>
                <CardDescription>Real-time view of inventory across all operational hubs.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter by SKU or location..." className="pl-8" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="w-[150px]">Capacity</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.map((item) => {
                    const fillPercentage = (item.quantity / item.capacity) * 100;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                          <div className="text-xs text-muted-foreground">{item.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-3 w-3 text-muted-foreground" />
                            {item.location}
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantity} <span className="text-muted-foreground text-xs">{item.unit}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={fillPercentage} 
                              className={`h-2 ${
                                fillPercentage < 20 ? '[&>div]:bg-rose-500' : 
                                fillPercentage > 90 ? '[&>div]:bg-amber-500' : 
                                '[&>div]:bg-emerald-500'
                              }`} 
                            />
                            <span className="text-xs text-muted-foreground">{Math.round(fillPercentage)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {getStatusBadge(item.status)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Movements Widget */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recent Movements</CardTitle>
              <CardDescription>Latest logistics activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-start gap-4">
                  <div className="mt-1 bg-muted p-2 rounded-full">
                    {getMovementIcon(movement.type)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="text-sm font-medium leading-none flex justify-between">
                      {movement.type}
                      <span className="text-xs text-muted-foreground font-normal">{movement.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {movement.amount} of {movement.item}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">
                        {movement.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate">
                        {movement.type === "Inbound" ? "to" : "to"} {movement.destination}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}