"use client";

import { useState, useEffect } from 'react';
import { 
    ResponsiveContainer, 
    BarChart, Bar, 
    LineChart, Line, 
    PieChart, Pie, Cell,
    AreaChart, Area,
    ScatterChart, Scatter,
    XAxis, YAxis, Tooltip, Legend 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

interface ChartWidgetProps {
    widgetConfig: {
        title: string;
        chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter'; // Added 'scatter'
        query: {
            categoryKey: string;
            valueKey: string;
            // --- NEW: Add keys for scatter plots ---
            xAxisKey?: string;
            yAxisKey?: string;
        };
    };
    datasourceId: string;
    filters: any;
}

const PIE_COLORS = ['#0ea5e9', '#84cc16', '#eab308', '#f97316', '#d946ef', '#6366f1'];

export function ChartWidget({ widgetConfig, datasourceId, filters }: ChartWidgetProps) {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // We'll use the filtered-query endpoint for all chart types
                const response = await fetch('/api/analytics/filtered-query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        datasourceId: datasourceId,
                        // Pass the whole widgetConfig so the backend knows what to do
                        query: widgetConfig.query,
                        chartType: widgetConfig.chartType,
                        filters: filters,
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
        
        // Check if the required keys for the specific chart type are present
        const { chartType, query } = widgetConfig;
        const canFetch = (chartType === 'scatter' && query.xAxisKey && query.yAxisKey) || (chartType !== 'scatter' && query.categoryKey && query.valueKey);
        
        if (canFetch) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [widgetConfig, datasourceId, filters]);

    const renderChart = () => {
        const { chartType, query } = widgetConfig;

        if (!data || data.length === 0) {
            return <div className="text-center text-sm text-muted-foreground h-full flex items-center justify-center">No data to display. Check your filters or query.</div>;
        }

        switch (chartType) {
            case 'line':
                return <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}><XAxis dataKey={query.categoryKey} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" height={60} /><YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} cursor={{fill: 'hsl(var(--muted))'}} /><Line type="monotone" dataKey={query.valueKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /></LineChart>;
            
            // Re-styled as a Donut Chart
            case 'pie':
                return <PieChart><Pie data={data} dataKey={query.valueKey} nameKey={query.categoryKey} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{data.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}</Pie><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} /><Legend /></PieChart>;
            
            case 'area':
                return <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}><defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs><XAxis dataKey={query.categoryKey} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" height={60} /><YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} cursor={{fill: 'hsl(var(--muted))'}} /><Area type="monotone" dataKey={query.valueKey} stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" /></AreaChart>;
            
            // --- NEW: Scatter Plot ---
            case 'scatter':
                return (
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <XAxis type="number" dataKey={query.xAxisKey} name={query.xAxisKey} tickFormatter={(v) => v.toLocaleString()} />
                        <YAxis type="number" dataKey={query.yAxisKey} name={query.yAxisKey} tickFormatter={(v) => v.toLocaleString()} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                        <Scatter name="Data points" data={data} fill="hsl(var(--primary))" />
                    </ScatterChart>
                );

            case 'bar':
            default:
                return <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}><XAxis dataKey={query.categoryKey} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" height={60} /><YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} cursor={{fill: 'hsl(var(--muted))'}} /><Bar dataKey={query.valueKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>;
        }
    };

    if (isLoading) {
        return <Skeleton className="h-full w-full" />;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
        </ResponsiveContainer>
    );
}