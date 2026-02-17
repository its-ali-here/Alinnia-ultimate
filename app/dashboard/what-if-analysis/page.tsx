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
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { 
  ArrowDownRight, 
  ArrowRight, 
  ArrowUpRight, 
  Calculator, 
  RefreshCcw,
  Save,
  TrendingDown,
  TrendingUp
} from "lucide-react"

// Baseline data mapped to operational hubs
const initialBusinessUnits = [
  {
    id: "BU-LPG-01",
    name: "Lahore Filling Plant",
    sector: "Energy",
    baselineRevenue: 15000000,
    baselineCosts: 11500000,
    primaryDriver: "Gas Import Price",
    sensitivity: 0.8 // 80% of costs are tied to the driver
  },
  {
    id: "BU-AGR-02",
    name: "Chak 156/9L Cattle & Agri",
    sector: "Livestock",
    baselineRevenue: 4500000,
    baselineCosts: 3200000,
    primaryDriver: "Feed & Seed Costs",
    sensitivity: 0.65
  },
  {
    id: "BU-EGG-03",
    name: "DHA EME Distribution Hub",
    sector: "FMCG",
    baselineRevenue: 6800000,
    baselineCosts: 5100000,
    primaryDriver: "Transport / Fuel Costs",
    sensitivity: 0.45
  }
]

