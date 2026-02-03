// components/analytics/widgets/chart-widget.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { 
    ResponsiveContainer, 
    BarChart, Bar, 
    LineChart, Line, 
    PieChart, Pie, Cell,
    AreaChart, Area,
    ScatterChart, Scatter,
    XAxis, YAxis, Tooltip, Legend,
    CartesianGrid 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useDuckDB } from '@/contexts/duckdb-context';
import { format } from 'date-fns';

interface ChartWidgetProps {
    widgetConfig: {
        title: string;
        chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter'; 
        query: {
            categoryKey: string;
            valueKey: string;
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
    const { db, loading: dbLoading, error: dbError } = useDuckDB();
    const lastFetchConfig = useRef<string>("");

    useEffect(() => {
        if (dbLoading || !db) return;

        const currentConfigString = JSON.stringify({ widgetConfig, datasourceId, filters });
        if (lastFetchConfig.current === currentConfigString && data.length > 0) return; 

        const uniqueFileName = `chart_${Math.random().toString(36).substr(2, 9)}.csv`;

        const fetchData = async () => {
            if (data.length === 0) setIsLoading(true);
            try {
                const dsResponse = await fetch(`/api/data-sources/${datasourceId}`);
                if (!dsResponse.ok) throw new Error('Failed to fetch datasource details.');
                
                const dsData = await dsResponse.json();
                const fileUrl = dsData.data?.file_url;
                if (!fileUrl) throw new Error('This datasource has no associated file.');

                await db.registerFileURL(uniqueFileName, fileUrl, 4, true);

                const { chartType, query } = widgetConfig;
                let sqlQuery = '';

                // Universal "Safe Value" regex to clean currency/text from numbers
                const safeValue = (col: string) => `TRY_CAST(NULLIF(regexp_replace("${col}", '[^0-9.-]', '', 'g'), '') AS DOUBLE)`;

                if (chartType === 'scatter') {
                    sqlQuery = `SELECT ${safeValue(query.xAxisKey!)} as "${query.xAxisKey}", ${safeValue(query.yAxisKey!)} as "${query.yAxisKey}" FROM "${uniqueFileName}"`;
                } else {
                    // Standard Aggregation
                    sqlQuery = `SELECT "${query.categoryKey}", SUM(${safeValue(query.valueKey)}) as "${query.valueKey}" FROM "${uniqueFileName}" GROUP BY "${query.categoryKey}"`;
                    
                    // NOTE: We REMOVED the SQL 'ORDER BY' here. 
                    // We will handle sorting in JavaScript below to support "13-Dec-2019" formats.
                }

                // Apply Filters
                if (filters?.dateRange?.from && filters?.dateRange?.to && filters?.dateColumn) {
                    const from = format(new Date(filters.dateRange.from), 'yyyy-MM-dd');
                    const to = format(new Date(filters.dateRange.to), 'yyyy-MM-dd');
                    const whereClause = `WHERE CAST("${filters.dateColumn}" AS DATE) BETWEEN '${from}' AND '${to}'`;
                    
                    const groupByIndex = sqlQuery.toUpperCase().indexOf(' GROUP BY');
                    const insertIndex = groupByIndex > -1 ? groupByIndex : sqlQuery.length;
                    
                    sqlQuery = `${sqlQuery.substring(0, insertIndex)} ${whereClause} ${sqlQuery.substring(insertIndex)}`;
                }
                
                const c = await db.connect();
                const result = await c.query(sqlQuery);
                let newData = JSON.parse(JSON.stringify(result.toArray().map(Object.fromEntries)));
                
                // --- FIX 1: SMART JAVASCRIPT SORTING ---
                if (chartType === 'line' || chartType === 'area' || chartType === 'bar') {
                    newData.sort((a: any, b: any) => {
                        const valA = a[query.categoryKey];
                        const valB = b[query.categoryKey];

                        // Try to parse as Date first (handles "13-Dec-2019" correctly)
                        const dateA = new Date(valA);
                        const dateB = new Date(valB);

                        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                            return dateA.getTime() - dateB.getTime();
                        }

                        // If not dates, try numbers
                        const numA = parseFloat(valA);
                        const numB = parseFloat(valB);
                        if (!isNaN(numA) && !isNaN(numB)) {
                            return numA - numB;
                        }

                        // Fallback to text sorting
                        return String(valA).localeCompare(String(valB));
                    });
                }

                setData(newData);
                lastFetchConfig.current = currentConfigString;
                await c.close();

            } catch (error) {
                console.error("Chart Error:", error);
            } finally {
                try { await db.registerFileURL(uniqueFileName, '', 4, true); } catch (e) {}
                setIsLoading(false);
            }
        };
        
        const { chartType, query } = widgetConfig;
        const canFetch = (chartType === 'scatter' && query.xAxisKey && query.yAxisKey) || (chartType !== 'scatter' && query.categoryKey && query.valueKey);
        
        if (canFetch) fetchData();
        else setIsLoading(false);

    }, [widgetConfig, datasourceId, filters, db, dbLoading, data.length]);

    const renderChart = () => {
        const { chartType, query } = widgetConfig;
        if (!data || data.length === 0) return <div className="text-center text-sm text-muted-foreground h-full flex items-center justify-center">No data available</div>;

        switch (chartType) {
            case 'line':
                return (
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                        {/* FIX 2: Removed interval={0} and added minTickGap */}
                        <XAxis 
                            dataKey={query.categoryKey} 
                            stroke="#888888" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            minTickGap={30}  
                        />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} cursor={{fill: 'hsl(var(--muted))'}} />
                        <Line type="monotone" dataKey={query.valueKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                         {/* FIX 2: Removed interval={0} and added minTickGap */}
                        <XAxis 
                            dataKey={query.categoryKey} 
                            stroke="#888888" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            minTickGap={30} 
                        />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                        <Area type="monotone" dataKey={query.valueKey} stroke="hsl(var(--primary))" fillOpacity={0.2} fill="hsl(var(--primary))" />
                    </AreaChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie data={data} dataKey={query.valueKey} nameKey={query.categoryKey} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                        <Legend />
                    </PieChart>
                );
            case 'scatter':
                return (
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey={query.xAxisKey} name={query.xAxisKey} tickFormatter={(v) => v.toLocaleString()} />
                        <YAxis type="number" dataKey={query.yAxisKey} name={query.yAxisKey} tickFormatter={(v) => v.toLocaleString()} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                        <Scatter name="Data points" data={data} fill="hsl(var(--primary))" />
                    </ScatterChart>
                );
            case 'bar':
            default:
                return (
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                        {/* FIX 2: Removed interval={0} and added minTickGap */}
                        <XAxis 
                            dataKey={query.categoryKey} 
                            stroke="#888888" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            minTickGap={30} 
                        />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} cursor={{fill: 'hsl(var(--muted))'}} />
                        <Bar dataKey={query.valueKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                );
        }
    };

    if (isLoading && data.length === 0) return <Skeleton className="h-full w-full" />;
    if (dbError) return <div className="text-center text-red-500 text-sm">DB Error</div>;

    return <ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer>;
}