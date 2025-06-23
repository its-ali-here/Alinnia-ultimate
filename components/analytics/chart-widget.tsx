// components/analytics/chart-widget.tsx
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// We define what information our component needs to draw a chart
interface ChartWidgetProps {
  title: string;
  // We'll add more types like 'line' and 'pie' here later
  chartType: 'bar'; 
  data: any[]; // The array of data to display
  // The names of the keys in our data objects to use for the axes
  categoryKey: string; 
  valueKey: string;
}

export function ChartWidget({ title, chartType, data, categoryKey, valueKey }: ChartWidgetProps) {
  
  // For now, we only handle the 'bar' type
  if (chartType !== 'bar') {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
          <p>{chartType} chart coming soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis 
              dataKey={categoryKey} 
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
            />
            <Tooltip />
            <Bar dataKey={valueKey} fill="#adfa1d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}