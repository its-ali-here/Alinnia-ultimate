"use client"

import React, { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowDownRight, 
  ArrowRightLeft, 
  ArrowUpRight, 
  Banknote, 
  Building2, 
  Download,
  Filter,
  Fuel,
  Sprout,
  Tractor,
  TrendingDown,
  TrendingUp,
  Wallet
} from "lucide-react"

// Hardcoded data mapping cash movements across your specific verticals
const cashFlowByVertical = [
  {
    id: "V-LPG",
    vertical: "Lahore LPG Plant",
    type: "Operating",
    icon: Fuel,
    inflows: 18500000,
    outflows: 14200000,
    status: "Positive"
  },
  {
    id: "V-EGG",
    vertical: "DHA EME Egg Hub",
    type: "Operating",
    icon: Building2,
    inflows: 6200000,
    outflows: 4800000,
    status: "Positive"
  },
  {
    id: "V-AGRI",
    vertical: "Chak 156/9L & Dina Nath",
    type: "Operating/Seasonal",
    icon: Tractor,
    inflows: 800000,
    outflows: 3500000,
    status: "Negative" // Seed/Feed buying season
  },
  {
    id: "V-RE",
    vertical: "DHA EME 200 Kanal",
    type: "Capital Expenditure",
    icon: Sprout,
    inflows: 0,
    outflows: 5500000,
    status: "Burn"
  },
  {
    id: "V-PERS",
    vertical: "House Construction",
    type: "Personal CapEx",
    icon: Wallet,
    inflows: 0,
    outflows: 2800000,
    status: "Burn"
  }
]

const recentTransactions = [
  {
    id: "TRX-1092",
    date: "Today, 10:45 AM",
    description: "Bulk Commercial Cylinder Sales",
    entity: "Lahore LPG Plant",
    amount: 1250000,
    type: "inflow"
  },
  {
    id: "TRX-1091",
    date: "Yesterday, 03:15 PM",
    description: "Sanitary Fittings & Tiles (Finishing)",
    entity: "House Construction",
    amount: 850000,
    type: "outflow"
  },
  {
    id: "TRX-1090",
    date: "Feb 15, 2026",
    description: "Premium Cattle Feed Bulk Order",
    entity: "Chak 156/9L",
    amount: 420000,
    type: "outflow"
  },
  {
    id: "TRX-1089",
    date: "Feb 14, 2026",
    description: "Weekly Distribution Collections",
    entity: "DHA EME Egg Hub",
    amount: 1850000,
    type: "inflow"
  },
  {
    id: "TRX-1088",
    date: "Feb 12, 2026",
    description: "Boundary Wall Contractor Advance",
    entity: "DHA EME 200 Kanal",
    amount: 2500000,
    type: "outflow"
  }
]

export default function CashFlowPage() {
  const [timeframe, setTimeframe] = useState("month")

  const formatRs = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumSignificantDigits: 3,
      notation: "compact",
      compactDisplay: "short"
    }).format(value)
  }

  // Calculate Aggregates
  const totalInflows = cashFlowByVertical.reduce((acc, curr) => acc + curr.inflows, 0)
  const totalOutflows = cashFlowByVertical.reduce((acc, curr) => acc + curr.outflows, 0)
  const netCashFlow = totalInflows - totalOutflows

  const operatingInflows = cashFlowByVertical.filter(v => v.type.includes("Operating")).reduce((acc, curr) => acc + curr.inflows, 0)
  const operatingOutflows = cashFlowByVertical.filter(v => v.type.includes("Operating")).reduce((acc, curr) => acc + curr.outflows, 0)
  const operatingNet = operatingInflows - operatingOutflows

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Consolidated Cash Flow</h2>
            <p className="text-muted-foreground">
              Monitor liquidity across operational businesses and capital projects.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-muted rounded-md p-1 mr-2">
              <Button 
                variant={timeframe === "week" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setTimeframe("week")}
                className="text-xs h-7"
              >
                7D
              </Button>
              <Button 
                variant={timeframe === "month" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setTimeframe("month")}
                className="text-xs h-7"
              >
                30D
              </Button>
              <Button 
                variant={timeframe === "quarter" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setTimeframe("quarter")}
                className="text-xs h-7"
              >
                QTD
              </Button>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Statement
            </Button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cash In</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{formatRs(totalInflows)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From {cashFlowByVertical.filter(v => v.inflows > 0).length} revenue-generating entities
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cash Out</CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">{formatRs(totalOutflows)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across operations and CapEx
              </p>
            </CardContent>
          </Card>

          <Card className={netCashFlow < 0 ? "border-rose-500/50 bg-rose-500/5" : "border-emerald-500/50 bg-emerald-500/5"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Consolidated Cash</CardTitle>
              <ArrowRightLeft className={`h-4 w-4 ${netCashFlow < 0 ? "text-rose-500" : "text-emerald-500"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netCashFlow < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {netCashFlow > 0 ? "+" : ""}{formatRs(netCashFlow)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Overall liquidity change
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operating Cash Flow (OCF)</CardTitle>
              <Banknote className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">+{formatRs(operatingNet)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Excludes real estate & personal CapEx
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          
          {/* Vertical Breakdown Table */}
          <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cash Flow by Vertical</CardTitle>
                <CardDescription>Breakdown of inflows and outflows per business unit.</CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity / Project</TableHead>
                    <TableHead className="text-right">Cash In</TableHead>
                    <TableHead className="text-right">Cash Out</TableHead>
                    <TableHead className="text-right">Net Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlowByVertical.map((vertical) => {
                    const net = vertical.inflows - vertical.outflows;
                    const Icon = vertical.icon;
                    
                    return (
                      <TableRow key={vertical.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-md">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{vertical.vertical}</div>
                              <div className="text-xs text-muted-foreground">{vertical.type}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">
                          {vertical.inflows > 0 ? formatRs(vertical.inflows) : "-"}
                        </TableCell>
                        <TableCell className="text-right text-rose-600 font-medium">
                          {vertical.outflows > 0 ? formatRs(vertical.outflows) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`inline-flex items-center font-bold ${net > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {net > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {formatRs(Math.abs(net))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Ledger / Recent Transactions Widget */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Consolidated Ledger</CardTitle>
              <CardDescription>Latest movements across all operating accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentTransactions.map((trx) => (
                  <div key={trx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${trx.type === 'inflow' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        {trx.type === 'inflow' ? (
                          <TrendingUp className={`h-4 w-4 text-emerald-500`} />
                        ) : (
                          <TrendingDown className={`h-4 w-4 text-rose-500`} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{trx.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{trx.entity}</span>
                          <span>•</span>
                          <span>{trx.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${trx.type === 'inflow' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {trx.type === 'inflow' ? '+' : '-'}{formatRs(trx.amount)}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6">View Full Ledger</Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}