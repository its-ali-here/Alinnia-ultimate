// components/cash-flow-chart.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { useTheme } from "next-themes"

// For now, we'll use static mock data.
const data = [
  { month: "Jan", income: 4000, expenses: 2400 },
  { month: "Feb", income: 3000, expenses: 1398 },
  { month: "Mar", income: 5000, expenses: 3800 },
  { month: "Apr", income: 2780, expenses: 3908 },
  { month: "May", income: 1890, expenses: 4800 },
  { month: "Jun", income: 3390, expenses: 3800 },
]

export function CashFlowChart() {
  const { theme } = useTheme()

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value / 1000}k`}
        />
        <Tooltip
            contentStyle={{
                backgroundColor: theme === 'dark' ? '#09090B' : '#FFFFFF',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
            }}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4, fill: "hsl(var(--primary))" }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="hsl(var(--muted-foreground))" 
          strokeWidth={2} 
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}