"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BrickWall,
  Package,
  Truck,
  ClipboardList,
  Search,
  Plus,
  Download,
  AlertTriangle,
  PackageCheck,
  DollarSign,
} from "lucide-react"

// Hardcoded data for a home construction project
const materialsData = [
  {
    id: "MAT-001",
    name: "Cement Bags",
    category: "Foundation",
    quantity: 250,
    required: 500,
    unit: "bags",
    status: "Shortage",
  },
  {
    id: "MAT-002",
    name: "A+ Quality Bricks",
    category: "Structure",
    quantity: 8000,
    required: 10000,
    unit: "pieces",
    status: "Low",
  },
  {
    id: "MAT-003",
    name: "Steel Rebar (12mm)",
    category: "Structure",
    quantity: 15,
    required: 15,
    unit: "tons",
    status: "Sufficient",
  },
  {
    id: "MAT-004",
    name: "White Paint",
    category: "Finishing",
    quantity: 20,
    required: 15,
    unit: "gallons",
    status: "Sufficient",
  },
  {
    id: "MAT-005",
    name: "Floor Tiles (24x24)",
    category: "Finishing",
    quantity: 350,
    required: 500,
    unit: "sqft",
    status: "Shortage",
  },
]

const recentActivity = [
    {
      id: "ACT-101",
      type: "Delivery",
      item: "Steel Rebar (12mm)",
      details: "15 tons received from Mughal Steel",
      time: "3 hours ago",
      status: "Completed"
    },
    {
      id: "ACT-102",
      type: "Usage",
      item: "Cement Bags",
      details: "100 bags used for foundation slab",
      time: "Yesterday",
      status: "Logged"
    },
    {
      id: "ACT-103",
      type: "Order",
      item: "Floor Tiles (24x24)",
      details: "Order placed for 150 sqft",
      time: "This morning",
      status: "Placed"
    },
  ]
  

export default function InventoryFlowPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Shortage":
        return <Badge variant="destructive">Shortage</Badge>
      case "Low":
        return <Badge variant="destructive" className="bg-orange-500">Low</Badge>
      case "Sufficient":
        return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30">Sufficient</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "Delivery":
        return <PackageCheck className="h-4 w-4 text-emerald-500" />
      case "Usage":
        return <BrickWall className="h-4 w-4 text-blue-500" />
      case "Order":
        return <ClipboardList className="h-4 w-4 text-amber-500" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Materials Management</h2>
            <p className="text-muted-foreground">
              Track material inventory, orders, and shortages for your project.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export List
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Material
            </Button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materials on Site</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 Types</div>
              <p className="text-xs text-muted-foreground mt-1">
                Covering Foundation, Structure & Finishing
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Material Shortages</CardTitle>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">2 Items</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cement & Floor Tiles require procurement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Deliveries</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1 Order</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                Floor tiles expected this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Material Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">65% Used</div>
              <Progress value={65} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Main Inventory Table */}
          <Card className="col-span-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Material Inventory</CardTitle>
                <CardDescription>Real-time stock levels on your construction site.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter materials..." className="pl-8" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">On Site</TableHead>
                    <TableHead className="w-[150px]">Progress</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialsData.map((item) => {
                    const fillPercentage = (item.quantity / item.required) * 100;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                          <div className="text-xs text-muted-foreground">{item.id}</div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantity} <span className="text-muted-foreground text-xs">/ {item.required} {item.unit}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={fillPercentage} 
                              className={`h-2 ${
                                fillPercentage < 50 ? '[&>div]:bg-rose-500' : 
                                fillPercentage < 80 ? '[&>div]:bg-amber-500' : 
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

          {/* Recent Activity Widget */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest material movements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="mt-1 bg-muted p-2 rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="text-sm font-medium leading-none flex justify-between">
                      {activity.type}
                      <span className="text-xs text-muted-foreground font-normal">{activity.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.details}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">
                        {activity.status}
                      </Badge>
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
