// components/analytics/widgets/chart-widget.tsx
"use client"

import { useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

interface ChartWidgetProps {
    widgetConfig: {
        title: string;
        chartType: 'bar'; // Can be expanded later
        query: {
            categoryKey: string;
            valueKey: string;
        };
    };
    datasourceId: string;
}

export function ChartWidget({ widgetConfig, datasourceId }: ChartWidgetProps) {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
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

    if (isLoading) {
        return <Skeleton className="h-full w-full" />;
    }

    return (
        <Card className="h-full w-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-base truncate">{widgetConfig.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                        <XAxis 
                            dataKey={widgetConfig.query.categoryKey} 
                            stroke="#888888" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            interval={0} // Ensure all labels are shown if possible
                            angle={-45} // Angle labels to prevent overlap
                            textAnchor="end"
                        />
                        <YAxis 
                            stroke="#888888" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                            }}
                            cursor={{fill: 'hsl(var(--muted))'}}
                        />
                        <Bar dataKey={widgetConfig.query.valueKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}