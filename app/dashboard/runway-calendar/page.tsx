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
  ArrowRight,
  Banknote,
  Calendar,
  CalendarDays,
  ChevronRight,
  Clock,
  Download,
  Home,
  MapPin,
  TrendingDown,
  TrendingUp,
  Wallet
} from "lucide-react"

// Hardcoded timeline of upcoming capital commitments
const upcomingOutflows = [
  {
    id: "EXP-01",
    date: "Feb 25, 2026",
    title: "House Construction (Finishing Phase)",
    description: "Imported German sanitary fittings, tiles, and custom woodwork.",
    amount: "Rs. 4,500,000",
    category: "Personal CapEx",
    status: "Pending",
    urgency: "High"
  },
  {
    id: "EXP-02",
    date: "Mar 10, 2026",
    title: "DHA EME 200 Kanal Development",
    description: "Initial boundary wall construction, leveling, and earthwork.",
    amount: "Rs. 8,200,000",
    category: "Real Estate",
    status: "Scheduled",
    urgency: "Medium"
  },
  {
    id: "EXP-03",
    date: "Mar 15, 2026",
    title: "Chak 156/9L Agri Operations",
    description: "Spring season seed, premium cattle feed, and fertilizer bulk purchasing.",
    amount: "Rs. 1,800,000",
    category: "Agriculture",
    status: "Scheduled",
    urgency: "Medium"
  },
  {
    id: "EXP-04",
    date: "Apr 05, 2026",
    title: "Lahore Filling Plant Maintenance",
    description: "Annual compressor servicing and commercial LPG cylinder replacements.",
    amount: "Rs. 2,400,000",
    category: "Energy",
    status: "Projected",
    urgency: "Low"
  },
  {
    id: "EXP-05",
    date: "May 12, 2026",
    title: "Dina Nath Storage Upgrade",
    description: "Roofing repairs and structural reinforcement for upcoming yields.",
    amount: "Rs. 950,000",
    category: "Infrastructure",
    status: "Projected",
    urgency: "Low"
  }
]

// 6-Month cash depletion forecast
const monthlyForecast = [
  { month: "Feb 2026", startingCash: 52000000, netBurn: 6800000 },
  { month: "Mar 2026", startingCash: 45200000, netBurn: 11200000 }, // Heavy real estate CapEx
  { month: "Apr 2026", startingCash: 34000000, netBurn: 3100000 },
  { month: "May 2026", startingCash: 30900000, netBurn: 2500000 },
  { month: "Jun 2026", startingCash: 28400000, netBurn: -1500000 }, // Projected positive cashflow
  { month: "Jul 2026", startingCash: 29900000, netBurn: 1200000 },
]

export default function RunwayCalendarPage() {
  const formatRs = (value: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumSignificantDigits: 3,
      notation: "compact",
      compactDisplay: "short"
    }).format(value)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "border-rose-500 bg-rose-500/10 text-rose-700"
      case "Medium": return "border-amber-500 bg-amber-500/10 text-amber-700"
      case "Low": return "border-emerald-500 bg-emerald-500/10 text-emerald-700"
      default: return "border-gray-200 bg-gray-50 text-gray-700"
    }
  }

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Runway & Capital Calendar</h2>
            <p className="text-muted-foreground">
              Track consolidated cash reserves against upcoming CapEx, construction, and operational milestones.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Forecast
            </Button>
            <Button>
              <CalendarDays className="mr-2 h-4 w-4" />
              Add Commitment
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consolidated Reserves</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. 52.0M</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                Liquid cash across all operating accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">30-Day Projected Burn</CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">Rs. 18.0M</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                Includes Rs. 12.7M in scheduled CapEx
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Runway</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.5 Months</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                Assuming zero new revenue generation
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Major Outflow</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">House Finishing</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                Rs. 4.5M due in 8 days
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          
          {/* Left Column: Timeline */}
          <Card className="md:col-span-7">
            <CardHeader>
              <CardTitle>Upcoming Capital Commitments</CardTitle>
              <CardDescription>Scheduled outflows for construction, inventory, and land development.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {upcomingOutflows.map((item, index) => (
                  <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    
                    {/* Timeline Node */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-secondary text-secondary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Calendar className="h-4 w-4" />
                    </div>
                    
                    {/* Content Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="font-medium text-xs">
                          {item.date}
                        </Badge>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${getUrgencyColor(item.urgency)}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-base mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 leading-snug">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between border-t pt-3 mt-3">
                        <span className="text-xs font-medium text-muted-foreground">{item.category}</span>
                        <span className="font-bold text-primary">{item.amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Burn Forecast */}
          <Card className="md:col-span-5">
            <CardHeader>
              <CardTitle>Cash Depletion Forecast</CardTitle>
              <CardDescription>6-Month view of cash reserves vs net burn.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {monthlyForecast.map((month, i) => {
                  const maxCash = 60000000; // Baseline for visual progress bar scale
                  const cashPercentage = (month.startingCash / maxCash) * 100;
                  const isPositive = month.netBurn < 0;

                  return (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground text-xs">Start: {formatRs(month.startingCash)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden relative">
                          <div 
                            className={`absolute left-0 top-0 h-full bg-slate-800 dark:bg-slate-200 rounded-full`} 
                            style={{ width: `${cashPercentage}%` }}
                          />
                        </div>
                        <div className={`flex items-center gap-1 w-20 justify-end text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {formatRs(Math.abs(month.netBurn))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 pt-6 border-t space-y-4">
                <h4 className="text-sm font-semibold">Risk Factors</h4>
                <div className="flex gap-3 items-start bg-muted/50 p-3 rounded-lg">
                  <Banknote className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">High CapEx Concentration</p>
                    <p className="text-xs text-muted-foreground mt-1">March contains concurrent major outflows for both DHA EME real estate and Chak 156/9L agricultural operations. Ensure sufficient liquidity buffer.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}