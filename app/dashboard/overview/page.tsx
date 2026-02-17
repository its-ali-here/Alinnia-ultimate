"use client"

import React from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Building2,
  Clock,
  Fuel,
  Home,
  Sprout,
  Tractor,
  Wallet,
  TrendingUp,
  ShieldAlert,
  CalendarDays
} from "lucide-react"

// Hardcoded data synthesizing the different business verticals
const portfolioHealth = [
  {
    id: "PH-01",
    name: "Lahore LPG Filling Plant",
    type: "Operating Entity",
    icon: Fuel,
    status: "Optimal",
    metricLabel: "MTD Volume",
    metricValue: "18,450 Cylinders",
    trend: "up",
    trendValue: "+4.2%"
  },
  {
    id: "PH-02",
    name: "DHA EME Egg Distribution",
    type: "Operating Entity",
    icon: Building2,
    status: "Attention",
    metricLabel: "Stock Level",
    metricValue: "65% Capacity",
    trend: "down",
    trendValue: "-12%"
  },
  {
    id: "PH-03",
    name: "Chak 156/9L & Dina Nath",
    type: "Agri / Livestock",
    icon: Tractor,
    status: "Capital Deployment",
    metricLabel: "Active Phase",
    metricValue: "Seed & Feed Proc.",
    trend: "neutral",
    trendValue: "On Schedule"
  },
  {
    id: "PH-04",
    name: "DHA EME 200 Kanal",
    type: "Real Estate Dev",
    icon: Sprout,
    status: "Capital Deployment",
    metricLabel: "Phase Progress",
    metricValue: "Earthwork",
    trend: "neutral",
    trendValue: "Starts Mar 10"
  },
  {
    id: "PH-05",
    name: "New House Construction",
    type: "Personal CapEx",
    icon: Home,
    status: "Critical Phase",
    metricLabel: "Completion",
    metricValue: "85%",
    trend: "neutral",
    trendValue: "Finishing"
  }
]

const priorityAlerts = [
  {
    id: "ALT-01",
    module: "Credit Risk",
    icon: ShieldAlert,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    message: "Lahore Central Logistics account is 62 days overdue (Rs. 5.4M)."
  },
  {
    id: "ALT-02",
    module: "Runway",
    icon: CalendarDays,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    message: "Rs. 4.5M outflow scheduled in 8 days for House Finishing."
  },
  {
    id: "ALT-03",
    module: "Inventory",
    icon: AlertTriangle,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    message: "Premium Cattle Feed at Chak 156/9L is at critical levels (45 bags remaining)."
  }
]

export default function OverviewPage() {
  const formatRs = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumSignificantDigits: 3,
      notation: "compact",
      compactDisplay: "short"
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Optimal": return "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
      case "Attention": return "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
      case "Critical Phase": return "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20"
      case "Capital Deployment": return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Executive Overview</h2>
            <p className="text-muted-foreground">
              Consolidated health, liquidity, and operational alerts across all holding verticals.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button>Generate Board Report</Button>
          </div>
        </div>

        {/* Top-Level Consolidated KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consolidated Liquidity</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. 52.0M</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total cash reserves across all entities
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operating Net Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">Rs. +5.7M</div>
              <p className="text-xs text-muted-foreground mt-1">
                MTD across LPG and Egg Distribution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled CapEx (30D)</CardTitle>
              <Activity className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">Rs. 12.7M</div>
              <p className="text-xs text-muted-foreground mt-1">
                Real estate and agricultural deployments
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actionable Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">3</div>
              <p className="text-xs text-muted-foreground mt-1 text-amber-700">
                Requires immediate executive review
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          
          {/* Operations Health Matrix */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Portfolio Health Matrix</CardTitle>
              <CardDescription>Current status of operational and developmental verticals.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioHealth.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary rounded-full">
                          <Icon className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.type}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-medium">{item.metricValue}</div>
                          <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            {item.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                            {item.trend === 'down' && <ArrowDownRight className="h-3 w-3 text-rose-500" />}
                            <span className={item.trend === 'up' ? 'text-emerald-500' : item.trend === 'down' ? 'text-rose-500' : ''}>
                              {item.trendValue}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className={`w-32 justify-center ${getStatusColor(item.status)}`}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="col-span-3 space-y-4">
            {/* Priority Alerts Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Action Items</CardTitle>
                <CardDescription>Cross-module alerts requiring attention.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priorityAlerts.map((alert) => {
                    const AlertIcon = alert.icon;
                    return (
                      <div key={alert.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card">
                        <div className={`mt-0.5 p-2 rounded-full ${alert.bg}`}>
                          <AlertIcon className={`h-4 w-4 ${alert.color}`} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {alert.module}
                          </p>
                          <p className="text-sm font-medium leading-snug">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Runway Snapshot */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Runway Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Liquidity</span>
                    <span className="font-medium">Rs. 52.0M</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">30-Day Burn</span>
                    <span className="font-medium text-rose-500">- Rs. 18.0M</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-semibold">Projected Runway</span>
                      <span className="font-bold">8.5 Months</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}