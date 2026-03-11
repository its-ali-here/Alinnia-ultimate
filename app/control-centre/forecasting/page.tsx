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
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Calculator,
  RefreshCcw,
  Save,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

// Baseline data for construction cost categories
const initialCostCategories = [
  {
    id: "CAT-MAT",
    name: "Materials",
    baselineCost: 6000000,
    primaryDriver: "Material Price Index",
    sensitivity: 0.9,
  },
  {
    id: "CAT-LAB",
    name: "Labor",
    baselineCost: 4500000,
    primaryDriver: "Labor Rate",
    sensitivity: 0.75,
  },
  {
    id: "CAT-CONT",
    name: "Contingency",
    baselineCost: 1500000,
    primaryDriver: "Contingency",
    sensitivity: 1.0,
  },
]

export default function ForecastingPage() {
  // Scenario variables (percentage changes from baseline)
  const [materialPriceChange, setMaterialPriceChange] = useState(0)
  const [laborRateChange, setLaborRateChange] = useState(0)
  const [contingencyChange, setContingencyChange] = useState(0)

  // Reset to baseline
  const handleReset = () => {
    setMaterialPriceChange(0)
    setLaborRateChange(0)
    setContingencyChange(0)
  }

  // Format currency
  const formatRs = (value: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumSignificantDigits: 4,
      notation: "compact",
      compactDisplay: "short",
    }).format(value)
  }

  // Calculate projections based on active sliders
  const projections = initialCostCategories.map(category => {
    let costMultiplier = 1

    if (category.id === "CAT-MAT")
      costMultiplier = 1 + (materialPriceChange / 100) * category.sensitivity
    if (category.id === "CAT-LAB")
      costMultiplier = 1 + (laborRateChange / 100) * category.sensitivity
    if (category.id === "CAT-CONT")
      costMultiplier = 1 + (contingencyChange / 100) * category.sensitivity

    const projectedCost = category.baselineCost * costMultiplier
    const costVariance = projectedCost - category.baselineCost

    return {
      ...category,
      projectedCost,
      costVariance,
    }
  })

  // Global totals
  const totalBaselineCost = projections.reduce(
    (acc, curr) => acc + curr.baselineCost,
    0
  )
  const totalProjectedCost = projections.reduce(
    (acc, curr) => acc + curr.projectedCost,
    0
  )
  const globalVariance = totalProjectedCost - totalBaselineCost
  const globalVariancePercent = (globalVariance / totalBaselineCost) * 100

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Cost Forecasting
            </h2>
            <p className="text-muted-foreground">
              Simulate how changes in market conditions could affect your
              project's final cost.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset Baseline
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Scenario
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Controls Panel - 4 columns */}
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Variable Adjustments
              </CardTitle>
              <CardDescription>
                Drag sliders to simulate market changes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Slider 1 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none">
                    Material Price Index
                  </label>
                  <Badge
                    variant={
                      materialPriceChange > 0 ? "destructive" : "secondary"
                    }
                  >
                    {materialPriceChange > 0 ? "+" : ""}
                    {materialPriceChange}%
                  </Badge>
                </div>
                <Slider
                  value={[materialPriceChange]}
                  min={-20}
                  max={30}
                  step={1}
                  onValueChange={val => setMaterialPriceChange(val[0])}
                />
              </div>

              {/* Slider 2 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none">
                    Labor Rate
                  </label>
                  <Badge
                    variant={laborRateChange > 0 ? "destructive" : "secondary"}
                  >
                    {laborRateChange > 0 ? "+" : ""}
                    {laborRateChange}%
                  </Badge>
                </div>
                <Slider
                  value={[laborRateChange]}
                  min={-15}
                  max={25}
                  step={1}
                  onValueChange={val => setLaborRateChange(val[0])}
                />
              </div>

              {/* Slider 3 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none">
                    Contingency
                  </label>
                  <Badge
                    variant={
                      contingencyChange > 0 ? "destructive" : "secondary"
                    }
                  >
                    {contingencyChange > 0 ? "+" : ""}
                    {contingencyChange}%
                  </Badge>
                </div>
                <Slider
                  value={[contingencyChange]}
                  min={-50}
                  max={50}
                  step={5}
                  onValueChange={val => setContingencyChange(val[0])}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Panel - 8 columns */}
          <div className="md:col-span-8 space-y-6">
            {/* Top Level Impact */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Baseline Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatRs(totalBaselineCost)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Projected Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatRs(totalProjectedCost)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {formatRs(Math.abs(globalVariance))}
                    {globalVariance !== 0 && (
                      <Badge
                        variant="outline"
                        className={
                          globalVariance > 0
                            ? "text-rose-500 border-rose-500"
                            : "text-emerald-500 border-emerald-500"
                        }
                      >
                        {globalVariance > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(globalVariancePercent).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown Table */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Category Breakdown</CardTitle>
                <CardDescription>
                  See how market variables affect each cost category.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">
                        Baseline Cost
                      </TableHead>
                      <TableHead className="text-center"></TableHead>
                      <TableHead className="text-right">
                        Projected Cost
                      </TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projections.map(category => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatRs(category.baselineCost)}
                        </TableCell>
                        <TableCell className="text-center">
                          <ArrowRight className="h-4 w-4 mx-auto text-muted-foreground" />
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatRs(category.projectedCost)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            category.costVariance > 0
                              ? "text-rose-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {category.costVariance === 0
                            ? "-"
                            : formatRs(Math.abs(category.costVariance))}
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
    </div>
  )
}
