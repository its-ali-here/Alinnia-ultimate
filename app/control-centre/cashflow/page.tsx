"use client"

import React, { useState } from "react"
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
import { Button } from "@/components/ui/button"
import {
  Download,
  Filter,
  TrendingDown,
  TrendingUp,
  Wallet,
  Building,
  Hammer,
  Wrench,
  Paintbrush,
} from "lucide-react"

// Hardcoded data for a homeowner's construction project budget
const budgetByCateory = [
  {
    id: "CAT-FOUND",
    category: "Foundation & Earthwork",
    icon: Building,
    budget: 2500000,
    spent: 2200000,
    status: "On Track",
  },
  {
    id: "CAT-FRAM",
    category: "Structural & Framing",
    icon: Hammer,
    budget: 3500000,
    spent: 3800000,
    status: "Over Budget",
  },
  {
    id: "CAT-MEP",
    category: "MEP (Mechanical, Electrical, Plumbing)",
    icon: Wrench,
    budget: 1800000,
    spent: 1500000,
    status: "On Track",
  },
  {
    id: "CAT-FIN",
    category: "Finishing & Interiors",
    icon: Paintbrush,
    budget: 4200000,
    spent: 1200000,
    status: "Under Budget",
  },
]

const recentExpenses = [
  {
    id: "EXP-2045",
    date: "Today, 02:30 PM",
    description: "Downpayment for Italian Marble",
    category: "Finishing & Interiors",
    amount: 500000,
    type: "outflow",
  },
  {
    id: "EXP-2044",
    date: "Yesterday, 11:00 AM",
    description: "Final Payment for Steel Reinforcement",
    category: "Structural & Framing",
    amount: 750000,
    type: "outflow",
  },
  {
    id: "EXP-2043",
    date: "Feb 20, 2026",
    description: "Excavation Services",
    category: "Foundation & Earthwork",
    amount: 300000,
    type: "outflow",
  },
]

export default function BudgetPage() {
  const [timeframe, setTimeframe] = useState("month")

  const formatRs = (value: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumSignificantDigits: 4,
      notation: "compact",
      compactDisplay: "short",
    }).format(value)
  }

  // Calculate Aggregates
  const totalBudget = budgetByCateory.reduce((acc, curr) => acc + curr.budget, 0)
  const totalSpent = budgetByCateory.reduce((acc, curr) => acc + curr.spent, 0)
  const remainingBudget = totalBudget - totalSpent

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Project Budgeting
            </h2>
            <p className="text-muted-foreground">
              Track your home construction project's budget and expenses.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Summary
            </Button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatRs(totalBudget)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Allocated for the entire project
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spent to Date</CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">
                {formatRs(totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all expense categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Remaining Budget
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatRs(remainingBudget)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available to spend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Budget vs. Actual
              </CardTitle>
              <div
                className={`text-2xl font-bold ${
                  remainingBudget >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {((totalSpent / totalBudget) * 100).toFixed(1)}%
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mt-1">
                Project completion progress
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Category Breakdown Table */}
          <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Budget by Category</CardTitle>
                <CardDescription>
                  Breakdown of budget and spending per category.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetByCateory.map(category => {
                    const variance = category.budget - category.spent
                    const Icon = category.icon

                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-md">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {category.category}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatRs(category.budget)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatRs(category.spent)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              variance < 0 ? "destructive" : "secondary"
                            }
                          >
                            {variance < 0 ? "Over" : "On"} Budget
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Expenses Widget */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>
                Latest expenses for the project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentExpenses.map(trx => (
                  <div
                    key={trx.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full bg-rose-500/10`}
                      >
                        <TrendingDown
                          className={`h-4 w-4 text-rose-500`}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {trx.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{trx.category}</span>
                          <span>•</span>
                          <span>{trx.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-bold text-rose-600`}>
                      -{formatRs(trx.amount)}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6">
                View All Expenses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}