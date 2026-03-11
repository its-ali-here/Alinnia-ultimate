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
import { 
  AlertCircle, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShieldAlert, 
  TrendingUp, 
  Users,
  Search,
  Download
} from "lucide-react"
import { Input } from "@/components/ui/input"

// Hardcoded data for initial niche testing
const highRiskAccounts = [
  { 
    id: "ACC-8902", 
    name: "Lahore Central Logistics", 
    balance: "Rs. 5,400,000", 
    daysOverdue: 62, 
    riskScore: 88,
    status: "Critical", 
    trend: "up" 
  },
  { 
    id: "ACC-1044", 
    name: "EME Traders", 
    balance: "Rs. 2,500,000", 
    daysOverdue: 45, 
    riskScore: 72,
    status: "High", 
    trend: "up" 
  },
  { 
    id: "ACC-3391", 
    name: "Dina Nath Distributors", 
    balance: "Rs. 850,000", 
    daysOverdue: 15, 
    riskScore: 45,
    status: "Moderate", 
    trend: "down" 
  },
  { 
    id: "ACC-7721", 
    name: "Chak 156 Agri Solutions", 
    balance: "Rs. 150,000", 
    daysOverdue: 5, 
    riskScore: 12,
    status: "Low", 
    trend: "down" 
  },
]

const agingData = [
  { bracket: "0-30 Days", amount: "Rs. 12.4M", percentage: 65, color: "bg-emerald-500" },
  { bracket: "31-60 Days", amount: "Rs. 4.2M", percentage: 22, color: "bg-amber-500" },
  { bracket: "61-90 Days", amount: "Rs. 1.8M", percentage: 9, color: "bg-orange-500" },
  { bracket: "90+ Days", amount: "Rs. 0.8M", percentage: 4, color: "bg-rose-500" },
]

export default function CreditRiskPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Critical":
        return <Badge variant="destructive" className="bg-rose-500">Critical</Badge>
      case "High":
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>
      case "Moderate":
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/30">Moderate</Badge>
      case "Low":
        return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30">Low</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Credit Risk Profile</h2>
            <p className="text-muted-foreground">
              Monitor outstanding balances, aging accounts, and default probabilities.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button>Generate Alerts</Button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exposure</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. 19.2M</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="mr-1 h-4 w-4 text-rose-500" />
                <span className="text-rose-500 font-medium">+4.1%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Balance</CardTitle>
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. 7.9M</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="mr-1 h-4 w-4 text-rose-500" />
                <span className="text-rose-500 font-medium">+12%</span> in 60+ days bracket
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowDownRight className="mr-1 h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">-2</span> settled this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Days Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24 Days</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="mr-1 h-4 w-4 text-orange-500" />
                <span className="text-orange-500 font-medium">+3 days</span> from historical avg
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Aging Report Widget */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Receivables Aging</CardTitle>
              <CardDescription>Breakdown of outstanding balance by time overdue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {agingData.map((tier) => (
                <div key={tier.bracket} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{tier.bracket}</span>
                    <span className="text-muted-foreground">{tier.amount}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className={`h-full ${tier.color}`} 
                        style={{ width: `${tier.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{tier.percentage}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* High Risk Accounts Table */}
          <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Accounts Requiring Attention</CardTitle>
                <CardDescription>Clients with deteriorating payment behavior.</CardDescription>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search accounts..." className="pl-8" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="text-center">Overdue</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {highRiskAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.name}
                        <div className="text-xs text-muted-foreground">{account.id}</div>
                      </TableCell>
                      <TableCell>{account.balance}</TableCell>
                      <TableCell className="text-center">{account.daysOverdue} days</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={account.riskScore} 
                            className={`h-2 ${account.riskScore > 70 ? '[&>div]:bg-rose-500' : account.riskScore > 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`} 
                          />
                          <span className="text-xs font-medium w-6">{account.riskScore}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(account.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
