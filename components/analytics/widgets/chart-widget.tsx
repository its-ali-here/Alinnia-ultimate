"use client"

import { useState, useEffect } from 'react';
import { 
    ResponsiveContainer, 
    BarChart, Bar, 
    LineChart, Line, 
    PieChart, Pie, Cell,
    AreaChart, Area,
    XAxis, YAxis, Tooltip, Legend 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

interface ChartWidgetProps {
    widgetConfig: {
        title: string;
        chartType: 'bar' | 'line' | 'pie' | 'area';
        query: {
            categoryKey: string;
            valueKey: string;
        };
    };
    datasourceId: string;
    filters: any;
}

const PIE_CHART_COLORS = ['#0ea5e9', '#84cc16', '#eab308', '#f97316', '#d946ef', '#6366f1'];

export function ChartWidget({ widgetConfig, datasourceId }: ChartWidgetProps) {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/analytics/filtered-query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        datasourceId: datasourceId,
                        categoryKey: widgetConfig.query.categoryKey,
                        valueKey: widgetConfig.query.valueKey,
                        filters: {},
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

        // Ensure we only fetch data if the query is complete
        if (widgetConfig.query?.categoryKey && widgetConfig.query?.valueKey) {
            fetchData();
        } else {
            setIsLoading(false); // No query to run, stop loading
        }
    }, [widgetConfig, datasourceId]);

    const renderChart = () => {
        const { chartType, query } = widgetConfig;

        // Return null if data is not ready, preventing chart errors
        if (!data || data.length === 0) {
            return <div className="text-center text-sm text-muted-foreground h-full flex items-center justify-center">No data to display.</div>;
        }

        switch (chartType) {
            case 'line':
                return <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}><XAxis dataKey={query.categoryKey} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" height={60} /><YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} cursor={{fill: 'hsl(var(--muted))'}} /><Line type="monotone" dataKey={query.valueKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /></LineChart>;
            case 'pie':
                return <PieChart><Pie data={data} dataKey={query.valueKey} nameKey={query.categoryKey} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => { const radius = innerRadius + (outerRadius - innerRadius) * 0.5; const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180)); const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180)); return ( <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central"> {`${(percent * 100).toFixed(0)}%`} </text> );}}>{data.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />))}</Pie><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} /><Legend /></PieChart>;
            case 'area':
                return <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}><defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs><XAxis dataKey={query.categoryKey} stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" height={60} /><YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} cursor={{fill: 'hsl(var(--muted))'}} /><Area type="monotone" dataKey={query.valueKey} stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" /></AreaChart>;
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