export default function WhatIfAnalysisPage() {
  // Scenario variables (percentage changes from baseline)
  const [gasPriceChange, setGasPriceChange] = useState(0)
  const [feedCostChange, setFeedCostChange] = useState(0)
  const [fuelCostChange, setFuelCostChange] = useState(0)

  // Reset to baseline
  const handleReset = () => {
    setGasPriceChange(0)
    setFeedCostChange(0)
    setFuelCostChange(0)
  }

  // Format currency
  const formatRs = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumSignificantDigits: 3,
      notation: "compact",
      compactDisplay: "short"
    }).format(value)
  }

  // Calculate projections based on active sliders
  const projections = initialBusinessUnits.map(unit => {
    let costMultiplier = 1;
    
    // Apply the relevant slider to the relevant business unit
    if (unit.sector === "Energy") costMultiplier = 1 + ((gasPriceChange / 100) * unit.sensitivity);
    if (unit.sector === "Livestock") costMultiplier = 1 + ((feedCostChange / 100) * unit.sensitivity);
    if (unit.sector === "FMCG") costMultiplier = 1 + ((fuelCostChange / 100) * unit.sensitivity);

    const projectedCosts = unit.baselineCosts * costMultiplier;
    const baselineMargin = unit.baselineRevenue - unit.baselineCosts;
    const projectedMargin = unit.baselineRevenue - projectedCosts;
    const marginVariance = projectedMargin - baselineMargin;

    return {
      ...unit,
      projectedCosts,
      baselineMargin,
      projectedMargin,
      marginVariance
    }
  })

  // Global totals
  const totalBaselineMargin = projections.reduce((acc, curr) => acc + curr.baselineMargin, 0)
  const totalProjectedMargin = projections.reduce((acc, curr) => acc + curr.projectedMargin, 0)
  const globalVariance = totalProjectedMargin - totalBaselineMargin
  const globalVariancePercent = (globalVariance / totalBaselineMargin) * 100

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Scenario Planning</h2>
            <p className="text-muted-foreground">
              Stress-test your margins against supply chain and economic fluctuations.
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
              <CardDescription>Drag sliders to simulate market shocks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Slider 1 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none">LPG Base Price Shift</label>
                  <Badge variant={gasPriceChange > 0 ? "destructive" : gasPriceChange < 0 ? "default" : "secondary"} className={gasPriceChange < 0 ? "bg-emerald-500" : ""}>
                    {gasPriceChange > 0 ? '+' : ''}{gasPriceChange}%
                  </Badge>
                </div>
                <Slider 
                  value={[gasPriceChange]} 
                  min={-30} 
                  max={50} 
                  step={1} 
                  onValueChange={(val) => setGasPriceChange(val[0])}
                  className="[&>span:first-child]:bg-muted [&_[role=slider]]:bg-primary"
                />
                <p className="text-[10px] text-muted-foreground">Impacts Lahore Filling Plant costs by a sensitivity factor of 0.80.</p>
              </div>

              {/* Slider 2 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none">Cattle Feed / Seed Price</label>
                  <Badge variant={feedCostChange > 0 ? "destructive" : feedCostChange < 0 ? "default" : "secondary"} className={feedCostChange < 0 ? "bg-emerald-500" : ""}>
                    {feedCostChange > 0 ? '+' : ''}{feedCostChange}%
                  </Badge>
                </div>
                <Slider 
                  value={[feedCostChange]} 
                  min={-20} 
                  max={40} 
                  step={1} 
                  onValueChange={(val) => setFeedCostChange(val[0])}
                />
                <p className="text-[10px] text-muted-foreground">Impacts Chak 156/9L operations by a sensitivity factor of 0.65.</p>
              </div>

              {/* Slider 3 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none">Logistics & Fuel Costs</label>
                  <Badge variant={fuelCostChange > 0 ? "destructive" : fuelCostChange < 0 ? "default" : "secondary"} className={fuelCostChange < 0 ? "bg-emerald-500" : ""}>
                    {fuelCostChange > 0 ? '+' : ''}{fuelCostChange}%
                  </Badge>
                </div>
                <Slider 
                  value={[fuelCostChange]} 
                  min={-20} 
                  max={60} 
                  step={1} 
                  onValueChange={(val) => setFuelCostChange(val[0])}
                />
                <p className="text-[10px] text-muted-foreground">Impacts DHA EME Distribution Hub by a sensitivity factor of 0.45.</p>
              </div>

            </CardContent>
          </Card>

          {/* Results Panel - 8 columns */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Top Level Impact */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Net Margin (Baseline)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatRs(totalBaselineMargin)}</div>
                </CardContent>
              </Card>
              <Card className={globalVariance < 0 ? "border-rose-500/50 bg-rose-500/5" : globalVariance > 0 ? "border-emerald-500/50 bg-emerald-500/5" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Projected Net Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatRs(totalProjectedMargin)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {formatRs(Math.abs(globalVariance))}
                    {globalVariance !== 0 && (
                      <Badge variant="outline" className={globalVariance > 0 ? "text-emerald-500 border-emerald-500" : "text-rose-500 border-rose-500"}>
                        {globalVariance > 0 ? <TrendingUp className="h-3 w-3 mr-1"/> : <TrendingDown className="h-3 w-3 mr-1"/>}
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
                <CardTitle>Business Unit Breakdown</CardTitle>
                <CardDescription>See how global variables affect local operational margins.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location / Unit</TableHead>
                      <TableHead>Primary Driver</TableHead>
                      <TableHead className="text-right">Baseline Margin</TableHead>
                      <TableHead className="text-center"></TableHead>
                      <TableHead className="text-right">Projected Margin</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projections.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">
                          {unit.name}
                          <div className="text-xs text-muted-foreground">{unit.sector}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{unit.primaryDriver}</TableCell>
                        <TableCell className="text-right font-medium">{formatRs(unit.baselineMargin)}</TableCell>
                        <TableCell className="text-center">
                          <ArrowRight className="h-4 w-4 mx-auto text-muted-foreground" />
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatRs(unit.projectedMargin)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`text-sm font-medium flex items-center justify-end gap-1 ${
                            unit.marginVariance < 0 ? "text-rose-500" : 
                            unit.marginVariance > 0 ? "text-emerald-500" : "text-muted-foreground"
                          }`}>
                            {unit.marginVariance < 0 ? <ArrowDownRight className="h-4 w-4" /> : 
                             unit.marginVariance > 0 ? <ArrowUpRight className="h-4 w-4" /> : null}
                            {unit.marginVariance === 0 ? "-" : formatRs(Math.abs(unit.marginVariance))}
                          </span>
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