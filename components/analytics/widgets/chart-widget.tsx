"use client"

import { useState, useEffect } from 'react';
import { 
    ResponsiveContainer, 
    BarChart, Bar, 
    LineChart, Line, 
    PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, Legend 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

interface ChartWidgetProps {
    widgetConfig: {
        title: string;
        chartType: 'bar' | 'line' | 'pie'; // Expanded types
        query: {
            categoryKey: string;
            valueKey: string;
        };
    };
    datasourceId: string;
}

// Define a set of colors for the Pie Chart
const PIE_CHART_COLORS = ['#0ea5e9', '#84cc16', '#eab308', '#f97316', '#d946ef', '#6366f1'];

export function ChartWidget({ widgetConfig, datasourceId }: ChartWidgetProps) {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // ... (The fetchData function remains exactly the same)
            setIsLoading(true);
            try {
                const response = await fetch('/api/analytics/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        datasourceId: datasourceId,
                        categoryKey: widgetConfig.query.categoryKey,
                        valueKey: widgetConfig.query.valueKey,
                    }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch widget data.');
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                toast.error(`Could not load data for "${widgetConfig.title}": ${(error as Error).message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [widgetConfig, datasourceId]);

    const renderChart = () => {
        const { chartType, query } = widgetConfig;

        switch (chartType) {
            case 'line':
                return (
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <XAxis dataKey={query.categoryKey} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} cursor={{fill: 'hsl(var(--muted))'}} />
                        <Line type="monotone" dataKey={query.valueKey} stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie data={data} dataKey={query.valueKey} nameKey={query.categoryKey} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                        <Legend />
                    </PieChart>
                );
            case 'bar':
            default:
                return (
                     <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <XAxis dataKey={query.categoryKey} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} cursor={{fill: 'hsl(var(--muted))'}} />
                        <Bar dataKey={query.valueKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                );
        }
    };

    return (
        <Card className="h-full w-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-base truncate">{widgetConfig.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}